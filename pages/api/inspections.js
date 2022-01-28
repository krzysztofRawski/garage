import { authorizeApi, validateWithRegex } from '../../lib/auth'
import { getInspections, addInspection, deleteInspection } from '../../lib/inspections'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        if (!req.query.carId) {
          res.json({
            status: 'fail',
            message: 'Podaj ID pojazdu.',
          })
        } else {
          const carId = validateWithRegex(req.query.carId, '^[0-9]{1,4}$')
          if (carId) {
            const { data, error } = await getInspections(carId)

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

    case 'POST':
      authorizeApi(req, res, async () => {
        if (req.body.carId && req.body.inspection && req.body.nextInspection) {
          let carId = null
          if (typeof req.body.carId === 'number') {
            carId = req.body.carId
          }
          const inspection = validateWithRegex(req.body.inspection, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
          const nextInspection = validateWithRegex(req.body.nextInspection, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
          if (!carId || !inspection || !nextInspection) {
            res.json({
              status: 'fail',
              message: 'Podane dane zawierają niedozwolone znaki.',
            })
          } else {
            const { data, error } = await addInspection(carId, inspection, nextInspection)

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
            message: 'Podaj ID pojazdu, datę badania i datę następnego badania.',
          })
        }
      })
      break

    case 'DELETE':
      authorizeApi(req, res, async () => {
        if (req.body.inspectionId) {
          let inspectionId = null
          if (typeof req.body.inspectionId === 'number') {
            inspectionId = req.body.inspectionId
          }
          if (inspectionId) {
            const { data, error } = await deleteInspection(inspectionId)

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
              message: 'ID badania technicznego zawiera niedozwolne znaki.',
            })
          }
        } else {
          res.json({
            status: 'fail',
            message: 'Podaj ID badania technicznego.',
          })
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
