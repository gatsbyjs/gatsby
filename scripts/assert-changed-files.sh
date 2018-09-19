#!/bin/bash
GREP_PATTERN=$1

CHANGED_FILES="$(git diff-tree --no-commit-id --name-only -r $CIRCLE_SHA1 | grep -E "$GREP_PATTERN")"
FILES_COUNT=$(echo $CHANGED_FILES | wc -l)

if [ $FILES_COUNT -eq 0 ]; then
  echo "$CHANGED_FILES"
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$CHANGED_FILES"
  echo "$FILES_COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
