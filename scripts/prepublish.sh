npm test
./scripts/build.sh

# Write out script so cli knows it's now published and should use the
# compiled code not Babel src code.
cat <<EOF >bin/published.js
module.exports = true
EOF
