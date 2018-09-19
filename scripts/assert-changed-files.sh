#!/bin/bash
GREP_PATTERN=$1

COUNT="$(git diff master... --name-only -r | grep -E "$GREP_PATTERN" | wc -l)"

if [ $COUNT -eq 0 ]; then
  echo "0 files matching '$GREP_PATTERN'; exiting and marking successful."
  circleci step halt || exit 1
else
  echo "$COUNT file(s) matching '$GREP_PATTERN'; continuing."
fi
