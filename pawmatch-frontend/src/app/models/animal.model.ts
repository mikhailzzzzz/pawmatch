export interface ShelterSummary {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  telegram: string;
  instagram: string;
  website: string;
  animalCount: number;
  animal_count: number;
}

export interface Animal {
  id: number;
  shelter: number;
  shelterDetail?: ShelterSummary;
  shelter_detail?: ShelterSummary;
  name: string;
  species: string;
  breed: string;
  age: number;
  photo: string;
  isVaccinated: boolean;
  is_vaccinated: boolean;
  isNeutered: boolean;
  is_neutered: boolean;
  isAdopted: boolean;
  is_adopted: boolean;
  likesCount: number;
  likes_count: number;
}
