/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState } from "react"

import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import { renderCell } from "./evaluation-cell"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const SimpleEvaluationTable = ({ title, headers, data }) => {
  const [openedDetails, setOpenedDetails] = useState()
  return (
    <React.Fragment>
      {title && <SectionTitle text={title} />}
      <table>
        <tbody>
          <SectionHeaderTop columnHeaders={headers.map(h => h.display)} />
          {data.map(({ node }, idx) => (
            <React.Fragment>
              <tr key={`feature-row-`}>
                {headers.map((header, i) => (
                  <td
                    key={`feature-cell--`}
                    sx={{
                      display: `table-cell`,
                      "&:hover": {
                        cursor: `pointer`,
                      },
                      borderBottom: t => `1px solid ${t.colors.ui.border}`,
                      minWidth: 40,
                      px: 0,
                      textAlign: `left`,
                      verticalAlign: `middle`,
                      fontSize: 1,
                      lineHeight: `solid`,
                    }}
                  >
                    {renderCell(node[header.nodeFieldProperty], i)}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </React.Fragment>
  )
}

export default SimpleEvaluationTable
