import math
import pulp
from collections import defaultdict
from rectpack import newPacker  # pip install rectpack

def check_truck_layout_2d(pallet_stacks, truck_width, truck_length):
    """
    Checks whether a set of pallet stack footprints (each given as a tuple (width, length))
    can be arranged on a truck floor with dimensions truck_width x truck_length.

    Parameters:
      pallet_stacks (list of tuples): Each tuple is (width, length) in inches.
      truck_width (int or float): Truck interior width (inches).
      truck_length (int or float): Truck interior length (inches).

    Returns:
      bool: True if a feasible layout exists, False otherwise.
    """
    packer = newPacker()

    # Add one bin representing the truck floor.
    packer.add_bin(truck_width, truck_length)

    # Add all pallet stacks as rectangles.
    for (w, l) in pallet_stacks:
        packer.add_rect(w, l)

    # Pack the items.
    packer.pack()

    # Check if all rectangles were placed in the bin.
    total_rects_packed = sum(len(b) for b in packer)
    return total_rects_packed == len(pallet_stacks)


def optimize_truckloads(listings, bids, truck_params):
    """
    Optimize truckload assignments for auction-based pallet allocation while verifying
    the physical layout via a dedicated 2D bin-packing algorithm.

    Assumptions:
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
          - truck_allocations: Mapping ((buyer_id, warehouse_id) -> {
                                 "trucks_used": number,
                                 "layout_feasible": True/False }).
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
    # For stackable items: max_stack = floor(truck_height / pallet_height); otherwise, 1.
    bid_max_stack = {}
    for bid in valid_bids:
        l = listing_dict[bid['listing_id']]
        if l['stackable']:
            max_stack = int(truck_params['truck_height'] // l['height'])
            max_stack = max(max_stack, 1)
        else:
            max_stack = 1
            if l['height'] > truck_params['truck_height']:
                bid['quantity_requested'] = 0  # Infeasible if non-stackable and too tall.
        bid_max_stack[bid['bid_id']] = max_stack

    # Group bids by (buyer, warehouse). Each truckload can only contain products from one warehouse.
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
    # Each stack uses one pallet footprint (dimensions: listing width x listing length).
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

        # Weight constraint.
        model += (
            pulp.lpSum(x_vars[bid['bid_id']] * listing_dict[bid['listing_id']]['weight']
                       for bid in group_bids)
            <= T_vars[group_key] * truck_params['max_weight'],
            f"Weight_{buyer}_{warehouse}"
        )

        # Volume constraint.
        model += (
            pulp.lpSum(x_vars[bid['bid_id']] * (listing_dict[bid['listing_id']]['length'] *
                                                  listing_dict[bid['listing_id']]['width'] *
                                                  listing_dict[bid['listing_id']]['height'])
                       for bid in group_bids)
            <= T_vars[group_key] * truck_params['max_volume'],
            f"Volume_{buyer}_{warehouse}"
        )

        # Dynamic floor area constraint:
        # The total floor area used by all stacks must not exceed the truck's floor area.
        model += (
            pulp.lpSum(s_vars[bid['bid_id']] * (listing_dict[bid['listing_id']]['length'] *
                                                 listing_dict[bid['listing_id']]['width'])
                       for bid in group_bids)
            <= T_vars[group_key] * truck_floor_area,
            f"FloorArea_{buyer}_{warehouse}"
        )

        # For each bid, enforce the stacking constraint:
        # Allocated pallets must not exceed (number of stacks * maximum pallets per stack).
        for bid in group_bids:
            max_stack = bid_max_stack[bid['bid_id']]
            model += (
                x_vars[bid['bid_id']] <= s_vars[bid['bid_id']] * max_stack,
                f"Stacking_{bid['bid_id']}"
            )

    # Global inventory constraints: For each listing, total allocated pallets ≤ available inventory.
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

    # Prepare the optimization results.
    result = {
        "status": pulp.LpStatus[model.status],
        "objective": pulp.value(model.objective),
        "bid_allocations": {},  # bid_id -> allocated pallets
        "truck_allocations": {}  # (buyer, warehouse) -> { "trucks_used": number, "layout_feasible": True/False }
    }

    for bid in valid_bids:
        result["bid_allocations"][bid['bid_id']] = pulp.value(x_vars[bid['bid_id']])

    # For each buyer-warehouse group, simulate the physical layout using the bin-packing module.
    # Build candidate pallet stack footprints for each group.
    for group_key, group_bids in buyer_warehouse_groups.items():
        buyer, warehouse = group_key

        # For each bid in the group, get the number of stacks from the optimization result.
        pallet_stacks = []  # list of (width, length) for each stack.
        layout_height_feasible = True  # We'll check each stack's height separately.
        for bid in group_bids:
            s_val = pulp.value(s_vars[bid['bid_id']])
            if s_val is None:
                s_val = 0
            s_val = int(round(s_val))
            if s_val > 0:
                l = listing_dict[bid['listing_id']]
                # Add 's_val' stacks of this pallet type.
                for _ in range(s_val):
                    pallet_stacks.append((l['width'], l['length']))
                # Check height feasibility for this bid:
                # Compute the maximum stack height possible (assume evenly distributed pallets among stacks).
                x_val = pulp.value(x_vars[bid['bid_id']])
                if x_val is None:
                    x_val = 0
                x_val = int(round(x_val))
                # Assume pallets are evenly distributed among stacks.
                if s_val > 0:
                    pallets_per_stack = math.ceil(x_val / s_val)
                    stack_height = pallets_per_stack * l['height']
                    if stack_height > truck_params['truck_height']:
                        layout_height_feasible = False

        # Use the dedicated 2D bin-packing algorithm to check floor layout feasibility.
        layout_2d_feasible = check_truck_layout_2d(pallet_stacks, truck_params['truck_width'], truck_params['truck_length'])

        result["truck_allocations"][group_key] = {
            "trucks_used": pulp.value(T_vars[group_key]),
            "layout_feasible": layout_2d_feasible and layout_height_feasible
        }

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
    # Example truck interior dimensions: width = 96", length = 288", height = 96".
    truck_params = {
        "truck_width": 96,        # inches
        "truck_length": 288,      # inches
        "truck_height": 96,       # inches
        "max_weight": 80000,      # pounds
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
    for key, info in result["truck_allocations"].items():
        print(f"  {key}: {info['trucks_used']} truck(s), layout feasible: {info['layout_feasible']}")
