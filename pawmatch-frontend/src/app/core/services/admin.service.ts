import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminMatchCreatePayload, AdminPetCreatePayload, AdminAnimalCreatePayload } from '../../models/admin.model';
import { Animal, ShelterSummary } from '../../models/animal.model';
import { User } from '../../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) {}

  getAdminUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/admin/users/');
  }

  getAdminAnimals(): Observable<Animal[]> {
    return this.apiService.get<Animal[]>('/admin/animals/');
  }

  getAdminPets(): Observable<any[]> {
    return this.apiService.get<any[]>('/admin/pets/');
  }

  createAdminPet(payload: AdminPetCreatePayload): Observable<any> {
    return this.apiService.post<any>('/admin/pets/', payload);
  }

  getAdminMatches(): Observable<any[]> {
    return this.apiService.get<any[]>('/admin/matches/');
  }

  createAdminMatch(payload: AdminMatchCreatePayload): Observable<any> {
    return this.apiService.post<any>('/admin/matches/', payload);
  }

  getShelters(): Observable<ShelterSummary[]> {
    return this.apiService.get<ShelterSummary[]>('/shelters/');
  }

  createAnimal(payload: AdminAnimalCreatePayload): Observable<any> {
    return this.apiService.post<any>('/animals/submit/', payload);
  }
}