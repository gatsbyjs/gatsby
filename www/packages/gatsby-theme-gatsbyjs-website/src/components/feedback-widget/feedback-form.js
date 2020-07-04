/** @jsx jsx */
import { jsx } from "theme-ui"
import { Fragment } from "react"
import WidgetWrapper from "./widget-wrapper"
import Ratings from "./ratings"
import { SubmitButton, CloseButton } from "./buttons"
import { themedInput } from "../../utils/styles"
import { Actions, Title, ScreenReaderText } from "./styled-elements"
import { MdSend, MdRefresh } from "react-icons/md"

const textareaLabelStyles = {
  fontSize: 1,
  fontWeight: `bold`,
  span: {
    fontWeight: `normal`,
  },
}

const textareaStyles = {
  ...themedInput,
  height: `5.5rem`,
  mt: 1,
  mb: 4,
  px: 3,
  py: 2,
  lineHeight: `default`,
  overflowY: `scroll`,
}

export default function FeedbackForm({
  handleSubmit,
  handleClose,
  handleChange,
  handleCommentChange,
  titleRef,
  rating,
  comment,
  submitting,
}) {
  return (
    <WidgetWrapper id="feedback-widget" handleClose={handleClose}>
      <form
        sx={{
          mb: 0,
        }}
        onSubmit={handleSubmit}
        className={`${submitting ? `submitting` : ``}`}
      >
        <Title ref={titleRef} tabIndex="-1">
          Was this doc helpful to you?
        </Title>
        <Ratings
          rating={rating}
          handleChange={handleChange}
          submitting={submitting}
        />
        <label
          sx={textareaLabelStyles}
          className={`textarea ${submitting ? `disabled` : ``}`}
        >
          Your comments <span>(optional):</span>
          <textarea
            sx={textareaStyles}
            value={comment}
            onChange={handleCommentChange}
            disabled={submitting}
          />
        </label>
        <Actions>
          <CloseButton
            onClick={handleClose}
            disabled={submitting}
            type="button"
          >
            Cancel{` `}
            <ScreenReaderText className="sr-only">this widget</ScreenReaderText>
          </CloseButton>
          <SubmitButton
            type="submit"
            className={submitting && `submitting`}
            disabled={submitting}
          >
            {submitting ? (
              <Fragment>
                Sending, wait <MdRefresh />
              </Fragment>
            ) : (
              <Fragment>
                Send feedback
                <MdSend />
              </Fragment>
            )}
          </SubmitButton>
        </Actions>
      </form>
    </WidgetWrapper>
  )
}
