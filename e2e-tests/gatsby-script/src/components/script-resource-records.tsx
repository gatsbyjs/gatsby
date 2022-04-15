import React, { useState, useEffect } from "react"
import { scriptUrls, scriptIndex, framework } from "../../scripts"
import { ResourceRecord } from "../../resource-records"

/**
 * Displays performance resource records of scripts in a table.
 */
export function ScriptResourceRecords(): JSX.Element {
  const [records, setRecords] = useState<Array<PerformanceResourceTiming>>([])

  // Poll for the script resource records we care about
  function getResourceRecords(retries: number = 0): void {
    const resourceRecords = performance.getEntriesByType(
      `resource`
    ) as Array<PerformanceResourceTiming>

    const scriptRecords = resourceRecords.filter(
      record => scriptUrls.has(record.name) || isFrameworkRecord(record)
    )

    if (scriptRecords.length !== scriptUrls.size + 1 && retries < 10) {
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
            <th>Fetch start (ms)</th>
            <th>Response end (ms)</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            let script: string

            if (isFrameworkRecord(record)) {
              script = framework
            } else {
              script = scriptIndex[record.name]
            }

            return (
              <tr id={script} key={script}>
                <td id="name">{script}</td>
                <td id={ResourceRecord.fetchStart}>
                  {trim(record.fetchStart)}
                </td>
                <td id={ResourceRecord.responseEnd}>
                  {trim(record.responseEnd)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

function trim(number: number): number {
  return Math.round(Number(number))
}

function isFrameworkRecord(record: PerformanceResourceTiming): boolean {
  return record.name.includes(framework)
}
