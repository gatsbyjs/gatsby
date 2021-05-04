#!/bin/bash

IS_CI="${CI:-false}"
GREP_PATTERN=$1

# See https://support.circleci.com/hc/en-us/articles/360047521451-Why-is-CIRCLE-PR-NUMBER-empty-
PR_NUMBER=${CIRCLE_PULL_REQUEST##*/}

echo "PR number: $PR_NUMBER"
echo "IS_WINDOWS: $IS_WINDOWS"

# See https://discuss.circleci.com/t/create-a-circle-target-branch-envar/10022
if [ "$IS_WINDOWS" = true ]; then
curl -L "https://github.com/stedolan/jq/releases/download/jq-1.6/jq-win64.exe" \
  -o jq
else
  curl -L "https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64" \
  -o jq
fi
chmod +x jq
url="https://api.github.com/repos/gatsbyjs/gatsby/pulls/$PR_NUMBER"
echo "url: $url"
target_branch=$(
  curl "$url" | ./jq '.base.ref' | tr -d '"'
)

if [[ -z "$target_branch" ]]; then
  # seems like we can't abort merge - script doesn't really handle that, we should fail this step because something is wonky
  echo "Something went wrong, we could not determine the base branch. Please re-run the test."
  exit 1
fi

echo "Target branch: $target_branch"

if [ "$IS_CI" = true ]; then
  git config --local url."https://github.com/".insteadOf git@github.com:
  git config --local user.name "GatsbyJS Bot"
  git config --local user.email "core-team@gatsbyjs.com"

  git fetch origin
  git merge --no-edit origin/$target_branch

  if [ $? -ne 0 ]; then
    echo "Branch has conflicts with $target_branch, rolling back test."
    git merge --abort

    if [ $? -ne 0 ]; then
      # seems like we can't abort merge - script doesn't really handle that, we should fail this step because something is wonky
      echo "Something went wrong, we could not abort our merge command. Please re-run the test."
      exit 1
    fi
  fi

  git config --local --unset user.name
  git config --local --unset user.email
  git config --local --unset url."https://github.com/".insteadOf
fi

FILES_COUNT="$(git diff-tree --no-commit-id --name-only -r "$CIRCLE_BRANCH" origin/$target_branch | grep -E "$GREP_PATTERN" -c)"

if [ "$IS_CI" = true ]; then
  # reset to previous state
  git reset --hard $CIRCLE_SHA1
fi

if [ "$FILES_COUNT" -eq 0 ]; then
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$FILES_COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi

