#!/bin/bash
GREP_PATTERN=$1

CHANGED_FILES="$(git diff master... --name-only -r | grep -E "$GREP_PATTERN")"
FILES_COUNT=$(echo $CHANGED_FILES | wc -l)

if [ $FILES_COUNT -eq 0 ]; then
  echo $CHANGED_FILES
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$FILES_COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
