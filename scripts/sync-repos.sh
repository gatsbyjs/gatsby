#!/bin/bash
BASE_FOLDER="${1:-examples}" # grab first argument, otherwise use examples folder

CURRENT_COMMIT="$(git log --format="%H" -n 1)"
CURRENT_COMMIT_MESSAGE="$(git log --format="%s" -n 1)"
LAST_COMMIT="$(git log --format="%H" -n 2 | tail -1)"

CHANGED_FILES="$(git diff-tree --no-commit-id --name-only -r $CURRENT_COMMIT $LAST_COMMIT | grep -E "$BASE_FOLDER/*")"

# TODO: figure out secure way to push to github
for file in $CHANGED_FILES
do
  FOLDER="$(echo $file | cut -d'/' -f2)"
  cd $BASE_FOLDER/$FOLDER

  git init
  git remote add origin git@github.com:gatsbyjs/$FOLDER
  git fetch origin/master
  git add .
  git commit -m "$CURRENT_COMMIT_MESSAGE"
  git push origin master
done
