import { supabase } from '../utils/supabase'

export async function getSettings() {
  let response = {
    data: null,
    error: null,
  }
  // const { data, error } = await supabase.from('users').update({ user_phone: userPhone }).eq('user_id', userId)
  let { data, error } = await supabase.from('settings').select('value').eq('name', 'urlop').single()

  if (error) {
    response.error = error
    return response
  }
  if (data) {
    response.data = data.value
  }

  return response
}
export async function setSettings(day, days) {
  const { data, error } = await supabase
    .from('settings')
    .update({ value: { day: day, days: days } })
    .eq('name', 'urlop')

  return { data, error }
}
