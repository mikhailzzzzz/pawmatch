import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AssistantResponse } from '../../models/assistant.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  constructor(private api: ApiService, private translate: TranslateService) {}

  ask(message: string): Observable<AssistantResponse> {
    const lang = this.translate.currentLang || 'en';
    return this.api.post<AssistantResponse>('/assistant/', { message, lang });
  }
}
