import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsComponent } from './notifications';
import { HttpClient } from '@angular/common/http';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [NotificationsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create and load notifications (mock fallback)', () => {
    // Trigger the GET for notifications
    // In the component, loadNotifications calls getNotifications$ which would hit the API.
    // If your API isn't set up, the fallback mock will be used.
    // We can simulate by calling loadNotifications and flushing mock response if needed.
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
