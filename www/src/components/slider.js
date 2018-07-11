import "./slider.css"

export default ( { items } ) => (
    <div class="slidingVertical">
        {
            items.map(item => <span>{item}</span>)
        }
    </div>
)