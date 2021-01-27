import { Select } from "enquirer"

export class SelectInput extends Select {
  format() {
    if (!this.state.submitted || this.state.cancelled) return ``
    if (Array.isArray(this.selected)) {
      return this.selected
        .map(choice =>
          this.styles.primary(this.symbols.middot + ` ` + choice.message)
        )
        .join(`\n`)
    }
    return this.styles.primary(
      this.symbols.middot + ` ` + this.selected.message
    )
  }

  async indicator(choice) {
    if (
      !this.multiple ||
      choice.role === `separator` ||
      choice.name === `___done`
    ) {
      return ``
    }
    return this.symbols.radio[choice.enabled ? `on` : `off`]
  }

  async pointer(choice, i) {
    const val = await this.element(`pointer`, choice, i)
    if (!val) {
      return undefined
    }

    const styles = this.styles
    const focused = this.index === i
    const style = focused ? styles.primary : val => val
    const ele = await this.resolve(
      val[focused ? `on` : `off`] || val,
      this.state
    )
    return focused ? style(ele) : ` `.repeat(ele.length)
  }

  async render() {
    const { submitted, size } = this.state

    let prompt = ``
    const header = await this.header()
    const prefix = await this.prefix()
    const message = await this.message()

    if (this.options.promptLine !== false) {
      prompt = [prefix, message].join(` `)
      this.state.prompt = prompt
    }

    const output = await this.format()
    const help = (await this.error()) || (await this.hint())
    const body = await this.renderChoices()
    const footer = await this.footer()

    if (output) prompt += `\n` + output
    if (help && !prompt.includes(help)) prompt += `\n` + help

    if (
      submitted &&
      !output &&
      !body.trim() &&
      this.multiple &&
      this.emptyError != null
    ) {
      prompt += this.styles.danger(this.emptyError)
    }

    this.clear(size)
    this.write([header, prompt, body, footer].filter(Boolean).join(`\n`))
    this.write(this.margin[2])
    this.restore()
  }
}

export class MultiSelectInput extends SelectInput {
  constructor(options) {
    super({ ...options, multiple: true })
  }

  toggle(choice, enabled) {
    super.toggle(choice, enabled)
  }

  async toChoices(value, parent) {
    const footer = [
      {
        role: `separator`,
      },
      {
        message: this.styles.bold(`Done`),
        name: `___done`,
      },
    ]

    if (typeof value === `function`) {
      value = await value.call(this)
    }
    if (value instanceof Promise) {
      value = await value
    }

    return super.toChoices([...value, ...footer], parent)
  }

  submit() {
    if (this.focused.name === `___done`) {
      return super.submit()
    }
    return this.space()
  }

  next() {
    return this.index === this.choices.length - 1 ? super.next() : this.end()
  }
}
