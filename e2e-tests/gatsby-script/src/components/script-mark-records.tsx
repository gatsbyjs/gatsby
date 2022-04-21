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
  useEffect(() => {
    const interval = setInterval(() => {
      const markRecords = performance.getEntriesByType(
        `mark`
      ) as Array<PerformanceMarkWithDetails>

      const scriptRecords = markRecords.filter(
        markRecord => markRecord.name === `inline-script`
      )

      if (scriptRecords.length === 6 || performance.now() > 10000) {
        setRecords(scriptRecords)
        clearInterval(interval)
      }
    }, 100)
  }, [])

  return (
    <table id="script-mark-records">
      <thead>
        <tr>
          <th>Type</th>
          <th>Strategy</th>
          <th>Success</th>
          <th>Execute start (ms)</th>
        </tr>
      </thead>
      <tbody>
        {records
          .sort((a, b) => a.detail.executeStart - b.detail.executeStart)
          .map(record => {
            const { strategy, type, executeStart } = record.detail
            const key = `${strategy}-${type}`
            // @ts-ignore Do not complain about key not being a number
            const success = `${typeof window[key] === `boolean`}`
            return (
              <tr id={key} key={key}>
                <td id="type">{type}</td>
                <td id="strategy">{strategy}</td>
                <td id="success">{success}</td>
                <td id={MarkRecord.executeStart}>{trim(executeStart)}</td>
              </tr>
            )
          })}
      </tbody>
    </table>
  )
}
