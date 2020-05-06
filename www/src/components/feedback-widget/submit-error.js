import React from "react"
import WidgetWrapper from "./widget-wrapper"
import { CloseButton } from "./buttons"
import { Actions, ScreenReaderText, Title } from "./styled-elements"
import { SubmitButton } from "./buttons"
import { MdArrowForward } from "react-icons/md"

const SubmitError = ({ handleClose, handleOpen, titleRef }) => (
  <WidgetWrapper className="feedback-success" handleClose={handleClose}>
    <Title ref={titleRef} tabIndex="-1">
      Oops! Something went wrong.
    </Title>
    <p>Please try again.</p>
    <Actions>
      <CloseButton onClick={handleClose}>
        Cancel{` `}
        <ScreenReaderText className="sr-only">this widget</ScreenReaderText>
      </CloseButton>
      <SubmitButton onClick={handleOpen}>
        Try Again <MdArrowForward />
      </SubmitButton>
    </Actions>
  </WidgetWrapper>
)

export default SubmitError
