# Read the current version from key.json
current_version=$(jq -r '.version' key.json)

# Increment the version
new_version=$(echo $current_version | awk -F. -v OFS=. '{$NF++;print}')

# Update the version in key.json
jq --arg new_version "$new_version" '.version = $new_version' key.json >temp.json && mv temp.json key.json

# remove all the files in build directory
rm -rf build/*

vite build

zip -r build/buddybeep-$new_version.zip dist
key.json backup to key.json.bak
cp key.json key.json.bak
# Remove key from key.json
jq 'del(.key)' key.json >temp.json && mv temp.json key.json

vite build --mode edge

zip -r build/buddybeep-$new_version-edge.zip dist

# Restore key.json from backup key.json.bak
mv key.json.bak key.json
