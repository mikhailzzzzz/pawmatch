import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { StatsService, SwipeStats } from '../../core/services/stats.service';
import { User } from '../../models/user.model';
import { Animal, ShelterSummary } from '../../models/animal.model';
import { AdminPetItem, AdminPetCreatePayload, AdminAnimalCreatePayload } from '../../models/admin.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';

  swipeStats: SwipeStats | null = null;
  statsLoading = false;

  userPets: AdminPetItem[] = [];
  userMatches: any[] = [];

  adminUsers: User[] = [];
  adminAnimals: Animal[] = [];
  adminShelters: ShelterSummary[] = [];
  adminPets: AdminPetItem[] = [];
  adminLoading = false;
  adminError = '';

  petForm: {
    user_id: number | null;
    animal_id: number | null;
    name: string;
    birth_date: string;
    weight: number | null;
  } = {
    user_id: null,
    animal_id: null,
    name: '',
    birth_date: '',
    weight: null
  };

  animalForm: {
    shelter: number | null;
    name: string;
    species: string;
    breed: string;
    age: number;
    photo_url: string;
    is_vaccinated: boolean;
    is_neutered: boolean;
  } = {
    shelter: null,
    name: '',
    species: 'dog',
    breed: '',
    age: 1,
    photo_url: '',
    is_vaccinated: false,
    is_neutered: false
  };

  petSuccess = '';
  petError = '';
  animalSuccess = '';
  animalError = '';
  creatingPet = false;
  creatingAnimal = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.apiService.get<User>('/me/').pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.loadSwipeStats();
        if (this.user?.is_staff) {
          this.loadAdminData();
        }
      },
      error: (err) => {
        this.error = this.extractError(err, 'Не удалось загрузить профиль.');
      }
    });
  }

  loadSwipeStats(): void {
    this.statsLoading = true;
    this.statsService.getSwipeStats().pipe(
      finalize(() => this.statsLoading = false),
      catchError(() => of(null))
    ).subscribe(stats => {
      this.swipeStats = stats;
    });
  }

  loadAdminData(): void {
    this.adminLoading = true;
    this.adminError = '';

    forkJoin({
      users: this.adminService.getAdminUsers().pipe(catchError(() => of([] as User[]))),
      animals: this.adminService.getAdminAnimals().pipe(catchError(() => of([] as Animal[]))),
      shelters: this.adminService.getShelters().pipe(catchError(() => of([] as ShelterSummary[]))),
      pets: this.adminService.getAdminPets().pipe(catchError(() => of([] as AdminPetItem[])))
    }).pipe(
      finalize(() => this.adminLoading = false)
    ).subscribe({
      next: ({ users, animals, shelters, pets }) => {
        this.adminUsers = users;
        this.adminAnimals = animals;
        this.adminShelters = shelters;
        this.adminPets = pets;
        this.applyDefaultSelections();
      },
      error: (err) => {
        this.adminError = this.extractError(err, 'Не удалось загрузить админ-данные.');
      }
    });
  }

  createPet(): void {
    this.petSuccess = '';
    this.petError = '';

    if (!this.petForm.user_id || !this.petForm.animal_id || !this.petForm.name.trim() ||
        !this.petForm.birth_date || !this.petForm.weight || this.petForm.weight <= 0) {
      this.petError = 'Заполните все поля для создания питомца.';
      return;
    }

    const payload: AdminPetCreatePayload = {
      user_id: this.petForm.user_id,
      animal_id: this.petForm.animal_id,
      name: this.petForm.name.trim(),
      birth_date: this.petForm.birth_date,
      weight: Number(this.petForm.weight)
    };

    this.creatingPet = true;

    this.adminService.createAdminPet(payload).pipe(
      finalize(() => this.creatingPet = false)
    ).subscribe({
      next: () => {
        this.petSuccess = 'Питомец успешно добавлен.';
        this.resetPetForm();
        this.loadAdminPets();
      },
      error: (err) => {
        this.petError = this.extractError(err, 'Не удалось создать питомца.');
      }
    });
  }

  createAnimal(): void {
    this.animalSuccess = '';
    this.animalError = '';

    if (!this.animalForm.shelter || !this.animalForm.name.trim() || !this.animalForm.breed.trim()) {
      this.animalError = 'Заполните приют, имя и породу.';
      return;
    }

    const payload: AdminAnimalCreatePayload = {
      shelter: this.animalForm.shelter,
      name: this.animalForm.name.trim(),
      species: this.animalForm.species,
      breed: this.animalForm.breed.trim(),
      age: this.animalForm.age,
      photo_url: this.animalForm.photo_url,
      is_vaccinated: this.animalForm.is_vaccinated,
      is_neutered: this.animalForm.is_neutered
    };

    this.creatingAnimal = true;

    this.adminService.createAnimal(payload).pipe(
      finalize(() => this.creatingAnimal = false)
    ).subscribe({
      next: () => {
        this.animalSuccess = 'Животное успешно добавлено.';
        this.animalForm = { shelter: this.animalForm.shelter, name: '', species: 'dog', breed: '', age: 1, photo_url: '', is_vaccinated: false, is_neutered: false };
        this.adminService.getAdminAnimals().subscribe(a => this.adminAnimals = a);
      },
      error: (err) => {
        this.animalError = this.extractError(err, 'Не удалось добавить животное.');
      }
    });
  }

  loadAdminPets(): void {
    this.adminService.getAdminPets().subscribe({
      next: (pets) => { this.adminPets = pets; },
      error: (err) => { this.petError = this.extractError(err, 'Не удалось обновить питомцев.'); }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getUserLabel(user: User | null | undefined): string {
    if (!user) return 'Неизвестный пользователь';
    if (user.email) return `${user.username} (${user.email})`;
    return `${user.username} (#${user.id})`;
  }

  getAnimalLabel(animal: Animal | any): string {
    if (!animal) return 'Неизвестное животное';
    const type = animal.animalType || animal.animal_type || animal.type || animal.species || '';
    const breed = animal.breed ? ` • ${animal.breed}` : '';
    return `${animal.name || 'Без имени'}${type ? ` • ${type}` : ''}${breed}`;
  }

  getPetUserLabel(pet: AdminPetItem | any): string {
    if (pet?.user) return this.getUserLabel(pet.user);
    const user = this.adminUsers.find((item) => item.id === pet?.user_id);
    return this.getUserLabel(user || null);
  }

  getPetAnimalLabel(pet: AdminPetItem | any): string {
    if (pet?.animal) return this.getAnimalLabel(pet.animal);
    const animal = this.adminAnimals.find((item) => item.id === pet?.animal_id);
    return this.getAnimalLabel(animal);
  }

  private applyDefaultSelections(): void {
    const firstUserId = this.adminUsers[0]?.id ?? null;
    const firstAnimalId = this.adminAnimals[0]?.id ?? null;
    const firstShelterId = this.adminShelters[0]?.id ?? null;

    if (!this.petForm.user_id) this.petForm.user_id = firstUserId;
    if (!this.petForm.animal_id) this.petForm.animal_id = firstAnimalId;
    if (!this.animalForm.shelter) this.animalForm.shelter = firstShelterId;
  }

  private resetPetForm(): void {
    this.petForm = {
      user_id: this.petForm.user_id,
      animal_id: this.petForm.animal_id,
      name: '',
      birth_date: '',
      weight: null
    };
  }

  private extractError(error: any, fallback: string): string {
    const errorData = error?.error;
    if (!errorData) return fallback;
    if (typeof errorData === 'string') return errorData;
    if (typeof errorData.detail === 'string') return errorData.detail;
    const firstKey = Object.keys(errorData)[0];
    if (!firstKey) return fallback;
    const firstValue = errorData[firstKey];
    if (Array.isArray(firstValue) && firstValue.length) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
    return fallback;
  }
}
