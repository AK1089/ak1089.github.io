#!/usr/bin/env python3
"""
Generate a visual tree structure from map.json
"""

import json
from pathlib import Path
from typing import Dict, List, Optional


def load_map_data(json_path: str | Path) -> List[Dict]:
    """Load and filter the map data from JSON file."""
    with open(json_path, 'r') as f:
        data = json.load(f)

    # Filter out entries with display=false
    return [entry for entry in data if entry.get('display', True)]


def build_tree(entries: List[Dict]) -> Dict[Optional[str], List[Dict]]:
    """Build a tree structure organized by parent."""
    tree = {}
    for entry in entries:
        parent = entry.get('parent')
        if parent not in tree:
            tree[parent] = []
        tree[parent].append(entry)

    # Sort children by name for consistent output
    for parent in tree:
        tree[parent].sort(key=lambda x: x['name'])

    return tree


def print_tree(tree: Dict[Optional[str], List[Dict]], parent: Optional[str] = None,
               prefix: str = "", is_last: bool = True):
    """Recursively print the tree structure."""
    if parent not in tree:
        return

    children = tree[parent]

    for i, entry in enumerate(children):
        is_last_child = (i == len(children) - 1)

        # Determine the connector symbols
        if parent is None:
            # Root level - no prefix
            connector = ""
            extension = ""
        else:
            connector = "└── " if is_last_child else "├── "
            extension = "    " if is_last_child else "│   "

        # Print current node
        print(f"{prefix}{connector}{entry['name']} ({entry['url']})")

        # Print children with updated prefix
        new_prefix = prefix + extension if parent is not None else ""
        print_tree(tree, entry['url'], new_prefix, is_last_child)


def main():
    """Main entry point."""
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    json_path = script_dir / "map.json"

    # Load and process data
    entries = load_map_data(json_path)
    tree = build_tree(entries)

    # Print the tree starting from root (parent=None)
    print_tree(tree, parent=None)


if __name__ == "__main__":
    main()
