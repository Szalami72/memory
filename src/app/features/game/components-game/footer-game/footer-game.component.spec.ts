import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterGameComponent } from './footer-game.component';

describe('FooterGameComponent', () => {
  let component: FooterGameComponent;
  let fixture: ComponentFixture<FooterGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
