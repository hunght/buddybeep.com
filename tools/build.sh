vite build
rm -f buddybeep.zip
zip -r buddybeep.zip dist
source .env
EXT_KEY=$(grep -oP '^EXT_KEY=\K.*' .env)
sed -i '/EXT_KEY/d' .env
vite build
rm -f buddybeep-edge.zip
zip -r buddybeep-edge.zip dist
echo "EXT_KEY=$EXT_KEY" >>.env
