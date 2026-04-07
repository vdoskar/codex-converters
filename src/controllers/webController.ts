import { Request, Response } from 'express';
import { z } from 'zod';
import { MediaService } from '../services/mediaService';

const resolveSchema = z.object({ url: z.string().url() });
const downloadSchema = z.object({
  originalUrl: z.string().url(),
  selectedOutputType: z.enum(['mp4', 'mp3']),
  selectedQuality: z.string().min(1),
  title: z.string().optional(),
});

const mediaService = new MediaService();

export class WebController {
  home(req: Request, res: Response): void {
    res.render('home', { error: null, inputUrl: '', warning: legalNotice });
  }

  async resolve(req: Request, res: Response): Promise<void> {
    const parsed = resolveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).render('home', {
        error: 'Neplatná URL adresa.',
        inputUrl: req.body?.url ?? '',
        warning: legalNotice,
      });
      return;
    }

    try {
      const resolved = await mediaService.resolve(parsed.data.url);
      res.render('resolved', { media: resolved, error: null, warning: legalNotice });
    } catch (error) {
      res.status(400).render('home', {
        error: error instanceof Error ? error.message : 'Resolve selhal.',
        inputUrl: parsed.data.url,
        warning: legalNotice,
      });
    }
  }

  async download(req: Request, res: Response): Promise<void> {
    const parsed = downloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).render('home', {
        error: 'Neplatný vstup pro stažení.',
        inputUrl: req.body?.originalUrl ?? '',
        warning: legalNotice,
      });
      return;
    }

    try {
      const result = await mediaService.download(parsed.data);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Length', result.contentLength.toString());
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

      result.stream.on('close', () => {
        void result.cleanup();
      });
      result.stream.on('error', () => {
        void result.cleanup();
      });
      result.stream.pipe(res);
    } catch (error) {
      res.status(400).render('home', {
        error: error instanceof Error ? error.message : 'Download selhal.',
        inputUrl: parsed.data.originalUrl,
        warning: legalNotice,
      });
    }
  }

  async history(req: Request, res: Response): Promise<void> {
    const items = await mediaService.listHistory();
    res.render('history', { items, warning: legalNotice });
  }

  health(req: Request, res: Response): void {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
}

const legalNotice =
  'Používejte pouze obsah, ke kterému máte zákonná práva. Integrace platforem je neoficiální a může se měnit.';
