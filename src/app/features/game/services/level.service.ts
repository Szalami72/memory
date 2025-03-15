import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private levelSubject = new BehaviorSubject<number>(1); // Initialize with level 1
  level$ = this.levelSubject.asObservable();

  setLevel(level: number): void {
    this.levelSubject.next(level);
  }

  getLevel(): number {
    return this.levelSubject.getValue();
  }
}