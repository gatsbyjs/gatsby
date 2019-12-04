#!/bin/bash
GREP_PATTERN=$1

FILES_COUNT="$(git diff-tree --no-commit-id --name-only -r $CIRCLE_BRANCH origin/master | grep -E "$GREP_PATTERN" | wc -l)"

if [ $FILES_COUNT -eq 0 ]; then
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$FILES_COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
