const getData = async (url, method = 'GET', params = {}) => {
  let args = ''
  let options = {
    method: method,
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }

  switch (method) {
    case 'GET':
      if (Object.keys(params).length > 0) {
        const paramsArray = Object.entries(params)
        const argsString = paramsArray.reduce((carry, item, index) => {
          if (index === 0) {
            carry += `?${item[0]}=${item[1]}`
            return carry
          }

          if (index >= 1) {
            carry += `&${item[0]}=${item[1]}`
            return carry
          }
        }, '')
        args = argsString
      }
      break
    default:
      if (Object.keys(params).length > 0) {
        options.body = JSON.stringify(params)
      }
      break
  }

  let response = {
    data: null,
    error: null,
  }

  try {
    const res = await fetch(url + args, options)
    const json = await res.json()
    response.data = json
  } catch (error) {
    response.error = { message: 'Brak połączenia z API, spróbuj później.' }
  }

  return response
}

export default getData
