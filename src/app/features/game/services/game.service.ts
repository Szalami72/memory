import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // private randomNumbers: number[] = [];

  constructor() { }

  getRandomNumberWithoutFive(): number {
    const possibleNumbers = [1, 2, 3, 4, 6, 7, 8, 9];
    const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
    return possibleNumbers[randomIndex];
  }

  getMultyRandomNumberWithoutFive(numbers: number): number[] {
    const randomNumbers: number[] = [];
    const possibleNumbers = [1, 2, 3, 4, 6, 7, 8, 9];
    for (let i = 0; i < numbers; i++) {
      const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
      randomNumbers.push(possibleNumbers[randomIndex]);
    }
    return randomNumbers;
  }

}
