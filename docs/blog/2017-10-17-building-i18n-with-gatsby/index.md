---
title: "Building i18n with Gatsby"
date: 2017-10-17
author: "Samuel Goudie"
---

Languages are a key part of who we are; they are an expression of our identity.
Serving users content in their own language is a powerful thing, and it allows
you to include nuances and specific cultural references in a way Google
Translate just wouldn't allow.

When we were looking for a new framework for the new
[doopoll](https://doopoll.co) marketing site, we knew we'd want to support i18n
from the start.

We were wowed with Gatsby's simplicity and speed, but couldn't find any clear
process for supporting i18n. With a little bit of digging and experimenting,
we've found that it's just as easy as the rest of the process.

Here is how we set up i18n for our Gatsby marketing site, and a few tips along
the way.

---

## Quick intro to i18n

Just in case you're new to i18n, don't worry, it's pretty simple! All we do is
take hard-coded strings like "Hello" and replace them with a variable so that
when the language changes, so does the string.

So for example rather than write `<h1>Hello</h1>`. I might write
`<h1>{t(hello)}` (more on this later), and the user would see 'Hello',
'Bonjour', or 'Hola' depending on what language they had switched to, and
whether we'd added a translation for it.

### TIP: A quick note on language codes

[Each language has a unique code](https://www.science.co.il/language/Codes.php).
We use this code to reference a language in our code. If you see a hyphen and
then some letters after it, they refer to the locale. So for example:

en = English cy = Welsh es = Spanish en-GB = British English en-US = American
English

The locale allows us to make changes to spelling (for example, "colour" vs.
"color"), but can also be used for other functions such as currency.

## Working with translators

At doopoll we speak multiple languages, but just like design, development, and
copywriting, translation requires time and skill to get it right. That's why we
work with our awesome friends at [Applingua](https://applingua.com/) who handle
all of our translation, and push new strings straight to our Git Repo 🙌.

There are other options out there. You can even crowd source your translations!
However, in our experience, if you're going to be updating your site regularly
it pays to build a good working relationship with a translator. They will
understand your brand, and how to effectively communicate your tone of voice in
a different language.

## Choosing a package

There are a few React i18n packages out there. We considered
[react-intl](https://github.com/yahoo/react-intl) and the community
[Gatsby plugin](https://www.npmjs.com/package/gatsby-plugin-i18n). However, we
opted for [react-i18next](https://github.com/i18next/react-i18next/) because we
use a version of i18next in our core Meteor app, and our translators are
familiar with the system.
[It's well documented too](https://react.i18next.com/).

We also wanted to use a non-specific Gatsby solution so we can use a similar
implementation in other projects.

To get started, you'll need to install a few packages:

`npm i -S i18next i18next-xhr-backend i18next-browser-languagedetector react-i18next`

## Setting up

This is straight from the
[i18n code examples](https://react.i18next.com/components/i18next-instance.html),
but copied here for convenience. You'll need to create an i18n component and
import it somewhere (we did it in our index layout):

```jsx
import i18n from "i18next";
import Backend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { reactI18nextModule } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: "en",

    // have a common namespace used around the full app
    ns: ["translations"],
    defaultNS: "translations",

    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    react: {
      wait: true,
    },
  });

export default i18n;
```

## Locales

Next we'll create a folder for our translation strings. We used a folder called
locales in our src folder (react-i18next likes that!). Within the locales folder
we create a folder for each language using the language code. Then within that
we create a JSON file for each component we want to translate.

For our site we're currently supporting English and Welsh, so our locales folder
looks like this.

```
- src
	- locales
		- en
			- PageHeader.json
			- PricingPlan.json
		...
		- cy
			- PageHeader.json
			- PricingPlan.json
		...
```

The `PageHeader` component in the `en` folder might look like this:

```json
{
  "heading": "Shwmae, bonjour, and hola!",
  "description":
    "Available in English, Welsh, French, and Spanish, with more translations coming soon. doopoll is great for local, multi-lingual, and global organisations."
}
```

And the `cy` component would look like this:

```json
{
  "heading": "Shwmae, bonjour, a hola!",
  "description":
    "Ar gael yn Saesneg, Cymraeg, Ffrangeg a Sbaeneg, gyda rhagor o gyfieithiadau'n dod yn fuan. Mae doopoll yn wych ar gyfer sefydliadau lleol, amlieithog a byd-eang."
}
```

### TIP: Using the locales folder with Gatsby

To get the locales folder into the right place for Gatsby we just need to add a
little hook to our `gatsby-node.js` file. It copies the locales folder post
build and gets everything in the right place:

```javascript
const fs = require("fs-extra");
const path = require("path");

exports.onPostBuild = () => {
  console.log("Copying locales");
  fs.copySync(
    path.join(__dirname, "/src/locales"),
    path.join(__dirname, "/public/locales")
  );
};
```

## Using with a component

With the packages installed and locales setup, we're ready to wire up a
component!

React-i18next uses a HOC to wrap your component and provide some props to handle
language switching. Here's our `PageHeader` component:

```jsx
import React, { Component } from "react";
import { translate } from "react-i18next";

class PageHeader extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className="PageHeader">
        <h2>{t("heading")}</h2>
        <p>{t("description")}</p>
      </div>
    );
  }
}

export default translate("PageHeader")(PageHeader);
```

Pretty simple! The string provided to `translate` is the corresponding JSON file
name for the translation, and the second instance is the component itself. We
keep these names the same to make it easier to match up translation files and
components.

### TIP: React Helmet

You can also use translation strings for page titles! Here's an example with
React Helmet:

```jsx
<div className="Pricing">
	<Helmet title={t('heading')}>
</div>
```

## Switching Languages

Finally, to make it easy for our users to switch language we need to create a
little component. Here's an example from our site:

```jsx
import React, { Component } from "react";
import classNames from "classnames";
import { translate } from "react-i18next";

class LanguageSwitcher extends Component {
  constructor(props) {
    super(props);
    const { i18n } = this.props;
    this.state = { language: i18n.language };

    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ language: nextProps.i18n.language });
  }

  handleChangeLanguage(lng) {
    const { i18n } = this.props;
    i18n.changeLanguage(lng);
  }

  renderLanguageChoice({ code, label }) {
    const buttonClass = classNames("LanguageSwitcher__button", {
      "LanguageSwitcher__button--selected": this.state.language === code,
    });

    return (
      <button
        key={code}
        className={buttonClass}
        onClick={() => this.handleChangeLanguage(code)}
      >
        {label}
      </button>
    );
  }

  render() {
    const languages = [
      { code: "en", label: "English" },
      { code: "cy", label: "Cymraeg" },
    ];

    return (
      <div className="LanguageSwitcher">
        {languages.map(language => this.renderLanguageChoice(language))}
      </div>
    );
  }
}

export default translate("LanguageSwitcher")(LanguageSwitcher);
```

This is a pretty simple component. We're setting the `language` state based on
the i18n prop so that we can check which language is currently active and show
that in our menu.

The `handleLanguageChange` function just wraps the `react-i18n` function passed
in as a prop through `translate`. Pretty much everything is handled for us.
Hooray! 🎉

## Finishing up

As you can see, i18n in Gatsby is actually pretty simple when you know how! We
had to work a few things out for ourselves (the locales folder being one of
them!), so hopefully reading this will allow you to get started serving
international users even quicker.
