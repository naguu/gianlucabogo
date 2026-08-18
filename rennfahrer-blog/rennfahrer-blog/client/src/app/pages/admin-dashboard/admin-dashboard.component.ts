import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SiteDataService } from '../../core/site-data.service';
import { Post, Profile } from '../../core/models';

interface TierForm {
  name: string;
  price: string;
  benefitsText: string;
}

function emptyProfile(): Profile {
  return {
    name: '',
    tagline: '',
    bio: '',
    photo: '',
    heroPhoto: '',
    achievements: [],
    contact: { address: '', email: '', phone: '', instagram: '', facebook: '', tiktok: '', youtube: '' },
    partner: { name: '', text: '', url: '', photo: '' },
    partnerPitch: { intro: '', benefits: [], individual: '' },
    sponsorTiers: [],
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  profile: Profile = emptyProfile();
  posts: Post[] = [];
  loading = true;

  profileSaving = false;
  profileMessage = '';

  achievementsText = '';
  achievementsSaving = false;
  achievementsMessage = '';

  contactSaving = false;
  contactMessage = '';

  partnerSaving = false;
  partnerMessage = '';

  partnerBenefitsText = '';
  pitchSaving = false;
  pitchMessage = '';

  tiers: TierForm[] = [];
  tiersSaving = false;
  tiersMessage = '';

  postSaving = false;
  postMessage = '';
  newPost = { title: '', date: this.today(), text: '' };

  editingPost: Post | null = null;
  editForm = { title: '', date: '', text: '' };
  editRemoveImages = new Set<string>();
  editSaving = false;
  editMessage = '';

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
      this.applyProfile(data.profile);
      this.posts = data.posts;
      this.loading = false;
    });
  }

  private applyProfile(profile: Profile): void {
    this.profile = profile;
    this.achievementsText = (profile.achievements || []).join('\n');
    this.partnerBenefitsText = (profile.partnerPitch?.benefits || []).join('\n');
    this.tiers = (profile.sponsorTiers || []).map((t) => ({
      name: t.name,
      price: t.price,
      benefitsText: (t.benefits || []).join('\n'),
    }));
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
        this.applyProfile(res.profile);
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

  saveAchievements(): void {
    const formData = new FormData();
    formData.append('achievements', this.achievementsText);

    this.achievementsSaving = true;
    this.achievementsMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.applyProfile(res.profile);
        this.achievementsSaving = false;
        this.achievementsMessage = 'Werdegang-Highlights gespeichert.';
      },
      error: () => {
        this.achievementsSaving = false;
        this.achievementsMessage = 'Speichern fehlgeschlagen.';
      },
    });
  }

  saveContact(): void {
    const formData = new FormData();
    formData.append('contact', JSON.stringify(this.profile.contact));

    this.contactSaving = true;
    this.contactMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.applyProfile(res.profile);
        this.contactSaving = false;
        this.contactMessage = 'Kontakt gespeichert.';
      },
      error: () => {
        this.contactSaving = false;
        this.contactMessage = 'Speichern fehlgeschlagen.';
      },
    });
  }

  savePartner(partnerPhotoInput: HTMLInputElement): void {
    const formData = new FormData();
    formData.append(
      'partner',
      JSON.stringify({
        name: this.profile.partner.name || '',
        text: this.profile.partner.text || '',
        url: this.profile.partner.url || '',
      })
    );
    if (partnerPhotoInput.files && partnerPhotoInput.files[0]) {
      formData.append('partnerPhoto', partnerPhotoInput.files[0]);
    }

    this.partnerSaving = true;
    this.partnerMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.applyProfile(res.profile);
        this.partnerSaving = false;
        this.partnerMessage = 'Partner gespeichert.';
        partnerPhotoInput.value = '';
      },
      error: () => {
        this.partnerSaving = false;
        this.partnerMessage = 'Partner konnte nicht gespeichert werden.';
      },
    });
  }

  savePartnerPitch(): void {
    const formData = new FormData();
    formData.append(
      'partnerPitch',
      JSON.stringify({
        intro: this.profile.partnerPitch.intro || '',
        individual: this.profile.partnerPitch.individual || '',
        benefits: this.partnerBenefitsText
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean),
      })
    );

    this.pitchSaving = true;
    this.pitchMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.applyProfile(res.profile);
        this.pitchSaving = false;
        this.pitchMessage = 'Partner-werden-Texte gespeichert.';
      },
      error: () => {
        this.pitchSaving = false;
        this.pitchMessage = 'Speichern fehlgeschlagen.';
      },
    });
  }

  addTier(): void {
    this.tiers.push({ name: '', price: '', benefitsText: '' });
  }

  removeTier(index: number): void {
    this.tiers.splice(index, 1);
  }

  saveSponsorTiers(): void {
    const payload = this.tiers
      .filter((t) => t.name.trim())
      .map((t) => ({
        name: t.name.trim(),
        price: t.price.trim(),
        benefits: t.benefitsText
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean),
      }));

    const formData = new FormData();
    formData.append('sponsorTiers', JSON.stringify(payload));

    this.tiersSaving = true;
    this.tiersMessage = '';
    this.siteData.updateProfile(formData).subscribe({
      next: (res) => {
        this.applyProfile(res.profile);
        this.tiersSaving = false;
        this.tiersMessage = 'Sponsoring-Pakete gespeichert.';
      },
      error: () => {
        this.tiersSaving = false;
        this.tiersMessage = 'Speichern fehlgeschlagen.';
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

  startEdit(post: Post): void {
    this.editingPost = post;
    this.editForm = { title: post.title, date: post.date, text: post.text };
    this.editRemoveImages = new Set<string>();
    this.editMessage = '';
  }

  cancelEdit(): void {
    this.editingPost = null;
  }

  toggleRemoveImage(img: string): void {
    if (this.editRemoveImages.has(img)) {
      this.editRemoveImages.delete(img);
    } else {
      this.editRemoveImages.add(img);
    }
  }

  saveEdit(imagesInput: HTMLInputElement): void {
    if (!this.editingPost) return;
    if (!this.editForm.title.trim()) {
      this.editMessage = 'Titel darf nicht leer sein.';
      return;
    }

    const id = this.editingPost.id;
    const formData = new FormData();
    formData.append('title', this.editForm.title);
    formData.append('date', this.editForm.date || this.today());
    formData.append('text', this.editForm.text);
    formData.append('removeImages', JSON.stringify(Array.from(this.editRemoveImages)));
    if (imagesInput.files) {
      Array.from(imagesInput.files).forEach((file) => formData.append('images', file));
    }

    this.editSaving = true;
    this.editMessage = '';
    this.siteData.updatePost(id, formData).subscribe({
      next: (res) => {
        this.posts = this.posts.map((p) => (p.id === id ? res.post : p));
        this.editSaving = false;
        this.editingPost = null;
      },
      error: () => {
        this.editSaving = false;
        this.editMessage = 'Beitrag konnte nicht gespeichert werden.';
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
