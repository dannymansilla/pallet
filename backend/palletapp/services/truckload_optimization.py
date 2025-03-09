import math
import pulp
from collections import defaultdict
from rectpack import newPacker  # pip install rectpack

def check_truck_layout_2d(pallet_stacks, truck_width, truck_length, bins=1):
    """
    Checks whether a set of pallet stack footprints (each as a (width, length, bid_info) tuple)
    can be arranged into the specified number of bins (truck floors) of size truck_width x truck_length.
    Allows rotation to improve packing.
    
    Returns:
      (feasible, placements)
      feasible (bool): True if all pallet stacks can be arranged, False otherwise.
      placements (dict): Mapping from truck index (0-based) to a list of placement dictionaries.
         Each placement dict contains keys: "x", "y", "width", "height", "bid_info" (a tuple (bid_id, stack_index)).
         If not feasible, placements is None.
    """
    packer = newPacker(rotation=True)
    
    bin_width = int(truck_width)
    bin_length = int(truck_length)
    packer.add_bin(bin_width, bin_length, count=bins)
    
    # Sort stacks descending by area for better packing.
    sorted_stacks = sorted(pallet_stacks, key=lambda rect: rect[0]*rect[1], reverse=True)
    
    # Add each pallet stack as a rectangle. Use bid_info (tuple: (bid_id, stack_index)) as the rectangle id.
    for rect in sorted_stacks:
        w, l, bid_info = rect
        packer.add_rect(int(w), int(l), rid=bid_info)
    
    packer.pack()
    
    total_rects_packed = sum(len(b) for b in packer)
    feasible = (total_rects_packed == len(pallet_stacks))
    
    placements = {}
    if feasible:
        for i, b in enumerate(packer):
            placements[i] = []
            # Each rectangle object has attributes: x, y, width, height, and rid.
            for rect in b:
                placements[i].append({
                    "x": rect.x,
                    "y": rect.y,
                    "width": rect.width,
                    "height": rect.height,
                    "bid_info": rect.rid  # This is a tuple: (bid_id, stack_index)
                })
    else:
        placements = None
        print(f"Debug: Layout failed for {bins} bin(s) ({bin_width}x{bin_length}) with stacks: {pallet_stacks}")
    
    return feasible, placements

