import React, { useState, useMemo, useContext, useRef, useEffect } from "react"
import { colors, transition, space, radii } from "../utils/presets"
import ChevronSvg from "./sidebar/chevron-svg"

const AccordionContext = React.createContext()

export const Accordion = ({ children }) => {
  const [childState, setChildState] = useState([])
  const lastRegisteredId = useRef(0)
  const accordionContextValue = useMemo(() => {
    return {
      registerChild: ref => {
        ref.current = ++lastRegisteredId.current
        setChildState(previousState => {
          const newState = [...previousState]
          newState[ref.current] = false
          return newState
        })
      },
      getExpandedState: id => !!childState[id],
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

const useAccordionState = () => {
  const accordionContext = useContext(AccordionContext)
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
