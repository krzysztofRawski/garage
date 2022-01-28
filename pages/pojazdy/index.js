// Import external libs
import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { Delete, AddCircle, Build } from '@material-ui/icons'

// Import components
import NewCar from '../../components/NewCar'

// Import internal lib
import { AppData } from '../../context/AppData'
import { authorizePage } from '../../lib/auth'
import { getModels } from '../../lib/models'
import { getCars } from '../../lib/cars'
import getData from '../../lib/helpers/getData'

// SSR
export async function getServerSideProps({ req }) {
  const props = {
    initalCars: {
      data: null,
      error: null,
    },
    initialModels: {
      data: null,
      error: null,
    },
  }

  // Get cars data
  const { data: carsData, error: carsError } = await getCars('')
  if (carsError) {
    props.initalCars.error = carsError
  }

  if (carsData) {
    props.initalCars.data = carsData
  }

  // Get models data
  const { data: modelsData, error: modelsError } = await getModels()
  if (modelsError) {
    props.initialModels.error = modelsError
  }

  if (modelsData) {
    props.initialModels.data = modelsData
  }

  const auth = authorizePage(req, props)
  return auth
}
// Component
const Pojazdy = ({ initalCars, initialModels }) => {
  const { state, dispatch } = useContext(AppData)

  const { homeUrl } = state
  const [cars, setCars] = useState([])
  const [models, setModels] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Initial render states
  useEffect(() => {
    dispatch({ type: 'setActiveTab', payload: 'pojazdy' })
    dispatch({ type: 'setUserLogedIn', payload: true })
    initalCars.data && setCars(initalCars.data)
    initalCars.error && setMessage(initalCars.error.message)
    initialModels.data && setModels(initialModels.data)
    initialModels.error && setMessage(initialModels.error.message)
    if (initalCars.data && initalCars && initalCars.data.length === 0) {
      setMessage('Brak pojazdów do wyświetlenia')
    }
  }, [])

  // Logic
  const getCars = async (search) => {
    setMessage(null)
    setError(null)
    const { data, error } = await getData(homeUrl + '/api/cars/', 'GET', { search: search })

    if (error) {
      setError(error.message)
    }

    if (data && data.status === 'success') {
      setCars(data.result)
      if (data.result.length === 0) {
        setMessage('Brak pojazdów do wyświetlenia')
      }
    }

    if (data && data.status === 'fail') {
      setError(data.message)
    }
  }

  const getModels = async () => {
    setError(null)
    const { data, error } = await getData(homeUrl + '/api/models/')

    if (error) {
      setError(error.message)
    }

    if (data && data.status === 'success') {
      setModels(data.result)
    }

    if (data && data.status === 'fail') {
      setError(data.message)
    }
  }

  const handleForm = (e) => {
    e.preventDefault()
    const search = e.target.search.value
    getCars(search)
  }

  const handleChange = (e) => {
    e.preventDefault()
    const search = e.target.value
    getCars(search)
  }

  const handleDelete = async (carId, registerNumber) => {
    let confirmation = confirm(`Czy na pewno chcesz usunąć pojazd: ${registerNumber}`)

    if (confirmation) {
      const { data, error } = await getData(homeUrl + '/api/cars/', 'DELETE', { carId: `${carId}` })

      if (error) {
        setError(error.message)
      }

      if (data) {
        getCars('')
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  // Render
  return (
    <section>
      <header>
        <h1>Lista pojazdów</h1>
        <div className='search'>
          <form onSubmit={handleForm} autoComplete='off'>
            <input type='search' name='search' id='search' onChange={handleChange} />
          </form>
          <button className='add' title='Dodaj nowy pojazd' onClick={() => setShowModal(true)}>
            <AddCircle />
          </button>
        </div>
      </header>
      {cars && cars.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Lp.</th>
              <th>Nr rejestracyjny</th>
              <th>VIN</th>
              <th>Marka</th>
              <th>Model</th>
              <th>Telefon</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, i) => {
              return (
                <tr key={i}>
                  <td>{++i}</td>
                  <td>{car.register_number}</td>
                  <td>{car.vin}</td>
                  <td>{car.manufacturer}</td>
                  <td>{car.model}</td>
                  <td>{car.user_phone}</td>
                  <td className='actions'>
                    <Link href={`/pojazdy/${car.car_id}`} passHref>
                      <button title='Edytu dane pojazdu' className='edit'>
                        <Build />
                      </button>
                    </Link>
                    <button title='Usuń pojazd' className='delete' onClick={() => handleDelete(car.car_id, car.register_number)}>
                      <Delete />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {message && <p>{message}</p>}
      {error && <p className='error'>{error}</p>}
      {showModal && <NewCar closeModal={closeModal} getCars={getCars} models={models} getModels={getModels} />}
    </section>
  )
}

export default Pojazdy
