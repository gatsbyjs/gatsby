// courtesy of @jlengstorf, found at
// https://github.com/jlengstorf/marisamorby.com/blob/f16e4165ba67ae096d907e1cfa477664a2f7e81f/src/utils/scroll-to-anchor.js

/**
 * Browser workaround to avoid a bug where scrollTop doesn’t work.
 * @return {Element}  the scrollable root element
 */
const getScrollableElement = () =>
  document.body.scrollTop ? document.body : document.documentElement

/**
 * Easing, using sinusoidal math (or some shit).
 *
 * I know; this makes my head hurt, too. Math is hard. This formula was copied
 * (I reformatted for legibility) from here: <http://gizma.com/easing/#sin3>
 *
 * @param  {Number} elapsed how much time has elapsed already
 * @param  {Number} start   the starting position
 * @param  {Number} change  the desired step size
 * @param  {Number} length  the duration length
 * @return {Number}         the new position based on the easing formula
 */
const easeInOutSine = (elapsed, start, change, length) =>
  -change / 2 * (Math.cos(Math.PI * elapsed / length) - 1) + start

// Sets up a loop that executes for the length of time set in duration
const animateScroll = (
  element,
  elapsedTime,
  { position, stepSize, increment, duration, callback = () => {} }
) => {
  const nextTime = elapsedTime + increment

  // Set the new element position using an easing formula.
  // eslint-disable-next-line no-param-reassign
  element.scrollTop = easeInOutSine(nextTime, position, stepSize, duration)

  if (nextTime < duration) {
    setTimeout(() => {
      animateScroll(element, nextTime, {
        position,
        stepSize,
        increment,
        duration,
        callback,
      })
    }, increment)
  } else {
    callback()
  }
}

const scrollToLocation = (element, targetPos, duration, callback) =>
  new Promise(resolve => {
    animateScroll(element, 0, {
      position: element.scrollTop,
      stepSize: targetPos - element.scrollTop,
      increment: 20,
      callback: () => {
        callback()
        resolve()
      },
      duration,
    })
  })

const scrollToAnchor = (target, callback) => event => {
  event.preventDefault()
  const rootElement = getScrollableElement()
  const targetOffset = target.offsetTop
  console.log(rootElement)
  console.log(target)
  console.log(targetOffset)

  scrollToLocation(rootElement, targetOffset, 750, callback)
}

export default scrollToAnchor
