import React from "react"
import { useMDXComponents } from "@mdx-js/react"

interface IMdxWrapperProps {
  MDXContent: React.FC<{ components: [React.FC] }>
  GatsbyMDXLayout: React.FC
}

// Inject all available components in MDX render function
const MDXComponentInjector: React.FC<{
  MDXContent: IMdxWrapperProps["MDXContent"]
}> = ({ MDXContent }) => {
  const components: [React.FC] = useMDXComponents()
  return <MDXContent components={components} />
}

// Wrap MDX code with given Gatsby layout component
const MDXWrapper: React.FC<IMdxWrapperProps> = ({
  MDXContent,
  GatsbyMDXLayout,
}) => (
  <GatsbyMDXLayout>
    <MDXComponentInjector MDXContent={MDXContent} />
  </GatsbyMDXLayout>
)

export default MDXWrapper
