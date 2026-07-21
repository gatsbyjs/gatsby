#!/bin/bash
set -e # bail on errors

SRC_PATH=$1
CUSTOM_COMMAND="${2:-yarn test}"
PRE_GATSBY_DEV_COMMAND="${3:-}"
eval GATSBY_PATH=${CIRCLE_WORKING_DIRECTORY:-../..}
TMP_LOCATION=$(mktemp -d);
LOCAL_GATSBY_DEV="$GATSBY_PATH/packages/gatsby-dev-cli/dist/index.js"
GATSBY_DEV_SHIM="$TMP_LOCATION/scripts/gatsby-dev"

mkdir -p $TMP_LOCATION/$SRC_PATH
TMP_TEST_LOCATION=$TMP_LOCATION/$SRC_PATH

mkdir -p $TMP_LOCATION/scripts/
mkdir -p $TMP_TEST_LOCATION

run_gatsby_dev() {
  # In CI we want the bootstrap-built CLI from this checkout so repo-local
  # changes to gatsby-dev-cli participate in the test run. Keep the global
  # install fallback for ad-hoc local usage where the built dist file may not
  # exist yet.
  if [[ -f "$LOCAL_GATSBY_DEV" ]]; then
    node "$LOCAL_GATSBY_DEV" "$@"
    return
  fi

  command -v gatsby-dev || (command -v sudo && sudo npm install -g gatsby-dev-cli@next) || npm install -g gatsby-dev-cli@next
  gatsby-dev "$@"
}

echo "Copy $SRC_PATH into $TMP_LOCATION to isolate test"
cp -Rv $SRC_PATH/. $TMP_TEST_LOCATION
cp -Rv $GATSBY_PATH/scripts/. $TMP_LOCATION/scripts/

# Some custom test commands call `gatsby-dev` again after the initial setup.
# Put a shim on PATH so those calls resolve to the same local-or-global runner
# we chose above instead of accidentally picking a stale globally installed CLI.
if [[ -f "$LOCAL_GATSBY_DEV" ]]; then
  printf '#!/bin/bash\nexec node %q \"$@\"\n' "$LOCAL_GATSBY_DEV" > "$GATSBY_DEV_SHIM"
else
  command -v gatsby-dev || (command -v sudo && sudo npm install -g gatsby-dev-cli@next) || npm install -g gatsby-dev-cli@next
  printf '#!/bin/bash\nexec %q \"$@\"\n' "$(command -v gatsby-dev)" > "$GATSBY_DEV_SHIM"
fi
chmod +x "$GATSBY_DEV_SHIM"
export PATH="$TMP_LOCATION/scripts:$PATH"

# setting up child integration test link to gatsby packages
cd "$TMP_TEST_LOCATION"

if [[ $PRE_GATSBY_DEV_COMMAND != "" ]]; then
  echo "Running pre-gatsby-dev command: $PRE_GATSBY_DEV_COMMAND"
  sh -c "$PRE_GATSBY_DEV_COMMAND"
fi

run_gatsby_dev --set-path-to-repo "$GATSBY_PATH"
run_gatsby_dev --force-install --scan-once  # Do not copy files, only install through npm, like our users would
if test -f "./node_modules/.bin/gatsby"; then
  chmod +x ./node_modules/.bin/gatsby # this is sometimes necessary to ensure executable
  echo "Gatsby bin chmoded"
else
  echo "Gatsby bin doesn't exist. Skipping chmod."
fi

sh -c "$CUSTOM_COMMAND"
echo "e2e test run succeeded"
