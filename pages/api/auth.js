import { checkPhone, saveOTP, getOTP, validateWithRegex } from '../../lib/auth'
import { sendSms } from '../../utils/smsapi'
import cookie from 'cookie'

const jwt = require('jsonwebtoken')
const generatePassword = require('password-generator')
const bcrypt = require('bcrypt')
const saltRounds = 10

export default async function handler(req, res) {
  const requestMethod = req.method

  switch (requestMethod) {
    case 'GET':
      if (req.query.phone) {
        const phone = validateWithRegex(req.query.phone, '^\\d{9}$')

        if (phone) {
          let userId = null
          let password = null
          let hash = null

          // Check for phone number in the database and generate password for the user
          const { data: phoneData, error: phoneError } = await checkPhone(phone)

          if (phoneError) {
            res.json({
              status: 'fail',
              message: phoneError.message,
            })
          }

          if (phoneData && phoneData.length === 0) {
            res.json({
              status: 'fail',
              message: 'Brak podanego numeru w bazie danych.',
            })
          }

          if (phoneData && phoneData.length > 0) {
            userId = phoneData[0].user_id
            password = generatePassword(6, true)

            try {
              const newHash = await bcrypt.hash(password, saltRounds)
              hash = newHash
            } catch (error) {
              res.json({
                status: 'fail',
                message: error.message,
              })
            }
          }

          // Save hashed password in the database
          const { data: otpData, error: otpError } = await saveOTP(userId, hash)
          if (otpError) {
            res.json({
              status: 'fail',
              message: otpError.message,
            })
          }

          if (otpData) {
            // Send SMS
            const message = `Twoje jednorazowe hasło: ${password}`
            const { data, error } = await sendSms(phone, message)

            if (error) {
              res.json({
                status: 'fail',
                message: error.message,
              })
            }

            if (data) {
              res.json({
                status: 'success',
                userId: userId,
                message: data.message, // TODO: do usunięcia
              })
            }
          }
        } else {
          // Invalid phone number
          res.json({
            status: 'fail',
            message: 'Podany numer telefonu zawiera niedozwolone znaki.',
          })
        }
      } else {
        // No phone number
        res.json({
          status: 'fail',
          message: 'Nie podano numeru telefonu.',
        })
      }
      break

    case 'POST':
      if (req.body.userId && req.body.password) {
        const userId = validateWithRegex(req.body.userId, '^\\d{1,4}$')
        const password = validateWithRegex(req.body.password, '^\\w{6}$')

        if (userId && password) {
          // Get OTP
          const { data: otpData, error: otpError } = await getOTP(userId)

          if (otpError) {
            res.json({
              status: 'fail',
              message: otpError.message,
            })
          }

          if (otpData) {
            const expiration = new Date(otpData[0].created_at).getTime() + 5 * 60000
            const now = new Date().getTime()
            if (expiration >= now) {
              try {
                // Verify passrowd
                const veryfiedPassword = await bcrypt.compare(password, otpData[0].password)
                if (veryfiedPassword) {
                  // If password is correct
                  const secret = process.env.NEXT_PUBLIC_JWT_SECRET
                  const token = jwt.sign({ userId: userId }, secret, {
                    expiresIn: '1 day',
                  })

                  // Set http-only cookie
                  res.setHeader(
                    'Set-Cookie',
                    cookie.serialize('token', token, {
                      httpOnly: true,
                      // secure: true, do zmiany w serwisie produkcyjnym
                      maxAge: 120 * 60 * 60, // w minutach
                      sameSite: 'strict',
                      path: '/',
                    })
                  )

                  // Send positive rosponse
                  res.json({
                    status: 'success',
                    message: 'Użytkownik został zalogowany.',
                  })
                } else {
                  // Incorrect password
                  res.json({
                    status: 'fail',
                    message: 'Nieprawidłowe hasło',
                  })
                }
              } catch (error) {
                // Problem with password verification
                res.json({
                  status: 'fail',
                  message: error.message,
                })
              }
            }

            if (expiration < now) {
              res.json({
                status: 'fail',
                message: 'Hasło wygasło. Podaj ponownie nr telefonu.',
              })
            }
          }
        } else {
          // Atrributes not valid
          res.json({
            status: 'fail',
            message: 'Numer telefonu lub hasło zawiera niedozwolone znaki.',
          })
        }
      } else {
        // No attributes
        res.json({
          status: 'fail',
          message: 'Podaj zarówno numer telefonu jak i hasło.',
        })
      }
      break

    case 'DELETE':
      // Set http-only cookie
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          // secure: true, do zmiany w serwisie produkcyjnym
          expires: new Date(0),
          sameSite: 'strict',
          path: '/',
        })
      )

      // Send positive rersponse
      res.json({
        status: 'success',
        message: 'Użytkownik został wylogowany.',
      })
      break

    default:
      // Wrong request method
      res.status(405).end()
      break
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}
