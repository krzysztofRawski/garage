import Modal from '../components/Modal'
import { useState, useContext } from 'react'
import { AppData } from '../context/AppData'
import getData from '../lib/helpers/getData'

const EditRegisterNumber = ({ closeModal, carId, updateRegisterNumber }) => {
  const { state } = useContext(AppData)
  const { homeUrl } = state
  const [error, setError] = useState(null)

  const handleForm = async (e) => {
    e.preventDefault()
    setError(null)
    const registerNumber = e.target.registerNumber.value.toUpperCase()

    if (!registerNumber) {
      setError('Uzupełnij wszystkie pola.')
    } else {
      const { data, error } = await getData(homeUrl + 'api/cars/', 'PUT', { carId: `${carId}`, registerNumber: registerNumber })

      if (error) {
        setError(error.message)
      }

      if (data) {
        if (data.status === 'success') {
          closeModal()
          updateRegisterNumber(registerNumber)
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
        <h3>Wpisz nowy numer rejestracyjny</h3>
        <input type='text' name='registerNumber' autoComplete='off' />
        <button>Zapisz</button>
      </form>
    </Modal>
  )
}
export default EditRegisterNumber
