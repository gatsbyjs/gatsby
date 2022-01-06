export default interface IIndicatorButtonTooltipProps {
  content?: React.ReactNode | string
  closable?: boolean
  show?: boolean
  overrideShow?: boolean
  testId?: string
  onClose?: () => void
  onAppear?: () => void
  onDisappear?: () => void
}
