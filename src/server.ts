import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'GitDB backend is running', data: {} });
});

app.use('/api/auth', authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`GitDB backend listening on port ${port}`);
});
