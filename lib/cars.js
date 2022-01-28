import { supabase } from '../utils/supabase'
import { addModel, getModels } from './models'
import { getUserByPhone, addUser, deleteUser, getUserRole } from './users'
import { deleteAllInspections } from './inspections'

export async function getCars(search) {
  const { data, error } = await supabase
    .from('car_list')
    .select('car_id, register_number, vin, manufacturer, model, user_phone')
    .or(`register_number.ilike.%${search}%, vin.ilike.%${search}%, user_phone.ilike.%${search}%`)
    .order('car_id', { ascending: false })
    .limit(10)
  return { data, error }
}

export async function getCarById(carId) {
  let { data, error } = await supabase
    .from('cars')
    .select('car_id, register_number, vin, user_id, models(manufacturer, model), users(user_phone)')
    .eq('car_id', carId)
    .single()

  return { data, error }
}

export async function getCar(registerNumber, vin) {
  let { data, error } = await supabase.from('cars').select('*').or(`register_number.eq.${registerNumber},vin.eq.${vin}`)

  return { data, error }
}

export async function addCar(registerNumber, vin, manufacturer, model, userPhone) {
  let response = {
    data: null,
    error: null,
  }

  let userId = null
  let modelId = null

  // Check if user exists and add one if not
  const { data: userData, error: userError } = await getUserByPhone(userPhone)

  if (userError) {
    response.error = userError
    return response
  }

  if (userData) {
    if (userData.length === 0) {
      const { data, error } = await addUser(userPhone)

      if (error) {
        response.error = error
        return response
      }

      if (data) {
        userId = data[0].user_id
      }
    }

    if (userData.length > 0) {
      userId = userData[0].user_id
    }
  }

  // Check if model exists and add one if not
  const { data: modelsData, error: modelsError } = await getModels()

  if (modelsError) {
    response.error = modelsError
    return response
  }

  if (modelsData && modelsData.length > 0) {
    const existingModel = modelsData.reduce((carry, item) => {
      if (item.manufacturer === manufacturer && item.model === model) {
        carry.id = item.id
      }
      return carry
    }, {})

    modelId = existingModel.id

    if (!existingModel.id) {
      const { data, error } = await addModel(manufacturer, model)

      if (error) {
        response.error = error
        return response
      }

      if (data) {
        modelId = data[0].id
      }
    }
  }

  // Check if car exists and add one if not
  const { data: carData, error: carError } = await getCar(registerNumber, vin)

  if (carError) {
    response.error = carError
    return response
  }

  if (carData) {
    if (carData.length === 0) {
      const { data, error } = await supabase.from('cars').insert([
        {
          register_number: registerNumber,
          vin: vin,
          model_id: modelId,
          user_id: userId,
        },
      ])

      if (error) {
        response.error = error
        return response
      }
      if (data) {
        response.data = data[0].car_id
      }
    }

    if (carData.length > 0) {
      response.error = {
        message: 'Pojazd jest już zarejestrowany w bazie danych',
      }
      return response
    }

    return response
  }
}

export async function countCars(userId) {
  const { data, error, count } = await supabase.from('cars').select('car_id', { count: 'exact' }).eq('user_id', userId)

  return { data, error, count }
}

export async function deleteCar(carId) {
  let response = {
    data: null,
    error: null,
  }

  let userId = null
  let carCount = null
  let userRole = null

  // Delete all inspections
  const { error: deleteError } = await deleteAllInspections(carId)

  if (deleteError) {
    response.error = deleteError
    return response
  }

  // Get user ID
  const { data: carData, error: carError } = await getCarById(carId)

  if (carError) {
    response.error = carError
    return response
  }

  if (carData) {
    userId = carData.user_id
  }

  // Count cars appended to user
  const { count: countData, error: countError } = await countCars(userId)

  if (countError) {
    response.error = countError
    return response
  }

  if (countData) {
    console.log(countData)
    carCount = countData
  }

  // Get user role
  const { data: userRoleData, error: userRoleError } = await getUserRole(userId)

  if (userRoleError) {
    response.error = userRoleError
    return response
  }

  if (userRoleData) {
    userRole = userRoleData.user_role
  }

  const { data: deleteCarData, error: deleteCarError } = await supabase.from('cars').delete().eq('car_id', carId)

  if (deleteCarError) {
    response.error = deleteCarError
    return response
  }

  if (deleteCarData) {
    if (userRole === 'user' && carCount === 1) {
      const { error } = await deleteUser(userId)

      if (error) {
        response.error = error
        return response
      }

      if (!error) {
        response.data = `Pojazd ID: ${carId} został usunięty`
        return response
      }
    }

    if (userRole === 'admin' || carCount > 1) {
      response.data = `Pojazd ID: ${carId} został usunięty`
      return response
    }
  }
}

export async function updateRegisterNumber(carId, registerNumber) {
  let response = {
    data: null,
    error: null,
  }

  const { data, error } = await getCars(registerNumber)

  if (error) {
    response.error = error
    return response
  }

  if (data) {
    if (data.length === 0) {
      const { data, error } = await supabase.from('cars').update({ register_number: registerNumber }).eq('car_id', carId)
      return { data, error }
    }

    if (data.length >= 1) {
      response.error = { message: 'W bazie danych jest już pojazd o podanym nr rejestracyjnym.' }
      return response
    }
  }
}
