/** @jsx jsx */
import { jsx } from "theme-ui"
import {
  useMemo,
  createContext,
  useCallback,
  useState,
  useRef,
  useContext,
} from "react"
import { Notification } from "gatsby-interface"

type NotificationTones = `BRAND` | `SUCCESS` | `DANGER` | `WARNING` | `NEUTRAL`

type NotificationVariants = `PRIMARY` | `SECONDARY` | `SOLID`

interface INotification {
  id: symbol
  content: string
  tone: NotificationTones
  variant: NotificationVariants
}

interface INotificationContext {
  showNotification: (
    content: string,
    options?: {
      tone?: NotificationTones
      variant?: NotificationVariants
      timeout?: number
    }
  ) => void
}

const NotificationContext = createContext<INotificationContext>({
  showNotification: () => null,
})

export const useNotifications = (): INotificationContext =>
  useContext(NotificationContext)

const useNotificationsManager = (): {
  notifications: Array<INotification>
  showNotification: INotificationContext["showNotification"]
  removeNotification: (notificationId: symbol) => void
} => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const timeoutsRef = useRef<Map<symbol, number>>(new Map())

  const removeNotification = useCallback((notificationId: symbol) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(({ id }) => id !== notificationId)
    )

    window.clearTimeout(timeoutsRef.current.get(notificationId))

    timeoutsRef.current.delete(notificationId)
  }, [])

  const showNotification = useCallback(
    (content, { tone = `BRAND`, timeout = 5000, variant = `PRIMARY` } = {}) => {
      const notificationId = Symbol(`notification`)

      setNotifications(prevNotifications => [
        ...prevNotifications,
        { id: notificationId, content, tone, variant },
      ])

      if (timeout > 0) {
        const timeOutId = window.setTimeout(() => {
          removeNotification(notificationId)
        }, timeout)

        timeoutsRef.current.set(notificationId, timeOutId)
      }
    },
    []
  )

  return { notifications, showNotification, removeNotification }
}

export const NotificationsProvider: React.FC<{}> = ({ children }) => {
  const {
    notifications,
    showNotification,
    removeNotification,
  } = useNotificationsManager()

  const contextValue = useMemo(() => {
    return {
      showNotification,
    }
  }, [showNotification])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <div
        sx={{
          display: `flex`,
          alignItems: `center`,
          flexDirection: `column-reverse`,
          position: `fixed`,
          top: `5rem`,
          right: `1rem`,
          maxWidth: `30rem`,
        }}
      >
        {notifications.map(notification => (
          <Notification
            showDismissButton
            onDismissButtonClick={(): void =>
              removeNotification(notification.id)
            }
            content={notification.content}
            tone={notification.tone}
            variant={notification.variant}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
