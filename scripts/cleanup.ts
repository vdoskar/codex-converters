import { CleanupService } from '../src/services/cleanupService';

const service = new CleanupService();
service
  .cleanupOldTempDirs()
  .then((count) => {
    console.log(`Removed ${count} temp directories.`);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
