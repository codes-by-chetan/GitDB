import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github.routes';
import repoRoutes from './routes/repos.routes';
import gitRoutes from './routes/git.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'GitDB backend is running', data: {} });
});

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/git', gitRoutes);
app.use('/api/settings', settingsRoutes);

const frontendBuildPath = path.join(process.cwd(), 'backend', 'public', 'admin');
app.use(express.static(frontendBuildPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`GitDB backend listening on port ${port}`);
});
