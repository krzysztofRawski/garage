import { supabase } from '../utils/supabase'
const jsonwebtoken = require('jsonwebtoken')
const escapeHtml = require('escape-html')

export function validateWithRegex(input, regex) {
  const expression = new RegExp(regex)
  const data = escapeHtml(input.trim().split(' ').join(''))
  const result = expression.test(data)
  if (result) {
    return data
  } else {
    return false
  }
}

export async function checkPhone(phone) {
  let { data, error } = await supabase.from('users').select('user_id').eq('user_phone', phone).eq('user_role', 'admin')

  return { data, error }
}

export async function getOTP(userId) {
  const { data, error } = await supabase.from('otp').select('password, created_at').eq('user_id', userId)

  return { data, error }
}

async function deleteOTP(userId) {
  const { data, error } = await supabase.from('otp').delete().match({ user_id: userId })

  return { data, error }
}

async function saveOTPDB(userId, hash) {
  const { data, error } = await supabase.from('otp').insert([{ user_id: userId, password: hash }])

  return { data, error }
}

export async function saveOTP(userId, hash) {
  let response = {
    data: null,
    error: null,
  }

  // Check if there is a OTP for a user
  const { data, error } = await getOTP(userId)

  if (error) {
    response.error = error
    return response
  }

  if (data) {
    // If there is OTP delete it and make a new one
    if (data.length > 0) {
      const { data, error } = await await deleteOTP(userId)

      if (error) {
        response.error = error
        return response
      }

      if (data) {
        const { data, error } = await saveOTPDB(userId, hash)

        if (error) {
          response.error = error
          return response
        }
        if (data) {
          response.data = 'Hasło zostało zapisane'
        }
      }
    }
    // If there is not one, make one
    if (data.length === 0) {
      const { data, error } = await saveOTPDB(userId, hash)

      if (error) {
        response.error = error
        return response
      }
      if (data) {
        response.data = 'Hasło zostało zapisane'
      }
    }
  }

  return response
}

export function verifyJWT(jwt) {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET
  try {
    const decoded = jsonwebtoken.verify(jwt, secret)
    return decoded
  } catch (error) {
    console.log(error)
    return false
  }
}

export function authorizePage(req, props = {}) {
  let token = req.cookies.token

  if (token) {
    let userLogedIn = verifyJWT(token)
    if (userLogedIn) {
      return {
        props: props,
      }
    } else {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

export function authorizeLogin(req) {
  let token = req.cookies.token

  if (token) {
    let userLogedIn = verifyJWT(token)
    if (userLogedIn) {
      return {
        redirect: {
          destination: '/powiadomienia',
          permanent: false,
        },
      }
    } else {
      return {
        props: {
          logout: true,
        },
      }
    }
  } else {
    return {
      props: {
        logout: true,
      },
    }
  }
}

export function authorizeApi(req, res, callback) {
  let token = req.cookies.token
  if (token) {
    let userLogedIn = verifyJWT(token)
    if (userLogedIn) {
      callback()
    }
  } else {
    res.json({
      status: 'fail',
      message: 'You are not authorized.',
    })
  }
}
