export const onPreBuild = (_, { slugify }) => {
  console.info(slugify(`a local plugin using passed esm module`));
};
