import random
import itertools
from math import floor
import pulp

# -----------------------------------------------------------------
# DATA MODELS
# -----------------------------------------------------------------

class Listing:
    def __init__(self, listing_id, warehouse_id, length, width, height,
                 weight, available_qty, min_price, stackable):
        self.id = listing_id
        self.warehouse_id = warehouse_id
        self.length = length
        self.width = width
        self.height = height
        self.weight = weight
        self.available_qty = available_qty
        self.min_price = min_price
        self.stackable = stackable

class Bid:
    def __init__(self, bid_id, buyer_id, listing_id, price_per_pallet, qty_requested):
        self.id = bid_id
        self.buyer_id = buyer_id
        self.listing_id = listing_id
        self.price_per_pallet = price_per_pallet
        self.qty_requested = qty_requested

class Truck:
    def __init__(self, length, width, height, max_weight):
        self.length = length   # total inside length
        self.width = width     # total inside width
        self.height = height   # total inside height
        self.max_weight = max_weight

# -----------------------------------------------------------------
# SYNTHETIC DATA GENERATION
# -----------------------------------------------------------------

def generate_synthetic_data(num_listings=8, num_buyers=5, seed=42):
    """
    Generates synthetic listings, bids, and a single truck configuration.
    Adjust as needed for your scenario.
    """
    random.seed(seed)
    warehouse_ids = ["W1", "W2"]

    listings = []
    for i in range(num_listings):
        warehouse_id = random.choice(warehouse_ids)
        length = 42
        width = 42
        height = random.randint(40, 60)
        weight = random.randint(100, 500)
        available_qty = random.randint(50, 100)
        min_price = random.uniform(10.0, 20.0)
        stackable = bool(random.choice([True, False]))
        listing_obj = Listing(
            listing_id=f"L{i+1}",
            warehouse_id=warehouse_id,
            length=length,
            width=width,
            height=height,
            weight=weight,
            available_qty=available_qty,
            min_price=round(min_price, 2),
            stackable=stackable
        )
        listings.append(listing_obj)

    bids = []
    bid_id = 1
    for buyer_idx in range(1, num_buyers+1):
        buyer_id = f"Buyer{buyer_idx}"
        for listing in listings:
            # 70% chance the buyer bids on the listing
            if random.random() < 0.7:
                price_per_pallet = random.uniform(listing.min_price, listing.min_price + 20)
                qty_requested = random.randint(1, listing.available_qty)
                bids.append(Bid(
                    bid_id=f"B{bid_id}",
                    buyer_id=buyer_id,
                    listing_id=listing.id,
                    price_per_pallet=round(price_per_pallet, 2),
                    qty_requested=qty_requested
                ))
                bid_id += 1

    # Single truck config for demonstration
    truck_config = Truck(length=636, width=100, height=110, max_weight=45000)
    return listings, bids, truck_config

# -----------------------------------------------------------------
# BID FILTERING
# -----------------------------------------------------------------

def filter_bids_min_price(listings, bids):
    """
    Exclude bids that fall below the listing's minimum price.
    """
    listing_min_price = {l.id: l.min_price for l in listings}
    filtered = []
    excluded = []
    for b in bids:
        if b.price_per_pallet >= listing_min_price[b.listing_id]:
            filtered.append(b)
        else:
            excluded.append(b)
    return filtered, excluded

# -----------------------------------------------------------------
# VOLUME & CANDIDATE TRUCKLOAD BUILDING
# -----------------------------------------------------------------

def approximate_volume(listing_obj):
    """Approximate volume for pruning."""
    return listing_obj.length * listing_obj.width * listing_obj.height

