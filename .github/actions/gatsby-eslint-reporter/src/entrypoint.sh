#!/bin/sh

set -e

npm install

NODE_PATH=node_modules node /action/src/run.js
