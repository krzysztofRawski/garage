import { createContext, useReducer } from 'react'

export const AppData = createContext()

const initialState = {
  homeUrl: 'http://localhost:3000/',
  activeTab: null,
  userLogedIn: null,
}
const reducer = (state, action) => {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.payload }
    case 'setUserLogedIn':
      return { ...state, userLogedIn: action.payload }
  }
}

const AppDataProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return <AppData.Provider value={{ state, dispatch }}>{props.children}</AppData.Provider>
}

export default AppDataProvider
