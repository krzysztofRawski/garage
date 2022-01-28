export async function sendSms(to, message) {
  let response = {
    data: null,
    error: null,
  }

  try {
    const res = await fetch('https://api.smsapi.pl/sms.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SMSAPI_TOKEN}`,
      },
      body: JSON.stringify({
        to: to,
        message: message,
        from: 'Test',
        test: 1,
        details: 1,
        encoding: 'utf-8',
        format: 'json',
      }),
    })

    if (!res.ok) {
      throw new Error(res.status)
    }

    const data = await res.json()

    if (data.error) {
      response.error = data
      return response
    }
    response.data = data
  } catch (error) {
    response.error = error
  }

  return response
}
