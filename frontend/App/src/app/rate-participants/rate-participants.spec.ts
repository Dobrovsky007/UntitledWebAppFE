import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RateParticipantsComponent } from './rate-participants';

describe('RateParticipantsComponent', () => {
  let component: RateParticipantsComponent;
  let fixture: ComponentFixture<RateParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RateParticipantsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RateParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 5 stars', () => {
    expect(component.stars.length).toBe(5);
  });

  it('should set rating when star is clicked', () => {
    const username = 'testUser';
    component.setRating(username, 4);
    expect(component.ratings[username]).toBe(4);
  });

  it('should check if star is filled correctly', () => {
    const username = 'testUser';
    component.ratings[username] = 3;
    
    expect(component.isStarFilled(username, 1)).toBeTruthy();
    expect(component.isStarFilled(username, 3)).toBeTruthy();
    expect(component.isStarFilled(username, 4)).toBeFalsy();
  });

  it('should return correct rating labels', () => {
    expect(component.getRatingLabel(5)).toContain('Excellent');
    expect(component.getRatingLabel(1)).toContain('Unacceptable');
  });
});
