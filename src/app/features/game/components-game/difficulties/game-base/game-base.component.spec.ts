import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBaseComponent } from './game-base.component';

describe('GameBaseComponent', () => {
  let component: GameBaseComponent;
  let fixture: ComponentFixture<GameBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
