export declare module "gatsby-plugin-gatsby-cloud/components" {
  import React from "react"

  type GenericProps = { [key: string]: any }

  type TrackEventProps = {
    siteId: string
    orgId: string
    buildId: string
  }

  interface IndicatorButtonTooltipProps {
    content: React.ReactNode | string
    closable: boolean
    show: boolean
    overrideShow?: boolean
    testId: string
    onClose?: () => void
  }
  interface IndicatorButtonProps {
    buttonIndex: number
    testId: string
    showSpinner?: boolean
    active?: boolean
    hoverable?: boolean
    highlighted?: boolean
    iconSvg?: React.ReactNode
    tooltip?: IndicatorButtonTooltipProps
    onClick?: () => void
    onMouseEnter?: () => void
  }

  export function PreviewIndicator(props: {
    children: React.ReactNode
  }): React.FC
  export function GatsbyIndicatorButton(props: GenericProps): React.FC
  export function LinkIndicatorButton(
    props: TrackEventProps & IndicatorButtonProps
  ): React.FC
  export function InfoIndicatorButton(
    props: TrackEventProps & IndicatorButtonProps
  ): React.FC
  export function BuildErrorIndicatorTooltip(props: TrackEventProps): React.FC
  export function BuildErrorIndicatorTooltip(props: {}): React.FC
}
