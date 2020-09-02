import React, { useContext } from "react"

const StepContext = React.createContext({})

export const useRecipeStep = () => {
  const context = useContext(StepContext)
  return context
}

export const StepProvider = ({ step, totalSteps, children }) => (
  <StepContext.Provider value={{ step, totalSteps }}>
    {children}
  </StepContext.Provider>
)

export const RecipeStep = ({ step, totalSteps, children }) => (
  <StepProvider step={step} totalSteps={totalSteps}>
    {children}
  </StepProvider>
)

export const RecipeIntroduction = `div`