def optimize_truckloads(listings, bids, truck_params):
    """
    Optimize truckload assignments for auction-based pallet allocation while verifying
    the physical layout via a dedicated 2D bin-packing algorithm.
    Additionally, returns a detailed breakdown of which bid's pallet stacks are assigned to which truck.
    
    The final result includes:
      - bid_allocations: allocated pallets per bid.
      - truck_allocations: per (buyer, warehouse) group, the number of trucks,
          a boolean for overall layout feasibility,
          the raw placements from bin packing, and
          a "truck_details" breakdown mapping each truck index to a per-bid pallet count.
    """
    # Filter bids by minimum price.
    valid_bids = []
    for bid in bids:
        listing = next(l for l in listings if l['listing_id'] == bid['listing_id'])
        if bid['bid_price'] >= listing['min_price']:
            valid_bids.append(bid)

    # Build a lookup dictionary for listings.
    listing_dict = {l['listing_id']: l for l in listings}

    # Compute maximum stacking factor for each bid.
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

    # Group bids by (buyer, warehouse).
    buyer_warehouse_groups = defaultdict(list)
    for bid in valid_bids:
        l = listing_dict[bid['listing_id']]
        group_key = (bid['buyer_id'], l['warehouse_id'])
        buyer_warehouse_groups[group_key].append(bid)

    # Compute truck floor area.
    truck_floor_area = truck_params['truck_width'] * truck_params['truck_length']

    # Create the optimization model.
    model = pulp.LpProblem("Truckload_Optimization", pulp.LpMaximize)

    # Decision variables: x_vars for pallets allocated.
    x_vars = {}
    for bid in valid_bids:
        var_name = f"x_bid_{bid['bid_id']}"
        x_vars[bid['bid_id']] = pulp.LpVariable(var_name, lowBound=0,
                                                 upBound=bid['quantity_requested'],
                                                 cat='Integer')

    # s_vars for the number of stacks per bid.
    s_vars = {}
    for bid in valid_bids:
        var_name = f"s_bid_{bid['bid_id']}"
        s_vars[bid['bid_id']] = pulp.LpVariable(var_name, lowBound=0, cat='Integer')

    # T_vars for the number of trucks used per (buyer, warehouse) group.
    T_vars = {}
    for group_key in buyer_warehouse_groups.keys():
        buyer, warehouse = group_key
        var_name = f"T_{buyer}_{warehouse}"
        T_vars[group_key] = pulp.LpVariable(var_name, lowBound=0, cat='Integer')

    # Objective: maximize total revenue.
    model += pulp.lpSum(bid['bid_price'] * x_vars[bid['bid_id']] for bid in valid_bids), "Total_Revenue"

    # Group-level constraints.
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

        # Floor area constraint.
        model += (
            pulp.lpSum(s_vars[bid['bid_id']] * (listing_dict[bid['listing_id']]['length'] *
                                                listing_dict[bid['listing_id']]['width'])
                       for bid in group_bids)
            <= T_vars[group_key] * truck_floor_area,
            f"FloorArea_{buyer}_{warehouse}"
        )

        # Stacking constraint for each bid.
        for bid in group_bids:
            max_stack = bid_max_stack[bid['bid_id']]
            model += (
                x_vars[bid['bid_id']] <= s_vars[bid['bid_id']] * max_stack,
                f"Stacking_{bid['bid_id']}"
            )

    # Global inventory constraints.
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
        "bid_allocations": {},  # Mapping: bid_id -> allocated pallets.
        "truck_allocations": {}  # Mapping: (buyer, warehouse) -> { trucks_used, layout_feasible, placements, truck_details }.
    }

    # Record bid allocations.
    for bid in valid_bids:
        result["bid_allocations"][bid['bid_id']] = pulp.value(x_vars[bid['bid_id']])

    # For each buyer-warehouse group, simulate the physical layout and compute per-truck breakdown.
    for group_key, group_bids in buyer_warehouse_groups.items():
        buyer, warehouse = group_key
        
        # For each bid in the group, compute the number of stacks and an exact distribution of allocated pallets.
        bid_stack_info = {}    # bid_id -> total stacks (s_vars)
        bid_stack_counts = {}  # bid_id -> list of pallet counts per stack (exact distribution)
        for bid in group_bids:
            s_val = pulp.value(s_vars[bid['bid_id']])
            s_val = int(round(s_val)) if s_val is not None else 0
            bid_stack_info[bid['bid_id']] = s_val
            total_allocated = pulp.value(x_vars[bid['bid_id']])
            total_allocated = int(round(total_allocated)) if total_allocated is not None else 0
            if s_val > 0:
                base = total_allocated // s_val
                rem = total_allocated % s_val
                # Assign exact pallet counts to each stack.
                stack_counts = [base + 1 if i < rem else base for i in range(s_val)]
            else:
                stack_counts = []
            bid_stack_counts[bid['bid_id']] = stack_counts

        # Build the list of pallet stacks to pack.
        # Each stack is now tagged with (bid_id, stack_index).
        pallet_stacks = []
        for bid in group_bids:
            s_val = bid_stack_info[bid['bid_id']]
            l = listing_dict[bid['listing_id']]
            for i in range(s_val):
                pallet_stacks.append((l['width'], l['length'], (bid['bid_id'], i)))
        
        # Check height feasibility.
        layout_height_feasible = True
        for bid in group_bids:
            s_val = bid_stack_info[bid['bid_id']]
            total_allocated = int(round(pulp.value(x_vars[bid['bid_id']])) if pulp.value(x_vars[bid['bid_id']]) is not None else 0)
            if s_val > 0:
                # Here, we know the exact count for each stack from bid_stack_counts.
                for count in bid_stack_counts[bid['bid_id']]:
                    stack_height = count * listing_dict[bid['listing_id']]['height']
                    if stack_height > truck_params['truck_height']:
                        layout_height_feasible = False
                        break
        
        trucks_allocated = int(round(pulp.value(T_vars[group_key])))
        if trucks_allocated < 1:
            trucks_allocated = 1

        # Get detailed placements from the bin packing algorithm.
        layout_2d_feasible, placements = check_truck_layout_2d(
            pallet_stacks,
            truck_params['truck_width'],
            truck_params['truck_length'],
            bins=trucks_allocated
        )
        
        # Process placements to compute an exact breakdown.
        # For each truck, for each placement, look up the bid_id and stack_index and sum the pallet counts.
        truck_details = {}  # truck index -> { bid_id: exact pallet count }
        if placements is not None:
            for truck_idx, placement_list in placements.items():
                detail = defaultdict(int)
                for placement in placement_list:
                    bid_info = placement["bid_info"]  # This is a tuple: (bid_id, stack_index)
                    bid_id, stack_index = bid_info
                    # Add the exact pallet count for that stack.
                    detail[bid_id] += bid_stack_counts[bid_id][stack_index]
                truck_details[truck_idx] = dict(detail)
        else:
            truck_details = None

        result["truck_allocations"][group_key] = {
            "trucks_used": trucks_allocated,
            "layout_feasible": layout_2d_feasible and layout_height_feasible,
            "placements": placements,       # Detailed placements from bin packing.
            "truck_details": truck_details  # Exact breakdown per truck.
        }

    return result

