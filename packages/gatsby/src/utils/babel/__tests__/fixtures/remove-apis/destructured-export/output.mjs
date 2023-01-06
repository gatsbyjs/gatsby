export const {
  config2
} = () => {
  const {
    config
  } = 'hello'; // Ensure matching nested properties stay untouched
  return {
    defer: true
  };
};
export const {
  anotherFunction
} = () => `test`;
