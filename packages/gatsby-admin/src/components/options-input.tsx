/* @jsx jsx */
import { jsx } from "strict-ui"

const OptionsInput: React.FC<{}> = () => (
  <form>
    <label>
      Plugin Options:
      <textarea>json goes here</textarea>
    </label>
    <input type="submit" value="Submit" />
  </form>
)

export default OptionsInput
