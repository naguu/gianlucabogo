import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SiteDataService } from '../../core/site-data.service';
import { Post, Profile } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  profile: Profile = { name: '', tagline: '', bio: '', photo: '', heroPhoto: '' };
  posts: Post[] = [];
  loading = true;

  profileSaving = false;
  profileMessage = '';

  postSaving = false;
  postMessage = '';
  newPost = { title: '', date: this.today(), text: '' };

  deletingId: string | number | null = null;

  constructor(
    private auth: AuthService,
    private siteData: SiteDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.siteData.getSite().subscribe((data) => {
      this.profile = data.profile;
      this.posts = data.posts;
      this.loading = false;
    });
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  saveProfile(photoInput: HTMLInputElement, heroInput: HTMLInputElement): void {
    const formData = new FormData();
    formData.append('name', this.profile.name || '');
    formData.append('tagline', this.profile.tagline || '');
    formData.append('bio', this.profile.bio || '');
    if (photoInput.files && photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }
    if (heroInput.files && heroInput.files[0]) {
      formData.append('heroPhoto', heroInput.files[0]);
    }

    this.profileSaving = true;
    this.profileMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.profile = res.profile;
        this.profileSaving = false;
        this.profileMessage = 'Profil gespeichert.';
        photoInput.value = '';
        heroInput.value = '';
      },
      error: () => {
        this.profileSaving = false;
        this.profileMessage = 'Profil konnte nicht gespeichert werden.';
      },
    });
  }

  addPost(imagesInput: HTMLInputElement): void {
    if (!this.newPost.title.trim()) {
      this.postMessage = 'Titel darf nicht leer sein.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newPost.title);
    formData.append('date', this.newPost.date || this.today());
    formData.append('text', this.newPost.text);
    if (imagesInput.files) {
      Array.from(imagesInput.files).forEach((file) => formData.append('images', file));
    }

    this.postSaving = true;
    this.postMessage = '';
    this.siteData.addPost(formData).subscribe({
      next: (res) => {
        this.posts = [res.post, ...this.posts];
        this.postSaving = false;
        this.postMessage = 'Beitrag veröffentlicht.';
        this.newPost = { title: '', date: this.today(), text: '' };
        imagesInput.value = '';
      },
      error: () => {
        this.postSaving = false;
        this.postMessage = 'Beitrag konnte nicht gespeichert werden.';
      },
    });
  }

  deletePost(post: Post): void {
    if (!confirm(`Beitrag "${post.title}" wirklich löschen?`)) return;
    this.deletingId = post.id;
    this.siteData.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
        this.deletingId = null;
      },
      error: () => {
        this.deletingId = null;
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/admin/login'));
  }
}
