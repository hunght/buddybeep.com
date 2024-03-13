# read JSON file at path /Users/owner/source/extentions/chathub/src/assets/prompts.de.json
# and convert it to a dictionary key-value pair key is the agentId and value is the prompt
#

import json
import os
import sys

# File paths
json_file_path = '/Users/owner/source/extentions/chathub/src/assets/prompts.fr.json'
#  example of the json file [   {
    #     "agentId": "historian",
    #     "name": "Historian"
    # },]
# Initialize an empty dictionary to hold the converted data
data = {}

with open(json_file_path, mode='r', encoding='utf-8') as jsonfile:
    arr = json.load(jsonfile)
    for row in arr:

        data[row['agentId']] = row['name']

# Write the data to a JSON file
with open('/Users/owner/source/extentions/chathub/src/assets/prompts.es.json', mode='w', encoding='utf-8') as jsonfile:
    json.dump(data, jsonfile, indent=4)


