import { useState, useEffect, useContext } from 'react'
import { AppData } from '../../context/AppData'
import { getCarById } from '../../lib/cars'
import { getInspections } from '../../lib/inspections'
import { AddCircle, Delete, Edit } from '@material-ui/icons'
import NewInspection from '../../components/NewInspection'
import { authorizePage } from '../../lib/auth'
import EditRegisterNumber from '../../components/EditRegisterNumber'
import EditUserPhone from '../../components/EditUserPhone'
import getData from '../../lib/helpers/getData'

export async function getServerSideProps({ req, query }) {
  const carId = query.carId

  const props = {
    initialCarData: null,
    initailCarError: null,
    initialInpectionsData: null,
    initialInpectionsError: null,
  }

  const { data: carData, error: carError } = await getCarById(carId)

  if (carError) {
    props.initailCarError = carError.message
  }

  if (carData) {
    props.initialCarData = carData
  }

  const { data: inspectionsData, error: inspectionsError } = await getInspections(carId)

  if (inspectionsError) {
    props.initialInpectionsError = inspectionsError.message
  }

  if (inspectionsData) {
    props.initialInpectionsData = inspectionsData
  }

  const auth = authorizePage(req, props)
  return auth
}

const Car = ({ initialCarData, initailCarError, initialInpectionsData, initialInpectionsError }) => {
  const { state, dispatch } = useContext(AppData)
  const { homeUrl } = state
  const [showModal, setShowModal] = useState(false)
  const [car, setCar] = useState(null)
  const [inspections, setInspections] = useState([])
  const [message, setMessage] = useState(null)
  const [modalType, setModalType] = useState(null)

  useEffect(() => {
    dispatch({ type: 'setActiveTab', payload: 'pojazdy' })
    dispatch({ type: 'setUserLogedIn', payload: true })
    initialCarData && setCar(initialCarData)
    initailCarError && setMessage(initailCarError)
    initialInpectionsData && setInspections(initialInpectionsData)
    initialInpectionsError && setMessage(initialInpectionsError)
    initialInpectionsData.length === 0 && setMessage('Brak badań technicznych do wyświetlenia.')
  }, [])

  const updateRegisterNumber = (registerNumber) => {
    setCar({ ...car, register_number: registerNumber })
  }

  const updateUserPhone = (phoneNumber) => {
    setCar({ ...car, users: { user_phone: phoneNumber } })
  }

  const getInspections = async (carId) => {
    const { data, error } = await getData(homeUrl + '/api/inspections/', 'GET', { carId: carId })
    if (error) {
      setMessage(error.message)
    }

    if (data) {
      if (data.status === 'success') {
        setInspections(data.result)
        if (data.result.length === 0) {
          setMessage('Brak badań technicznych do wyświetlenia.')
        } else {
          setMessage(null)
        }
      }

      if (data.status === 'fail') {
        setMessage(data.message)
      }
    }
  }

  const deleteInspection = async (inspectionId) => {
    let confirmation = confirm(`Czy na pewno chcesz usunąć to badanie?`)

    if (confirmation) {
      const { data, error } = await getData(homeUrl + '/api/inspections/', 'DELETE', { inspectionId: inspectionId })

      if (error) {
        setMessage(error.message)
      }

      if (data) {
        getInspections(car.car_id)
      }
    }
  }

  function closeModal() {
    setShowModal(false)
    setModalType(null)
  }

  return (
    <section className='car'>
      {car && (
        <>
          <div className='editable'>
            <h2>Nr rejestracyjny: {car.register_number} </h2>
            <button
              onClick={() => {
                setShowModal(true)
                setModalType('editRegisterNumber')
              }}
            >
              <Edit />
            </button>
          </div>
          <p>Marka: {car.models.manufacturer}</p>
          <p>Model: {car.models.model}</p>
          <p>VIN: {car.vin}</p>
          <div className='editable'>
            <h2>Telefon: {car.users.user_phone}</h2>{' '}
            <button
              onClick={() => {
                setShowModal(true)
                setModalType('editUserPhone')
              }}
            >
              <Edit />
            </button>
          </div>
          <header>
            <h1>Lista badań technicznych</h1>
            <button
              className='add'
              title='Dodaj badanie techniczne'
              onClick={() => {
                setShowModal(true)
                setModalType('newInspection')
              }}
            >
              <AddCircle />
            </button>
          </header>
          {inspections.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Lp.</th>
                  <th>Data badania</th>
                  <th>Data następnego badania</th>
                  <th>Data powiadomienia</th>
                  <th>Akcja</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((inspection, i) => {
                  return (
                    <tr key={i}>
                      <td>{++i}</td>
                      <td>{inspection.inspection}</td>
                      <td>{inspection.next_inspection}</td>
                      <td>{inspection.notification ? inspection.notification : '-'}</td>
                      <td className='actions'>
                        <button title='Usuń badanie' className='delete' onClick={() => deleteInspection(inspection.inspection_id)}>
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
          {showModal && modalType === 'newInspection' && <NewInspection closeModal={closeModal} carId={car.car_id} getInspections={getInspections} />}
          {showModal && modalType === 'editRegisterNumber' && (
            <EditRegisterNumber closeModal={closeModal} carId={car.car_id} updateRegisterNumber={updateRegisterNumber} />
          )}
          {showModal && modalType === 'editUserPhone' && (
            <EditUserPhone closeModal={closeModal} userId={car.user_id} carId={car.car_id} updateUserPhone={updateUserPhone} />
          )}
        </>
      )}
    </section>
  )
}

export default Car
