#!/usr/bin/env bash

cd .. || exit
# print first
find . -name \*.md -exec grep -EHInr "\bGithub\b|\bGitlab\b|\bJavascript\b|\bTypescript\b|\bWordpress\b" {} \;

var=$(find . -name \*.md -exec grep -EHInr "\bGithub\b|\bGitlab\b|\bJavascript\b|\bTypescript\b|\bWordpress\b" {} \;)
# then exit with fail if found
if test -z "$var"; then
  exit 0
else
  exit 1
fi
