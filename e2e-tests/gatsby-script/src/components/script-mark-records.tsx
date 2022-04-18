import React, { useState, useEffect } from "react"
import { PerformanceMarkWithDetails } from "../../records"
import { trim } from "../utils/trim"

/**
 * Displays performance mark records of scripts in a table.
 */
export function ScriptMarkRecords(): JSX.Element {
  const [records, setRecords] = useState<Array<PerformanceMarkWithDetails>>([])

  /**
   * Poll for the mark records we care about.
   */
  function getMarkRecords(retries: number = 0): void {
    const markRecords = performance.getEntriesByType(
      `mark`
    ) as Array<PerformanceMarkWithDetails>

    const scriptRecords = markRecords.filter(
      record => record.name === `inline-script`
    )

    if (scriptRecords.length !== 6 && retries < 10) {
      setTimeout(() => {
        getMarkRecords(retries + 1)
      }, 100)
    }

    setRecords(scriptRecords)
  }

  useEffect(() => {
    getMarkRecords()
  }, [])

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Type</th>
            <th>Load end (ms)</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            const { strategy, type, executeEnd } = record.detail
            const key = `${strategy}-${type}`
            return (
              <tr id={key} key={key}>
                <td id="strategy">{strategy}</td>
                <td id="type">{type}</td>
                <td id="execute-end">{trim(executeEnd)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
