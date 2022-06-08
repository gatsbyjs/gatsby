export default function SomeGatsbyTemplateComponent({ data }) {
  return (
    <main>
      <MdxRenderer>{data.Mdx.node.mdxField.body}</MdxRenderer>
    </main>
  );
};