import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  YTDLP_BIN: z.string().default('yt-dlp'),
  FFMPEG_BIN: z.string().default('ffmpeg'),
  TEMP_DIR: z.string().default('/tmp/codex-converters'),
  MAX_OUTPUT_SIZE_MB: z.coerce.number().default(500),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(120000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const MAX_OUTPUT_BYTES = env.MAX_OUTPUT_SIZE_MB * 1024 * 1024;
