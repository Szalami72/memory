import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DifficultyService {
  private _difficulty: string = 'easy';

  set difficulty(value: string) {
    this._difficulty = value;
  }

  get difficulty(): string {
    return this._difficulty;
  }
}
