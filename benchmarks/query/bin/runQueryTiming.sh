output=$(rm -rf .cache && gatsby build | grep "run graphql queries")
echo $output | cut -d' ' -f 6

