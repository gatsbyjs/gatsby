import React, { useRef, Fragment } from "react"
import { post } from "axios"
import { Machine, assign } from "xstate"
import { useMachine } from "@xstate/react"

import { ToggleButton, ToggleButtonIcon, ToggleButtonLabel } from "./buttons"
import FeedbackForm from "./feedback-form"
import SubmitSuccess from "./submit-success"
import SubmitError from "./submit-error"
import { ScreenReaderText, WidgetContainer } from "./styled-elements"
import { MdClose, MdForum } from "react-icons/md"

const postFeedback = ({ rating, comment }) => {
  const payload = {
    variables: {
      rating,
      comment,
      url: window.location.href,
    },
    query: `
      mutation submit($rating: Int!, $url: String!, $comment: String) {
        submitFeedback(input: {
          rating: $rating,
          originUrl: $url,
          comment: $comment
        })
      }
    `,
  }

  return post(process.env.GATSBY_FEEDBACK_ENDPOINT, payload)
}

const feedbackMachine = Machine({
  id: `feedback`,
  initial: `closed`,
  context: {
    rating: 2,
    comment: ``,
  },
  states: {
    opened: {
      onEntry: `focusWidgetTitle`,
      on: {
        RATE: {
          // Assign the RATE event value to the rating context
          actions: assign({ rating: (_context, event) => event.value }),
        },
        COMMENT: {
          actions: assign({ comment: (_ctx, e) => e.value }),
        },
        SUBMIT: `submitting`,
      },
    },
    submitting: {
      invoke: {
        id: `postFeedback`,
        src: ctx => postFeedback(ctx),
        onDone: `success`,
        onError: `failed`,
      },
    },
    success: {
      // TODO can we send these events to gatsby-telemetry?
      onEntry: `focusSuccessTitle`,
    },
    failed: {
      // TODO can we send these events to gatsby-telemetry?
      on: {
        OPEN: `opened`,
      },
      onEntry: `focusErrorTitle`,
    },
    closed: {
      on: {
        OPEN: `opened`,
      },
      onEntry: [assign({ comment: ``, rating: 2 })],
    },
  },
  on: {
    CLOSE: {
      target: `closed`,
      actions: `focusOpenButton`,
    },
  },
})

const FeedbackWidget = () => {
  // We’re not going to show this widget if JS is disabled
  if (typeof window === `undefined`) {
    return null
  }

  const widgetTitle = useRef(null)
  const successTitle = useRef(null)
  const errorTitle = useRef(null)
  const toggleButton = useRef(null)
  const [current, send] = useMachine(
    feedbackMachine.withConfig({
      actions: {
        focusWidgetTitle() {
          requestAnimationFrame(() => {
            widgetTitle.current.focus()
          })
        },
        focusSuccessTitle() {
          requestAnimationFrame(() => {
            successTitle.current.focus()
          })
        },
        focusErrorTitle() {
          requestAnimationFrame(() => {
            errorTitle.current.focus()
          })
        },
        focusOpenButton() {
          requestAnimationFrame(() => {
            toggleButton.current.focus()
          })
        },
      },
    })
  )

  const { rating, comment } = current.context

  const handleChange = event => {
    send({
      type: `RATE`,
      value: +event.target.value, // Use + to cast to an integer.
    })
  }

  const handleCommentChange = event => {
    // XXX is this actually safe?
    const safeComment = event.target.value.replace(/(<([^>]+)>)/gi, ``)
    send({
      type: `COMMENT`,
      value: safeComment,
    })
  }

  const handleSubmit = event => {
    event.preventDefault()
    send(`SUBMIT`)
  }

  const handleOpen = () => send(`OPEN`)
  const handleClose = () => send(`CLOSE`)
  const handleToggle = () => send(!current.matches(`closed`) ? `CLOSE` : `OPEN`)

  return (
    <WidgetContainer className={current.value}>
      <ToggleButton
        ref={toggleButton}
        className="feedback-trigger"
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {!current.matches(`closed`) ? (
          <Fragment>
            <ScreenReaderText>Close Rating Widget</ScreenReaderText>
            <ToggleButtonIcon>
              <MdClose />
            </ToggleButtonIcon>
          </Fragment>
        ) : (
          <Fragment>
            <ToggleButtonLabel>Was this doc helpful to you?</ToggleButtonLabel>
            <ToggleButtonIcon>
              <MdForum />
            </ToggleButtonIcon>
          </Fragment>
        )}
      </ToggleButton>
      {(current.matches(`opened`) || current.matches(`submitting`)) && (
        <FeedbackForm
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleCommentChange={handleCommentChange}
          titleRef={widgetTitle}
          rating={rating}
          comment={comment}
          submitting={current.matches(`submitting`)}
        />
      )}
      {current.matches(`failed`) && (
        <SubmitError
          handleClose={handleClose}
          handleOpen={handleOpen}
          titleRef={errorTitle}
        />
      )}
      {current.matches(`success`) && (
        <SubmitSuccess handleClose={handleClose} titleRef={successTitle} />
      )}
    </WidgetContainer>
  )
}

export default FeedbackWidget
