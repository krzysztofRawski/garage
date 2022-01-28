import { useRouter } from 'next/router'
import { useState, useEffect, useContext } from 'react'
import { authorizeLogin } from '../lib/auth'
import { AppData } from '../context/AppData'
import getData from '../lib/helpers/getData'

// SSR
export async function getServerSideProps({ req }) {
  const auth = authorizeLogin(req)
  return auth
}

// Component
export default function Home({ logout }) {
  const router = useRouter()
  const { state, dispatch } = useContext(AppData)
  const { homeUrl } = state
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)

  // Initial render
  useEffect(() => {
    if (logout) {
      dispatch({ type: 'setActiveTab', payload: null })
      dispatch({ type: 'setUserLogedIn', payload: null })
    }
  }, [])

  const handlePhone = async (e) => {
    e.preventDefault()
    setError(null)

    let phone = e.target.telefon.value.trim().split(' ').join('')
    const regex = new RegExp('^\\d{9}$')

    if (regex.test(phone)) {
      const { data, error } = await getData(homeUrl + 'api/auth/', 'GET', { phone: phone })

      if (error) {
        setError(error.message)
      }

      if (data && data.status === 'success') {
        console.log(data.message) //TODO: do usunięcia
        setUserId(data.userId)
      }

      if (data && data.status === 'fail') {
        console.log(data)
        setError(data.message)
      }
    } else {
      setError('Podaj prawidłowy nr telefonu.')
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setError(null)

    let password = e.target.password.value.trim()
    const regex = new RegExp('^\\w{6}$')

    if (regex.test(password)) {
      const { data, error } = await getData(homeUrl + 'api/auth/', 'POST', { userId: `${userId}`, password: password })

      if (error) {
        setError(error.message)
      }

      if (data && data.status === 'success') {
        router.push('/')
      }

      if (data && data.status === 'fail') {
        setError(data.message)
        setUserId(null)
      }
    } else {
      setError('Wpisz poprawne hasło.')
    }
  }

  return (
    <section className='login-form'>
      <h1>Logowanie</h1>
      {!userId && (
        <form onSubmit={handlePhone}>
          <p>Podaj swój numer telefonu w formacie: 123 123 132.</p>
          <input type='text' name='telefon' id='telefon' maxLength='11' autoComplete='off' />
          <br />
          <button>Dalej</button>
        </form>
      )}
      {userId && (
        <form onSubmit={handlePassword}>
          <p>Wpisz hasło przesłane przez nas SMSem.</p>
          <input type='password' name='password' id='password' maxLength='6' />
          <br />
          <button>Dalej</button>
        </form>
      )}
      {error && <p className='error'>{error}</p>}
    </section>
  )
}
