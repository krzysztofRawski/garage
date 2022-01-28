import Modal from '../components/Modal'
import { useState, useContext } from 'react'
import { AppData } from '../context/AppData'
import getData from '../lib/helpers/getData'

const EditUserPhone = ({ closeModal, userId, carId, updateUserPhone }) => {
  const { state } = useContext(AppData)
  const { homeUrl } = state
  const [error, setError] = useState(null)

  const handleForm = async (e) => {
    e.preventDefault()
    setError(null)
    const userPhone = e.target.userPhone.value.toUpperCase()

    if (!userPhone) {
      setError('Uzupełnij wszystkie pola.')
    } else {
      const { data, error } = await getData(homeUrl + 'api/users/', 'PUT', { userId: `${userId}`, carId: `${carId}`, userPhone: userPhone })

      if (error) {
        setError(error.message)
      }

      if (data) {
        if (data.status === 'success') {
          closeModal()
          updateUserPhone(userPhone)
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
        <h3>Wpisz nowy numer telefonu</h3>
        <input type='phone' name='userPhone' autoComplete='off' pattern='^[0-9]{3}.?[0-9]{3}.?[0-9]{3}?$' title='Numer telefonu w formacie 123 123 123.' />
        <button>Zapisz</button>
      </form>
    </Modal>
  )
}

export default EditUserPhone
