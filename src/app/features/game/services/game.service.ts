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

  // addRandomNumberToArrayAndGetArray(): number[] {
  //   const randomNumber = this.getRandomNumberWithoutFive();
  //   this.randomNumbers.push(randomNumber);
  //   return this.randomNumbers;
  // }

}
