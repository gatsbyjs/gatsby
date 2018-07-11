import "./slider.css"

export default ( { items, color } ) => (
    <div class="slidingVertical">
        {
            items.map(item => <span css={{ color }}>{item}</span>)
        }
    </div>
)