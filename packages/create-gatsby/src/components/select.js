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

    let styles = this.styles
    let focused = this.index === i
    let style = focused ? styles.primary : val => val
    let ele = await this.resolve(val[focused ? `on` : `off`] || val, this.state)
    return focused ? style(ele) : ` `.repeat(ele.length)
  }

  async render() {
    let { submitted, size } = this.state

    let prompt = ``
    let header = await this.header()
    let prefix = await this.prefix()
    let message = await this.message()

    if (this.options.promptLine !== false) {
      prompt = [prefix, message].join(` `)
      this.state.prompt = prompt
    }

    let output = await this.format()
    let help = (await this.error()) || (await this.hint())
    let body = await this.renderChoices()
    let footer = await this.footer()

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
    if (choice.name === `___done`) {
      super.submit()
    } else {
      super.toggle(choice, enabled)
    }
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
    return this.space()
  }

  next() {
    return this.index === this.choices.length - 1 ? super.next() : this.end()
  }
}