# -----------------------------------------------------------------------------
# Example usage (for testing/integration):
if __name__ == "__main__":
    # Synthetic Listings Data.
    listings = [
        {
            "listing_id": 1,
            "length": 48,   # inches
            "width": 40,    # inches
            "height": 60,   # inches
            "weight": 1100, # pounds
            "available_quantity": 100,
            "min_price": 200,
            "stackable": True,
            "warehouse_id": "A"
        },
        {
            "listing_id": 2,
            "length": 42,   # inches
            "width": 36,    # inches
            "height": 55,   # inches
            "weight": 900,  # pounds
            "available_quantity": 80,
            "min_price": 150,
            "stackable": False,
            "warehouse_id": "A"
        },
        {
            "listing_id": 3,
            "length": 50,   # inches
            "width": 42,    # inches
            "height": 65,   # inches
            "weight": 1200, # pounds
            "available_quantity": 60,
            "min_price": 250,
            "stackable": True,
            "warehouse_id": "B"
        },
    ]

    # Synthetic Bids Data.
    bids = [
        {"bid_id": 1, "buyer_id": "Buyer1", "listing_id": 1, "bid_price": 220, "quantity_requested": 50},
        {"bid_id": 2, "buyer_id": "Buyer1", "listing_id": 2, "bid_price": 160, "quantity_requested": 30},
        {"bid_id": 3, "buyer_id": "Buyer2", "listing_id": 1, "bid_price": 210, "quantity_requested": 40},
        {"bid_id": 4, "buyer_id": "Buyer2", "listing_id": 3, "bid_price": 260, "quantity_requested": 20},
        {"bid_id": 5, "buyer_id": "Buyer1", "listing_id": 3, "bid_price": 255, "quantity_requested": 10},
    ]

    # Truck Parameters for a Standard 53-foot Trailer.
    truck_params = {
        "truck_width": 99,            # inches
        "truck_length": 636,          # inches (53 ft * 12)
        "truck_height": 110.25,       # inches
        "max_weight": 42000,          # pounds
        "max_volume": 4000 * 1728     # cubic inches (4,000 cubic ft)
    }

    result = optimize_truckloads(listings, bids, truck_params)

    print("Optimization Status:", result["status"])
    print("Objective (Total Revenue):", result["objective"])
    print("\nBid Allocations:")
    for bid_id, allocation in result["bid_allocations"].items():
        print(f"  Bid {bid_id}: {allocation} pallets allocated")
    print("\nTruck Allocations (Buyer, Warehouse):")
    for key, info in result["truck_allocations"].items():
        print(f"  {key}: {info['trucks_used']} truck(s), layout feasible: {info['layout_feasible']}")
        if info.get("placements"):
            print("    Detailed Placements per Truck:")
            for truck_idx, placements in info["placements"].items():
                print(f"      Truck {truck_idx+1}:")
                for placement in placements:
                    bid_info = placement['bid_info']
                    print(f"         Bid {bid_info[0]}, Stack {bid_info[1]} at (x={placement['x']}, y={placement['y']}), "
                          f"size=({placement['width']}x{placement['height']})")
        if info.get("truck_details"):
            print("    Truck Composition Breakdown:")
            for truck_idx, details in info["truck_details"].items():
                print(f"      Truck {truck_idx+1}:")
                for bid_id, count in details.items():
                    print(f"         Bid {bid_id}: {count} pallets")
