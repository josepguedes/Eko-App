import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Car {
  id: string;
  model: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  userId: string;
  createdAt: Date;
}

const STORAGE_KEY = 'cars';

export async function saveCar(car: Car): Promise<void> {
  if (!car) {
    throw new Error('Carro inválido');
  }
  try {
    const cars = await getAllCars();
    const index = cars.findIndex(c => c.id === car.id);
    
    if (index >= 0) {
      cars[index] = car;
    } else {
      cars.push(car);
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  } catch (error) {
    throw new Error(`Erro ao guardar carro: ${error}`);
  }
}

export async function getAllCars(): Promise<Car[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((json: any) => ({
      ...json,
      createdAt: new Date(json.createdAt)
    }));
  } catch (error) {
    throw new Error(`Erro ao obter carros: ${error}`);
  }
}

export async function getCarById(id: string): Promise<Car | undefined> {
  if (!id) {
    throw new Error('ID é obrigatório');
  }
  const cars = await getAllCars();
  return cars.find(c => c.id === id);
}

export async function getUserCars(userId: string): Promise<Car[]> {
  if (!userId) {
    throw new Error('ID do utilizador é obrigatório');
  }
  const cars = await getAllCars();
  return cars.filter(c => c.userId === userId);
}

export async function deleteCar(id: string): Promise<void> {
  if (!id) {
    throw new Error('ID é obrigatório');
  }
  try {
    const cars = await getAllCars();
    const filteredCars = cars.filter(c => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCars));
  } catch (error) {
    throw new Error(`Erro ao eliminar carro: ${error}`);
  }
}

export async function updateCar(carId: string, updates: Partial<Omit<Car, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  const cars = await getAllCars();
  const index = cars.findIndex(c => c.id === carId);
  
  if (index === -1) {
    throw new Error('Carro não encontrado');
  }

  const car = cars[index];
  
  // Update fields if provided
  if (updates.model !== undefined) car.model = updates.model;
  if (updates.fuelType !== undefined) car.fuelType = updates.fuelType;
  
  cars[index] = car;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

export async function createCar(
  userId: string,
  model: string,
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
): Promise<Car> {
  if (!userId || !model || !fuelType) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos');
  }

  const cars = await getAllCars();
  
  let newId = 1;
  if (cars.length > 0) {
    const maxId = Math.max(...cars.map(c => {
      const id = parseInt(c.id);
      return isNaN(id) ? 0 : id;
    }));
    newId = maxId + 1;
  }

  const newCar: Car = {
    id: newId.toString(),
    model,
    fuelType,
    userId,
    createdAt: new Date()
  };

  await saveCar(newCar);
  return newCar;
}

