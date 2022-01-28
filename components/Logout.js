import { ExitToApp } from '@material-ui/icons'
import { useContext } from 'react'
import { AppData } from '../context/AppData'
import { useRouter } from 'next/router'

const Logout = () => {
  const { state, dispatch } = useContext(AppData)
  const router = useRouter()
  const { homeUrl } = state

  function handleClick() {
    fetch(homeUrl + 'api/auth/', {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          dispatch({ type: 'setActiveTab', payload: null })
          dispatch({ type: 'setUserLogedIn', payload: null })
          router.push('/')
        } else if (data.status === 'fail') {
          console.log(data.message)
        }
      })
      .catch((error) => console.log(error))
  }
  return (
    <li onClick={handleClick}>
      <ExitToApp />
      <span>Wyloguj się</span>
    </li>
  )
}

export default Logout
