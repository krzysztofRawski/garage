import { supabase } from '../utils/supabase'

export async function getModels() {
  const { data, error } = await supabase.from('models').select()
  return { data, error }
}

export async function addModel(manufacturer, model) {
  const { data, error } = await supabase.from('models').insert([{ manufacturer: manufacturer, model: model }])

  return { data, error }
}
