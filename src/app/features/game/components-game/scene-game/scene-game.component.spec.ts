import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneGameComponent } from './scene-game.component';

describe('SceneGameComponent', () => {
  let component: SceneGameComponent;
  let fixture: ComponentFixture<SceneGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceneGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
