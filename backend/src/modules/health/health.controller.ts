import { Request, Response } from 'express';
import { healthService } from './health.service';
import { sendSuccess, sendError } from '../../core/utils/api-response';

export class HealthController {
  public getLiveness = (_req: Request, res: Response): void => {
    const liveness = healthService.getLiveness();
    sendSuccess(res, liveness, 200, 'Service is alive');
  };

  public getReadiness = (req: Request, res: Response): void => {
    const readiness = healthService.getReadiness();

    if (readiness.status === 'ready') {
      sendSuccess(res, readiness, 200, 'Service is ready');
    } else {
      sendError(
        res,
        503,
        'DATABASE_NOT_READY',
        'Database connection is not ready',
        readiness,
        req.id ? String(req.id) : undefined
      );
    }
  };
}

export const healthController = new HealthController();
