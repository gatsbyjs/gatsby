# gatsby-plugin-sentryio

Gatsby plugin to add Sentry error tracking to your site.

Learn more about Sentry [here](https://sentry.io).

## Install

`npm install --save gatsby-plugin-sentryio`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: "gatsby-plugin-sentryio",
    options: {
      dsn: "YOUR_SENTRY_DSN_URL",
      // Optional settings, see https://docs.sentry.io/clients/node/config/#optional-settings
      environment: process.env.NODE_ENV,
      enabled: (() =>
        ["production", "stage"].indexOf(process.env.NODE_ENV) !== -1)(),
    },
  },
]
```

Now `Sentry` is availble in global window object. so you can use it in `react 16` like:

```javascript
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error })
    Sentry.configureScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
    })
    Sentry.captureException(error)
  }

  render() {
    if (this.state.error) {
      // render fallback UI
      return <h1>Something went wrong!</h1>
    } else {
      // when there's not an error, render children untouched
      return this.props.children
    }
  }
}
```
