---
title: Deploying to Microsoft Internet Information Server (IIS)
---

[Internet Information Services (IIS)](https://www.iis.net/) for Windows® Server is a flexible, secure and manageable Web server for hosting anything on the Web. From media streaming to web applications, IIS's scalable and open architecture is ready to handle the most demanding tasks.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Instructions

### wwwroot

Deploying to IIS is a matter of running `gatsby build` and copying the contents of your local `public` folder to the `wwwroot` folder of your IIS web server.

### Caching

One important and sometimes overlooked aspect is to configure caching correctly. The following configuration will give you a good starting point in line with Gatsby's [suggested approach to caching](/docs/how-to/previews-deploys-hosting/caching/).

- Install the [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) module if it's not already there. It's required to define the `outboundRules` in the `web.config` given below.
- Add a `web.config` file to the `static` folder of your Gatsby project. It will be copied unchanged to the `public` folder
  during `gatsby build`.

Please note that local settings you make for your web in IIS Manager change the `web.config` file. You have to be careful to copy any changes to `web.config` on your server back to the version in your Gatsby `static` folder.

```xml:file=static\web.config
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <location path="static">
        <system.webServer>
            <httpProtocol>
                <customHeaders>
                    <remove name="cache-control" />
                    <add name="cache-control" value="public, max-age=31536000, immutable" />
                </customHeaders>
            </httpProtocol>
        </system.webServer>
    </location>
    <location path="page-data">
        <system.webServer>
            <httpProtocol>
                <customHeaders>
                    <remove name="cache-control" />
                    <add name="cache-control" value="public, max-age=0, must-revalidate" />
                </customHeaders>
            </httpProtocol>
        </system.webServer>
    </location>

    <system.webServer>
        <staticContent>
            <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
        </staticContent>
        <rewrite>
            <outboundRules>
              <rule name="AdjustCacheForDontCacheFiles" preCondition="IsDontCacheFile" stopProcessing="true">
                <match serverVariable="RESPONSE_Cache-Control" pattern=".*" />
                <action type="Rewrite" value="public, max-age=0, must-revalidate" />
              </rule>
              <rule name="AdjustCacheForCachePermanentlyFiles" preCondition="IsCachePermanentlyFile" stopProcessing="true">
                <match serverVariable="RESPONSE_Cache-Control" pattern=".*" />
                <action type="Rewrite" value="public, max-age=31536000, immutable" />
              </rule>
              <preConditions>
                <preCondition name="IsDontCacheFile">
                  <add input="{REQUEST_FILENAME}" pattern="(.*\.html)|(sw\.js)|(app\-data\.json)|(page\-data\.json)" />
                </preCondition>
                <preCondition name="IsCachePermanentlyFile">
                  <add input="{REQUEST_FILENAME}" pattern="((.*\.js)|(.*\.css))$" />
                </preCondition>
              </preConditions>
            </outboundRules>
        </rewrite>
    </system.webServer>
</configuration>
```

## Limitations

IIS doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).
