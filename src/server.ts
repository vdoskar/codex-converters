import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { env } from './config/env';
import { webRoutes } from './routes/webRoutes';
import { CleanupService } from './services/cleanupService';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use('/static', express.static(path.join(process.cwd(), 'src', 'views', 'static')));

app.use(webRoutes);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error', { err, path: req.path });
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500).send('Internal server error');
});

const cleanupService = new CleanupService();
setInterval(() => {
  void cleanupService.cleanupOldTempDirs().catch((error) => {
    console.error('Scheduled cleanup failed', error);
  });
}, 60 * 60 * 1000);

app.listen(env.PORT, () => {
  console.log(`Server running at ${env.APP_BASE_URL} on port ${env.PORT}`);
});
