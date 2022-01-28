import { authorizeApi, validateWithRegex } from '../../lib/auth'
import { getSettings, setSettings } from '../../lib/settings'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        const { data, error } = await getSettings()

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
      })
      break

    case 'PUT':
      authorizeApi(req, res, async () => {
        if (!req.body.day || !req.body.days) {
          res.json({
            status: 'fail',
            message: 'Podaj wymagane dane.',
          })
        } else {
          const day = validateWithRegex(req.body.day, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
          const days = validateWithRegex(req.body.days, '^\\d{1,2}$')

          if (day && days) {
            const { data, error } = await setSettings(day, parseInt(days))

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
