import csv
import json

# File paths
csv_file_path = '/Users/owner/source/extentions/chathub/tools/prompts.csv'
cats_json_file_path = '/Users/owner/source/extentions/chathub/src/assets/cats.json'

# Initialize a dictionary to hold the category and subcategory data
categories = {}

with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    csvreader = csv.reader(csvfile)
    # Assuming the first row is the header
    header = next(csvreader)

    for row in csvreader:
        # Extract category and subcategory from the row
        category = row[3]  # Assuming the fourth column is 'category'
        subCategory = None if len(row) <= 4 or row[4].lower() == 'null' or row[3] == row[4] else row[4]

        # Check if the main category is already in the dictionary
        if category not in categories:
            categories[category] = set()

        # If there's a valid subcategory, add it to the set for this category
        if subCategory:
            categories[category].add(subCategory)

# Convert sets to lists (JSON serialization does not support sets)
for category in categories:
    categories[category] = list(categories[category])

# Write the categories and subcategories to a JSON file
with open(cats_json_file_path, mode='w', encoding='utf-8') as jsonfile:
    json.dump(categories, jsonfile, indent=4)
