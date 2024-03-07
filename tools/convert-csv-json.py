import csv
import json

# File paths
csv_file_path = '/Users/owner/source/extentions/chathub/tools/prompts.csv'
json_file_path = '/Users/owner/source/extentions/chathub/src/assets/prompts.json'

# Initialize an empty dictionary to hold the converted data
data = {}

with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    csvreader = csv.reader(csvfile)
    # Assuming the first row is the header
    header = next(csvreader)

    for row in csvreader:
        # Use agentId as the key and the rest of the agent data as the value
        agentId = row[0]

        # Check if category equals subCategory, set subCategory to None if true
        subCategory = None if len(row) > 4 and (row[4].lower() == 'null' or row[3] == row[4]) else row[4]

        data[agentId] = {
            "agentId": agentId,
            "name": row[1],     # Assuming the second column is 'name'
            "prompt": row[2],   # Assuming the third column is 'prompt'
            "category": row[3], # Assuming the fourth column is 'category'
            "subCategory": subCategory,
        }

# Write the data to a JSON file
with open(json_file_path, mode='w', encoding='utf-8') as jsonfile:
    json.dump(data, jsonfile, indent=4)
