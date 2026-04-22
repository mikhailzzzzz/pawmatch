import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AssistantMessage } from '../../models/assistant.model';
import { AssistantService } from '../../core/services/assistant.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  suggestions: string[] = [
    'How to find a suitable pet?',
    'Where to view my matches?',
    'How does the shelters page work?'
  ];

  messages: AssistantMessage[] = [
    {
      role: 'assistant',
      text: 'Hello! I will help you navigate PawMatch. Ask about pets, matches, profile, or shelters.'
    }
  ];

  constructor(
    private assistantService: AssistantService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.initMessages();
    });
    this.initMessages();
  }

  private initMessages(): void {
    const lang = this.translate.currentLang;
    
    if (lang === 'ru') {
      this.suggestions = [
        'Как найти подходящего питомца?',
        'Где посмотреть мои матчи?',
        'Как работает страница приютов?'
      ];
      this.messages = [
        { role: 'assistant', text: 'Привет! Я помогу разобраться в PawMatch. Спросите про питомцев, матчи, профиль или приюты.' }
      ];
    } else {
      this.suggestions = [
        'How to find a suitable pet?',
        'Where to view my matches?', 
        'How does the shelters page work?'
      ];
      this.messages = [
        { role: 'assistant', text: 'Hello! I will help you navigate PawMatch. Ask about pets, matches, profile, or shelters.' }
      ];
    }
  }

  useSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private sendMessage(rawMessage: string): void {
    const message = rawMessage.trim();

    if (!message || this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.messages.push({ role: 'user', text: message });
    this.isLoading = true;

    this.assistantService
      .ask(message)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.messages.push({ role: 'assistant', text: response.reply });
          this.suggestions = response.suggestions ?? [];
        },
        error: () => {
          const lang = this.translate.currentLang;
          this.errorMessage = lang === 'ru' 
            ? 'Не удалось получить ответ. Попробуйте ещё раз через пару секунд.'
            : 'Failed to get answer. Try again in a few seconds.';
        }
      });
  }
}
