import math
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from collections import defaultdict

def visualize_summary(result):
    """Print a summary dashboard of the optimization results."""
    print("----- Optimization Summary -----")
    print(f"Status: {result.get('status', 'N/A')}")
    print(f"Total Revenue (Objective): ${result.get('objective', 0)}")
    print("\nBid Allocations:")
    for bid_id, alloc in result.get("bid_allocations", {}).items():
        print(f"  Bid {bid_id}: {alloc} pallets allocated")
    print("\nTruck Allocations (Buyer, Warehouse):")
    for key, info in result.get("truck_allocations", {}).items():
        print(f"  {key}: {info['trucks_used']} truck(s), layout feasible: {info['layout_feasible']}")
        if info.get("truck_details"):
            print("    Truck Composition Breakdown:")
            for truck_idx, breakdown in info["truck_details"].items():
                breakdown_str = ", ".join([f"Bid {bid_id}: {count} pallets" for bid_id, count in breakdown.items()])
                print(f"      Truck {truck_idx+1}: {breakdown_str}")
    print("--------------------------------\n")

def visualize_truck_layout(truck_idx, placements, truck_params, group_key):
    """
    Create a schematic visualization of a single truck's floor.
    Draws the truck floor as a rectangle, and overlays each pallet stack placement.
    Each placement is annotated with "Bid {bid_id}, Stack {stack_index}".
    """
    truck_width = truck_params['truck_width']
    truck_length = truck_params['truck_length']
    
    fig, ax = plt.subplots(figsize=(8, 4))
    title = f"Truck Layout for Group {group_key} - Truck {truck_idx+1}"
    ax.set_title(title)
    
    # Draw truck floor outline.
    truck_rect = patches.Rectangle((0, 0), truck_width, truck_length,
                                   linewidth=2, edgecolor='black', facecolor='none')
    ax.add_patch(truck_rect)
    
    # Draw each placed pallet stack.
    # placements is a list of dictionaries with keys: x, y, width, height, bid_info.
    for placement in placements:
        x = placement["x"]
        y = placement["y"]
        w = placement["width"]
        h = placement["height"]
        bid_id, stack_index = placement["bid_info"]
        # Use a light color fill; you can modify color selection as needed.
        rect_patch = patches.Rectangle((x, y), w, h, linewidth=1,
                                       edgecolor='blue', facecolor='lightblue', alpha=0.6)
        ax.add_patch(rect_patch)
        label = f"Bid {bid_id}, Stk {stack_index}"
        ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=8)
    
    ax.set_xlim(0, truck_width)
    ax.set_ylim(0, truck_length)
    ax.set_xlabel("Truck Width (inches)")
    ax.set_ylabel("Truck Length (inches)")
    ax.set_aspect('equal')
    # Invert y-axis if you want (optional)
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.show()

def visualize_truck_composition(truck_details, group_key):
    """
    Creates a bar chart for the truck composition breakdown for a given group.
    truck_details is a dictionary: truck_idx -> { bid_id: pallet_count, ... }
    """
    for truck_idx, breakdown in truck_details.items():
        bids = list(breakdown.keys())
        pallet_counts = [breakdown[bid] for bid in bids]
        fig, ax = plt.subplots(figsize=(6,4))
        title = f"Truck Composition for Group {group_key} - Truck {truck_idx+1}"
        ax.set_title(title)
        ax.bar([str(bid) for bid in bids], pallet_counts, color='lightgreen')
        ax.set_xlabel("Bid ID")
        ax.set_ylabel("Exact Pallet Count")
        for i, count in enumerate(pallet_counts):
            ax.text(i, count + 0.5, str(count), ha='center', fontsize=10)
        plt.tight_layout()
        plt.show()

def visualize_truckload_results(result, truck_params):
    """
    Main visualization function.
    Displays the summary dashboard and, for each (buyer, warehouse) group, visualizes:
      - Each truck's layout with detailed placements.
      - A composition bar chart per truck.
    """
    visualize_summary(result)
    
    truck_allocs = result.get("truck_allocations", {})
    
    for group_key, group_info in truck_allocs.items():
        placements = group_info.get("placements", {})
        truck_details = group_info.get("truck_details", {})
        trucks_used = group_info.get("trucks_used", 0)
        
        print(f"\nVisualizing Truck Layouts for Group {group_key} ({trucks_used} truck(s)):")
        if placements:
            for truck_idx, placement_list in placements.items():
                visualize_truck_layout(truck_idx, placement_list, truck_params, group_key)
        else:
            print(f"  No placements available for group {group_key}.")
        
        print(f"\nVisualizing Truck Composition for Group {group_key}:")
        if truck_details:
            visualize_truck_composition(truck_details, group_key)
        else:
            print(f"  No composition details available for group {group_key}.")

