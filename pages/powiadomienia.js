import { useEffect, useState, useContext } from 'react'
import { authorizePage } from '../lib/auth'
import { AppData } from '../context/AppData'
import { getNotifications } from '../lib/notifications'
import { Sms } from '@material-ui/icons'
import getData from '../lib/helpers/getData'

// SSR
export async function getServerSideProps({ req }) {
  const props = {
    initialNotifications: '',
    initialError: '',
  }

  const { data, error } = await getNotifications()

  if (error) {
    props.initialError = error
  }

  if (data) {
    props.initialNotifications = data
  }

  const auth = authorizePage(req, props)
  return auth
}

// Component
const Powiadomienia = ({ initialNotifications, initialError }) => {
  const { state, dispatch } = useContext(AppData)
  const { homeUrl } = state
  const [notifications, setNotifications] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Initial render
  useEffect(() => {
    dispatch({ type: 'setActiveTab', payload: 'powiadomienia' })
    dispatch({ type: 'setUserLogedIn', payload: true })
    setNotifications(initialNotifications)
    initialNotifications.length === 0 && setMessage('Brak powiadomień do wyświetlenia.')
    initialError && setMessage(initialError)
  }, [])

  const getNotifications = async () => {
    const { data, error } = await getData(homeUrl + 'api/notifications')
    return { data, error }
  }

  const sendNotifications = async () => {
    setLoading(true)
    const { data, error } = await getData(homeUrl + 'api/notifications', 'PUT')
    console.log('wefewrfqe: ', data, error)

    if (error) {
      setError(error.message)
    }

    if (data && data.status === 'success') {
      const { data, error } = await getNotifications()
      console.log('wefewrfqe: ', data, error)

      if (error) {
        setError(error.message)
      }

      if (data) {
        setNotifications(data.result)
        setMessage('Powiadomienia zostały wysłane.')
      }

      if (data || error) {
        setLoading(false)
      }
    }

    if (data && data.status === 'fail') {
      setError(data.message)
    }
  }

  return (
    <section>
      <header>
        <h1>Powiadomienia na dziś:</h1>
        <button className='send' title='Wyślij powiadomienia' onClick={sendNotifications} disabled={!notifications || !notifications.length || loading}>
          <Sms />
        </button>
      </header>
      {notifications && notifications.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Lp.</th>
              <th>Nr rejestracyjny</th>
              <th>Marka</th>
              <th>Model</th>
              <th>Telefon</th>
              <th>Następne badanie</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification, i) => {
              return (
                <tr key={i}>
                  <td>{++i}</td>
                  <td>{notification.register_number}</td>
                  <td>{notification.manufacturer}</td>
                  <td>{notification.model}</td>
                  <td>{notification.user_phone}</td>
                  <td>{notification.next_inspection}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {message && <p>{message}</p>}
      {error && <p className='error'>{error}</p>}
    </section>
  )
}

export default Powiadomienia
