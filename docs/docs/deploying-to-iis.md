---
title: Deploying to Microsoft Internet Information Server (IIS)
---

Deploying to Microsoft IIS is mostly copy & paste.
After `gatsby build` copy the contents of the `public` folder into the `wwwroot` folder of your IIS web.

One important and sometimes overlooked aspect is to configure caching correctly.
The following configuration will give you a good starting point in line with Gatsby's [suggested approach to caching](/docs/caching/).

Install the [IIS URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) module if it's not already there.
It's required to define the `outboundRules` in the `web.config` given below.

Add a `web.config` file to the `static` folder inside your Gatsby solution. It will be copied unchanged to the `public` folder
during `gatsby build`.

Please note that local settings you make for your web in IIS Manager change the `web.config` file;
you have to be careful to copy any changes to `web.config` on your server back to the version in your Gatsby `static` folder.

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
