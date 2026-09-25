import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GalleryView from './pages/GalleryView';
import JoinQuiz from './pages/JoinQuiz';
import Registration from './pages/Registration';
import StudentDashboard from './pages/StudentDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import QuestionManagement from './pages/QuestionManagement';
import PresentationUpload from './pages/PresentationUpload';
import Results from './pages/Results';
import QuizInterface from './pages/QuizInterface';
import LiveControl from './pages/LiveControl';
import CertificateDashboard from './pages/CertificateDashboard';
import CertificateEditor from './pages/CertificateEditor';
import AdminSettings from './pages/AdminSettings';
import GalleryManager from './pages/GalleryManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/quiz" element={<QuizInterface />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/gallery" element={<GalleryManager />} />
        <Route path="/admin/create-event" element={<CreateEvent />} />
        <Route path="/admin/events/:eventId/questions" element={<QuestionManagement />} />
        <Route path="/admin/events/:eventId/presentation" element={<PresentationUpload />} />
        <Route path="/admin/events/:eventId/results" element={<Results />} />
        <Route path="/admin/events/:eventId/certificates" element={<CertificateDashboard />} />
        <Route path="/admin/events/:eventId/certificate-editor" element={<CertificateEditor />} />
        <Route path="/admin/live/:id" element={<LiveControl />} />
      </Routes>
    </Router>
  );
}

export default App;
