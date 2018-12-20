#!/bin/bash
FOLDER=$1
BASE=$(pwd)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

for folder in $FOLDER/*; do
  [ -d "$folder" ] || continue # only directories
  cd $BASE

  NAME=$(cat $folder/package.json | jq -r '.name')
  CLONE_DIR="__${NAME}__clone__"

  # clone, delete files in the clone, and copy (new) files over
  # this handles file deletions, additions, and changes seamlessly
  git clone --depth 1 https://$GITHUB_API_TOKEN@github.com/gatsbyjs/$NAME.git $CLONE_DIR
  cd $CLONE_DIR
  find . | grep -v ".git" | grep -v "^\.*$" | xargs rm -rf # delete all files (to handle deletions in monorepo)
  cp -r $BASE/$folder/. . # copy all content
  git add .
  git commit --message "$COMMIT_MESSAGE"
  git push origin master

  cd $BASE
done
