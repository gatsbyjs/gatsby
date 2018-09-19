#!/bin/bash
GREP_PATTERN=$1
BRANCH="${CIRCLE_BRANCH:-$(git branch | grep "\*" | cut -d ' ' -f2)}"

COUNT="$(git diff-tree --no-commit-id --name-only -r $BRANCH | grep "$GREP_PATTERN" | wc -l)"

if [ $COUNT -eq 0 ]; then
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
