import { Input } from "enquirer"
export class TextInput extends Input {
  constructor(options) {
    super(options)
    this.cursorShow()
  }
  async render() {
    const size = this.state.size

    const prefix = await this.prefix()
    const separator = await this.separator()
    const message = await this.message()

    let prompt = [
      prefix,
      ` `,
      this.styles.muted(await this.element(`hint`)),
      separator,
    ]
      .filter(Boolean)
      .join(``)
    this.state.prompt = prompt

    const header = await this.header()
    let output = await this.format()
    const unstyled = this.styles.unstyle(output)

    // Make a fake cursor if we're showing the placeholder
    if (!this.input?.length && unstyled.length) {
      this.cursorHide()
      output =
        this.styles.highlight(unstyled[0]) +
        this.styles.placeholder(unstyled.slice(1))
    } else {
      this.cursorShow()
    }
    const footer = await this.footer()

    prompt += ` ` + output

    this.clear(size)
    this.write(
      [header, message, prompt, await this.error(), footer]
        .filter(Boolean)
        .join(`\n`)
    )
    this.restore()
  }
}
