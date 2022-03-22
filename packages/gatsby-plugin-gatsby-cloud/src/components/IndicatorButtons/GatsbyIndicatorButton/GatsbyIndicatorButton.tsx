import React, { FC } from "react"
import IndicatorButton, { IIndicatorButtonProps } from "../IndicatorButton"
import { gatsbyIcon } from "../../icons"

const GatsbyIndicatorButton: FC = () => {
  const buttonProps: IIndicatorButtonProps = {
    testId: `gatsby`,
    icon: gatsbyIcon,
    clickable: false,
  }
  return <IndicatorButton {...buttonProps} />
}

export default GatsbyIndicatorButton
