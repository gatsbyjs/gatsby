Now you can use JSX to add the processed image to your page. You need to import `Img` from `gatsby-image`, the package you installed at the beginning.

Using the `Img` tag you'll pass in the object returned from your GraphQL query. The key `fluid` matches the way the image was processed. It needs to match. And always include an alt tag with a description of your image.
