---
title: Configuring Log Drains on Gatsby Cloud
description: Learn how to connect Gatsby Cloud's hosting logs to third party log analytics providers like DataDog
---

Gatsby Cloud can deliver hosting logs to the 3rd party services, which allows developers and marketers to review server side analytics, and accelerate the troubleshooting process when hosting layer errors occur.

## Prerequisites
- The Log Drains feature is limited to Enterprise Plans in Gatsby cloud, therefore this feature will only appear within Site Settings for Sites within Enterprise Plans.
- You must have an account with DataDog. Currently, Gatsby Cloud only supports integration with DataDog, but will introduce additional logging targets based on customer demand in the future.

## Enable Log Drains
1. [Log in](https://app.datadoghq.com/account/login) to your DataDog account
1. [Add a new API Key](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token), giving it a name that will help you remember that this key is used for receiving logs from Gatsby Cloud<br/>**Note**: If you’re enabling Log Drains for multiple Gatsby Cloud sites, we recommend that you create a separate API key for each Gatsby Cloud site.
1. Copy the newly-created API Key
1. Take note of the Region ([SITE in DataDog terminology](https://docs.datadoghq.com/getting_started/site/#pagetitle)) for your DataDog account<br/>**Note**: Your DataDog region may appear as the subdomain when logged into DataDog
1. [Log in](https://www.gatsbyjs.com/dashboard/login) to Gatsby Cloud
1. Select the site whose logs you’d like to integrate with DataDog
1. Access Site Settings for that site
1. Select Log Drains in the left navigation<br/>
![Log Drains Navigation Item](log-drains-nav-item.png)<br/> **Note**: If you do not see Log Drains, then the selected site is not likely within an Enterprise Plan. Contact Us if you have any questions.
1. Click Connect<br/>![Click Connect to configure log drains](connect-log-drains-1.png)
1. Select the appropriate region for your DataDog instance.<br/>![Select the appropriate region](select-region-3.png)<br/>
1. In DataDog, this is the value for [Site](https://docs.datadoghq.com/getting_started/site/#pagetitle)
1. Enter the API key you created in DataDog from step 3<br/>![Add your Log Analytics service's API Key](add-api-key.png)
1. Click Connect
1. You will see a confirmation that DataDog is now connected<br/>![Connected confirmation message](connect-confirmation.png)
1. View the [Live Tail](https://app.datadoghq.com/logs/livetail) for this Gatsby Site’s Logs in your DataDog account to confirm that you’re now receiving logs from Gatsby Cloud<br/>**Note**: It can take up to 10 minutes for your initial set of logs to appear

## Modify Log Drains
1. Access your Site’s settings via the Site’s Site Settings in Gatsby Cloud
1. Navigate to Log Drains in the left-hand navigation
1. Click the ellipsis for Log Drains to expose the actions menu
1. Click Edit
1. Update the settings accordingly
1. Click Save

## Disconnect Log Drains
1. Access your Site’s settings via the Site’s Site Settings in Gatsby Cloud
1. Navigate to Log Drains in the left-hand navigation
1. Click the ellipsis for Log Drains to expose the actions menu
1. Click Delete
1. Confirm Deletion of this Configuration
1. Confirm that you are no longer receiving Logs for this site via [Live Tail](https://app.datadoghq.com/logs/livetail) in DataDog

## Troubleshooting
- After selecting the region and specifying my API key, I receive an error upon clicking Connect from Gatsby Cloud
  - Confirm that you’ve entered the DataDog API Key properly
  - Confirm that you’ve selected the appropriate Region in Step 10
  - If all of these are correct, please [Contact Us](https://www.gatsbyjs.com/support/)
- It’s been more than 10 minutes, and I still don’t see any logs in DataDog. What now?
  - Confirm that the corresponding site in Gatsby Cloud has indeed received visitor traffic historically
  - Visit the corresponding site in Gatsby Cloud yourself to ensure activities within the next drain interval and wait another 10 minutes to confirm events via [Live Tail](https://app.datadoghq.com/logs/livetail)
  - If you still see no traffic in DataDog Live Tail, please [Contact Us](https://www.gatsbyjs.com/support/)
