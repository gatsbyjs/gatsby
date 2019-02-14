const get = require('lodash/get');
const endsWith = require('lodash/endsWith');

function filterJavascriptItems(item) {
  const href = get(item, 'props.href');
  const src = get(item, 'props.src');

  if (href && href.endsWith('.js')) {
    return false;
  }

  if (src && src.endsWith('.js')) {
    return false;
  }

  return true;
}

exports.onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
  getPostBodyComponents,
  replacePostBodyComponents,
}) => {
  const filteredHeadComponents = getHeadComponents().filter(
    filterJavascriptItems
  );
  replaceHeadComponents(filteredHeadComponents);

  const filteredPostBodyComponents = getPostBodyComponents().filter(
    filterJavascriptItems
  );
  replacePostBodyComponents(filteredPostBodyComponents);
};
