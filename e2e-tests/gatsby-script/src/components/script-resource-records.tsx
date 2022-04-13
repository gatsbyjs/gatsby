import React, { useState, useEffect } from "react"
import { scriptUrls, scriptIndex } from "../../scripts"

/**
 * Displays performance resource records of scripts in a table.
 */
export function ScriptResourceRecords(): JSX.Element {
  const [records, setRecords] = useState<Array<PerformanceResourceTiming>>([])

  function getResourceRecords(retries: number = 0): void {
    const resourceRecords = performance.getEntriesByType(
      `resource`
    ) as Array<PerformanceResourceTiming>

    const scriptRecords = resourceRecords.filter(record =>
      scriptUrls.has(record.name)
    )

    if (scriptRecords.length !== scriptUrls.size && retries < 10) {
      setTimeout(() => {
        getResourceRecords(retries + 1)
      }, 1000)
    }

    setRecords(scriptRecords)
  }

  useEffect(() => {
    getResourceRecords()
  }, [])

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Script</th>
            <th>Fetch start</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            const script = scriptIndex[record.name]
            return (
              <tr id={script} key={script}>
                <td id="name">{script}</td>
                <td id="fetch-start">{record.fetchStart}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
