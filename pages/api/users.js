import { authorizeApi, validateWithRegex } from '../../lib/auth'
import { getUserByPhone, updateUserPhone } from '../../lib/users'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        const search = validateWithRegex(req.query.search, '^[0-9]{0,9}$')

        if (search !== false) {
          const { data, error } = await getUserByPhone(search)

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

    case 'PUT':
      authorizeApi(req, res, async () => {
        if (!req.body.userPhone || !req.body.userId) {
          res.json({
            status: 'fail',
            message: 'Podaj wymagane dane.',
          })
        } else {
          console.log(req.body.userPhone, req.body.userId)
          const userPhone = validateWithRegex(req.body.userPhone, '^\\d{9}$')
          const userId = validateWithRegex(req.body.userId, '^\\d{1,4}$')

          console.log(userPhone, userId)

          if (userPhone && userId) {
            const { data, error } = await updateUserPhone(userId, userPhone)

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
