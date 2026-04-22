import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { PetService } from '../../core/services/pet.service';

@Component({
  selector: 'app-pet-detail',
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.css']
})
export class PetDetailComponent implements OnInit {
  pet: Pet | null = null;
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPetData(id);
  }

  private loadPetData(id: number): void {
    this.isLoading = true;
    this.error = '';
    this.petService.getPets().subscribe({
      next: (pets) => {
        this.pet = pets.find(p => p.id === id) ?? null;
        this.isLoading = false;
        if (!this.pet) {
          this.error = 'Pet not found';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load pet';
      }
    });
  }

  deletePet(): void {
    if (!this.pet) return;
    if (!confirm(`Are you sure you want to delete ${this.pet.name}?`)) return;

    this.petService.deletePet(this.pet.id).subscribe({
      next: () => {
        this.router.navigate(['/pets']);
      },
      error: () => {
        this.error = 'Failed to delete pet';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pets']);
  }
}
