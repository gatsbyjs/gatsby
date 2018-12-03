#!/bin/bash
FOLDER=$1
BASE=$(pwd)

for folder in $FOLDER/*; do
  [ -d "$folder" ] || continue # only directories
  cd $BASE

  NAME=$(cat $folder/package.json | jq -r '.name')
  CLONE_DIR="__${NAME}__clone__"

  git clone https://$GITHUB_TOKEN@github.com/dschau/$NAME.git $CLONE_DIR
  cp -r $folder/. $CLONE_DIR
  cd $CLONE_DIR
  git add .
  git commit --message "chore: syncing with gatsbyjs/starters monorepo"
  git push origin master
done
