import Banner from "../components/landing/Banner";
import CourseBenefits from "../components/landing/CourseBenefits";
import Internship from "../components/landing/Internship";
import LastCourses from "../components/landing/LastCourses";
import LastArticles from "../components/landing/LastArticles";
import Projects from "../components/landing/Projects";
import Poster from "../components/landing/Poster";
import SampleEditor from "../components/landing/SampleEditors";
import Certificate from "../components/landing/Certificate";
import LastDocumentation from "../components/landing/LastDocumentation";
import Packages from "../components/landing/Packages"
import LevelAssessment from "../components/landing/LevelAssessment";
import Pricing from "../components/landing/Pricing";
import Roadmap from "../components/landing/Roadmap";
import MarketPreview from "../components/landing/MarketPreview";
export default function Home() {
  return (
    <div className="overflow-hidden">
      <Banner />
      <Poster />
      <MarketPreview />
      <Roadmap />
      {/* <LevelAssessment /> */}
      {/* <LastCourses /> */}
      <Packages />
      {/* <Roadmap /> */}
      {/* <Pricing /> */}
      <LastDocumentation />
      <CourseBenefits />
      <Certificate />
      <Internship />
      {/* <Projects /> */}
      <SampleEditor />
      <LastArticles />
    </div>
  );
}
