#!/bin/bash
set -e # bail on errors
GLOB=$1
IS_CI="${CI:-false}"
BASE=$(pwd)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
MINIMAL_STARTER=gatsby-starter-minimal
MINIMAL_STARTER_TS=gatsby-starter-minimal-ts

if [ "$IS_CI" = true ]; then
  sudo apt-get update && sudo apt-get install jq
fi

for folder in $GLOB; do
  [ -d "$folder" ] || continue # only directories
  cd "$BASE"

  NAME=$(jq -r '.name' "$folder/package.json")

  # FIX-ME: there are changes in gatsbyjs/gatsby-starter-wordpress-blog that
  # are not applied in this repo, so until we make starter in this repo
  # source of truth we should skip it.
  if [ "gatsby-starter-wordpress-blog" = "$NAME" ]; then
    continue
  fi

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
    rm -f yarn.lock
    if [[ "$MINIMAL_STARTER" != "$NAME" || "$MINIMAL_STARTER_TS" != "$NAME" ]]; then # ignore minimal starter (ts) because we don't want any lock files for create-gatsby
      yarn import # generate a new yarn.lock file based on package-lock.json, gatsby new does this is new CLI versions but will ignore if file exists
    fi
  fi

  if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "$COMMIT_MESSAGE"
    DEFAULT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    git push origin $DEFAULT_BRANCH_NAME
  fi

  cd "$BASE"
done
