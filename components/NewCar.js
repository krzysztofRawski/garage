import Modal from '../components/Modal'
import { useState, useContext } from 'react'
import { AppData } from '../context/AppData'
import getData from '../lib/helpers/getData'

const NewCar = ({ closeModal, getCars, models, getModels }) => {
  const { state } = useContext(AppData)
  const { homeUrl } = state
  const [error, setError] = useState(null)

  const [registerNumber, setRegisterNumber] = useState('')
  const [vin, setVin] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [userPhone, setUserPhone] = useState('')

  const [manufacturersList, setManufacturersList] = useState([])
  const [modelsList, setModelsList] = useState([])
  const [usersList, setUsersList] = useState([])

  const distinctManufaturers = new Set()

  models.forEach((item) => {
    distinctManufaturers.add(item.manufacturer)
  })

  const getPhones = async (search) => {
    setError(null)
    if (search) {
      const { data, error } = await getData(homeUrl + 'api/users/', 'GET', { search: search })

      if (error) {
        setError(error.message)
      }

      if (data && data.status === 'success') {
        if (data.result.length === 0) {
          setUsersList([])
        }

        if (data.result.length > 0) {
          const usersList = data.result.reduce((carry, item) => {
            carry.push(item.user_phone)
            return carry
          }, [])
          setUsersList(usersList)
        }
      }

      if (data && data.status === 'fail') {
        setError(data.message)
      }
    }
  }

  const handleForm = async (e) => {
    e.preventDefault()
    setError(null)
    if (!registerNumber || !vin || !manufacturer || !model || !userPhone) {
      setError('Najpierw wypełnij wszystkie pola.')
    } else {
      const { data, error } = await getData(homeUrl + 'api/cars/', 'POST', {
        registerNumber: registerNumber.toUpperCase(),
        vin: vin.toUpperCase(),
        manufacturer: manufacturer.toUpperCase(),
        model: model.toUpperCase(),
        userPhone: userPhone.replace(/\s/g, ''),
      })

      if (error) {
        setError(error.message)
      }

      if (data && data.status === 'success') {
        setRegisterNumber('')
        setVin('')
        setManufacturer('')
        setModel('')
        closeModal()
        getCars('')
        getModels()
      }

      if (data && data.status === 'fail') {
        setError(data.message)
      }
    }
  }

  function handleManufacturersList(e) {
    const searchValue = e.target.value
    if (searchValue) {
      let slearchList = [...distinctManufaturers].filter((manufacturer) => manufacturer.toUpperCase().includes(searchValue.toUpperCase()))
      setManufacturersList(slearchList)
    } else {
      setManufacturersList(null)
    }
    setManufacturer(searchValue)
  }

  function handleModelsList(e) {
    setModel([])
    const searchValue = e.target.value
    if (searchValue) {
      let slearchList = models.reduce((carry, item) => {
        if (item.manufacturer === manufacturer && item.model.includes(searchValue.toUpperCase())) {
          carry.push(item.model)
        }
        return carry
      }, [])
      setModelsList(slearchList)
    } else {
      setModelsList([])
    }
    setModel(searchValue)
  }

  const handleUserPhone = async (e) => {
    const searchValue = e.target.value
    const cleanValue = searchValue.replace(/\s/g, '')
    getPhones(cleanValue)
    if (!cleanValue) {
      setUsersList([])
    }
    setUserPhone(cleanValue)
  }

  return (
    <Modal error={error} closeModal={closeModal}>
      <form onSubmit={handleForm}>
        <h3>Numer rejestracyjny</h3>
        <input type='text' name='registerNumber' onChange={(e) => setRegisterNumber(e.target.value)} autoComplete='off' />
        <h3>VIN</h3>
        <input type='text' name='vin' onChange={(e) => setVin(e.target.value)} autoComplete='off' />
        <h3>Marka</h3>
        <div className='autocomplete'>
          <input type='text' name='manufacturer' onChange={handleManufacturersList} onFocus={() => setModelsList([])} autoComplete='off' value={manufacturer} />
          <div className='list'>
            {manufacturersList &&
              manufacturersList.map((manufacturer, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setManufacturer(manufacturer)
                      setManufacturersList(null)
                    }}
                  >
                    {manufacturer}
                  </div>
                )
              })}
          </div>
        </div>
        <h3>Model</h3>
        <div className='autocomplete'>
          <input type='text' name='model' onChange={handleModelsList} autoComplete='off' value={model} />
          <div className='list'>
            {modelsList &&
              modelsList.map((model, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setModel(model)
                      setModelsList(null)
                    }}
                  >
                    {model}
                  </div>
                )
              })}
          </div>
        </div>
        <h3>Numer telefonu</h3>
        <div className='autocomplete'>
          <input
            type='phone'
            name='userPhone'
            onChange={handleUserPhone}
            autoComplete='off'
            value={userPhone}
            pattern='^[0-9]{3}.?[0-9]{3}.?[0-9]{3}?$'
            title='Numer telefonu w formacie 123 123 123.'
          />
          <div className='list'>
            {usersList &&
              usersList.map((user, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setUserPhone(user)
                      setUsersList(null)
                    }}
                  >
                    {user}
                  </div>
                )
              })}
          </div>
        </div>
        <button>Zapisz</button>
      </form>
    </Modal>
  )
}

export default NewCar
