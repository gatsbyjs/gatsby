# gatsby-telemetry

Gatsby contains a telemetry feature that collects anonymous usage information that helps improve Gatsby for all users.
You will be notified when installing Gatsby and when running it for the first time.

## How to opt-out

Users may always opt-out from the telemetry with `gatsby telemetry --disable` or setting the environment variable `GATSBY_TELEMETRY_DISABLED` to `1`

## Why?

Anonymous aggregate user analytics allow us to prioritise fixes and features based on how, and when people use Gatsby.
Since much of Gatsby’s function revolves around community plugins and starters, we want to collect information on usage,
and, importantly, reliability, so that we can ensure a high-quality plugin (and soon, theme) ecosystem.

For example:

- We will be able to understand which plugins are used together, surface that information in the public plugin library, and, for example, build more relevant starters and tutorials.
- We will be able to surface popularity of different starters in the starter showcase.
- We will be able to surface error rates in each build stage, and focusing on driving these down over time. We want the experience to remain error free.
- We will be able to surface reliability of different plugins and starters, and detect the ones which seen buggy to then improve these.
- We will be able to see timings for different build stages to guide us in where we should focus optimization work.

## We collect the following data for all events

- Timestamp of the occurrence
- Command invoked (e.g. `build` or `develop`)
- Unique and unidentifiable machine ID
- Unique and unidentifiable session ID
- One-way hashed current working directory
- General OS level information (operating system, version, CPU architecture, and whether the command is run inside a CI)
- Used Gatsby version
- Errors with PII (e.g., paths) sanitized.

In addition to these events, we may collect additional performance affecting measurements, such as how many pages / queries etc. the build involved.
