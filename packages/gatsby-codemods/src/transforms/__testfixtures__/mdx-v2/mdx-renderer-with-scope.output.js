export default function SomeGatsbyTemplateComponent({ data }) {
  return (
    <main>
      <MDXProvider components={SomeCustomComponents}>{children}</MDXProvider>
    </main>
  );
};