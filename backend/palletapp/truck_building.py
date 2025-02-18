import math
import pulp
from collections import defaultdict

def optimize_truckloads(listings, bids, truck_params):
    """
    Optimize truckload assignments for auction-based pallet allocation,
    ensuring that dynamic layout (using non-standard pallet sizes) and stacking
    constraints (including height) are respected.
    
    Assumes:
      - Listing dimensions are in inches.
      - Truck dimensions are in inches.
      - Weights are in pounds.
    
    Parameters:
      listings (list of dict): Each dict must include:
          - listing_id: Unique ID.
          - length, width, height: Dimensions of a pallet (inches).
          - weight: Weight per pallet (pounds).
          - available_quantity: Available inventory.
          - min_price: Minimum acceptable price per pallet.
          - stackable: Boolean flag (True if pallets can be stacked).
          - warehouse_id: Identifier for the warehouse.
          
      bids (list of dict): Each dict must include:
          - bid_id: Unique ID.
          - buyer_id: Buyer identifier.
          - listing_id: Associated product listing.
          - bid_price: Price offered per pallet.
          - quantity_requested: Number of pallets requested.
          
      truck_params (dict): Truck parameters including:
          - truck_width: Truck interior width (inches).
          - truck_length: Truck interior length (inches).
          - truck_height: Truck interior height (inches).
          - max_weight: Maximum truck weight capacity (pounds).
          - max_volume: Maximum truck volume capacity (cubic inches).
          
    Returns:
      dict: Contains:
          - status: Solver status.
          - objective: Total revenue.
          - bid_allocations: Mapping (bid_id -> pallets allocated).
          - truck_allocations: Mapping ((buyer_id, warehouse_id) -> trucks used).
    """
    
    # Filter bids by minimum price.
    valid_bids = []
    for bid in bids:
        listing = next(l for l in listings if l['listing_id'] == bid['listing_id'])
        if bid['bid_price'] >= listing['min_price']:
            valid_bids.append(bid)
    
    # Build a lookup dictionary for listings.
    listing_dict = {l['listing_id']: l for l in listings}
    
    # For each bid, compute the maximum stacking factor.
    # If stackable: max_stack = floor(truck_height / pallet_height), else 1.
    bid_max_stack = {}
    for bid in valid_bids:
        l = listing_dict[bid['listing_id']]
        if l['stackable']:
            max_stack = int(truck_params['truck_height'] // l['height'])
            max_stack = max(max_stack, 1)
        else:
            max_stack = 1
            # For non-stackable items, if pallet height exceeds truck height, mark as infeasible.
            if l['height'] > truck_params['truck_height']:
                bid['quantity_requested'] = 0
        bid_max_stack[bid['bid_id']] = max_stack
    
    # Group bids by (buyer, warehouse) – each truckload can only mix products from one warehouse.
    buyer_warehouse_groups = defaultdict(list)
    for bid in valid_bids:
        l = listing_dict[bid['listing_id']]
        group_key = (bid['buyer_id'], l['warehouse_id'])
        buyer_warehouse_groups[group_key].append(bid)
    
    # Compute the truck floor area (in square inches).
    truck_floor_area = truck_params['truck_width'] * truck_params['truck_length']
    
    # Create the optimization model.
    model = pulp.LpProblem("Truckload_Optimization", pulp.LpMaximize)
    
    # Decision variables:
    # x_vars: Number of pallets allocated for each bid.
    x_vars = {}
    for bid in valid_bids:
        var_name = f"x_bid_{bid['bid_id']}"
        x_vars[bid['bid_id']] = pulp.LpVariable(var_name, lowBound=0, 
                                                 upBound=bid['quantity_requested'], 
                                                 cat='Integer')
    
    # s_vars: Number of stacks used for each bid.
    # Each stack occupies one pallet footprint computed as (length * width) of that pallet.
    s_vars = {}
    for bid in valid_bids:
        var_name = f"s_bid_{bid['bid_id']}"
        s_vars[bid['bid_id']] = pulp.LpVariable(var_name, lowBound=0, cat='Integer')
    
    # T_vars: Number of trucks used for each (buyer, warehouse) group.
    T_vars = {}
    for group_key in buyer_warehouse_groups.keys():
        buyer, warehouse = group_key
        var_name = f"T_{buyer}_{warehouse}"
        T_vars[group_key] = pulp.LpVariable(var_name, lowBound=0, cat='Integer')
    
    # Objective: Maximize total revenue from awarded pallets.
    model += pulp.lpSum(bid['bid_price'] * x_vars[bid['bid_id']] for bid in valid_bids), "Total_Revenue"
    
    # Group-level constraints (per buyer, warehouse):
    for group_key, group_bids in buyer_warehouse_groups.items():
        buyer, warehouse = group_key
        
        # (a) Weight constraint: Total weight of allocated pallets must not exceed truck capacity.
        model += (
            pulp.lpSum(x_vars[bid['bid_id']] * listing_dict[bid['listing_id']]['weight'] 
                       for bid in group_bids)
            <= T_vars[group_key] * truck_params['max_weight'],
            f"Weight_{buyer}_{warehouse}"
        )
        
        # (b) Volume constraint: Total volume must not exceed truck capacity.
        # Volume per pallet = length * width * height.
        model += (
            pulp.lpSum(x_vars[bid['bid_id']] * (listing_dict[bid['listing_id']]['length'] *
                                                  listing_dict[bid['listing_id']]['width'] *
                                                  listing_dict[bid['listing_id']]['height'])
                       for bid in group_bids)
            <= T_vars[group_key] * truck_params['max_volume'],
            f"Volume_{buyer}_{warehouse}"
        )
        
        # (c) Dynamic floor area constraint:
        # Total floor area used by stacks must not exceed the truck's floor area.
        model += (
            pulp.lpSum(s_vars[bid['bid_id']] * (listing_dict[bid['listing_id']]['length'] *
                                                 listing_dict[bid['listing_id']]['width'])
                       for bid in group_bids)
            <= T_vars[group_key] * truck_floor_area,
            f"FloorArea_{buyer}_{warehouse}"
        )
        
        # (d) Stacking constraint: For each bid, allocated pallets cannot exceed (number of stacks * max_stack).
        for bid in group_bids:
            max_stack = bid_max_stack[bid['bid_id']]
            model += (
                x_vars[bid['bid_id']] <= s_vars[bid['bid_id']] * max_stack,
                f"Stacking_{bid['bid_id']}"
            )
    
    # Global inventory constraints: For each listing, total allocated pallets across bids ≤ available inventory.
    listings_bid_groups = defaultdict(list)
    for bid in valid_bids:
        listings_bid_groups[bid['listing_id']].append(bid)
    
    for listing_id, group_bids in listings_bid_groups.items():
        available_qty = listing_dict[listing_id]['available_quantity']
        model += (
            pulp.lpSum(x_vars[bid['bid_id']] for bid in group_bids)
            <= available_qty,
            f"Inventory_{listing_id}"
        )
    
    # Solve the optimization model.
    solver = pulp.PULP_CBC_CMD(msg=True)
    model.solve(solver)
    
    # Prepare results.
    result = {
        "status": pulp.LpStatus[model.status],
        "objective": pulp.value(model.objective),
        "bid_allocations": {},      # bid_id -> allocated pallets
        "truck_allocations": {}     # (buyer, warehouse) -> trucks used
    }
    
    for bid in valid_bids:
        result["bid_allocations"][bid['bid_id']] = pulp.value(x_vars[bid['bid_id']])
    
    for group_key in buyer_warehouse_groups.keys():
        result["truck_allocations"][group_key] = pulp.value(T_vars[group_key])
    
    return result

# -----------------------------------------------------------------------------
# Example usage (for testing/integration):
if __name__ == "__main__":
    # Sample listings data (dimensions in inches, weight in pounds).
    listings = [
        {
            "listing_id": 1,
            "length": 48, "width": 40, "height": 60,  # inches
            "weight": 1100,                           # pounds
            "available_quantity": 100,
            "min_price": 200,
            "stackable": True,
            "warehouse_id": "A"
        },
        {
            "listing_id": 2,
            "length": 42, "width": 36, "height": 55,   # inches
            "weight": 900,                            # pounds
            "available_quantity": 80,
            "min_price": 150,
            "stackable": False,
            "warehouse_id": "A"
        },
        {
            "listing_id": 3,
            "length": 50, "width": 42, "height": 65,   # inches
            "weight": 1200,                           # pounds
            "available_quantity": 60,
            "min_price": 250,
            "stackable": True,
            "warehouse_id": "B"
        },
    ]
    
    # Sample bids data.
    bids = [
        {"bid_id": 1, "buyer_id": "Buyer1", "listing_id": 1, "bid_price": 220, "quantity_requested": 50},
        {"bid_id": 2, "buyer_id": "Buyer1", "listing_id": 2, "bid_price": 160, "quantity_requested": 30},
        {"bid_id": 3, "buyer_id": "Buyer2", "listing_id": 1, "bid_price": 210, "quantity_requested": 40},
        {"bid_id": 4, "buyer_id": "Buyer2", "listing_id": 3, "bid_price": 260, "quantity_requested": 20},
        {"bid_id": 5, "buyer_id": "Buyer1", "listing_id": 3, "bid_price": 255, "quantity_requested": 10}
    ]
    
    # Truck parameters (using inches and pounds).
    # For example, a truck with interior dimensions: 96" (width) x 288" (length) x 96" (height).
    truck_params = {
        "truck_width": 96,        # inches
        "truck_length": 288,      # inches
        "truck_height": 96,       # inches
        "max_weight": 80000,      # pounds
        # max_volume computed externally (truck_width * truck_length * truck_height)
        "max_volume": 96 * 288 * 96  # cubic inches
    }
    
    # Run the optimization.
    result = optimize_truckloads(listings, bids, truck_params)
    
    # Output the results.
    print("Optimization Status:", result["status"])
    print("Objective (Total Revenue):", result["objective"])
    print("Bid Allocations:")
    for bid_id, allocation in result["bid_allocations"].items():
        print(f"  Bid {bid_id}: {allocation} pallets allocated")
    print("Truck Allocations (Buyer, Warehouse):")
    for key, trucks in result["truck_allocations"].items():
        print(f"  {key}: {trucks} truck(s)")
