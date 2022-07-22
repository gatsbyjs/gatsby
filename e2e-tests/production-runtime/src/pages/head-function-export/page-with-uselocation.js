import * as React from "react"
import { useLocation } from '@gatsbyjs/reach-router';

export default function HeadFunctionExportWithUseLocation() {
  const location = useLocation();

  return (
    <>
      <h1>I test that Head export with useLocation hook works</h1>
      <p data-testid="location-pathname-in-template">{location.pathname}</p>
    </>
  )
}

export function Head() {
  const location = useLocation();

  return <meta data-testid="location-pathname-in-head" name="location" content={location.pathname}/>
}