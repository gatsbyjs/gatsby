import React from "react"
import { graphql, Link } from "gatsby"

export default () => null
// export default ({ data }) => {
//   const { title, content, contentType, pagination } = data.wpContent

//   return (
//     <div>
//       <Link to="/">home</Link>
//       <h1>{title}</h1>
//       <h2>
//         {contentType} #{pagination.pageNumber}
//       </h2>
//       {!!pagination && !!pagination.previous && (
//         <>
//           <Link to={pagination.previous.path}>
//             Previous {pagination.previous.title}
//           </Link>
//           <br />
//         </>
//       )}
//       {!!pagination && !!pagination.next && (
//         <Link to={pagination.next.path}>Next {pagination.next.title}</Link>
//       )}
//       <p dangerouslySetInnerHTML={{ __html: content }} />
//     </div>
//   )
// }

// export const query = graphql`
//   query index($id: String!) {
//     wpPost(id: { eq: $id }) {
//       title
//       content
//       contentType
//     #   pagination {
//     #     pageNumber
//     #     next {
//     #       path
//     #       title
//     #     }
//     #     previous {
//     #       path
//     #       title
//     #     }
//     #   }
//     # }
//   }
// `
