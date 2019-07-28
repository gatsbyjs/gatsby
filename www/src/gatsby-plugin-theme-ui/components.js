import GuideList from "../components/guide-list.js"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import DateChart from "../components/chart"
import CodeBlock from "../components/code-block"

export default {
  GuideList,
  HubspotForm,
  DateChart,
  Pullquote,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}
