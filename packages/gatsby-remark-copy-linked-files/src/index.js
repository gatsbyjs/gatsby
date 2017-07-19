const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)
const _ = require(`lodash`)
const cheerio = require(`cheerio`)
const sizeOf = require('image-size');

module.exports = ({ files, markdownNode, markdownAST, getNode }, pluginOptions) => {
  const defaults = {
    ignoreFileExtensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
  }

  const options = _.defaults(pluginOptions, defaults)

  // Copy linked files to the public directory and modify the AST to point to
  // new location of the files.
  const visitor = link => {
    if (
      isRelativeUrl(link.url) &&
      getNode(markdownNode.parent).internal.type === `File`
    ) {
      const linkPath = path.join(getNode(markdownNode.parent).dir, link.url)
      const linkNode = _.find(files, file => {
        if (file && file.absolutePath) {
          return file.absolutePath === linkPath
        }
        return null
      })
      if (linkNode && linkNode.absolutePath) {
        const newPath = path.join(
          process.cwd(),
          `public`,
          `${linkNode.internal.contentDigest}.${linkNode.extension}`
        )
        
        // Prevent uneeded copying
        if(linkPath === newPath) {
          return;
        }

        const relativePath = path.join(
          `/${linkNode.internal.contentDigest}.${linkNode.extension}`
        )
        link.url = `${relativePath}`
        
        if (!fsExtra.existsSync(newPath)) {
          try{ 
            // Using copy sync to prevent race conditions that were caused by using
            // async copy
            fsExtra.copySync(linkPath, newPath);
          } catch(err) {
            console.error('\nerror copying: ' + linkPath + ' to ' + newPath);
          }
        }
      }
    }
  }

  // Takes a node and generates the needed images and then returns
  // the needed HTML replacement for the image
  const generateImagesAndUpdateNode = async function(image) {
    const imagePath = path.posix.join(
      getNode(markdownNode.parent).dir,
      image.attr('src'),
    );
    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath;
      }
      return null;
    });
    if (!imageNode || !imageNode.absolutePath) {
      return;
    }

    const initialImageSrc = image.attr('src');
    // The link object will be modified to the new location so we'll
    // use that data to update our ref
    const link = {url: image.attr('src')};
    await visitor(link);
    image.attr('src', link.url)
    
    let dimensions;

    if(!image.attr('width') || !image.attr('height')) {
      dimensions = sizeOf(imageNode.absolutePath);
    }

    // Generate default alt tag
    const srcSplit = initialImageSrc.split('/');
    const fileName = srcSplit[srcSplit.length - 1];
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, '');
    const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ' ');

    image.attr('alt', image.attr('alt') ? image.attr('alt') : defaultAlt)
    image.attr('width', image.attr('width') ? image.attr('width') : dimensions.width)
    image.attr('height', image.attr('height') ? image.attr('height') : dimensions.height)
  };

  visit(markdownAST, `link`, link => {
    const ext = link.url.split('.').pop()
    if(options.ignoreFileExtensions.includes(ext)) {
      return;
    }

    visitor(link)
  })

  // This will only work for markdown img tags
  visit(markdownAST, `image`, image => {
    const ext = image.url.split('.').pop()
    if(options.ignoreFileExtensions.includes(ext)) {
      return;
    }

    const imagePath = path.join(getNode(markdownNode.parent).dir, image.url)
    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return false
    })

    if(imageNode) {
      visitor(image)
    }
  })

  // For each HTML Node
  visit(markdownAST, `html`, async (node) => {
    const $ = cheerio.load(node.value);
    // Handle Images
    const imageRefs = [];
      $('img').each(function() {
        try {
          if (isRelativeUrl($(this).attr('src'))) {
            imageRefs.push($(this));
          }
        } catch(err) {

        }
      });

    for (let thisImg of imageRefs) {
      try {
        const ext = thisImg.attr('src').split('.').pop()
        if(options.ignoreFileExtensions.includes(ext)) {
          return;
        }

        await generateImagesAndUpdateNode(thisImg);
      } catch (err) {
      }
    };
    
    const videoRefs = [];
    // Handle video tags. 
    $('video source').each(function() {
      try {
        if (isRelativeUrl($(this).attr('src'))) {
          videoRefs.push($(this));
        }
      } catch(err) {

      }
    });

    for (let thisVideo of videoRefs) {
      try {
        const ext = thisVideo.attr('src').split('.').pop()
        if(options.ignoreFileExtensions.includes(ext)) {
          return;
        }
        
        // The link object will be modified to the new location so we'll
        // use that data to update our ref
        const link = {url: thisVideo.attr('src')};
        await visitor(link);
        thisVideo.attr('src', link.url)
      } catch (err) {
      }
    };

    // Handle a tags. 
    const aRefs = [];
    $('a').each(function() {
      try {
        if (isRelativeUrl($(this).attr('href'))) {
          aRefs.push($(this));
        }
      } catch(err) {

      }
    });

    for (let thisATag of aRefs) {
      try {
        const ext = thisATag.attr('href').split('.').pop()
        if(options.ignoreFileExtensions.includes(ext)) {
          return;
        }

        // The link object will be modified to the new location so we'll
        // use that data to update our ref
        const link = {url: thisATag.attr('href')};
        await visitor(link);
        thisATag.attr('href', link.url)
      } catch (err) {
      }
    };

    // Replace the image node with an inline HTML node.
    node.type = 'html';
    node.value = $.html();
    return;
  })
}
