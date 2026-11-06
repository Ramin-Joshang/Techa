import { LivenessResponse, ReadinessResponse } from '@techa/shared';
import { isDatabaseConnected } from '../../core/database/database-status';

export class HealthService {
  public getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  public getReadiness(): ReadinessResponse {
    const connected = isDatabaseConnected();
    return {
      status: connected ? 'ready' : 'not_ready',
      database: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
