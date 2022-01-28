import { authorizePage } from '../lib/auth'
import { useEffect, useState, useContext } from 'react'
import { AppData } from '../context/AppData'
import { getSettings } from '../lib/settings'
import getData from '../lib/helpers/getData'

// SSR
export async function getServerSideProps({ req }) {
  let props = {
    currentDay: '',
    currentDays: '',
    currentError: null,
  }

  const { data, error } = await getSettings()

  if (error) {
    props.currentError = error.message
  }

  if (data) {
    props.currentDay = data.day
    props.currentDays = data.days
  }

  const auth = authorizePage(req, props)
  return auth
}

// Component
const Ustawienia = ({ currentDay, currentDays, currentError }) => {
  const { state, dispatch } = useContext(AppData)
  const { homeUrl } = state
  const [day, setDay] = useState(currentDay)
  const [days, setDays] = useState(currentDays)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Inital render
  useEffect(() => {
    dispatch({ type: 'setActiveTab', payload: 'ustawienia' })
    dispatch({ type: 'setUserLogedIn', payload: true })
    currentError && setError(currentError)
  }, [])

  const handleForm = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const day = e.target.day.value
    const days = e.target.days.value

    if (!day || !days) {
      setError('Uzupełnij wszystkie pola.')
    } else {
      const { data, error } = await getData(homeUrl + 'api/settings/', 'PUT', { day: day, days: days })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
      if (data && data.status === 'success') {
        const { data, error } = await getData(homeUrl + 'api/settings/')

        if (error) {
          setError(error.message)
          setLoading(false)
        }

        if (data) {
          setDay(data.result.day)
          setDays(data.result.days)
        }

        if (data || error) {
          setLoading(false)
        }
      } else if (data && data.status === 'fail') {
        setError(data.message)
        setLoading(false)
      }
    }
  }

  return (
    <section>
      <header>
        <h1>Ustawienia</h1>
      </header>
      <article>
        <form onSubmit={handleForm}>
          <h3>Początek urlopu</h3>
          <input type='date' name='day' value={day} onChange={(e) => setDay(e.target.value)} />
          <h3>Ilość dni</h3>
          <input type='number' name='days' value={days} onChange={(e) => setDays(e.target.value)} />
          <button disabled={loading}>Zapisz</button>
        </form>
        {error && <p className='error'>{error}</p>}
      </article>
    </section>
  )
}

export default Ustawienia
