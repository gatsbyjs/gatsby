const b = {
  xs: `400px`,
  sm: `550px`,
  md: `750px`,
  lg: `1000px`,
  xl: `1200px`,
  xxl: `1600px`,
}

export const breakpoints = b

const bp = []
for (const b in breakpoints) {
  bp.push(breakpoints[b])
}

export const breakpointsArray = bp
