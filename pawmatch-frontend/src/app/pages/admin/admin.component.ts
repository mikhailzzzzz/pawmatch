import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AdminPetCreatePayload, AdminMatchCreatePayload, AdminPetItem } from '../../models/admin.model';
import { Animal } from '../../models/animal.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  animals: Animal[] = [];
  matches: any[] = [];
  pets: AdminPetItem[] = [];

  petForm: AdminPetCreatePayload = {
    user_id: 0,
    animal_id: 0,
    name: '',
    birth_date: '',
    weight: 0
  };

  matchForm: AdminMatchCreatePayload = {
    user_id: 0,
    animal_id: 0
  };

  isLoading = false;
  message = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.adminService.getAdminUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.adminService.getAdminAnimals().subscribe({
          next: (animals) => {
            this.animals = animals;
            this.adminService.getAdminMatches().subscribe({
              next: (matches) => {
                this.matches = matches;
                this.adminService.getAdminPets().subscribe({
                  next: (pets) => {
                    this.pets = pets;
                    this.isLoading = false;
                  },
                  error: () => { this.isLoading = false; }
                });
              },
              error: () => { this.isLoading = false; }
            });
          },
          error: () => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  createPet(): void {
    this.adminService.createAdminPet(this.petForm).subscribe({
      next: () => {
        this.message = 'Питомец успешно добавлен!';
        this.petForm = { user_id: 0, animal_id: 0, name: '', birth_date: '', weight: 0 };
        this.loadData();
      },
      error: () => {
        this.message = 'Ошибка при добавлении питомца.';
      }
    });
  }

  createMatch(): void {
    this.adminService.createAdminMatch(this.matchForm).subscribe({
      next: () => {
        this.message = 'Матч успешно создан!';
        this.matchForm = { user_id: 0, animal_id: 0 };
        this.loadData();
      },
      error: () => {
        this.message = 'Ошибка при создании матча.';
      }
    });
  }
}