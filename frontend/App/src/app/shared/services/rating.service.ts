import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ParticipantRating {
  username: string;
  rating: number;
}

export interface Participant {
  id: string;
  username: string;
  trustScore?: number;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Submit ratings for all participants of an event
   * @param eventId - The UUID of the event
   * @param ratings - Map of username to rating (1-5)
   */
  submitEventRatings(eventId: string, ratings: { [username: string]: number }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ratings/event/${eventId}`,
      ratings,
      { responseType: 'text' }
    );
  }

  /**
   * Get all participants of an event (for rating)
   * @param eventId - The UUID of the event
   */
  getEventParticipants(eventId: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(
      `${this.apiUrl}/event/${eventId}/participants`
    );
  }
}
