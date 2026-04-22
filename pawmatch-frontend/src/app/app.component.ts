import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showNav = false;
  currentLang = 'ru';

  constructor(
    private auth: AuthService,
    private router: Router,
    private theme: ThemeService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('ru');
    this.translate.addLangs(['ru', 'en']);
    
    const savedLang = localStorage.getItem('lang') || 'ru';
    this.translate.use(savedLang);
    this.currentLang = savedLang;
    
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang = event.lang;
      document.documentElement.lang = event.lang;
    });
  }

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang;
    this.updateNavigationVisibility(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.updateNavigationVisibility(e.urlAfterRedirects);
      });
  }

  get isDarkTheme(): boolean {
    return this.theme.isDark();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  changeLanguage(lang: string): void {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    this.currentLang = lang;
  }

  private updateNavigationVisibility(url: string): void {
    const hiddenRoutes = ['/login', '/register'];
    this.showNav = !hiddenRoutes.includes(url);
  }
}