def build_candidate_truckloads(listings, bids, truck, step_factor=10):
    """
    Creates candidate truckloads by enumerating partial quantities in steps,
    pruning obviously infeasible combos (by weight or approximate volume).
    """
    listing_map = {l.id: l for l in listings}
    truck_floor_area = truck.length * truck.width
    truck_volume = truck_floor_area * truck.height

    # Group bids by (buyer, warehouse)
    bw_map = {}
    for b in bids:
        warehouse_id = listing_map[b.listing_id].warehouse_id
        key = (b.buyer_id, warehouse_id)
        if key not in bw_map:
            bw_map[key] = []
        bw_map[key].append(b)

    candidate_truckloads = []
    for (buyer_id, wh_id), bid_list in bw_map.items():
        # Gather listing-bid info for this buyer/warehouse
        listing_bids = []
        for b in bid_list:
            listing_bids.append((b.listing_id, b.qty_requested, b.price_per_pallet))

        # Convert max_qty to "stepped" enumerations
        all_candidate_qtys = []
        for (lid, max_qty, price) in listing_bids:
            step_size = max(1, max_qty // step_factor)
            possible_qtys = []
            for q in range(step_size, max_qty + 1, step_size):
                possible_qtys.append(min(q, max_qty))
            if max_qty not in possible_qtys:
                possible_qtys.append(max_qty)
            possible_qtys = sorted(set(possible_qtys))

            all_candidate_qtys.append((lid, possible_qtys, price))

        # Build cartesian product
        lids_only = [p[0] for p in all_candidate_qtys]
        range_arrays = [p[1] for p in all_candidate_qtys]
        product_lists = itertools.product(*range_arrays)

        for combo in product_lists:
            listing_qty = {}
            total_revenue = 0.0
            total_weight = 0.0
            total_volume = 0.0
            for i, qty in enumerate(combo):
                lid = lids_only[i]
                price = all_candidate_qtys[i][2]
                listing_qty[lid] = listing_qty.get(lid, 0) + qty
                total_revenue += qty * price

                lobj = listing_map[lid]
                total_weight += lobj.weight * qty
                total_volume += approximate_volume(lobj) * qty

            # Basic pruning checks
            if sum(listing_qty.values()) == 0:
                continue
            if total_weight > truck.max_weight:
                continue
            if total_volume > truck_volume * 1.2:  # prune large volume combos
                continue

            candidate_truckloads.append({
                "buyer_id": buyer_id,
                "warehouse_id": wh_id,
                "listing_qty": listing_qty,
                "revenue": round(total_revenue, 2)
            })
    return candidate_truckloads

# -----------------------------------------------------------------
# 3D BIN-PACKING FEASIBILITY CHECK
# -----------------------------------------------------------------

def check_bin_packing_feasibility_3d(candidate, listing_map, truck):
    """
    A naive 3D bin packing approach that:
      - Sorts pallets (items) by footprint area (length*width), largest first.
      - Tries to place each pallet on the floor (z=0) if space is available.
      - If the pallet is stackable AND an existing pallet on the floor
        (or stacked) can support it (same length & width, space left in height),
        place it on top of that pallet.

    Returns:
      feasible (bool),
      placement_layout (list of (x_offset, y_offset, z_offset, item_dict)),
      total_weight,
      leftover_volume (approx)
    """
    listing_qty = candidate["listing_qty"]
    items = []
    for lid, qty in listing_qty.items():
        l = listing_map[lid]
        for _ in range(qty):
            items.append({
                "listing_id": lid,
                "length": l.length,
                "width": l.width,
                "height": l.height,
                "stackable": l.stackable,
                "weight": l.weight
            })

    # Sort items by (area desc), then height desc
    items.sort(key=lambda x: (x["length"] * x["width"], x["height"]), reverse=True)

    total_weight = sum(i["weight"] for i in items)
    if total_weight > truck.max_weight:
        return False, [], total_weight, None

    truck_floor_area = truck.length * truck.width
    truck_volume = truck_floor_area * truck.height

    placed_positions = []  # list of (x, y, z, item)
    used_volume = 0

    # We'll track the "floor rows" in a simplistic way:
    # Each row will have:
    #   - x_offset: how far along the length we are
    #   - used_width: how wide we've filled in this row so far
    #   - max_height_in_row: the tallest pallet in this row (for floor-level items)
    #
    # In a more advanced approach, you'd do a real 2D or 3D bin packing algorithm.
    rows = []
    current_x_offset = 0

    for item in items:
        item_volume = item["length"] * item["width"] * item["height"]
        item_placed = False

        # Try to place the item in an existing row on the floor (z=0)
        for row in rows:
            if row["used_width"] + item["width"] <= truck.width:
                # Check if we can stack it on top of an existing pallet in this row
                # (Only if item is stackable, and the base pallet is stackable,
                #  and footprints match.)
                stacked_on = None
                for pp in row["placed_on_floor"]:
                    # pp is (x_offset, y_offset, z_offset, item_dict)
                    base_item = pp[3]
                    if (base_item["stackable"] and item["stackable"] and
                            base_item["length"] == item["length"] and
                            base_item["width"] == item["width"]):
                        # The new z will be base_item's top
                        new_z = pp[2] + base_item["height"]
                        if new_z + item["height"] <= truck.height:
                            stacked_on = pp
                            break

                if stacked_on:
                    # Place on top of stacked_on
                    base_pp_x, base_pp_y, base_pp_z, base_item = stacked_on
                    new_z = base_pp_z + base_item["height"]
                    placed_positions.append((row["x_offset"], row["used_width"], new_z, item))
                    used_volume += item_volume
                    row["used_width"] += item["width"]
                    item_placed = True
                    break
                else:
                    # Place on the floor if there's still capacity in row width
                    placed_positions.append((row["x_offset"], row["used_width"], 0, item))
                    used_volume += item_volume
                    row["used_width"] += item["width"]
                    row["placed_on_floor"].append(
                        (row["x_offset"], row["used_width"] - item["width"], 0, item)
                    )
                    # Update row height if needed
                    if item["height"] > row["max_height_in_row"]:
                        row["max_height_in_row"] = item["height"]
                        if row["max_height_in_row"] > truck.height:
                            return False, placed_positions, total_weight, None
                    item_placed = True
                    break

        # If not placed in an existing row, try starting a new row
        if not item_placed:
            # Check if there's enough length left for a new row
            if current_x_offset + item["length"] > truck.length:
                # Not enough length for a new row
                return False, placed_positions, total_weight, None

            # Make a new row
            new_row = {
                "x_offset": current_x_offset,
                "used_width": 0,
                "max_height_in_row": 0,
                "placed_on_floor": []  # track items on the floor in this row
            }
            rows.append(new_row)
            # Place the item on the floor (z=0)
            placed_positions.append((new_row["x_offset"], new_row["used_width"], 0, item))
            used_volume += item_volume
            new_row["placed_on_floor"].append(
                (new_row["x_offset"], new_row["used_width"], 0, item)
            )
            new_row["used_width"] += item["width"]
            if item["height"] > new_row["max_height_in_row"]:
                new_row["max_height_in_row"] = item["height"]
                if new_row["max_height_in_row"] > truck.height:
                    return False, placed_positions, total_weight, None

            item_placed = True

            # Advance x_offset for future rows only after we fill up this row
            # in terms of length. This is a naive approach: once the row is 'done'
            # we move to the next row. We'll do that after we've placed all we can.
            # For simplicity, we won't do it immediately here.

    # After placing all items, let's finalize the used length:
    # The used length is basically the last row's x_offset + the tallest item in that row
    # but we'll do it more simply:
    final_row_x = 0
    for row in rows:
        row_length = row["x_offset"] + row["max_height_in_row"]
        if row_length > final_row_x:
            final_row_x = row_length

    # If final_row_x > truck.length, not feasible
    # (though in this naive approach, we tried to check it earlier)
    if final_row_x > truck.length:
        return False, placed_positions, total_weight, None

    leftover_volume = truck_volume - used_volume
    if leftover_volume < 0:
        leftover_volume = None  # indicates we overfilled

    return True, placed_positions, total_weight, leftover_volume

# -----------------------------------------------------------------
# TWO-PHASE SOLVER
# -----------------------------------------------------------------

def solve_phase1_max_revenue(feasible_combinations, listings):
    """
    Phase 1: Maximize total revenue.
    Returns the model, solver, solution, and best revenue.
    """
    listing_avail = {l.id: l.available_qty for l in listings}
    model = pulp.LpProblem("Truckload_Optimization_Phase1", pulp.LpMaximize)

    x = {}
    for c in feasible_combinations:
        c_id = c["id"]
        x[c_id] = pulp.LpVariable(f"x_{c_id}", cat=pulp.LpBinary)

    # Objective: Maximize sum of revenue
    model += pulp.lpSum([
        c["revenue"] * x[c["id"]]
        for c in feasible_combinations
    ]), "MaxRevenue"

    # Inventory constraints
    for l in listings:
        lid = l.id
        model += pulp.lpSum([
            c["listing_qty"].get(lid, 0) * x[c["id"]]
            for c in feasible_combinations
        ]) <= listing_avail[lid], f"Inv_{lid}"

    solver = pulp.PULP_CBC_CMD(msg=1, timeLimit=1200, gapRel=0.05)
    model.solve(solver)

    best_revenue = pulp.value(model.objective)

    # Collect chosen combos for clarity
    chosen_phase1 = []
    for c in feasible_combinations:
        if pulp.value(x[c["id"]]) == 1:
            chosen_phase1.append(c)

    return model, solver, chosen_phase1, best_revenue

def solve_phase2_min_leftover(feasible_combinations, listings, best_revenue):
    """
    Phase 2: Constrain revenue >= best_revenue, then minimize leftover space.
    """
    listing_avail = {l.id: l.available_qty for l in listings}
    phase2_model = pulp.LpProblem("Truckload_Optimization_Phase2", pulp.LpMinimize)

    x2 = {}
    for c in feasible_combinations:
        c_id = c["id"]
        x2[c_id] = pulp.LpVariable(f"x2_{c_id}", cat=pulp.LpBinary)

    # Minimize leftover space
    phase2_model += pulp.lpSum([
        c["leftover_volume"] * x2[c["id"]]
        for c in feasible_combinations
    ]), "MinimizeLeftover"

    # Inventory constraints
    for l in listings:
        lid = l.id
        phase2_model += pulp.lpSum([
            c["listing_qty"].get(lid, 0) * x2[c["id"]]
            for c in feasible_combinations
        ]) <= listing_avail[lid], f"Inv_{lid}"

    # Force total revenue >= best_revenue - small epsilon
    phase2_model += pulp.lpSum([
        c["revenue"] * x2[c["id"]]
        for c in feasible_combinations
    ]) >= (best_revenue - 1e-6), "FixRevenue"

    solver2 = pulp.PULP_CBC_CMD(msg=1, timeLimit=300, gapRel=0.05)
    phase2_model.solve(solver2)

    chosen_phase2 = []
    for c in feasible_combinations:
        if pulp.value(x2[c["id"]]) == 1:
            chosen_phase2.append(c)

    return chosen_phase2, pulp.value(phase2_model.objective)

# -----------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------

def main():
    # 1) Generate synthetic data
    listings, bids, truck_config = generate_synthetic_data(
        num_listings=5,  # tweak to see bigger or smaller
        num_buyers=3,
        seed=42
    )

    # Print listings
    print("=== LISTINGS ===")
    for l in listings:
        print(f"Listing {l.id}: Warehouse={l.warehouse_id}, "
              f"Size=({l.length}x{l.width}x{l.height}), "
              f"Weight={l.weight}, MinPrice={l.min_price:.2f}, "
              f"Stackable={l.stackable}, AvailableQty={l.available_qty}")
    print()

    # 2) Filter bids
    filtered_bids, excluded_bids = filter_bids_min_price(listings, bids)

    print("=== EXCLUDED BIDS (below min price) ===")
    for b in excluded_bids:
        print(f"  {b.id} - Buyer={b.buyer_id}, Listing={b.listing_id}, Price={b.price_per_pallet}")
    print()

    print("=== USED (FILTERED) BIDS ===")
    for b in filtered_bids:
        print(f"  {b.id} - Buyer={b.buyer_id}, Listing={b.listing_id}, "
              f"Price={b.price_per_pallet}, Qty={b.qty_requested}")
    print()

    # 3) Build candidate truckloads
    candidate_truckloads = build_candidate_truckloads(listings, filtered_bids, truck_config, step_factor=20)
    print(f"Candidate truckloads (after pruning & stepping): {len(candidate_truckloads)}")

    # 4) Bin-packing feasibility check (3D)
    listing_map = {l.id: l for l in listings}
    feasible_combinations = []
    combo_id = 1
    truck_floor_area = truck_config.length * truck_config.width
    truck_volume = truck_floor_area * truck_config.height

    for c in candidate_truckloads:
        feasible, layout, total_weight, leftover_volume = check_bin_packing_feasibility_3d(c, listing_map, truck_config)
        if feasible and leftover_volume is not None:
            new_c = dict(c)
            new_c["id"] = combo_id
            new_c["layout"] = layout
            new_c["total_weight"] = total_weight
            new_c["leftover_volume"] = leftover_volume
            feasible_combinations.append(new_c)
            combo_id += 1

    print(f"Feasible combos after 3D bin packing: {len(feasible_combinations)}")

    if not feasible_combinations:
        print("No feasible combinations found. Exiting.")
        return

    # -------------------------------
    # PHASE 1: Maximize Revenue
    # -------------------------------
    model1, solver1, chosen_phase1, best_revenue = solve_phase1_max_revenue(feasible_combinations, listings)
    print(f"\nPHASE 1 (Max Revenue) => Best Revenue = ${best_revenue:,.2f}")
    print(f"Chosen combos in phase 1: {len(chosen_phase1)}")

    # -------------------------------
    # PHASE 2: Among max-revenue, minimize leftover
    # -------------------------------
    chosen_phase2, best_leftover = solve_phase2_min_leftover(feasible_combinations, listings, best_revenue)
    print(f"PHASE 2 (Minimize leftover) => leftover volume = {best_leftover:,.2f}")
    print(f"Chosen combos in phase 2: {len(chosen_phase2)}")

    # Summarize final solution
    total_rev = sum(c["revenue"] for c in chosen_phase2)
    total_leftover = sum(c["leftover_volume"] for c in chosen_phase2)

    print(f"\n=== FINAL 2-PHASE SOLUTION ===")
    print(f"Revenue: ${total_rev:,.2f}, Total leftover volume: {total_leftover:,.2f}\n")

    for c in chosen_phase2:
        buyer_id = c["buyer_id"]
        wh_id = c["warehouse_id"]
        rev = c["revenue"]
        leftover = c["leftover_volume"]
        q_str = ", ".join([f"{lid}:{qty}" for lid, qty in c["listing_qty"].items()])
        print(f"  Truckload {c['id']}: Buyer={buyer_id}, Warehouse={wh_id}, "
              f"Revenue=${rev:.2f}, leftoverVol={leftover:.2f}, Pallets=({q_str}), WtUsed={c['total_weight']}")
        layout_preview = c["layout"][:]  # show first few pallets
        for idx, (px, py, pz, item) in enumerate(layout_preview, start=1):
            print(f"    Pallet #{idx} -> listing={item['listing_id']}, "
                  f"pos=({px:.1f},{py:.1f},{pz:.1f}), "
                  f"size=({item['length']}x{item['width']}x{item['height']}), "
                  f"stackable={item['stackable']}")
        # if len(c["layout"]) > 5:
        #     print(f"    ... {len(c['layout'])-5} more pallets ...")
        print()

# -----------------------------------------------------------------
# ENTRY POINT
# -----------------------------------------------------------------

if __name__ == "__main__":
    main()
