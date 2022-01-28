import Modal from '../components/Modal'
import { useState, useContext } from 'react'
import { AppData } from '../context/AppData'
import getData from '../lib/helpers/getData'

const NewInspection = ({ closeModal, carId, getInspections }) => {
  const { state } = useContext(AppData)
  const { homeUrl } = state
  const [error, setError] = useState(null)

  const handleForm = async (e) => {
    e.preventDefault()
    setError(null)
    const inspection = e.target.today.value
    const nextIspection = e.target.nextInspection.value

    if (!inspection || !nextIspection) {
      setError('Uzupełnij wszystkie pola.')
    } else {
      const { data, error } = await getData(homeUrl + 'api/inspections/', 'POST', { carId: carId, inspection: inspection, nextInspection: nextIspection })

      if (error) {
        setError(error.message)
      }

      if (data) {
        if (data.status === 'success') {
          closeModal()
          getInspections(carId)
        }

        if (data.status === 'fail') {
          setError(data.message)
        }
      }
    }
  }

  return (
    <Modal error={error} closeModal={closeModal}>
      <form onSubmit={handleForm}>
        <h3>Data badania</h3>
        <input type='date' name='today' />
        <h3>Data następnego badania</h3>
        <input type='date' name='nextInspection' />
        <button>Zapisz</button>
      </form>
    </Modal>
  )
}

export default NewInspection
