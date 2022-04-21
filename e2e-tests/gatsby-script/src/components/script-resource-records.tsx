import React, { useState, useEffect } from "react"
import {
  scriptUrlIndex,
  scriptStrategyIndex,
  scriptSuccessIndex,
  Script,
} from "../../scripts"
import { ResourceRecord } from "../../records"
import { trim } from "../utils/trim"

interface Props {
  check: (record: PerformanceResourceTiming) => boolean
  count: number
}

/**
 * Displays performance resource records of scripts in a table.
 */
export function ScriptResourceRecords(props: Props): JSX.Element {
  const { check, count } = props

  const [records, setRecords] = useState<Array<PerformanceResourceTiming>>([])

  /**
   * Poll for the resource records we care about.
   * Use this approach since `PerformanceObserver` doesn't give us preload link records (e.g. framework)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const resourceRecords = performance.getEntriesByType(
        `resource`
      ) as Array<PerformanceResourceTiming>

      const scriptRecords = resourceRecords.filter(check)

      if (scriptRecords.length === count || performance.now() > 10000) {
        setRecords(scriptRecords)
        clearInterval(interval)
      }
    }, 100)
  }, [])

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Script</th>
            <th>Strategy</th>
            <th>Success</th>
            <th>Fetch start (ms)</th>
            <th>Response end (ms)</th>
          </tr>
        </thead>
        <tbody>
          {records
            .sort((a, b) => a.fetchStart - b.fetchStart)
            .map(record => {
              const { name: url, fetchStart, responseEnd } = record || {}

              let name: Script | `framework`
              let strategy: string
              let success: string

              if (record.name.includes(`framework`)) {
                name = `framework`
                strategy = `N/A`
                success = `N/A`
              } else {
                name = scriptUrlIndex[url]
                strategy = scriptStrategyIndex[name]
                success = `${scriptSuccessIndex[name]()}`
              }

              return (
                <tr id={name} key={name}>
                  <td id="name">{name}</td>
                  <td id="strategy">{strategy}</td>
                  <td id="success">{success}</td>
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
