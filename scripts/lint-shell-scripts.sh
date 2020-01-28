#!/bin/bash

set -eu

SCRIPT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR="$(realpath "$SCRIPT_DIR"/..)";

if ! [ -x "$(command -v shellcheck)" ]; then
  echo ''
  echo 'ShellCheck not found.'
  echo 'For more info: https://github.com/koalaman/shellcheck#installing"'
  echo ''
  exit 1
fi

shellcheck "$ROOT_DIR"/**/*.sh
