import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MusicService } from '../../services/music.service';
import { Observable, Subscription } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs/operators';

interface UserScoreData {
  name?: string;
  easy?: number;
  hard?: number;
  extreme?: number;
  challenge?: number;
  uid?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../../shared/styles/menu-windows.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  progress = 0;
  pressTimer: any = null;
  pressStartTime: number = 0;
  holdDuration = 1000;

  user$: Observable<firebase.User | null>;
  allUserScores: UserScoreData[] = [];
  currentUserScores: UserScoreData = {};
  private userSubscription: Subscription | null = null;

  easyScores: UserScoreData[] = [];
  hardScores: UserScoreData[] = [];
  extremeScores: UserScoreData[] = [];
  challengeScores: UserScoreData[] = [];

  currentUserId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private musicService: MusicService,
    private firestore: AngularFirestore
  ) {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.loadCurrentUserScores();
    this.loadAllUserScores();
    this.user$.pipe(take(1)).subscribe(user => {
      this.currentUserId = user?.uid || null;
      console.log('Aktuális felhasználó ID:', this.currentUserId);
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.musicService.stopMusic();
    this.authService.logout();
  }

  backToStartPage(): void {
    this.router.navigate(['/home']);
  }

  startPress(): void {
    this.pressStartTime = Date.now();
    this.progress = 0;
    this.pressTimer = setInterval(() => {
      const elapsed = Date.now() - this.pressStartTime;
      this.progress = Math.min(100, (elapsed / this.holdDuration) * 100);
      if (elapsed >= this.holdDuration) {
        this.logout();
        console.log('Kilépés végrehajtva, navigálás a kezdőoldalra.');
        this.endPress();
      }
    }, 50);
  }

  endPress(): void {
    if (this.pressTimer) {
      clearInterval(this.pressTimer);
      this.pressTimer = null;
    }
    this.progress = 0;
  }

  getAllUsersData(): Observable<firebase.firestore.QuerySnapshot<any>> {
    console.log('getAllUsersData() metódus meghívva.');
    return this.firestore.collection('users').get(); // A teljes dokumentumokat kérjük le
  }

  loadAllUserScores(): void {
    this.getAllUsersData().pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id, // <- uid mentése
          name: data.name || doc.id,
          easy: data['easy'],
          hard: data['hard'],
          extreme: data['extreme'],
          challenge: data['challenge']
        };
      }))
    ).subscribe(scores => {
      this.allUserScores = scores;
  
      this.easyScores = [...scores]
        .filter(user => user.easy! > 0)
        .sort((a, b) => b.easy! - a.easy!);
  
      this.hardScores = [...scores]
        .filter(user => user.hard! > 0)
        .sort((a, b) => b.hard! - a.hard!);
  
      this.extremeScores = [...scores]
        .filter(user => user.extreme! > 0)
        .sort((a, b) => b.extreme! - a.extreme!);
  
      this.challengeScores = [...scores]
        .filter(user => user.challenge! > 0)
        .sort((a, b) => b.challenge! - a.challenge!);
    });
  }

  loadCurrentUserScores(): void {
    this.userSubscription = this.authService.user$.pipe(
      take(1),
      map(user => user?.uid)
    ).subscribe(uid => {
      if (uid) {
        this.firestore.doc<UserScoreData>(`users/${uid}`).valueChanges().pipe(
          map(userData => ({
            name: userData?.name || '',
            easy: userData?.easy,
            hard: userData?.hard,
            extreme: userData?.extreme,
            challenge: userData?.challenge
          }))
        ).subscribe(scores => {
          this.currentUserScores = scores;
          
        });
      }
    });
  }
}