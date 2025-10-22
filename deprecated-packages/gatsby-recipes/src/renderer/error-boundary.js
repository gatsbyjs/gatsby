import React from "react"

function ErrorBoundary({children}) {
  const [hasError, setHasError] = React.useState(false);

  function getDerivedStateFromError(error) {
    return { hasError: true }
  }

  function componentDidCatch(error, errorInfo) {
    console.log({ error, errorInfo })
  }

  if (hasError) {
return null
}

return children;
}

export default ErrorBoundary
