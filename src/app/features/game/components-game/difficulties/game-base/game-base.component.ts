import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef hozzáadva
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { SettingsService } from '../../../services/settings.service';
import { DifficultyService } from '../../../services/difficulty.service';

@Component({
  selector: 'app-game-base',
  standalone: true,
  imports: [CommonModule],
  template: '', // Maradhat üres az absztrakt komponensnél
  styleUrl: './game-base.component.css' // Maradhat üres az absztrakt komponensnél
})
export abstract class GameBaseComponent implements OnInit, OnDestroy {
  countdown: number | string = 3;
  countdownInterval: any;
  isCountingDown: boolean = true;

  correctSequence: number[] = [];
  userSequence: number[] = [];
  clickIndex: number = 0;
  canClick: boolean = false;
  isFailed: boolean = false;
  isNextLevel: boolean = false;
  finalScore: number = 0;
  isNewBestScore: boolean = false;
  isCheckingBestScore: boolean = false;

  isGameRunning = true;

  level: number = 1;
  lastCorrectClickTime: number | null = null;
  MAX_CLICK_TIME_WINDOW: number = 2000; // 2 másodperc

  colorSetting: boolean = true;
  soundSetting: boolean = true;

  difficulty: string = '';

  private gameTimeout: any;
   settingsSubscription: Subscription | null = null;

  // --- MÓDOSÍTÁS: Timeout-ok tárolása ---
  private glowTimeouts: { [key: number]: any } = {};

  @ViewChildren('square') squares!: QueryList<ElementRef>;

  clickQueue: number[] = [];
  isProcessingClick: boolean = false;

  constructor(
    public gameService: GameService,
    public levelService: LevelService,
    public scoreService: ScoreService,
    public musicService: MusicService,
    public settingsService: SettingsService,
    public difficultyService: DifficultyService,
    private cdr: ChangeDetectorRef // ChangeDetectorRef injektálása
  ) { }

  ngOnInit(): void {
    this.settingsSubscription = this.settingsService.userSettings$.subscribe(settings => {
      this.colorSetting = settings.colorsSetting ?? true;
      this.soundSetting = settings.soundSetting ?? true;
      // Itt nem kell a musicService-t külön értesíteni, mert az is fel van iratkozva
    });
    this.difficulty = this.difficultyService.difficulty;
    console.log('Difficulty:', this.difficulty);
    // A MusicService konstruktora már gondoskodik az előtöltésről, ha ott hívod meg
    // this.musicService.preloadSounds();
    this.resetGameState();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    console.log("GameBaseComponent OnDestroy");
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    clearInterval(this.countdownInterval);
    clearTimeout(this.gameTimeout);
    Object.values(this.glowTimeouts).forEach(clearTimeout);
    this.isGameRunning = false;
    // Biztosítsuk, hogy a futó async műveletek is leálljanak ha lehet
  }

  startCountdown(): void {
    this.isCountingDown = true; // Mutassuk a visszaszámlálót
    this.canClick = false;
    this.countdown = 3;
    this.cdr.detectChanges(); // Változás detektálása

    this.countdownInterval = setInterval(() => {
      if (typeof this.countdown === 'number') {
        this.countdown--;
        if (this.countdown < 1) {
          this.countdown = 'Start';
          clearInterval(this.countdownInterval); // Fontos: intervallum törlése
          setTimeout(() => {
            this.isCountingDown = false;
            this.startGame();
            this.cdr.detectChanges(); // Változás detektálása
          }, 1000);
        }
        this.cdr.detectChanges(); // Változás detektálása minden másodpercben
      }
    }, 1000);
  }

  abstract generateCorrectSequence(): void;

  async startGame(): Promise<void> {
    if (!this.isGameRunning) return; // Ne induljon el, ha a komponens már megszűnt

    this.levelService.setLevel(this.level);
    this.isFailed = false;
    this.lastCorrectClickTime = null;
    this.userSequence = [];
    this.clickIndex = 0;
    this.clickQueue = [];
    this.isProcessingClick = false;
    this.canClick = false; // Kattintás letiltása a szekvencia lejátszásáig
    this.cdr.detectChanges(); // Állapotváltozások jelzése

    await this.delay(500); // Kis szünet a Start felirat után

    this.generateCorrectSequence(); // Generálja az új szekvenciát

    await this.highlightSequence(); // Lejátssza a szekvenciát
    if (this.isGameRunning) { // Csak akkor engedélyezd, ha még fut a játék
        this.canClick = true; // Kattintás engedélyezése
        console.log("Kattintás engedélyezve");
        this.cdr.detectChanges(); // Állapotváltozás jelzése
    }
  }

