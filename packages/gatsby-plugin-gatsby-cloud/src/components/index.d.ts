export declare module "gatsby-plugin-gatsby-cloud/components" {
  import React from "react"

  type GenericProps = {[key: string]: any}
  type TrackEventProps = {
    siteId: string,
    orgId: string,
    buildId: string
  }
  type IndicatorButtonProps = {
    tooltipContent?: React.ReactNode,
    overrideShowTooltip?: boolean,
    iconSvg?: React.ReactNode,
    onClick?: () => void,
    showSpinner?: boolean,
    active?: boolean,
    onMouseEnter?: () => void,
  }

  export function PreviewIndicator(props: { children: React.ReactNode }): React.FC
  export function GatsbyIndicatorButton(props: GenericProps): React.FC
  export function LinkIndicatorButton(props: TrackEventProps & IndicatorButtonProps): React.FC
  export function InfoIndicatorButton(props: TrackEventProps & IndicatorButtonProps): React.FC
  export function BuildErrorIndicatorTooltip(props: TrackEventProps): React.FC
  export function BuildErrorIndicatorTooltip(props: {}): React.FC
}
