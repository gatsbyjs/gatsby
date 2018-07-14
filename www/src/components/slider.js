import "./slider.css"

export default ({ items, color }) => (
  <div className="slidingVertical">
    {items.map(item => <span css={{ color }}>{item}</span>)}
  </div>
)
