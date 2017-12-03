import createHistory from 'history/createMemoryHistory'
import { configureUrlQuery } from 'react-url-query'

const history = createHistory()

configureUrlQuery({ history })

exports.replaceHistory = () => history
