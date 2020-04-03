---
title: Using cloudinary image service for media optimization  
---
`Cloudinary` is a cloud-based end-to-end media management platform for many of the world’s top brands. With extensive product offerings from an Image management solution, Dynamic Video Platform, and a dynamic digital asset management solution.

As Plugins are at the heart of developing software with Gatsby and optimization is also really important in mordern app. The Cloudinary plugins aid in making sure media assets fit this need. 

In this guide you will take a look at the  [gatsby-source-plugin](/packages/gatsby-source-cloudinary/) and [gatsby-transformer-cloudinary](/packages/gatsby-transformer-cloudinary/) which can be used to improve the experience of handling images on Gatsby sites. 

Here's a [Demo site for source plugin](https://gsc-sample.netlify.com) showcasing  optimized images in a masonry grid, served from [Cloudinary](https://cloudinary.com) 

The `gatsby-source-plugin` is helpful if you already have some images hosted on `Cloudinary` and would like to leverage on the plugin system of Gatsby.  

## Problem 
Dealing with images on the web have always been a problem as unoptimized images can slow down your site. The processes put in place to create the best media experience can take a lot of time to implement. 

## Solutions 
Cloudinary provides a couple of amazing solutions to this problem by offering the following solutions: 
- Remote storage and delivery of images via CDN
- Wider range of transformations over [gatsby-image](/docs/using-gatsby-image/).
- [Digital Asset Management](https://cloudinary.com/documentation/digital_asset_management_overview) for enterprise assets 

## Gatsby-Source-plugin 
This plugin fetches media assets from Cloudinary that are specified in a folder. It then transforms these images into Cloudinary file nodes, which can be queried with GraphQL in a Gatsby project. 

`gatsby-source-plugin` applies [f_auto and q_auto](https://cloudinary.com/documentation/image_transformations) transformation parameters which aid in automatic optimisation of format and quality for media assets by over 70 percent.

### Prerequisites 

There are a couple of things you would need to set up before using this plugin: 

- Upload the images to a folder on Cloudinary. This folder can have any name of your choosing. 
- Obtain your API key and API secret from your Cloudinary dashboard.
- [Dotenv](https://www.npmjs.com/package/dotenv) module installed for loading environment variables from a `.env` file.

### Usage 
1. Install `gatsby-source-cloudinary` 
```shell
  npm install gatsby-source-cloudinary
```
2. In the root of your project, create an environment file called `.env` to which to add your Cloudinary credentials and their values
```
CLOUDINARY_API_KEY=xxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
```
3. Configure `gatsby-config.js`
```js:title=gatsby-config.js
require('dotenv').config();
module.exports = {
  ...
  plugins:[
  ...
  {
      resolve: `gatsby-source-cloudinary`,
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        resourceType: `image`,
        prefix: `gatsby-source-cloudinary/` 
      }
    }
  ]
} 
```

> `gatsby-source-cloudinary` takes these options:
- **`cloudName`** , **`apiKey`** , and **`apiSecret`** **:** These are credentials from your Cloudinary console, stored as three separate environment variables for security.
- **`resourceType`** **:** This is the resource type of the media assets: either an image or a video.
- **`prefix`** **:** This is the folder (in your Cloudinary account) in which the files reside. In the example above, I named this folder `gatsby-source-cloudinary` . Assign a name of your choice.

Other optional options are `type`, `tags`, and `maxResult`.

> The `info` log, which displays the CloudinaryMedia nodes. Those images are ready to be queried in Gatsby components.

## Gatsby-transformer-cloudinary

Here's a [Demo site for transformer plugin](https://gatsby-transformer-cloudinary.netlify.com/fluid/)

### Usage 
1. Install `gatsby-transformer-cloudinary` and  `gatsby-source-filesystem` which creates the File nodes that the cloudinary transformer plugin works on. 
```shell
 npm install --save gatsby-transformer-cloudinary gatsby-source-filesystem 
```
2. In the root of your project, create an environment file called `.env` to which to add your Cloudinary credentials and their values
```
CLOUDINARY_API_KEY=xxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
```
3. Configure `gatsby-config.js`

```js:title=gatsby-config.js

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});
 
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-transformer-cloudinary',
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
 
        // This folder will be created if it doesn’t exist.
        uploadFolder: 'gatsby-cloudinary',
     
    },
  ],
};
```
> In gatsby-config, Responsive breakpoints can be created for each image, use the fluidMaxWidth and fluidMinWidth options to set them.


### Additional resources
- [Faster Sites with Optimized Media Assets by William Imoh](/blog/2020-01-12-faster-sites-with-optimized-media-assets/)
- [Gatsby Transformer Cloudinary](https://www.npmjs.com/package/gatsby-transformer-cloudinary)
- [Gatsby Source Cloudinary](/packages/gatsby-source-cloudinary/)
- [Aspect ratio parameter ](https://cloudinary.com/documentation/image_transformation_reference#aspect_ratio_parameter)
