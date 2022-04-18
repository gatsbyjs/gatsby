import React, { useState, useEffect } from "react"
import { PerformanceMarkWithDetails, MarkRecord } from "../../records"
import { trim } from "../utils/trim"

/**
 * Displays performance mark records of scripts in a table.
 */
export function ScriptMarkRecords(): JSX.Element {
  const [records, setRecords] = useState<Array<PerformanceMarkWithDetails>>([])

  /**
   * Poll for the mark records we care about.
   * We'll use this approach instead of listening for the load event to be consistent.
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
            <th>Execute start (ms)</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            const { strategy, type, executeStart } = record.detail
            const key = `${strategy}-${type}`
            return (
              <tr id={key} key={key}>
                <td id="strategy">{strategy}</td>
                <td id="type">{type}</td>
                <td id={MarkRecord.executeStart}>{trim(executeStart)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
