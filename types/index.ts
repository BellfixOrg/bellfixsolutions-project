export interface SiteSettings {
  id: string;
  business_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  about_heading: string;
  about_description: string;
  about_image: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  heading: string;
  subheading?: string;
  description: string;
  background_image: string;
  mobile_image_url?: string;
  cta_text: string;
  cta_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  services_count?: number;
  services?: Service[];
  subcategories?: Subcategory[];
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  category?: ServiceCategory;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  services_count?: number;
  districts?: District[];
  services?: Service[];
  created_at?: string;
  updated_at?: string;
}

export interface District {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  display_order: number;
  services_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  category?: ServiceCategory;
  subcategory_id?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
  subcategory?: Subcategory;
  name: string;
  slug: string;
  icon: string;
  short_description: string;
  full_description?: string;
  main_image: string;
  cover_image?: string;
  additional_images?: string[];
  benefits?: string[];
  display_order: number;
  is_active: boolean;
  district_ids?: string[];
  districts?: District[];
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  category_id?: string;
  category_name?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  service_id?: string;
  service_name: string;
  district_id?: string;
  district_name?: string;
  address?: string;
  location: string;
  preferred_date: string;
  message?: string;
  status: BookingStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  role_or_location?: string;
  rating: number;
  review: string;
  avatar_url?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalBookings: number;
  newBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalActiveServices: number;
  totalCategories?: number;
  totalSubcategories?: number;
  totalDistricts?: number;
  recentBookings: Booking[];
}

export interface WhyChooseUsItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export interface WhyChooseUsSection {
  heading: string;
  subheading?: string;
  description?: string;
  image_url: string;
  items: WhyChooseUsItem[];
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  read_time?: string;
  excerpt: string;
  content: string;
  date?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
