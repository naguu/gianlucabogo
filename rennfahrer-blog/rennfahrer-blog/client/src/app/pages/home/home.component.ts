import { Component, OnInit } from '@angular/core';
import { SiteDataService } from '../../core/site-data.service';
import { Post, Profile } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  profile: Profile | null = null;
  posts: Post[] = [];
  loading = true;

  constructor(private siteData: SiteDataService) {}

  ngOnInit(): void {
    this.siteData.getSite().subscribe((data) => {
      this.profile = data.profile;
      this.posts = data.posts;
      this.loading = false;
    });
  }

  formatDate(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('de-CH', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
