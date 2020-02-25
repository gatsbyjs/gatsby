#!/bin/bash
set -e # bail on errors
GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [ "$IS_CI" = true ]; then
  sudo apt-get update && sudo apt-get install jq
fi

for folder in $GLOB; do
  [ -d "$folder" ] || continue # only directories
  cd "$BASE"

  NAME=$(jq -r '.name' "$folder/package.json")
  IS_WORKSPACE=$(jq -r '.workspaces' "$folder/package.json")
  CLONE_DIR="__${NAME}__clone__"

  # sync to read-only clones
  # clone, delete files in the clone, and copy (new) files over
  # this handles file deletions, additions, and changes seamlessly
  # note: redirect output to dev/null to avoid any possibility of leaking token
  git clone --quiet --depth 1 "https://$GITHUB_API_TOKEN@github.com/gatsbyjs/$NAME.git" "$CLONE_DIR" > /dev/null
  cd "$CLONE_DIR"
  find . | grep -v ".git" | grep -v "^\.*$" | xargs rm -rf # delete all files (to handle deletions in monorepo)
  cp -r "$BASE/$folder/." .

  if [ "$IS_WORKSPACE" = null ]; then
    rm -rf yarn.lock
    yarn import # generate a new yarn.lock file based on package-lock.json
  fi

  if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "$COMMIT_MESSAGE"
    git push origin master
  fi

  cd "$BASE"
done
