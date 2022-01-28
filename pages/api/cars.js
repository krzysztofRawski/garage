import { authorizeApi, validateWithRegex } from '../../lib/auth'
import { getCars, addCar, deleteCar, updateRegisterNumber } from '../../lib/cars'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        const search = validateWithRegex(req.query.search, '^[a-zA-Z0-9]{0,17}$')

        if (search !== false) {
          const { data, error } = await getCars(search)

          if (error) {
            res.json({
              status: 'fail',
              message: error.message,
            })
          }

          if (data) {
            res.json({
              status: 'success',
              result: data,
            })
          }
        } else {
          res.json({
            status: 'fail',
            message: 'Wyszukiwanie zawiera niedozwolone znaki.',
          })
        }
      })

      break

    case 'POST':
      authorizeApi(req, res, async () => {
        if (req.body.registerNumber && req.body.vin && req.body.manufacturer && req.body.model && req.body.userPhone) {
          const registerNumber = validateWithRegex(req.body.registerNumber, '^[A-Z0-9]{1,8}$')
          const vin = validateWithRegex(req.body.vin, '^[A-Z0-9]{1,17}$')
          const manufacturer = validateWithRegex(req.body.manufacturer, '^[A-Z0-9]{1,20}$')
          const model = validateWithRegex(req.body.model, '^[A-Z0-9]{1,20}$')
          const userPhone = validateWithRegex(req.body.userPhone, '^\\d{9}$')
          if (!registerNumber || !vin || !manufacturer || !model || !userPhone) {
            res.json({
              status: 'fail',
              message: 'Przekazane dane zawierają niedozwolone znaki.',
            })
          } else {
            const { data, error } = await addCar(registerNumber, vin, manufacturer, model, userPhone)

            if (error) {
              res.json({
                status: 'fail',
                message: error.message,
              })
            }

            if (data) {
              res.json({
                status: 'success',
                result: data,
              })
            }
          }
        } else {
          res.json({
            status: 'fail',
            message: 'Podaj wszystkie wymagane informacje: numer rejestracyjny, VIN, producenta, markę i numer telefonu właściciela.',
          })
        }
      })
      break

    case 'PUT':
      authorizeApi(req, res, async () => {
        if (!req.body.registerNumber || !req.body.carId) {
          res.json({
            status: 'fail',
            message: 'Podaj wymagane dane.',
          })
        } else {
          const registerNumber = validateWithRegex(req.body.registerNumber, '^[A-Z0-9]{1,8}$')
          const carId = validateWithRegex(req.body.carId, '^[0-9]{1,4}$')

          if (registerNumber && carId) {
            const { data, error } = await updateRegisterNumber(carId, registerNumber)

            console.log(data, error)

            if (error) {
              res.json({
                status: 'fail',
                message: error.message,
              })
            }

            if (data) {
              res.json({
                status: 'success',
                result: data,
              })
            }
          } else {
            res.json({
              status: 'fail',
              message: 'Podane dane zawierają niedozwolone znaki.',
            })
          }
        }
      })
      break

    case 'DELETE':
      authorizeApi(req, res, async () => {
        if (!req.body.carId) {
          res.json({
            status: 'fail',
            message: 'Podaj ID pojazdu.',
          })
        } else {
          const carId = validateWithRegex(req.body.carId, '^[0-9]{1,4}$')

          if (carId) {
            const { data, error } = await deleteCar(carId)

            if (error) {
              res.json({
                status: 'fail',
                message: error.message,
              })
            }

            if (data) {
              res.json({
                status: 'success',
                result: data,
              })
            }
          } else {
            res.json({
              status: 'fail',
              message: 'ID pojazdu zawiera niedozwolone znaki.',
            })
          }
        }
      })
      break

    default:
      res.status(405).end()
      break
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}
