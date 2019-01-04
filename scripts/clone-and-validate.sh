#!/bin/bash
FOLDER=$1
CLONE=$2
IS_CI="${CI:-false}"
BASE=$(pwd)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [ "$IS_CI" = true ]; then
  sudo apt-get update && sudo apt-get install jq
fi

for folder in $FOLDER/*; do
  [ -d "$folder" ] || continue # only directories
  cd $BASE

  NAME=$(cat $folder/package.json | jq -r '.name')
  CLONE_DIR="__${NAME}__clone__"
  
  # sync to read-only clones
  if [ "$CLONE" = true ]; then
    # clone, delete files in the clone, and copy (new) files over
    # this handles file deletions, additions, and changes seamlessly
    git clone --depth 1 https://$GITHUB_API_TOKEN@github.com/gatsbyjs/$NAME.git $CLONE_DIR
    cd $CLONE_DIR
    find . | grep -v ".git" | grep -v "^\.*$" | xargs rm -rf # delete all files (to handle deletions in monorepo)
    cp -r $BASE/$folder/. .
  
    rm -rf yarn.lock
    yarn import # generate a new yarn.lock file based on package-lock.json

    git add .
    git commit --message "$COMMIT_MESSAGE"
    git push origin master
  else
    # validate
    cd $folder
    npm audit
    npm install
    npm run build
  fi

  cd $BASE
done
