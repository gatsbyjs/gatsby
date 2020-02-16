const { createRequireFromPath } = require(`gatsby-core-utils`)

const inkRequire = createRequireFromPath(`ink`)

/* 
Make sure we use same "react" instance as "ink" would use to prevent error:

UNHANDLED REJECTION Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.

This should fix case 3. from that error.
/*/
module.exports = inkRequire(`react`)
