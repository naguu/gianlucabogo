import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = false;

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  login(password: string): Observable<{ loggedIn: boolean }> {
    return this.http
      .post<{ loggedIn: boolean }>('/api/login', { password }, { withCredentials: true })
      .pipe(tap((res) => (this.loggedIn = res.loggedIn)));
  }

  logout(): Observable<{ loggedIn: boolean }> {
    return this.http
      .post<{ loggedIn: boolean }>('/api/logout', {}, { withCredentials: true })
      .pipe(tap(() => (this.loggedIn = false)));
  }

  checkSession(): Observable<{ loggedIn: boolean }> {
    return this.http
      .get<{ loggedIn: boolean }>('/api/session', { withCredentials: true })
      .pipe(tap((res) => (this.loggedIn = res.loggedIn)));
  }
}
