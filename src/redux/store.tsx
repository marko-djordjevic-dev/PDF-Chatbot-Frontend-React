import { combineReducers, createStore, applyMiddleware } from 'redux'
import AuthReducer from './auth/reducers'
import ChatbotReducer from './chatbot/reducers'
import SettingsReducer from './settings/reducers'
import { thunk } from 'redux-thunk'
const rootReducer = combineReducers<any>({
  AuthReducer,
  ChatbotReducer,
  SettingsReducer,
})

const store = createStore(rootReducer, applyMiddleware(thunk))
export default store
