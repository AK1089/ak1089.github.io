import json
import subprocess
from pathlib import Path


def get_parent_url(url):
    if url == "/":
        return None
    parent = str(Path(url).parent)
    return "/" if parent == "." else parent.replace("\\", "/")


def generate_flat_sitemap(start_path):
    # Define directories to block
    blocklist = {"assets", "styles", "scripts", "node_modules", "venv"}

    # Try to load existing map
    existing_map = {}
    map_path = Path(start_path) / "map.json"
    if map_path.exists():
        try:
            with open(map_path) as f:
                existing_data = json.load(f)
                existing_map = {item["url"]: item for item in existing_data}
        except json.JSONDecodeError:
            print("Warning: Existing map.json was invalid")

    results = []

    # Add root if not in existing map
    if "/" not in existing_map:
        results.append({"name": "Home", "url": "/", "parent": None, "display": True})
    else:
        results.append(existing_map["/"])

    # Convert start_path to absolute path and get the parent directory (site root)
    site_root = Path(start_path).resolve().parent

    # Walk through all directories
    for path in site_root.rglob("index.html"):
        # Skip hidden directories and blocklisted directories
        if any(part.startswith(".") for part in path.parts):
            continue
        if any(part in blocklist for part in path.parts):
            continue

        # Convert path to URL by getting the parent directory of index.html
        relative_path = path.parent.relative_to(site_root)
        url = f"/{str(relative_path)}".replace("\\", "/")
        if url == "/.":  # Handle root directory
            continue  # Skip as we already added root

        # If URL exists in current map, keep its data
        if url in existing_map:
            results.append(existing_map[url])
            continue

        # Get the name from the directory containing index.html
        name = path.parent.name.replace("-", " ").title()

        results.append(
            {
                "name": name,
                "url": url,
                "parent": get_parent_url(url),
                "display": True
            }
        )
        
    # get the actual urls which are still in use
    valid_base_urls = [page["url"] for page in results]
        
    # scan through the previous items for purely organisational branches which aren't pages
    for url, data in existing_map.items():
        
        # ignore ones which are actual pages
        if "#" not in url:
            continue
        
        # get the actual page url: if it is still a valid page, use it
        if url.split("#")[0] in valid_base_urls:
            results.append(data)
        

    # Sort results by URL length (shorter URLs first) and then alphabetically
    results.sort(key=lambda x: (len(x["url"].split("/")), x["url"]))

    return results


def update_index_with_tree(map_dir):
    """Run tree.py and update index.md with the output."""
    # Run tree.py and capture output
    tree_script = map_dir / "tree.py"
    result = subprocess.run(
        ["python3", str(tree_script)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Error running tree.py: {result.stderr}")
        return

    tree_output = result.stdout.strip()

    # Read current index.md
    index_path = map_dir / "index.md"
    with open(index_path, "r") as f:
        content = f.read()

    # Find the marker comment
    marker = "```tree"
    if marker not in content:
        print(f"Warning: Could not find marker '{marker}' in index.md")
        return

    # Split content at the marker and replace everything after it
    before_marker = content.split(marker)[0]

    # Reconstruct the file with the new tree
    new_content = f"{before_marker}{marker}\n{tree_output}\n```\n"

    # Write back to index.md
    with open(index_path, "w") as f:
        f.write(new_content)


if __name__ == "__main__":
    # Run from the map directory
    current_dir = Path(__file__).parent
    sitemap = generate_flat_sitemap(current_dir)

    # Write to map.json in the map directory
    output_path = current_dir / "map.json"
    with open(output_path, "w") as f:
        json.dump(sitemap, f, indent=2)

    # Update index.md with tree structure
    update_index_with_tree(current_dir)
