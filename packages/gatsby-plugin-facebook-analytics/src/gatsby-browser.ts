declare global {
  interface Window {
    FB: Function & {
      AppEvents: {
        logPageView(): void
      }
    };
  }
}

export const onRouteUpdate = () => {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof window.FB === `function`) {
    window.FB.AppEvents.logPageView()
  }
}
