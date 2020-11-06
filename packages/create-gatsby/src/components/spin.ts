// Tiny, zero dependency spinner
const dots = [`⠋`, `⠙`, `⠹`, `⠸`, `⠼`, `⠴`, `⠦`, `⠧`, `⠇`, `⠏`]
const out = process.stderr

export function spin(message = ``, frames = dots, interval = 80): () => void {
  let frame = 0
  // Hide cursor
  out.write(`\x1b[?25l`)
  const timer = setInterval(() => {
    out.write(`${frames[frame]} ${message}`)
    frame = (frame + 1) % frames.length
    out.cursorTo(0)
  }, interval)

  return function stop(): void {
    clearInterval(timer)
    out.cursorTo(0)
    // Show cursor
    out.write(`\x1b[?25h`)
  }
}
