import { getDb } from '../firebase/admin';
import { OperationRecord } from '../models/types';

const COLLECTIONS = {
  resolutions: 'resolutions',
  downloads: 'downloads',
  history: 'history',
};

export class HistoryRepository {
  async createResolution(record: OperationRecord): Promise<string> {
    const ref = await getDb().collection(COLLECTIONS.resolutions).add(record);
    await getDb().collection(COLLECTIONS.history).add({ ...record, sourceId: ref.id, sourceType: 'resolution' });
    return ref.id;
  }

  async createDownload(record: OperationRecord): Promise<string> {
    const ref = await getDb().collection(COLLECTIONS.downloads).add(record);
    await getDb().collection(COLLECTIONS.history).add({ ...record, sourceId: ref.id, sourceType: 'download' });
    return ref.id;
  }

  async listHistory(limit = 50): Promise<(OperationRecord & { id: string })[]> {
    const snap = await getDb().collection(COLLECTIONS.history).orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as OperationRecord) }));
  }
}
