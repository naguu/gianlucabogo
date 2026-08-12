export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  photo: string;
  heroPhoto: string;
}

export interface Post {
  id: number | string;
  title: string;
  date: string;
  text: string;
  images: string[];
}

export interface SiteData {
  profile: Profile;
  posts: Post[];
}
