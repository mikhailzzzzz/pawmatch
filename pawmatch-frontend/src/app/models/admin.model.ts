import { Animal } from './animal.model';
import { User } from './user.model';

export interface AdminPetCreatePayload {
  user_id: number;
  animal_id: number;
  name: string;
  birth_date: string;
  weight: number;
}

export interface AdminMatchCreatePayload {
  user_id: number;
  animal_id: number;
}

export interface AdminAnimalCreatePayload {
  shelter: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  photo_url: string;
  is_vaccinated: boolean;
  is_neutered: boolean;
}

export interface AdminPetItem {
  id: number;
  name: string;
  birth_date: string;
  weight: number;
  user?: User;
  animal?: Animal;
  user_id?: number;
  animal_id?: number;
  user_username?: string;
  animal_name?: string;
}