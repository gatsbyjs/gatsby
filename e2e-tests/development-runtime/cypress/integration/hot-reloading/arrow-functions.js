const IDS = {
  title: `title`,
  subTitle: `sub-title`,
}

describe(`hot-reloading anonymous arrow functions`, () => {
  beforeEach(() => {
    cy.visit(`/arrows`).waitForRouteChange()
  })
  it(`displays placeholders on launch`, () => {
    cy.getTestElement(IDS.title).should(`have.text`, `%TITLE%`)

    cy.getTestElement(IDS.subTitle).should(`have.text`, `%SUB_TITLE%`)
  })

  it(`updates on change`, () => {
    const text = `The title`
    cy.exec(
      `npm run update -- --file src/components/title.tsx --replacements "TITLE:${text}"`
    )

    cy.waitForHmr()

    cy.getTestElement(IDS.title).should(`have.text`, text)
  })
})
