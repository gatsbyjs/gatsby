import React from 'react';

function MyComponent() {
  const shouldNotBeReplaced = process.env.REPLACE_ME;
  return /*#__PURE__*/React.createElement("div", null, "Hello World! ", process.env.REPLACE_ME);
}

export async function getServerData() {
  const shouldBeReplaced = "env-var-replacement";
  return {
    props: {
      shouldBeReplaced
    }
  };
}
export async function config() {
  const shouldNotBeReplaced = process.env.REPLACE_ME;
  return {
    defer: shouldNotBeReplaced
  };
}
export default MyComponent;
