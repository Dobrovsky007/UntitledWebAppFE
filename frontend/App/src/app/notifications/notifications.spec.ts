import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationsComponent } from './notifications';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications from API', () => {
    const mockPayload = { sub: 'user-123' };
    const mockToken = 'header.' + btoa(JSON.stringify(mockPayload)) + '.signature';
    localStorage.setItem('token', mockToken);

    fixture.detectChanges();

    const req = httpMock.expectOne((request) => {
      return request.url.includes('/notifications') && request.url.includes('user_id=user-123');
    });

    const mockNotifications = [
      {
        id: '1',
        title: 'New Event',
        message_of_notification: 'You have a new event',
        time: '2026-01-14T10:00:00Z',
        event_id: 'event-1'
      }
    ];

    req.flush(mockNotifications);
    fixture.detectChanges();

    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].title).toBe('New Event');
  });

  it('should handle empty notifications', () => {
    const mockPayload = { sub: 'user-123' };
    const mockToken = 'header.' + btoa(JSON.stringify(mockPayload)) + '.signature';
    localStorage.setItem('token', mockToken);

    fixture.detectChanges();

    const req = httpMock.expectOne((request) => request.url.includes('/notifications'));
    req.flush([]);
    fixture.detectChanges();

    expect(component.notifications.length).toBe(0);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });
});
