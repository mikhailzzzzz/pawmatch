import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Pet } from '../../models/pet.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  constructor(private api: ApiService) {}

  // ── Pets ──────────────────────────────────────────────────────────────────
  getPets(): Observable<Pet[]> {
    return this.api.get<Pet[]>('/pets/');
  }

  createPet(petData: Partial<Pet>): Observable<Pet> {
    return this.api.post<Pet>('/pets/', petData);
  }

  updatePet(id: number, petData: Partial<Pet>): Observable<Pet> {
    return this.api.put<Pet>(`/pets/${id}/`, petData);
  }

  deletePet(id: number): Observable<void> {
    return this.api.delete<void>(`/pets/${id}/`);
  }
}