# -----------------------------------------------------------------------------
# Example usage (assuming you have already run your optimization algorithm):
if __name__ == "__main__":
    # (Your optimization algorithm code runs here and produces a result.)
    # For demonstration, assume the result is stored in the variable 'result'.
    # (Use your full algorithm code; here we assume 'result' is already produced.)
    
    # Example: Use the previously obtained result from your optimization algorithm.
    # (Replace this with your actual result.)
    result = {
        "status": "Optimal",
        "objective": 31950.0,
        "bid_allocations": {
            "1": 50.0,
            "2": 30.0,
            "3": 40.0,
            "4": 20.0,
            "5": 10.0
        },
        "truck_allocations": {
            ("Buyer1", "A"): {
                "trucks_used": 3,
                "layout_feasible": True,
                "placements": {
                    0: [
                        {"x": 0, "y": 0, "width": 48, "height": 40, "bid_info": (1, 0)},
                        {"x": 48, "y": 0, "width": 48, "height": 40, "bid_info": (1, 1)},
                        {"x": 0, "y": 40, "width": 48, "height": 40, "bid_info": (1, 2)}
                    ],
                    1: [
                        {"x": 0, "y": 0, "width": 48, "height": 40, "bid_info": (1, 3)},
                        {"x": 48, "y": 0, "width": 48, "height": 40, "bid_info": (1, 4)},
                        {"x": 0, "y": 40, "width": 48, "height": 40, "bid_info": (1, 5)}
                    ],
                    2: [
                        {"x": 0, "y": 0, "width": 42, "height": 36, "bid_info": (2, 0)}
                    ]
                },
                "truck_details": {
                    0: {1: 30, 2: 1},
                    1: {1: 20, 2: 12},
                    2: {2: 17}
                }
            },
            ("Buyer2", "A"): {
                "trucks_used": 2,
                "layout_feasible": True,
                "placements": {
                    0: [
                        {"x": 0, "y": 0, "width": 48, "height": 40, "bid_info": (3, 0)},
                        {"x": 48, "y": 0, "width": 48, "height": 40, "bid_info": (3, 1)}
                    ],
                    1: [
                        {"x": 0, "y": 0, "width": 48, "height": 40, "bid_info": (3, 2)},
                        {"x": 48, "y": 0, "width": 48, "height": 40, "bid_info": (3, 3)}
                    ]
                },
                "truck_details": {
                    0: {3: 30},
                    1: {3: 10}
                }
            },
            ("Buyer2", "B"): {
                "trucks_used": 1,
                "layout_feasible": True,
                "placements": {
                    0: [
                        {"x": 0, "y": 0, "width": 50, "height": 42, "bid_info": (4, 0)},
                        {"x": 50, "y": 0, "width": 42, "height": 50, "bid_info": (4, 1)}
                    ]
                },
                "truck_details": {
                    0: {4: 20}
                }
            },
            ("Buyer1", "B"): {
                "trucks_used": 1,
                "layout_feasible": True,
                "placements": {
                    0: [
                        {"x": 0, "y": 0, "width": 50, "height": 42, "bid_info": (5, 0)},
                        {"x": 50, "y": 0, "width": 42, "height": 50, "bid_info": (5, 1)}
                    ]
                },
                "truck_details": {
                    0: {5: 10}
                }
            }
        }
    }
    
    # Define truck parameters (example for a standard 53-foot trailer).
    truck_params = {
        "truck_width": 99,            # inches
        "truck_length": 636,          # inches (53 ft * 12)
        "truck_height": 110.25,       # inches
        "max_weight": 42000,          # pounds
        "max_volume": 4000 * 1728     # cubic inches (4,000 cubic ft)
    }
    
    # Visualize the results.
    visualize_truckload_results(result, truck_params)
