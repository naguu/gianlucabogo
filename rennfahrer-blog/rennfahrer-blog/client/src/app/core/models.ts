export interface Contact {
  address: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
}

export interface Partner {
  name: string;
  text: string;
  url: string;
  photo: string;
}

export interface PartnerPitch {
  intro: string;
  benefits: string[];
  individual: string;
}

export interface SponsorTier {
  name: string;
  price: string;
  benefits: string[];
}

export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  photo: string;
  heroPhoto: string;
  achievements: string[];
  contact: Contact;
  partner: Partner;
  partnerPitch: PartnerPitch;
  sponsorTiers: SponsorTier[];
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
