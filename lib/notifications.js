import { sendSms } from '../utils/smsapi'
import { supabase } from '../utils/supabase'
import { getSettings } from './settings'

export async function getNotifications() {
  let response = {
    data: null,
    error: null,
  }

  const today = new Date()
  let maxDay = new Date()
  let maxDate = new Date(maxDay.setDate(today.getDate() + 10)).toISOString()
  let minDate = new Date().toISOString()

  const { data, error } = await getSettings()

  if (error) {
    response.error = error
    return response
  }

  if (data) {
    let date = new Date(data.day)
    let maxUrlopDate = new Date(date.setDate(date.getDate() + data.days)).toISOString()
    if (maxUrlopDate > maxDate) {
      maxDate = maxUrlopDate
    }
  }

  const { data: notificationData, error: notificationError } = await supabase
    .from('notification_data')
    .select()
    .gte('next_inspection', minDate)
    .lte('next_inspection', maxDate)
    .order('next_inspection', { ascending: true })

  if (notificationError) {
    response.error = notificationError
    return response
  }

  if (notificationData) {
    response.data = notificationData
  }

  return response
}

async function registerNotification(inspectionId) {
  const today = new Date()
  const { data, error } = await supabase.from('inspections').update({ notification: today }).eq('inspection_id', inspectionId)

  return { data, error }
}

export async function sendNotifications(notifications) {
  let smsReports = []
  let response = {
    data: null,
    error: null,
  }

  for await (const notification of notifications) {
    const message = `W dniu ${notification.next_inspection} kończy się przegląd techniczny twojego pojazdu: ${notification.register_number}. Zapraszam Krzysztof Mysza`
    const { data, error } = await sendSms(notification.user_phone, message)

    // TODO: do poprawy jak api będzie działało !!!!!!!!!!

    if (!error) {
      response.error = error
      return response
    }

    if (!data) {
      const { data: registerData, error: registerError } = await registerNotification(notification.inspection_id)
      if (registerError) {
        response.error = registerError
        return response
      }
      if (registerData) {
        smsReports.push(data)
      }
    }
  }
  response.data = smsReports
  return response
}
