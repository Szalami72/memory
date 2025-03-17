import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ScoreService } from '../../services/score.service';
import { RouterOutlet } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';


import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../header/header.component';

interface UserData {
  bestScore: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MenuComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private firestore: AngularFirestore, 
    private scoreService: ScoreService
  ) {}

  ngOnInit(): void {
    this.syncBestScoreWithFirestore();
    console.log('User ID from home:', this.authService.getUserId());

  }

  async syncBestScoreWithFirestore(): Promise<void> {
    const userId = this.authService.getUserId();
    console.log('syncBestScoreWithFirestore called. userId:', userId);
    
    if (!userId || userId === 'guest') {
      console.log('No valid userId or user is guest. Exiting sync.');
      return;
    }
  
    // Egyedi kulcs generálása a localStorage számára
    const localStorageKey = `bestScore_${userId}`;
    
    try {
      // Firestore dokumentum lekérése
      const userDocSnapshot = await firstValueFrom(this.firestore.collection('users').doc(userId).get());
      console.log('Firestore document snapshot:', userDocSnapshot);
  
      const userData = userDocSnapshot.data() as UserData | undefined;
      console.log('UserData from Firestore:', userData);
  
      const firestoreBestScore = userData?.bestScore || 0;
      console.log('Firestore best score:', firestoreBestScore);
  
      const localBestScore = parseInt(localStorage.getItem(localStorageKey) || '0', 10);
      console.log('Local best score for user:', localBestScore);
  
      if (localBestScore > firestoreBestScore) {
        console.log('Local best score is greater than Firestore best score. Updating Firestore...');
        await this.scoreService.saveBestScoreToDatabase(userId, localBestScore);
        console.log('Offline best score synced to Firestore:', localBestScore);
      } else if (firestoreBestScore > localBestScore) {
        console.log('Firestore best score is greater than local best score. Updating localStorage and subject...');
        localStorage.setItem(localStorageKey, firestoreBestScore.toString());
        this.scoreService.bestScoreSubject.next(firestoreBestScore);
        console.log('Local best score updated from Firestore:', firestoreBestScore);
      } else {
        console.log('Best scores are equal:', localBestScore);
      }
    } catch (error) {
      console.error('Error syncing best score with Firestore:', error);
    }
  }
  
}
