#!/bin/bash
GREP_PATTERN=$1

MERGE_BASE="$(git merge-base master $CIRCLE_SHA1)"
FILES_COUNT="$(git diff-tree --no-commit-id --name-only -r $MERGE_BASE $CIRCLE_SHA1 | grep -E "$GREP_PATTERN" | wc -l)"

if [ $FILES_COUNT -eq 0 ]; then
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$FILES_COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
