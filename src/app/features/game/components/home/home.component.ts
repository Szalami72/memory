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
  bestScores: Record<string, number>;
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
    this.syncBestScoresWithFirestore();
    console.log('User ID from home:', this.authService.getUserId());
  }

  async syncBestScoresWithFirestore(): Promise<void> {
    const userId = this.authService.getUserId();
    console.log('syncBestScoresWithFirestore called. userId:', userId);
    
    if (!userId || userId === 'guest') {
      console.log('No valid userId or user is guest. Exiting sync.');
      return;
    }
  
    try {
      // Firestore dokumentum lekérése
      const userDocSnapshot = await firstValueFrom(this.firestore.collection('users').doc(userId).get());
      console.log('Firestore document snapshot:', userDocSnapshot);
  
      const userData = userDocSnapshot.data() as UserData | undefined;
      console.log('UserData from Firestore:', userData);
  
      const firestoreBestScores = userData?.bestScores || {};
      console.log('Firestore best scores:', firestoreBestScores);
  
      const difficulties = ['easy', 'hard', 'extreme', 'challenge'];
      
      difficulties.forEach((difficulty) => {
        const localStorageKey = `bestScore_${userId}_${difficulty}`;
        const localBestScore = parseInt(localStorage.getItem(localStorageKey) || '0', 10);
        const firestoreBestScore = firestoreBestScores[difficulty] || 0;
  
        console.log(`Local best score for ${difficulty}:`, localBestScore);
        console.log(`Firestore best score for ${difficulty}:`, firestoreBestScore);
  
        if (localBestScore > firestoreBestScore) {
          console.log(`Local best score for ${difficulty} is greater. Updating Firestore...`);
          this.scoreService.saveBestScoreToDatabase(userId, localBestScore, difficulty);
        } else if (firestoreBestScore > localBestScore) {
          console.log(`Firestore best score for ${difficulty} is greater. Updating localStorage...`);
          localStorage.setItem(localStorageKey, firestoreBestScore.toString());
          this.scoreService.bestScoreSubjects[difficulty].next(firestoreBestScore);
        }
      });
    } catch (error) {
      console.error('Error syncing best scores with Firestore:', error);
    }
  }
}