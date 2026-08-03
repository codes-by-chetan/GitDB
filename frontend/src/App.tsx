import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardData {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  githubStatus: string;
  repositoryCount: number;
  selectedRepository: string;
  branch: string;
}

interface RepositoryItem {
  id: string;
  name: string;
  owner: string;
  visibility: string;
  defaultBranch: string;
  cloneStatus: string;
  syncStatus: string;
}

interface LoginFormState {
  username: string;
  password: string;
}

const initialDashboard: DashboardData = {
  authStatus: 'loading',
  githubStatus: 'loading',
  repositoryCount: 0,
  selectedRepository: 'none',
  branch: 'main',
};

function App() {
  const [dashboard, setDashboard] = useState<DashboardData>(initialDashboard);
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [form, setForm] = useState<LoginFormState>({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('gitdb-admin-token')));
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('gitdb-admin-token');

    if (!savedToken) {
      setDashboard({ ...initialDashboard, authStatus: 'unauthenticated' });
      setIsAuthenticated(false);
      return;
    }

    void loadDashboard(savedToken);
  }, []);

  async function loadDashboard(token: string) {
    setDashboard((prev) => ({ ...prev, authStatus: 'loading', githubStatus: 'loading' }));
    setErrorMessage('');
    setIsBusy(true);

    try {
      const [reposResponse, githubResponse, settingsResponse] = await Promise.all([
        axios.get('/api/repos', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/github/status', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setRepositories(reposResponse.data.data.repositories || []);
      setDashboard({
        authStatus: 'authenticated',
        githubStatus: githubResponse.data.data.connected ? 'connected' : 'disconnected',
        repositoryCount: reposResponse.data.data.repositories?.length || 0,
        selectedRepository: settingsResponse.data.data.repository || 'none',
        branch: settingsResponse.data.data.branch || 'main',
      });
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('gitdb-admin-token');
      setDashboard({ ...initialDashboard, authStatus: 'unauthenticated' });
      setIsAuthenticated(false);
      setErrorMessage('Your session expired or is invalid. Please sign in again.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const loginResponse = await axios.post('/api/auth/login', {
        username: form.username,
        password: form.password,
      });

      const token = loginResponse.data.data.token;
      localStorage.setItem('gitdb-admin-token', token);
      await loadDashboard(token);
    } catch {
      setDashboard({ ...initialDashboard, authStatus: 'unauthenticated' });
      setIsAuthenticated(false);
      setErrorMessage('Invalid admin credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConnectGitHub() {
    const token = localStorage.getItem('gitdb-admin-token');
    if (!token) return;

    setIsBusy(true);
    try {
      const response = await axios.get('/api/github/connect', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const redirectUrl = response.data?.data?.redirectUrl;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setErrorMessage('GitHub OAuth did not return a redirect URL.');
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      setErrorMessage(message || 'Unable to start GitHub OAuth right now.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDisconnectGitHub() {
    const token = localStorage.getItem('gitdb-admin-token');
    if (!token) return;

    setIsBusy(true);
    try {
      await axios.post('/api/github/disconnect', {}, { headers: { Authorization: `Bearer ${token}` } });
      await loadDashboard(token);
    } catch {
      setErrorMessage('Unable to disconnect GitHub right now.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateRepository() {
    const token = localStorage.getItem('gitdb-admin-token');
    if (!token) return;

    setIsBusy(true);
    try {
      await axios.post('/api/repos/create', {
        name: `repo-${Date.now()}`,
        description: 'Created from the admin dashboard',
        visibility: 'private',
        initializeReadme: true,
        defaultBranch: 'main',
      }, { headers: { Authorization: `Bearer ${token}` } });
      await loadDashboard(token);
    } catch {
      setErrorMessage('Unable to create the repository right now.');
    } finally {
      setIsBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('gitdb-admin-token');
    setDashboard({ ...initialDashboard, authStatus: 'unauthenticated' });
    setIsAuthenticated(false);
    setForm({ username: '', password: '' });
    setErrorMessage('');
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 32, fontFamily: 'Arial, sans-serif', background: '#07111f', color: '#f5f7fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#111827', padding: 24, borderRadius: 16, boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)' }}>
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>GitDB Admin Login</h1>
          <p style={{ marginTop: 0, marginBottom: 20, color: '#9ca3af' }}>Access to the administration panel requires a valid administrator sign-in.</p>
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <label>
              <div style={{ marginBottom: 6, fontSize: 13, color: '#d1d5db' }}>Username</div>
              <input
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#030712', color: '#f9fafb' }}
                autoComplete="username"
                required
              />
            </label>
            <label>
              <div style={{ marginBottom: 6, fontSize: 13, color: '#d1d5db' }}>Password</div>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#030712', color: '#f9fafb' }}
                autoComplete="current-password"
                required
              />
            </label>
            {errorMessage ? <div style={{ color: '#fca5a5', fontSize: 14 }}>{errorMessage}</div> : null}
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif', background: '#07111f', color: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>GitDB Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>Phase 1 administration experience served from the backend.</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#f9fafb', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {errorMessage ? <div style={{ marginBottom: 16, color: '#fca5a5' }}>{errorMessage}</div> : null}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
          <strong>Authentication Status</strong>
          <p>{dashboard.authStatus}</p>
        </div>
        <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
          <strong>GitHub Status</strong>
          <p>{dashboard.githubStatus}</p>
        </div>
        <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
          <strong>Active Repository</strong>
          <p>{dashboard.selectedRepository}</p>
        </div>
        <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
          <strong>Active Branch</strong>
          <p>{dashboard.branch}</p>
        </div>
        <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
          <strong>Repository Count</strong>
          <p>{dashboard.repositoryCount}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={handleConnectGitHub} disabled={isBusy} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
          {isBusy ? 'Working...' : 'Connect GitHub'}
        </button>
        <button onClick={handleDisconnectGitHub} disabled={isBusy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#f9fafb', cursor: 'pointer' }}>
          Disconnect GitHub
        </button>
        <button onClick={handleCreateRepository} disabled={isBusy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #4b5563', background: 'transparent', color: '#f9fafb', cursor: 'pointer' }}>
          Create Repository
        </button>
      </div>

      <div style={{ background: '#111827', padding: 18, borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Repositories</h2>
        {repositories.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No repositories have been discovered yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {repositories.map((repo) => (
              <div key={repo.id} style={{ border: '1px solid #374151', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{repo.name}</strong>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>{repo.owner} • {repo.visibility} • {repo.defaultBranch}</div>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 13 }}>Clone: {repo.cloneStatus} • Sync: {repo.syncStatus}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
