import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DifficultyService {
  private difficultySubject = new BehaviorSubject<string>('easy'); // Kezdeti érték
  difficulty$ = this.difficultySubject.asObservable();

  get difficulty(): string {
    return this.difficultySubject.getValue();
  }

  set difficulty(value: string) {
    this.difficultySubject.next(value);
  }
}
