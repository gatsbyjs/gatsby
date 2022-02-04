#!/bin/bash
OUTPUT_DIR="output/${OUTPUT}"

###########
# Helpers #
###########

BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
RESET='\033[0m'

get_mem_usage() {
  TYPE=$1
  PID=$2
  # output is normally in kb, dividing by 1024 gets us mb
  echo $(ps -o $TYPE= $PID | awk '{printf "%.0f\n", $1 / 1024}')
}

write_csv() {
  if [ -z "${OUTPUT}" ]; then
    return
  fi

  mkdir -p $OUTPUT_DIR

  local IFS=","
  FILE=$1
  shift
  CONTENTS=$(echo "$*")
  echo "$CONTENTS" >> $FILE
}

clear_csv() {
  if [ -z "${OUTPUT}" ]; then
    return
  fi

  mkdir -p $OUTPUT_DIR

  FILE=$1
  > $FILE
}

echo_build() {
  TIMESTAMP=$(date +%T)
  BUILD_NUMBER=$1
  CONTENT=$2

  COLOR=$YELLOW
  if [ $(($BUILD_NUMBER%2)) -eq 0 ]; then
    COLOR=$CYAN
  fi

  echo -e "${TIMESTAMP} - Build ${COLOR}#${BUILD_NUMBER}${RESET}: $CONTENT"
}


#########
# Setup #
#########

BUILD_CMD="node --max_old_space_size=16384 --expose-gc node_modules/gatsby/dist/bin/gatsby.js build"
if [ -z "${SHOW_BUILD_OUTPUT}" ]; then
  BUILD_CMD="${BUILD_CMD} >/dev/null 2>&1"
fi

BUILD_COUNT="${BUILD_COUNT:=1}"
SUMMARY_CSV_NAME="summary"
BUILD_CSV_NAME="build"
COMBINED_CSV_NAME="combined"

SUMMARY_FILE="${OUTPUT_DIR}/${SUMMARY_CSV_NAME}.csv"
clear_csv $SUMMARY_FILE
write_csv $SUMMARY_FILE build "time" max_rss max_vsz result code

COMBINED_FILE="${OUTPUT_DIR}/${COMBINED_CSV_NAME}.csv"
clear_csv $COMBINED_FILE
write_csv $COMBINED_FILE build "time" rss vsz

echo -e "\nStarting ${CYAN}${BUILD_COUNT}${RESET} builds..."

if [ -n "${OUTPUT}" ]; then
  echo -e "Writing results to ${MAGENTA}./${OUTPUT_DIR}/${RESET}"
fi

echo ""

##############
# Run Builds #
##############

# loop through build counts
for i in $(seq 1 $BUILD_COUNT); do
  echo_build $i "initializing"

  if [ $i -ne 1 ]; then
    sleep 2
  fi

  BUILD_FILE="${OUTPUT_DIR}/${BUILD_CSV_NAME}_${i}.csv"
  clear_csv $BUILD_FILE
  write_csv $BUILD_FILE "time" rss vsz

  # start off clean
  gatsby clean >/dev/null 2>&1
  rimraf .data >/dev/null 2>&1

  # start build in background
  START_TIME=$(date +%s%N | cut -b1-13)
  eval "$BUILD_CMD &"
  BUILD_PID=$!
  echo_build $i "running with pid ${YELLOW}${BUILD_PID}${RESET}"

  # monitor build memory usage
  RSS=$(get_mem_usage rss $BUILD_PID)
  VSZ=$(get_mem_usage vsz $BUILD_PID)
  MAX_RSS=$RSS
  MAX_VSZ=$VSZ

  # loop until ps no longer sees the process
  while [ -n "${RSS}" ]; do
    sleep .1

    CUR_TIME=$(date +%s%N | cut -b1-13)
    RSS=$(get_mem_usage rss $BUILD_PID)
    VSZ=$(get_mem_usage vsz $BUILD_PID)
    MAX_RSS=$([[ $RSS -gt $MAX_RSS ]] && echo "$RSS" || echo "$MAX_RSS")
    MAX_VSZ=$([[ $VSZ -gt $MAX_VSZ ]] && echo "$VSZ" || echo "$MAX_VSZ")

    write_csv $BUILD_FILE $(( CUR_TIME - START_TIME )) $RSS $VSZ
    write_csv $COMBINED_FILE $i $(( CUR_TIME - START_TIME )) $RSS $VSZ
  done

  # get exit result/code
  RESULT="SUCCESS"
  wait $BUILD_PID
  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    RESULT="FAILURE"
    echo_build $i "${RED}failed${RESET} with exit code ${EXIT_CODE}"

    if [ -z "${SHOW_BUILD_OUTPUT}" ]; then
      echo_build $i "  - Try running again with SHOW_BUILD_OUTPUT=1"
    fi
  fi

  # build is done, write summary
  END_TIME=$(date +%s%N | cut -b1-13)
  ELAPSED=$(( END_TIME - START_TIME ))
  write_csv $SUMMARY_FILE $i $ELAPSED $MAX_RSS $MAX_VSZ $RESULT $EXIT_CODE
  echo_build $i "finished in ${GREEN}${ELAPSED}ms${RESET}"

done


echo -e "\nFinished!"

