import React from "react"

import { colors, fontSizes, lineHeights } from "../../utils/presets"
import SectionTitle from "./evaluation-table-section-title"
import SectionHeaderTop from "./evaluation-table-section-header-top"
import { renderCell } from "./evaluation-cell"

const SimpleEvaluationTable = ({ title, headers, data }) => (
  <>
    {title && <SectionTitle text={title} />}
    <table>
      <tbody>
        <SectionHeaderTop columnHeaders={headers.map(h => h.display)} />
        {data.map(({ node }, idx) => (
          <tr key={`feature-row-${idx}`}>
            {headers.map((header, i) => (
              <td
                key={`feature-cell-${idx}-${i}`}
                css={{
                  display: `table-cell`,
                  "&:hover": {
                    cursor: `pointer`,
                  },
                  borderBottom: `1px solid ${colors.ui.light}`,
                  minWidth: 40,
                  paddingRight: 0,
                  paddingLeft: 0,
                  textAlign: `left`,
                  verticalAlign: `middle`,
                  fontSize: fontSizes[1],
                  lineHeight: lineHeights.solid,
                }}
              >
                {renderCell(node[header.nodeFieldProperty], i)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

export default SimpleEvaluationTable
