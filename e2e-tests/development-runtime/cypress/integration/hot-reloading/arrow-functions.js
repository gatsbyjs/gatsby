const IDS = {
  title: `title`,
  subTitle: `sub-title`,
}

describe(`hot-reloading anonymous arrow functions`, () => {
  beforeEach(() => {
    cy.visit(`/arrows`).waitForAPI(`onRouteUpdate`)
  })
  it(`displays placeholders on launch`, () => {
    cy.getTestElement(IDS.title)
      .invoke(`text`)
      .should(`contain`, `%TITLE%`)

    cy.getTestElement(IDS.subTitle)
      .invoke(`text`)
      .should(`contain`, `%SUB_TITLE%`)
  })

  it(`upates on change`, () => {
    const text = `The title`
    cy.exec(
      `npm run update -- --file src/components/title.js --replacements "TITLE:${text}"`
    )

    cy.getTestElement(IDS.title)
      .invoke(`text`)
      .should(`eq`, text)
  })
})
