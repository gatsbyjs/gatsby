export default function SomeGatsbyTemplateComponent({ data }) {
  return (
    <main>
      <MdxRenderer scope={SomeCustomComponents}>{data.Mdx.node.mdxField.body}</MdxRenderer>
    </main>
  );
};