export type Site = {
  id: string;
  title: string;
  studio: string | null;
  url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  styles: string[];
  types: string[];
  subjects: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
};

export const ALL_FILTERS = {
  Style: ["Minimal", "Editorial", "Bold", "Typographic", "Dark", "Light", "Luxury", "Monochrome", "Colorful", "Serif"],
  Type: ["Portfolio", "E-commerce", "Publication", "Agency", "Brand", "Hospitality", "Foundry", "Directory", "Restaurant", "Education"],
  Subject: ["Design", "Food & Drink", "Art", "Photography", "Technology", "Fashion", "Travel", "Typography", "Music", "Illustration", "Stationery", "Science", "Branding", "Home", "Learning"],
} as const;

export function picsum(seed: string, w = 1000, h = 750) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

export function thumbFor(site: Pick<Site, "id" | "thumbnail_url" | "title">) {
  return site.thumbnail_url && site.thumbnail_url.trim() ? site.thumbnail_url : picsum(site.id || site.title);
}
