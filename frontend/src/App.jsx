import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DeckDetail from './pages/DeckDetail';
import ReviewSession from './pages/ReviewSession';
import QuizSession from './pages/QuizSession';
import McQuizSession from './pages/McQuizSession';
import Billing from './pages/Billing';
import BillingReturn from './pages/BillingReturn';
import Links from './pages/Links';
import StudyTips from './pages/StudyTips';
import ProtectedRoute from './components/ProtectedRoute';
import Goals from './pages/Goals';
import Library from './pages/Library';
import Demo from './pages/Demo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/decks/:deckId" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
        <Route path="/decks/:deckId/review" element={<ProtectedRoute><ReviewSession /></ProtectedRoute>} />
        <Route path="/decks/:deckId/quiz" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />
        <Route path="/decks/:deckId/quiz-mc" element={<ProtectedRoute><McQuizSession /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/billing/return" element={<ProtectedRoute><BillingReturn /></ProtectedRoute>} />
        <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
        <Route path="/study-tips" element={<ProtectedRoute><StudyTips /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/demo" element={<Demo />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}