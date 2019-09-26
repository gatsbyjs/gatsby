import React, { useState, useMemo, useContext, useRef, useEffect } from "react"
import { colors, transition, space, radii } from "../utils/presets"
import ChevronSvg from "./sidebar/chevron-svg"

const AccordionContext = React.createContext()

/**
 * Makes it so only one child Details component can be open at any given time.
 * Use it to group multiple Details/Summary blocks that are mutually exclusive,
 * like different options for how to do the same thing or the same instructions
 * for different operating systems.
 */
export const Accordion = ({ children }) => {
  const [childState, setChildState] = useState([])
  // A ref is used to keep track of what ids have already been assigned
  // because state update batching means that multiple calls to registerChild
  // might see the same childState
  const lastRegisteredId = useRef(0)
  const accordionContextValue = useMemo(() => {
    return {
      // Called by a child to add itself to the shared state array
      // It gets passed a ref so that the child has a way to store the id
      // it will need to retrieve the state associated with it.
      registerChild: ref => {
        ref.current = ++lastRegisteredId.current
        setChildState(previousState => {
          const newState = [...previousState]
          newState[ref.current] = false
          return newState
        })
      },
      // Called by a child to retrieve its state from context.
      getExpandedState: id => !!childState[id],
      // Called by a child to toggle its open/closed state. Closes all registered
      // children other than the one calling it, thus implementing the desired
      // "accordion" behaviour.
      toggleExpandedState: id =>
        setChildState(previousState =>
          previousState.map((isOpen, index) => {
            if (index === id) {
              return !isOpen
            } else {
              return false
            }
          })
        ),
    }
  }, [childState])

  return (
    <AccordionContext.Provider value={accordionContextValue}>
      {children}
    </AccordionContext.Provider>
  )
}

/**
 * Registers and fetches open/closed state with the AccordionContext.
 * This is extracted into a hook to limit the scope of the slightly convoluted
 * ref handoff process. Before initialization it returns null for both state
 * and callback which means the Details/Summary components fall back to their
 * default browser behaviour if React isn't loaded.
 */
const useAccordionState = () => {
  const accordionContext = useContext(AccordionContext)
  // The id is saved in a ref to avoid unnecessary re-renders. Modifying
  // context will already re-run this hook, we don't need it to run more
  // times than that.
  const id = useRef()
  useEffect(() => {
    if (accordionContext && !id.current) {
      accordionContext.registerChild(id)
    }
  })
  if (accordionContext && id.current) {
    return [
      accordionContext.getExpandedState(id.current),
      e => {
        e.preventDefault()
        accordionContext.toggleExpandedState(id.current)
      },
    ]
  } else {
    return [null, null]
  }
}

const DetailsContext = React.createContext({
  toggle: () => void 0,
})

/**
 * Hides all children except a Summary until it is interacted with. Useful
 * for decluttering a page by hiding optional information.
 */
export const Details = props => {
  const [open, toggle] = useAccordionState()
  const contextValue = useMemo(() => {
    return {
      toggle,
    }
  }, [toggle])
  return (
    <DetailsContext.Provider value={contextValue}>
      <details open={open} {...props} />
    </DetailsContext.Provider>
  )
}

const bulletSize = 8

/**
 * Displays a title for a Details block when rendered as a child of it.
 * Having a heading inside a Summary is both legal and encouraged to give
 * the document structure.
 */
export const Summary = ({ children, ...props }) => {
  const { toggle } = useContext(DetailsContext)
  return (
    <summary
      onClick={toggle}
      css={{
        position: `relative`,
        cursor: `pointer`,
        paddingTop: space[3],
        paddingBottom: space[3],
        paddingLeft: space[6],
        display: `flex`,
        alignItems: `center`,
        justifyContent: `space-between`,
        listStyle: `none`,
        transition: `background ${transition.speed.default} ${transition.curve.default}`,
        "::-webkit-details-marker": {
          display: `none`,
        },
        "details[open] > &": {
          backgroundColor: colors.purple[5],
          marginBottom: space[2],
          "&:before": {
            background: colors.link.color,
            transform: `scale(1)`,
          },
        },
        "& > *": {
          margin: 0,
        },
        "& .anchor": {
          marginLeft: `calc(-20px - ${space[5]})`,
        },
        "&:before": {
          content: `''`,
          left: space[2],
          top: `calc(50% - ${bulletSize / 2}px)`,
          height: bulletSize,
          position: `absolute`,
          transition: `all ${transition.speed.default} ${transition.curve.default}`,
          width: bulletSize,
          background: false,
          borderRadius: radii[6],
          transform: `scale(0.1)`,
        },
        "&&:hover": {
          backgroundColor: colors.purple[10],
          "&:before": {
            background: colors.link.color,
            transform: `scale(1)`,
          },
        },
      }}
      {...props}
    >
      {children}
      <ChevronSvg
        cssProps={{
          marginRight: space[2],
          transition: `transform ${transition.speed.default} ${transition.curve.default}`,
          transform: `rotate(270deg)`,
          "details[open] > summary > &": {
            transform: `rotate(180deg)`,
          },
        }}
      />
    </summary>
  )
}
