import { authorizeApi } from '../../lib/auth'
import { getNotifications, sendNotifications } from '../../lib/notifications'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        const { data, error } = await getNotifications()

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
        const { data, error } = await getNotifications()
        if (error) {
          res.json({
            status: 'fail',
            message: error.message,
          })
        }

        if (data) {
          const { data: notificationsData, error: notificationsError } = await sendNotifications(data)

          if (notificationsError) {
            res.json({
              status: 'fail',
              message: notificationsError.message,
            })
          }

          if (notificationsData) {
            res.json({
              status: 'success',
              result: notificationsData,
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
