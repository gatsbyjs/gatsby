# babel-plugin-optimize-hook-destructuring

Thanks to the wonderful [Jason Miller](@developit) for sharing with us the V8 teams research into array destructuring and for writing this code for the next.js project.

This plugin does the following:

```js
// in
const [state, setState] = useState()

// out
const { 0: state, 1: setState } = useState()
```

The V8 team found that this destructure operation is faster for browser engines.
