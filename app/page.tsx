import {
  getBanners,
  getDistricts,
  getNavigationHierarchy,
  getServices,
  getSiteSettings,
  getTestimonials,
  getWhyChooseUsData,
} from '@/lib/db';
import HomeView from '@/components/HomeView';

export const revalidate = 0; // Dynamic data from Supabase

export default async function HomePage() {
  const [settings, banners, categories, districts, services, testimonials, whyChooseUs] = await Promise.all([
    getSiteSettings().catch((err) => {
      console.error('Failed to load site settings:', err);
      return null;
    }),
    getBanners(true).catch((err) => {
      console.error('Failed to load banners:', err);
      return [];
    }),
    getNavigationHierarchy().catch((err) => {
      console.error('Failed to load navigation categories:', err);
      return [];
    }),
    getDistricts(true).catch((err) => {
      console.error('Failed to load districts:', err);
      return [];
    }),
    getServices(true).catch((err) => {
      console.error('Failed to load services:', err);
      return [];
    }),
    getTestimonials(true).catch((err) => {
      console.error('Failed to load testimonials:', err);
      return [];
    }),
    getWhyChooseUsData().catch((err) => {
      console.error('Failed to load why choose us data:', err);
      return null;
    }),
  ]);

  return (
    <HomeView
      settings={settings}
      banners={banners}
      categories={categories}
      districts={districts}
      services={services}
      testimonials={testimonials}
      whyChooseUs={whyChooseUs}
    />
  );
}
