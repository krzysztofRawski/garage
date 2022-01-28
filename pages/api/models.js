import { authorizeApi } from '../../lib/auth'
import { getModels } from '../../lib/models'

export default function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      authorizeApi(req, res, async () => {
        const { data, error } = await getModels()

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
