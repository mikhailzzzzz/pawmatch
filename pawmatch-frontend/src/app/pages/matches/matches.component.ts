import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Match } from '../../models/match.model';
import { SwipeService } from '../../core/services/swipe.service';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit {
  matches: Match[] = [];
  isLoading = false;
  selectedMatch: Match | null = null;

  constructor(private swipeService: SwipeService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.isLoading = true;
    this.swipeService.getMatches().subscribe({
      next: (data) => {
        this.matches = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onContact(match: Match): void {
    this.selectedMatch = match;
  }

  closeContactModal(): void {
    this.selectedMatch = null;
  }

  getPrimaryPhone(match: Match): string {
    const shelter = match.animal.shelter_detail || match.animal.shelterDetail;
    return shelter?.phone || this.translate.instant('matches.noPhone');
  }

  getSpeciesEmoji(species: string): string {
    return species === 'cat' ? '🐱' : '🐶';
  }

  getTimeAgo(dateStr: string): string {
    const raw = dateStr || '';
    const date = new Date(raw);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (isNaN(diff)) return '';
    if (diff === 0) return this.translate.instant('matches.timeAgo.today');
    if (diff === 1) return this.translate.instant('matches.timeAgo.yesterday');
    return `${diff} ${this.translate.instant('matches.timeAgo.daysAgo')}`;
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }
}
