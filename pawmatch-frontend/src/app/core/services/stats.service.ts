import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  is_staff: boolean;
  total_pets: number;
  total_matches: number;
  total_swipes: number;
  favorite_species: string | null;
}

export interface SwipeStats {
  user_id: number;
  total_swipes: number;
  likes_count: number;
  dislikes_count: number;
  match_rate: number;
  last_swiped: string | null;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private api: ApiService) {}

  /**
   * Get comprehensive user profile with activity statistics
   */
  getUserProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/user/profile/');
  }

  /**
   * Get detailed swipe statistics for authenticated user
   */
  getSwipeStats(): Observable<SwipeStats> {
    return this.api.get<SwipeStats>('/user/swipe-stats/');
  }
}
