cd $1
# Normally you wouldn't do this but we
# want to test the latest versions of packages always
# so our example site builds catch problems early.
yarn

echo "=== Building website"
# Once we get better cache invalidation, remove the following
# line.
rm -rf .cache

NODE_ENV=production ./node_modules/.bin/gatsby build
