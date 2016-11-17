echo "=== Installing npm packages for Gatsby"
npm install
echo "=== Building ES5 version of Gatsby"
npm run build
cd www
echo "=== Installing the website dependencies"
npm install
echo "=== Copying built Gatsby to website."
cp -r ../dist ./node_modules/gatsby/
echo "=== Building website"
./node_modules/.bin/gatsby build
