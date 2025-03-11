# Read the current version from key.json
current_version=$(jq -r '.version' key.json)

# Increment the version
new_version=$(echo $current_version | awk -F. -v OFS=. '{$NF++;print}')

# Update the version in key.json
jq --arg new_version "$new_version" '.version = $new_version' key.json >temp.json && mv temp.json key.json

# remove all the files in build directory
rm -rf build/*

vite build

# Add verbose output and explicit manifest inclusion
zip -rv build/buddybeep-$new_version.zip dist/manifest.json dist
key.json backup to key.json.bak
cp key.json key.json.bak
# Remove key from key.json
jq 'del(.key)' key.json >temp.json && mv temp.json key.json

vite build --mode edge

# Debug: Print out dist directory contents before zipping
echo "Contents of dist directory for edge build:"
ls -la dist

# Add verbose output and explicit manifest inclusion
zip -rv build/buddybeep-$new_version-edge.zip dist/manifest.json $(find dist -type f ! -name "*.map")

# Debug: Verify zip contents
echo "Contents of edge zip file:"
unzip -l build/buddybeep-$new_version-edge.zip | grep manifest

# Restore key.json from backup key.json.bak
mv key.json.bak key.json
