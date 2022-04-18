import React, { useState, useEffect } from "react"
import {
  scriptUrls,
  scriptUrlIndex,
  scriptStrategyIndex,
  Script,
} from "../../scripts"
import { ResourceRecord } from "../../records"
import { trim } from "../utils/trim"

/**
 * Displays performance resource records of scripts in a table.
 */
export function ScriptResourceRecords(): JSX.Element {
  const [records, setRecords] = useState<Array<PerformanceResourceTiming>>([])

  /**
   * Poll for the resource records we care about.
   * Use this approach since `PerformanceObserver` doesn't give us preload link records (e.g. framework)
   */
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
      }, 100)
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
            <th>Strategy</th>
            <th>Fetch start (ms)</th>
            <th>Response end (ms)</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => {
            const { name: url, fetchStart, responseEnd } = record || {}

            let name: Script | `framework`
            let strategy: string

            if (isFrameworkRecord(record)) {
              name = `framework`
              strategy = `N/A`
            } else {
              name = scriptUrlIndex[url]
              strategy = scriptStrategyIndex[name]
            }

            return (
              <tr id={name} key={name}>
                <td id="name">{name}</td>
                <td id="strategy">{strategy}</td>
                <td id={ResourceRecord.fetchStart}>{trim(fetchStart)}</td>
                <td id={ResourceRecord.responseEnd}>{trim(responseEnd)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

function isFrameworkRecord(record: PerformanceResourceTiming): boolean {
  return record.name.includes(`framework`)
}
