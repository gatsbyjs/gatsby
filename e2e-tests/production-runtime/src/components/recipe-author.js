import React from "react"

// Use as a Slice
function RecipeAuthor({ sliceContext: { name } }) {
  return (
    <div>
      Written by{" "}
      <span data-testid="recipe-author-name" style={{ fontWeight: "bold" }}>
        {name}
      </span>
    </div>
  )
}

export default RecipeAuthor
