import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { ModeProvider } from './context/ModeContext';
import { RefreshProvider } from './context/RefreshContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageShell } from './components/layout/PageShell';
import { LandingPage } from './pages/public/LandingPage';
import { CodeEntryPage } from './pages/public/CodeEntryPage';
import { BallotPage } from './pages/public/BallotPage';
import { ReviewPage } from './pages/public/ReviewPage';
import { SuccessPage } from './pages/public/SuccessPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import type { VotingCode, House } from './types';
import { electionService } from "./services/electionService";

type PublicPage = 'landing' | 'code-entry' | 'ballot' | 'review' | 'success';

function AppContent() {
  const { isAdminAuthenticated } = useAuth();
  const [publicPage, setPublicPage] = useState<PublicPage>('landing');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [validatedCode, setValidatedCode] = useState<VotingCode | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [ballotSelections, setBallotSelections] = useState<Record<string, string>>({});
  const [voteId, setVoteId] = useState('');

// Initialize election data
useEffect(() => {
  async function initialize() {
    await electionService.getElection();
    await electionService.getCandidates();
    await electionService.getAllCodes();
  }

  initialize().catch(() => {});
}, []);

const handleCodeValidated = (code: VotingCode, house: House) => {
  setValidatedCode(code);
  setSelectedHouse(house);
  setPublicPage("ballot");
};

  const handleBallotReview = (selections: Record<string, string>) => {
    setBallotSelections(selections);
    setPublicPage('review');
  };

  const handleVoteSuccess = (id: string) => {
    setVoteId(id);
    setPublicPage('success');
  };

  if (showAdminDashboard) {
    return (
      <>
        <AdminDashboardPage onClose={() => setShowAdminDashboard(false)} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <PageShell>
      <AnimatePresence mode="wait">
        {publicPage === 'landing' && (
          <LandingPage
            key="landing"
            onStartVoting={() => setPublicPage('code-entry')}
            onAdminAccess={() => {
              if (isAdminAuthenticated) {
                setShowAdminDashboard(true);
              } else {
                setShowAdminLogin(true);
              }
            }}
          />
        )}
        {publicPage === 'code-entry' && (
          <CodeEntryPage
            key="code-entry"
            onBack={() => {
              setSelectedHouse(null);
              setPublicPage('landing');
            }}
            onCodeValidated={handleCodeValidated}
          />
        )}
        {publicPage === 'ballot' && validatedCode && selectedHouse && (
          <BallotPage
            key="ballot"
            votingCode={validatedCode}
            selectedHouse={selectedHouse}
            onBack={() => setPublicPage('code-entry')}
            onReview={handleBallotReview}
          />
        )}
        {publicPage === 'review' && validatedCode && (
          <ReviewPage
            key="review"
            votingCode={validatedCode}
            selections={ballotSelections}
            onBack={() => setPublicPage('ballot')}
            onSuccess={handleVoteSuccess}
          />
        )}
        {publicPage === 'success' && (
  <SuccessPage
    key="success"
    voteId={voteId}
    onDone={() => {
      setValidatedCode(null);
      setSelectedHouse(null);
      setBallotSelections({});
      setVoteId('');
      setPublicPage('landing');
    }}
  />
)}
      </AnimatePresence>

      {showAdminLogin && (
        <AdminLoginPage
          onClose={() => setShowAdminLogin(false)}
          onAuthenticated={() => {
            setShowAdminLogin(false);
            setShowAdminDashboard(true);
          }}
        />
      )}

      <Toaster richColors position="top-right" />
    </PageShell>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <AuthProvider>
        <RefreshProvider>
          <AppContent />
        </RefreshProvider>
      </AuthProvider>
    </ModeProvider>
  );
}
