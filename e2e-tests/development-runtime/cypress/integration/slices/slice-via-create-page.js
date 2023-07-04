import { allRecipes, allRecipeAuthors } from "../../../shared-data/slices"

/**
 * Test behaviour when a slice is created and passed `slices` option to createPage
 */

describe("Slice passed via createPage", () => {
  it("Pages created with slices mapping have correct content", () => {
    allRecipes.forEach(recipe => {
      cy.visit(`recipe/${recipe.id}`).waitForRouteChange()

      cy.getTestElement(`recipe-name`)
        .invoke(`text`)
        .should(`contain`, recipe.name)

      cy.getTestElement(`recipe-description`)
        .invoke(`text`)
        .should(`contain`, recipe.description)

      cy.getTestElement(`recipe-author-name`)
        .invoke(`text`)
        .should(`contain`, allRecipeAuthors.find(author => recipe.authorId === author.id).name)
    })
  })

  it(`404 pages with slices mapping have correct content`, () => {
    cy.visit(`/doesnt-exist`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`button`).click()

    cy.getTestElement(`mapped-slice`).should("have.text", "My mapped Slice")
  })
})
