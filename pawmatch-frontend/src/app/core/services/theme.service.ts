import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';
  
  currentTheme = signal<ThemeMode>('light');

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  loadTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    const theme = saved === 'dark' ? 'dark' : 'light';
    this.currentTheme.set(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    const body = document.body;
    
    // Set data-theme attribute
    html.setAttribute('data-theme', theme);
    
    // Manage body classes
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}