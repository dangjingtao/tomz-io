import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { AboutPage } from "./pages/AboutPage";
import { BasicPage } from "./pages/BasicPage";
import { BlogsPage } from "./pages/BlogsPage";
import { HomePage } from "./pages/HomePage";
import { ProjectsPage } from "./pages/ProjectsPage";

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="blogs" element={<BlogsPage />} />
        <Route path="thoughts" element={<BasicPage title="共用的床" eyebrow="THOUGHTS" description="还没有定型的想法，以及 Tomz 与 Mira 继续共同思考的地方。" path="/thoughts" />} />
        <Route path="reading" element={<BasicPage title="阅读" eyebrow="READING" description="一起读书、看纪录片，也把没有读懂的地方慢慢谈开。" path="/reading" />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
