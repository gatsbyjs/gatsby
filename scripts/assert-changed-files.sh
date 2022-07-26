#!/bin/bash

IS_CI="${CI:-false}"
GREP_PATTERN=$1

if [ "$IS_CI" = true ]; then
  git config --local url."https://github.com/".insteadOf git@github.com:
  git config --local user.name "GatsbyJS Bot"
  git config --local user.email "core-team@gatsbyjs.com"

  git fetch origin
  git merge --no-edit origin/master

  if [ $? -ne 0 ]; then
    echo "Branch has conflicts with master, rolling back test."
    git merge --abort

    if [ $? -ne 0]; then
      # seems like we can't abort merge - script doesn't really handle that, we should fail this step because something is wonky
      echo "Something went wrong, we could not abort our merge command. Please re-run the test."
      exit 1
    fi
  fi

  git config --local --unset user.name
  git config --local --unset user.email
  git config --local --unset url."https://github.com/".insteadOf
fi

FILES_COUNT="$(git diff-tree --no-commit-id --name-only -r "$CIRCLE_BRANCH" origin/master | grep -E "$GREP_PATTERN" -c)"

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

