import React from "react"
import loadable from "@loadable/component"
import { radii } from "../utils/presets"

const dateToUTC = date => {
  const d = String(date)
  const year = Number(d.slice(0, 4))
  const monthNum = Number(d.slice(5))

  return Date.UTC(year, monthNum - 1, 0)
}

const highchartsOptions = {
  colors: [`#fd9800`, `#008FD5`, `#77AB43`, `#663399`, `#C4C4C4`],
  chart: {
    backgroundColor: null,
    style: {
      fontFamily: `Overpass, sans-serif`,
    },
  },
  title: {
    style: {
      color: `#241236`,
    },
    align: `left`,
  },
  legend: {
    align: `left`,
    verticalAlign: `bottom`,
  },
  tooltip: {
    backgroundColor: `#FFFFFF`,
    borderRadius: radii[1],
  },
  credits: {
    enabled: false,
  },
  xAxis: {
    gridLineWidth: 1,
    gridLineColor: `#F3F3F3`,
    lineColor: `#F3F3F3`,
    minorGridLineColor: `#F3F3F3`,
    tickColor: `#F3F3F3`,
    tickWidth: 1,
  },
  yAxis: {
    gridLineColor: `#F3F3F3`,
    lineColor: `#F3F3F3`,
    minorGridLineColor: `#F3F3F3`,
    tickColor: `#F3F3F3`,
    tickWidth: 1,
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.65,
    },
  },
}

const LazyHighChart = loadable(() => import(`react-highcharts`))

const DateChart = props => {
  const seriesData = JSON.parse(props.seriesData || props[`series-data`])
  const yAxisLabel = props.yAxisLabel || props[`y-axis-label`]
  const config = {
    chart: {
      type: `spline`,
      zoomType: `x`,
    },
    tooltip: {
      pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:.2f}%</b><br/>`,
    },
    title: {
      text: props.title,
    },
    xAxis: {
      type: `datetime`,
      title: {
        text: `Date`,
      },
    },
    yAxis: {
      title: {
        text: yAxisLabel,
      },
      labels: {
        format: `{value}%`,
      },
    },
    series: seriesData.map(series => {
      return {
        name: series.name,
        data: series.data.map(edge => [
          dateToUTC(edge.date),
          100 * parseFloat(edge.value),
        ]),
      }
    }),
  }
  return (
    <div className="gatsby-highcharts">
      <LazyHighChart
        config={{
          ...highchartsOptions,
          ...config,
        }}
      />
    </div>
  )
}

export default DateChart
