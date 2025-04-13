from itertools import combinations
from datetime import datetime
from json import dumps

# read the raw data from the text file
with open("minr/collab-map/raw-data.txt", "r") as f:
    lines = f.readlines()
    
# parse the data into a set of creators and collaborations
collaboration_counts = {}
all_creators = set()
    
# for each line in the text file, extract the creators and add them to the set
for line in lines:
    creators = line.strip().split(", ")
    
    # if this is not a collaboration, skip it
    if len(creators) <= 1:
        continue
    
    # add the creators to the set
    all_creators.update(creators)
    
    # consider each pair of creators in alphabetical order
    for (x, y) in combinations(creators, 2):
        x, y = sorted((x, y))
        
        # if this is the first time we see this pair, add it to the dictionary
        if (x, y) not in collaboration_counts:
            collaboration_counts[(x, y)] = 0
            
        # increment the count for this pair
        collaboration_counts[(x, y)] += 1
    
# create the nodes for the graph
nodes = [
    {"id": creator, "name": creator}
    for creator in all_creators
]

# create the edges for the graph
links = [
    {
        "source": x,
        "target": y,
        "value": count
    }
    for (x, y), count in collaboration_counts.items()
]

# create metadata for the graph
last_updated = datetime.now().strftime("%Y-%m-%d")
source = "https://docs.google.com/spreadsheets/d/12adnu29aV7pS7K62oacxKRFdaRifxzzw8-x1A-514MI/"

# create the final data structure
data = {
    "nodes": nodes,
    "links": links,
    "lastUpdated": last_updated,
    "source": source
}

# write the data to a JSON file
with open("minr/collab-map/data.json", "w") as f:
    f.write(dumps(data, indent=4))
    
# create the set of creators in lowercase
lowercased = set([
    creator.lower() for creator in all_creators
])

# remove the lowercase versions of the creators from the set
for creator in all_creators:
    try:
        lowercased.remove(creator.lower())
        
    # if a creator is in there twice with different cases, this will raise a KeyError
    except KeyError:
        print("KeyError: ", creator)