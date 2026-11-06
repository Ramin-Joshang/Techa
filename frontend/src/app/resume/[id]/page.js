import Sidebar from "../../../components/resume/Sidebar";
import MainContent from "../../../components/resume/MainContent"


export default function Resume() {

  return (
    <div className="flex flex-col md:flex-row pt-24">
      <Sidebar />
      <MainContent />
    </div>
  );
}