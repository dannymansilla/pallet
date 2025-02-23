# Real-World Test Data for Henkel's Excess Inventory

# Synthetic Listings Data (each listing represents a different Henkel product)
listings = [
    {
        "listing_id": 1,
        # Henkel Adhesive A
        "length": 48,   # inches
        "width": 40,    # inches
        "height": 60,   # inches
        "weight": 1000, # pounds per pallet
        "available_quantity": 200,  # pallets available
        "min_price": 150,           # minimum acceptable price per pallet
        "stackable": True,
        "warehouse_id": "WH1"
    },
    {
        "listing_id": 2,
        # Henkel Adhesive B
        "length": 50,   # inches
        "width": 42,    # inches
        "height": 65,   # inches
        "weight": 1100, # pounds per pallet
        "available_quantity": 150,
        "min_price": 160,
        "stackable": True,
        "warehouse_id": "WH1"
    },
    {
        "listing_id": 3,
        # Henkel Cleaner (non-stackable)
        "length": 40,   # inches
        "width": 35,    # inches
        "height": 50,   # inches
        "weight": 900,  # pounds per pallet
        "available_quantity": 300,
        "min_price": 120,
        "stackable": False,
        "warehouse_id": "WH1"
    },
    {
        "listing_id": 4,
        # Henkel Degreaser (non-stackable)
        "length": 42,   # inches
        "width": 38,    # inches
        "height": 55,   # inches
        "weight": 950,  # pounds per pallet
        "available_quantity": 100,
        "min_price": 140,
        "stackable": False,
        "warehouse_id": "WH1"
    },
    {
        "listing_id": 5,
        # Henkel Adhesive C
        "length": 52,   # inches
        "width": 44,    # inches
        "height": 70,   # inches
        "weight": 1200, # pounds per pallet
        "available_quantity": 80,
        "min_price": 180,
        "stackable": True,
        "warehouse_id": "WH1"
    }
]

# Synthetic Bids Data
# Each bid comes from a buyer and is for a particular product listing.
bids = [
    {"bid_id": 1, "buyer_id": "Buyer1", "listing_id": 1, "bid_price": 155, "quantity_requested": 50},
    {"bid_id": 2, "buyer_id": "Buyer1", "listing_id": 2, "bid_price": 165, "quantity_requested": 30},
    {"bid_id": 3, "buyer_id": "Buyer2", "listing_id": 1, "bid_price": 160, "quantity_requested": 70},
    {"bid_id": 4, "buyer_id": "Buyer2", "listing_id": 3, "bid_price": 125, "quantity_requested": 100},
    {"bid_id": 5, "buyer_id": "Buyer3", "listing_id": 4, "bid_price": 145, "quantity_requested": 40},
    {"bid_id": 6, "buyer_id": "Buyer1", "listing_id": 5, "bid_price": 185, "quantity_requested": 20},
    {"bid_id": 7, "buyer_id": "Buyer2", "listing_id": 5, "bid_price": 190, "quantity_requested": 15},
    {"bid_id": 8, "buyer_id": "Buyer3", "listing_id": 2, "bid_price": 170, "quantity_requested": 25},
    {"bid_id": 9, "buyer_id": "Buyer3", "listing_id": 1, "bid_price": 155, "quantity_requested": 30},
    {"bid_id": 10, "buyer_id": "Buyer2", "listing_id": 4, "bid_price": 150, "quantity_requested": 20}
]

# Truck Parameters for a Standard 53-foot Trailer.
truck_params = {
    "truck_width": 99,            # inches
    "truck_length": 636,          # inches (53 ft * 12)
    "truck_height": 110.25,       # inches
    "max_weight": 42000,          # pounds
    "max_volume": 4000 * 1728     # cubic inches (4,000 cubic ft)
}

# Now, you can run your optimization algorithm (using your complete code)
# and then use the visualization code (provided in previous responses)
# to see how trucks are filled and allocated.

# For example:
if __name__ == "__main__":
    from truckload_optimization import optimize_truckloads  # assuming your code is modularized

    result = optimize_truckloads(listings, bids, truck_params)
    
    # Print out the result for verification
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
    
    # Then call your visualization function (from your visualization module)
    from truckload_visualization import visualize_truckload_results  # assuming your code is modularized
    visualize_truckload_results(result, truck_params)
