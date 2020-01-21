#!/bin/bash
#
# git-mv-with-history -- move/rename file or folder, with history.
#
# Moving a file in git doesn't track history, so the purpose of this
# utility is best explained from the kernel wiki:
#
#   Git has a rename command git mv, but that is just for convenience.
#   The effect is indistinguishable from removing the file and adding another
#   with different name and the same content.
#
# https://git.wiki.kernel.org/index.php/GitFaq#Why_does_Git_not_.22track.22_renames.3F
#
# While the above sucks, git has the ability to let you rewrite history
# of anything via `filter-branch`. This utility just wraps that functionality,
# but also allows you to easily specify more than one rename/move at a
# time (since the `filter-branch` can be slow on big repos).
#
# Usage:
#
#   git-rewrite-history [-d/--dry-run] [-v/--verbose] <srcname>=<destname> <...> <...>
#
# After the repsitory is re-written, eyeball it, commit and push up.
#
# Given this example repository structure:
#
#   src/makefile
#   src/test.cpp
#   src/test.h
#   src/help.txt
#   README.txt
#
# The command:
#
#   git-rewrite-history README.txt=README.md  \     <-- rename to markdpown
#                       src/help.txt=docs/    \     <-- move help.txt into docs
#                       src/makefile=src/Makefile   <-- capitalize makefile
#
#  Would restructure and retain history, resulting in the new structure:
#
#    docs/help.txt
#    src/Makefile
#    src/test.cpp
#    src/test.h
#    README.md
#
# @author emiller
# @date   2013-09-29
#

function usage() {
  echo "usage: `basename $0` [-d/--dry-run] [-v/--verbose] <srcname>=<destname> <...> <...>"
  [ -z "$1" ] || echo $1

  exit 1
}

[ ! -d .git ] && usage "error: must be ran from within the root of the repository"

dryrun=0
filter=""
verbose=""
repo=$(basename `git rev-parse --show-toplevel`)

while [[ $1 =~ ^\- ]]; do
  case $1 in
    -d|--dry-run)
      dryrun=1
      ;;

    -v|--verbose)
      verbose="-v"
      ;;

    *)
      usage "invalid argument: $1"
  esac

  shift
done

for arg in $@; do
  val=`echo $arg | grep -q '=' && echo 1 || echo 0`
  src=`echo $arg | sed 's/\(.*\)=\(.*\)/\1/'`
  dst=`echo $arg | sed 's/\(.*\)=\(.*\)/\2/'`
  dir=`echo $dst | grep -q '/$' && echo $dst || dirname $dst`

  [ "$val" -ne 1  ] && usage
  [ ! -e "$src"   ] && usage "error: $src does not exist"

  filter="$filter                            \n\
    if [ -e \"$src\" ]; then                 \n\
      echo                                   \n\
      if [ ! -e \"$dir\" ]; then             \n\
        mkdir -p ${verbose} \"$dir\" && echo \n\
      fi                                     \n\
      mv $verbose \"$src\" \"$dst\"          \n\
    fi                                       \n\
  "
done

[ -z "$filter" ] && usage

if [[ $dryrun -eq 1 || ! -z $verbose ]]; then
  echo
  echo "tree-filter to execute against $repo:"
  echo -e "$filter"
fi

[ $dryrun -eq 0 ] && git filter-branch -f --tree-filter "`echo -e $filter`"
