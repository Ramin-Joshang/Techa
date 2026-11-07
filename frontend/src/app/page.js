import Banner from "../components/landing/Banner";
import CourseBenefits from "../components/landing/CourseBenefits";
import Internship from "../components/landing/Internship";
import LastArticles from "../components/landing/LastArticles";
import Poster from "../components/landing/Poster";
import SampleEditor from "../components/landing/SampleEditors";
import Certificate from "../components/landing/Certificate";
import LastDocumentation from "../components/landing/LastDocumentation";
import Packages from "../components/landing/Packages";
import Roadmap from "../components/landing/Roadmap";
import MarketPreview from "../components/landing/MarketPreview";
import { getHomepage, getPublishedCourses } from "../lib/server";

export async function generateMetadata() {
  try {
    const page = await getHomepage();
    if (page?.seo) {
      return {
        title: page.seo.metaTitle || 'مرجع تخصصی آموزش برنامه‌نویسی وب | تکا',
        description:
          page.seo.metaDescription ||
          'آموزش جامع فرانت‌اند و بک‌اند با استانداردهای مدرن وب به زبان فارسی.',
        keywords: page.seo.metaKeywords || ['آموزش برنامه‌نویسی', 'تکا', 'ری‌اکت', 'نکست جی‌اس'],
        robots: page.seo.robotsNoIndex ? 'noindex, nofollow' : 'index, follow',
      };
    }
  } catch {
    // Graceful fallback when backend or home config is unavailable
  }

  return {
    title: 'تکا | مرجع آموزش برنامه‌نویسی وب',
    description: 'آموزش جامع و پروژه محور برنامه‌نویسی وب فرانت‌اند و بک‌اند به زبان فارسی.',
  };
}

export default async function Home() {
  const [homeConfig, coursesResult] = await Promise.all([
    getHomepage().catch(() => null),
    getPublishedCourses({ limit: 6 }).catch(() => ({
      courses: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1,
    })),
  ]);

  return (
    <div className="overflow-hidden">
      <Banner hero={homeConfig?.heroSection} />
      <Poster />
      <MarketPreview />
      <Roadmap />
      <Packages />
      <LastDocumentation courses={coursesResult?.courses || []} />
      <CourseBenefits features={homeConfig?.features} />
      <Certificate />
      <Internship />
      <SampleEditor />
      <LastArticles />
    </div>
  );
}
