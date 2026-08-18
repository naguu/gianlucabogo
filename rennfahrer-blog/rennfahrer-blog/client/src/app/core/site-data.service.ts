import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, SiteData } from './models';

@Injectable({ providedIn: 'root' })
export class SiteDataService {
  constructor(private http: HttpClient) {}

  getSite(): Observable<SiteData> {
    return this.http.get<SiteData>('/api/site');
  }

  updateProfile(formData: FormData): Observable<{ profile: SiteData['profile'] }> {
    return this.http.put<{ profile: SiteData['profile'] }>('/api/profile', formData, {
      withCredentials: true,
    });
  }

  addPost(formData: FormData): Observable<{ post: Post }> {
    return this.http.post<{ post: Post }>('/api/posts', formData, { withCredentials: true });
  }

  updatePost(id: number | string, formData: FormData): Observable<{ post: Post }> {
    return this.http.put<{ post: Post }>(`/api/posts/${id}`, formData, { withCredentials: true });
  }

  deletePost(id: number | string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/api/posts/${id}`, { withCredentials: true });
  }
}
