import React, { useState, useEffect } from "react"
import {
  scriptUrlIndex,
  scriptStrategyIndex,
  scriptSuccessIndex,
} from "../../gatsby-script-scripts"
import { resourceRecord } from "../../gatsby-script-records"
import { trim } from "../utils/trim"

/**
 * Displays performance resource records of scripts in a table.
 */
export function ScriptResourceRecords(props) {
  const { check, count } = props

  const [records, setRecords] = useState([])

  /**
   * Poll for the resource records we care about.
   * Use this approach since `PerformanceObserver` doesn't give us preload link records (e.g. framework)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const resourceRecords = performance.getEntriesByType(`resource`)

      const scriptRecords = resourceRecords.filter(check)

      if (scriptRecords.length === count || performance.now() > 10000) {
        setRecords(scriptRecords)
        clearInterval(interval)
      }
    }, 100)
  }, [])

  return (
    <table id="script-resource-records">
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

            let name
            let strategy
            let success

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
                <td id={resourceRecord.fetchStart}>{trim(fetchStart)}</td>
                <td id={resourceRecord.responseEnd}>{trim(responseEnd)}</td>
              </tr>
            )
          })}
      </tbody>
    </table>
  )
}
