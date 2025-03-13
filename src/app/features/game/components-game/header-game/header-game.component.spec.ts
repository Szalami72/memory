import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderGameComponent } from './header-game.component';

describe('HeaderGameComponent', () => {
  let component: HeaderGameComponent;
  let fixture: ComponentFixture<HeaderGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
