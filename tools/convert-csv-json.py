import csv
import json
import openai
import os
import requests

# File paths
csv_file_path = '/Users/owner/source/extentions/buddybeep/tools/prompts.csv'

# Initialize an empty dictionary to hold the converted data
data = {}

# Set your OpenAI API key here
openai.api_key =  "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"

def generate_image(prompt):
    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size="1024x1024"
    )
    return response

def download_image(url, save_path="generated_image.png"):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f"Image successfully downloaded and saved as {save_path}")
    else:
        print("Failed to download the image.")

with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
    csvreader = csv.reader(csvfile)
    # Assuming the first row is the header
    header = next(csvreader)

    for row in csvreader:
        # Use agentId as the key and the rest of the agent data as the value
        agentId = row[0]


        prompt = row[2]
        image_response = generate_image(prompt)
         # Assuming the image URL is in the response
        image_url = image_response['data'][0]['url']

        # Download and save the image
        download_image(image_url, agentId + ".png")
        #  remove this line to generate all images
        break