  async highlightSequence(): Promise<void> {
    this.canClick = false; // Biztosan ne lehessen kattintani lejátszás közben
    await this.delay(500); // Kis szünet a lejátszás előtt

    for (const value of this.correctSequence) {
      if (!this.isGameRunning) return; // Kilépés, ha a játék közben leállt

      const index = value - 1;
      const squareElement = this.squares?.toArray()[index]?.nativeElement; // Biztonságosabb elérés
      if (!squareElement) {
          console.warn(`highlightSequence: A(z) ${index} indexű négyzet nem található.`);
          continue; // Ugorj a következőre, ha nincs meg az elem
      }

      this.playSound(value); // Hang lejátszása

      const originalClass = squareElement.className.replace(' glow', ''); // Alap osztályok (glow nélkül)
      const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));

      if (idleClass) {
          const activeClass = idleClass.replace('-idle', '');
          squareElement.className = originalClass.replace(idleClass, activeClass) + ' glow'; // Aktív + glow
          this.cdr.detectChanges(); // Változás detektálása (opcionális, lehet elég a böngésző)
          await this.delay(600); // Villantás időtartama (lehet rövidebb mint 1000)

          if (!this.isGameRunning) return; // Ellenőrzés a várakozás után is

          squareElement.className = originalClass; // Visszaállítás az eredeti (idle) állapotra
          this.cdr.detectChanges(); // Változás detektálása (opcionális)
          await this.delay(300); // Rövid szünet a négyzetek között (lehet rövidebb mint 500)
      } else {
          console.warn(`highlightSequence: Nem található '-idle' osztály a(z) ${index} indexű négyzeten.`);
      }
    }
    console.log("Szekvencia lejátszása befejezve.");
  }

  // --- MÓDOSÍTOTT onSquareClick ---
  onSquareClick(clickedValue: number): void {
    if (!this.canClick || this.isFailed || !this.isGameRunning) {
        console.log(`Kattintás ${clickedValue} blokkolva: canClick=${this.canClick}, isFailed=${this.isFailed}, isGameRunning=${this.isGameRunning}`);
        return;
    }


    const index = clickedValue - 1;
    const squareElement = this.squares?.toArray()[index]?.nativeElement;
    if (!squareElement) {
        console.warn(`onSquareClick: A(z) ${index} indexű négyzet nem található.`);
        return;
    }

    // 1. Hang lejátszása azonnal
    this.playSound(clickedValue);

    // 2. Vizuális effekt kezelése
    const originalClass = squareElement.className.replace(' glow', ''); // Alap osztályok (biztosan glow nélkül)
    const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));

    if (idleClass) {
      // 3. Töröld a korábbi időzítőt ehhez a négyzethez
      if (this.glowTimeouts[index]) {
        clearTimeout(this.glowTimeouts[index]);
      }

      // 4. Állítsd vissza az alap állapotra (rövid időre)
      squareElement.className = originalClass;

      // 5. Használj requestAnimationFrame-t a vizuális elkülönítéshez
      requestAnimationFrame(() => {
        if (!squareElement || !this.isGameRunning) return; // Ellenőrzés a callbacken belül is

        // A 'originalClass' a célállapot a glow előtt
        const idleClassForGlow = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));
        if (idleClassForGlow) {
            const activeClassForGlow = idleClassForGlow.replace('-idle', '');
            // 6. Add hozzá az aktív és glow osztályt
            squareElement.className = originalClass.replace(idleClassForGlow, activeClassForGlow) + ' glow';

            // 7. Időzítsd a glow eltávolítását és tárold el az ID-t
            this.glowTimeouts[index] = setTimeout(() => {
                if (!squareElement || !this.isGameRunning) return;
                // 8. Állítsd vissza az eredeti állapotra
                squareElement.className = originalClass;
                delete this.glowTimeouts[index]; // Töröld a tárolt ID-t
                // Itt nem kell feltétlenül detectChanges, hacsak a stílus nem kötődik Angular property-hez
            }, 300); // Rövidebb glow időtartam (pl. 300ms)
        }
      });
    } else {
        console.warn(`onSquareClick: Nem található '-idle' osztály a(z) ${index} indexű négyzeten.`);
    }

    // 9. Kattintás hozzáadása a várólistához
    this.clickQueue.push(clickedValue);

    // 10. Feldolgozás indítása, ha még nem fut
    if (!this.isProcessingClick) {
      this.processNextClick();
    }
  }

  async processNextClick(): Promise<void> {
    if (this.clickQueue.length === 0 || !this.isGameRunning) {
      this.isProcessingClick = false;
      return;
    }

    this.isProcessingClick = true;
    const clickedValue = this.clickQueue.shift()!;

     if (!this.canClick || this.isFailed) {
        this.isProcessingClick = false;
        this.clickQueue = [];
        return;
     }

    const expectedValue = this.correctSequence[this.clickIndex];

    if (clickedValue === expectedValue) {
      // Helyes kattintás
      this.userSequence.push(clickedValue);
      this.clickIndex++;
      this.updateScore();

      // --- MÓDOSÍTÁS KEZDETE ---
      // Ellenőrizd, hogy a sorozat végére értünk-e
      if (this.userSequence.length === this.correctSequence.length) {
        console.log("Szint teljesítve! Várakozás az utolsó effekt befejezésére...");
        this.canClick = false; // Ne lehessen többet kattintani azonnal

        // Várj a glow effekt időtartamával (és egy kis ráhagyással), mielőtt szintet lépsz
        const glowDuration = 300; // Ennyi a setTimeout a glow eltávolítására az onSquareClick-ben
        const delayBeforeNextLevel = glowDuration + 50; // Kis ráhagyás

        setTimeout(() => {
            // Csak akkor lépj tovább, ha a játék még mindig fut
            if (!this.isGameRunning) {
                console.log("Játék leállt a szintváltás előtt.");
                return;
            }
            this.advanceLevel(); // Következő szintre lépés a várakozás után
        }, delayBeforeNextLevel);

        // Mivel az advanceLevel most már késleltetve hívódik meg,
        // itt be kell fejezni a jelenlegi kattintás feldolgozását.
        this.isProcessingClick = false;
        // Ne hívd meg újra a processNextClick-et, mert a sorozat végére értünk.

      // --- MÓDOSÍTÁS VÉGE ---

      } else {
         // Még nem értünk a sorozat végére, várjuk a következő kattintást
         this.isProcessingClick = false; // Engedélyezzük a következő elem feldolgozását
         // Feldolgozzuk a következőt azonnal, ha van még elem a sorban és fut a játék
         if (this.clickQueue.length > 0 && this.isGameRunning) {
            // Kis késleltetés opcionálisan beiktatható itt is, ha túl gyorsak a kattintások egymáshoz képest
            // await this.delay(50); // pl. 50ms szünet
            this.processNextClick();
         }
      }
    } else {
      // Hibás kattintás
      console.error(`Hibás kattintás! Várunk: ${expectedValue}, Kattintva: ${clickedValue}`);
      const clickedSquare = this.squares?.toArray()[clickedValue - 1]?.nativeElement;
      this.failGame(clickedSquare);
      this.clickQueue = [];
      this.isProcessingClick = false;
    }
    // A sikeres szint végén a feldolgozás a setTimeout után folytatódik az advanceLevel-lel.
    // A többi esetben a rekurzív hívás vagy a felhasználói interakció viszi tovább a logikát.
  }

  updateScore(): void {
    const currentTime = Date.now();
    let scoreIncrement = 100; // Alap pontszám

    // Bónusz pontszám a gyorsaságért
    if (this.lastCorrectClickTime !== null) {
      const elapsedTime = currentTime - this.lastCorrectClickTime;
      if (elapsedTime < this.MAX_CLICK_TIME_WINDOW) {
        // Lineáris vagy exponenciális bónusz - itt lineáris
        const timeBonus = Math.max(0, (this.MAX_CLICK_TIME_WINDOW - elapsedTime) / this.MAX_CLICK_TIME_WINDOW) * 100; // Max +100 pont
        scoreIncrement += Math.round(timeBonus);
      }
    }

    // Nehézségi szorzó (opcionális)
    // switch(this.difficulty) {
    //   case 'easy': scoreIncrement *= 1; break;
    //   case 'medium': scoreIncrement *= 1.5; break;
    //   case 'hard': scoreIncrement *= 2; break;
    // }

    this.scoreService.incrementScore(Math.round(scoreIncrement));
    this.lastCorrectClickTime = currentTime; // Utolsó helyes kattintás idejének mentése
    this.cdr.detectChanges(); // Pontszám UI frissítése
  }

  advanceLevel(): void {
    if (!this.isGameRunning) return; // Ne lépj tovább, ha leállt a játék

    this.isNextLevel = true; // Mutassuk a "Következő szint" üzenetet
    this.canClick = false;   // Kattintás letiltása
    this.level++;
    this.levelService.setLevel(this.level);
    this.cdr.detectChanges(); // UI frissítése

    // Rövid várakozás, majd a következő szint indítása
    setTimeout(() => {
      if (!this.isGameRunning) return; // Ellenőrzés itt is
      this.isNextLevel = false;
      this.startGame(); // Új szint indítása a frissített szintszámmal
      this.cdr.detectChanges(); // UI frissítése
    }, 1500); // Várakozási idő a szintek között
  }

  async failGame(clickedSquare: any): Promise<void> { // Async jelölés hozzáadva
    if (!this.isGameRunning) return; // Ne csinálj semmit, ha már leállt

    console.log("Játék vége - Hiba!");
    this.isFailed = true;
    this.canClick = false;
    const wasGameRunning = this.isGameRunning; // Mentsük el az állapotot
    this.isGameRunning = false; // Állítsd le a játék logikát itt is
    this.finalScore = this.scoreService.getScore();

    // Állapot reset és betöltés jelzése
    this.isNewBestScore = false; // Alaphelyzetbe állítás
    this.isCheckingBestScore = true; // Mutassuk, hogy ellenőrzünk (ha van UI erre)
    this.cdr.detectChanges(); // Frissítsük az UI-t

    // Takarítás: Leállítjuk az időzítőket
    clearInterval(this.countdownInterval);
    clearTimeout(this.gameTimeout);
    Object.values(this.glowTimeouts).forEach(clearTimeout);

    // Hívjuk meg az aszinkron score check-et és várjuk meg az eredményt
    try {
       console.log(`Checking best score with final score: ${this.finalScore}, difficulty: ${this.difficulty}`);
       // await a Promise visszatérési értékére
       this.isNewBestScore = await this.scoreService.checkPreviousBestScore(this.finalScore, this.difficulty);
       console.log(`Best score check complete. isNewBestScore: ${this.isNewBestScore}`);
    } catch (error) {
       console.error("Error during best score check:", error);
       // Hiba esetén feltételezzük, hogy nem új rekord
       this.isNewBestScore = false;
       // Itt lehetne felhasználói visszajelzést adni a hibáról
    } finally {
       // Mindenképp állítsuk vissza a betöltési állapotot és frissítsük a UI-t
       this.isCheckingBestScore = false;
       this.cdr.detectChanges();
    }

    // Adjunk időt a felhasználónak látni a hibát (opcionális)
    if(clickedSquare && wasGameRunning) { // Csak akkor villogtassunk, ha a játék futott még
        clickedSquare.classList.add('fail-glow');
        setTimeout(() => {
            if(clickedSquare) clickedSquare.classList.remove('fail-glow');
            // A finally blokkban lévő detectChanges frissíti az UI-t
        }, 1000);
    }
    // Az UI frissítése már megtörtént a finally blokkban
 }

  resetGameState(): void {
    console.log("Játék állapotának alaphelyzetbe állítása.");
    this.countdown = 3; // Vagy a kezdeti érték
    this.isCountingDown = false; // Ne kezdjen azonnal visszaszámlálni, startNewGame indítja
    this.correctSequence = [];
    this.userSequence = [];
    this.clickIndex = 0;
    this.canClick = false;
    this.isFailed = false;
    this.isNextLevel = false;
    this.level = 1;
    this.lastCorrectClickTime = null;
    this.clickQueue = [];
    this.isProcessingClick = false;
    this.isGameRunning = true; // Új játékra készen áll

    // --- MÓDOSÍTÁS: Glow timeout-ok törlése és tároló ürítése ---
    Object.values(this.glowTimeouts).forEach(clearTimeout);
    this.glowTimeouts = {};

    // UI frissítése az alaphelyzetnek megfelelően
    this.cdr.detectChanges();
  }

  startNewGame(): void {
    console.log("Új játék indítása...");
    this.resetGameState(); // Alaphelyzetbe állítás
    this.levelService.setLevel(this.level); // Szint beállítása (bár resetGameState is megteszi)
    this.scoreService.resetScore(); // Pontszám nullázása
    this.startCountdown(); // Visszaszámlálás indítása
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        // Használj gameTimeout-ot, hogy le tudjuk állítani, ha közben vége a játéknak
        if (!this.isGameRunning) {
            resolve(); // Azonnal térj vissza, ha a játék már nem fut
            return;
        }
        // Töröld az előző timeoutot, ha volt
        clearTimeout(this.gameTimeout);
        this.gameTimeout = setTimeout(() => {
            if (this.isGameRunning) {
                resolve();
            }
            // Ha közben leállt a játék, a promise nem resolve-olódik itt,
            // de a hívó async függvényekben az `if (!this.isGameRunning) return;` ellenőrzések kezelik.
        }, ms);
    });
  }


  playSound(value: number): void {
    // A hang beállítást már a MusicService kezeli
    this.musicService.playSound(value);
  }
}