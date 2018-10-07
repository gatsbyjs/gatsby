import React from "react"
import ReactHighcharts from "react-highcharts"

const dateToUTC = date => {
  const d = String(date)
  const year = Number(d.slice(0, 4))
  const monthNum = Number(d.slice(4))

  return Date.UTC(year, monthNum - 1, 0)
}

const highchartsOptions = {
  colors: ["#fd9800", "#008FD5", "#77AB43", "#663399", "#C4C4C4"],
  chart: {
    backgroundColor: null,
    style: {
      fontFamily: "Overpass, sans-serif",
    },
  },
  title: {
    style: {
      color: "#241236",
    },
    align: "left",
  },
  legend: {
    align: "left",
    verticalAlign: "bottom",
  },
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  credits: {
    enabled: false,
  },
  xAxis: {
    gridLineWidth: 1,
    gridLineColor: "#F3F3F3",
    lineColor: "#F3F3F3",
    minorGridLineColor: "#F3F3F3",
    tickColor: "#F3F3F3",
    tickWidth: 1,
  },
  yAxis: {
    gridLineColor: "#F3F3F3",
    lineColor: "#F3F3F3",
    minorGridLineColor: "#F3F3F3",
    tickColor: "#F3F3F3",
    tickWidth: 1,
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.65,
    },
  },
}

const DateChart = ({ props }) => {
  const data = { props }
  const config = {
    chart: {
      type: "spline",
      zoomType: "x",
    },
    title: {
      text: props.title,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Month",
      },
    },
    yAxis: {
      title: {
        text: props.yAxisLabel,
      },
    },
    series: props.data.allSeries.map(series => ({
      name: series.name,
      data: series.data.map(edge => [dateToUTC(edge.date), edge.value]),
    })),
  }
  return (
    <div className="gatsby-highcharts">
      <ReactHighcharts
        config={{
          ...highchartsOptions,
          ...config,
        }}
      />
    </div>
  )
}

export default DateChart
