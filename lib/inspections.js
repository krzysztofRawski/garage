import { supabase } from '../utils/supabase'

export async function getInspections(carId) {
  let { data, error } = await supabase.from('inspections').select('*').eq('car_id', carId)

  return { data, error }
}

export async function addInspection(carId, inspection, nextInspection) {
  let { data, error } = await supabase.from('inspections').insert([
    {
      car_id: carId,
      inspection: inspection,
      next_inspection: nextInspection,
    },
  ])

  return { data, error }
}

export async function deleteAllInspections(carId) {
  const { data, error } = await supabase.from('inspections').delete().eq('car_id', carId)

  return { data, error }
}

export async function deleteInspection(inspectionId) {
  const { data, error } = await supabase.from('inspections').delete().eq('inspection_id', inspectionId)

  return { data, error }
}
