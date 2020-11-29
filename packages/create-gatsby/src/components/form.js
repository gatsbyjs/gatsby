import { Form } from "enquirer"
import placeholder from "./placeholder"
import colors from "ansi-colors"

export class FormInput extends Form {
  async renderChoice(choice, i) {
    await this.onChoice(choice, i)

    let { state, styles } = this
    let { cursor, initial = ``, name, input = `` } = choice
    let { muted, submitted, primary, danger } = styles

    let focused = this.index === i
    let validate = choice.validate || (() => true)
    let sep = await this.choiceSeparator(choice, i)
    let msg = choice.message

    if (this.align === `right`) msg = msg.padStart(this.longest + 1, ` `)
    if (this.align === `left`) msg = msg.padEnd(this.longest + 1, ` `)

    // re-populate the form values (answers) object
    let value = (this.values[name] = input || initial)
    let color = input ? `success` : `dark`

    if ((await validate.call(choice, value, this.state)) !== true) {
      color = `danger`
    }

    let style = styles[color]
    let indicator = style(await this.indicator(choice, i)) + (choice.pad || ``)

    let indent = this.indent(choice)
    let line = () =>
      [indent, indicator, msg + sep, input].filter(Boolean).join(` `)

    if (state.submitted) {
      msg = colors.unstyle(msg)
      input = submitted(input)
      return line()
    }

    if (choice.format) {
      input = await choice.format.call(this, input, choice, i)
    } else {
      let color = this.styles.muted
      let options = { input, initial, pos: cursor, showCursor: focused, color }
      input = placeholder(this, options)
    }

    if (!this.isValue(input)) {
      input = this.styles.muted(this.symbols.ellipsis)
    }

    if (choice.result) {
      this.values[name] = await choice.result.call(this, value, choice, i)
    }

    if (focused) {
      msg = primary(msg)
    }

    if (choice.error) {
      input += (input ? ` ` : ``) + danger(choice.error.trim())
    } else if (choice.hint && focused) {
      input +=
        (input ? `\n${` `.repeat(this.longest + 6)}` : ``) +
        muted(choice.hint.trim())
    }

    return line()
  }
}
