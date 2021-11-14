import React from 'react';

const MyComponent = () => {
  const shouldNotBeReplaced = process.env.REPLACE_ME;
  return /*#__PURE__*/React.createElement("div", null, "Hello World! ", process.env.REPLACE_ME);
};

export const getServerData = async () => {
  const shouldBeReplaced = "env-var-replacement";
  return {
    props: {
      shouldBeReplaced
    }
  };
};
export const config = async () => {
  const shouldNotBeReplaced = process.env.REPLACE_ME;
  return {
    defer: shouldNotBeReplaced
  };
};
export default MyComponent;
