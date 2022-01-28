import { supabase } from '../utils/supabase'

export async function getUserByPhone(search) {
  let { data, error } = await supabase.from('users').select('user_id, user_phone').or(`user_phone.ilike.%${search}%`).order('user_id', { ascending: false })

  return { data, error }
}

export async function addUser(userPhone) {
  const { data, error } = await supabase.from('users').insert([{ user_phone: userPhone, user_role: 'user' }])

  return { data, error }
}

export async function deleteUser(userId) {
  const { data, error } = await supabase.from('users').delete().eq('user_id', userId)

  return { data, error }
}

export async function updateUserPhone(userId, userPhone) {
  const { data, error } = await supabase.from('users').update({ user_phone: userPhone }).eq('user_id', userId)

  return { data, error }
}

export async function getUserRole(userId) {
  let { data, error } = await supabase.from('users').select('user_role').eq('user_id', userId).single()

  return { data, error }
}
