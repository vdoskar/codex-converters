import { Router } from 'express';
import { WebController } from '../controllers/webController';

const controller = new WebController();
export const webRoutes = Router();

webRoutes.get('/', (req, res) => controller.home(req, res));
webRoutes.post('/resolve', (req, res) => void controller.resolve(req, res));
webRoutes.post('/download', (req, res) => void controller.download(req, res));
webRoutes.get('/history', (req, res) => void controller.history(req, res));
webRoutes.get('/health', (req, res) => controller.health(req, res));
