
> # gatsby-new-blog

[![Build Status][travis-svg]][travis-url]
[![npm download][download-img]][download-url]
[![license][license-img]][license-url]

[travis-svg]: https://travis-ci.org/FengShangWuQi/gatsby-new-blog.svg
[travis-url]: https://travis-ci.org/FengShangWuQi/gatsby-new-blog
[download-img]: https://img.shields.io/npm/dt/gatsby-new-blog.svg
[download-url]: https://www.npmjs.com/package/gatsby-new-blog
[license-img]: https://img.shields.io/npm/l/gatsby-new-blog.svg
[license-url]: https://github.com/FengShangWuQi/gatsby-new-blog/blob/master/LICENSE

new blog for your gatsby site.

## screenshots

![screenshots](./images/screenshots.png)

## install

```
$ yarn add gatsby-new-blog --dev
```

[![gatsby-new-blog](https://nodei.co/npm/gatsby-new-blog.png)](https://npmjs.org/package/gatsby-new-blog)

## Usage

### update package.json

```json
{
  "scripts": {
    "new-blog": "gatsby-new-blog start"
  }
}
```

just run `yarn run new-blog`, you will enjoy, if you add `global` when install, you can use `gatsby-new-blog start` instead.

### config config/default.yml

`header` and `question` is required

```yml
blog:
  header: "fswq's blog"
  warning: '⚠️  ：The default size of cover image is 1200 * 600 in px'
  info: '❤️  hello, fswq, welcome back!'
  question: 
    title:
      type: 'input'
      name: 'title'
      default: 'How JavaScipt can do this'
      message: 'blog title'
    original:
      type: 'confirm'
      name: 'original'
      default: true
      message: 'is original'
    tag:
      type: 'checkbox'
      name: 'tag'
      default: ['Front-End']
      message: 'blog tag'
      choices: ['Front-End','NodeJS','Visualization']
      pageSize: 10
```

With reference to the `screenshots` above, you can know the meaning of each configuration item, and what need to be remind is the config of question which you should follow [inquirer](https://github.com/SBoudrias/Inquirer.js)

## prepare a header img

put a `1200 * 600` size `header.png` in `static/`

## LICENSE
MIT@[fengshangwuqi](https://github.com/FengShangWuQi)
