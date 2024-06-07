from os import path, walk
import json

# Load all the URLs present when made
with open("siteMap.json") as f:
    old_pages = json.loads(f.read())

# If the URL existed before, use that name, otherwise default name is the URL (or Home if empty)
def get_page_name(url):
    for entry in old_pages:
        if url == entry["url"]:
            return entry["name"]

    return url.strip("/").split("/")[-1] or "Home"

# Traverses the directory and adds all new pages to the sitemap
def walk_directory(root_dir):
    entries = []
    
    # For each index.html
    for subdir, _, files in walk(root_dir):
        if "index.html" not in files:
            continue

        # Processes the URL to add and standardise path markers, and gets the parent URL too
        url = "/" + path.relpath(subdir, root_dir).replace("\\", "/") + "/"
        parent_url = "/" + path.relpath(path.dirname(subdir), root_dir).replace("\\", "/") + "/"

        # Strips redundant URLs
        if parent_url == "/./" or parent_url == "/domains/":
            parent_url = "/"
        if url == "/./":
            url, parent_url = "/", None

        # This is a dummy page, so ignore it
        if url == "/domains/":
            continue
            
        # Adds a dictionary with all of this information
        entries.append({
            "name": get_page_name(url),
            "url": url,
            "parent": parent_url
        })
    
    return entries


if __name__ == "__main__":

    # Walk through the root directory and add all the files, then write to siteMap.json
    new_entries = walk_directory("../")

    with open('siteMap.json', 'w') as f:
        json.dump(new_entries, f, indent=4)