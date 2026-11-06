import pinoHttp from 'pino-http';
import { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger/logger';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const customReq = req as Request;
    if (customReq.id) {
      return String(customReq.id);
    }
    const incomingId = req.headers['x-request-id'];
    if (typeof incomingId === 'string' && incomingId.length > 0) {
      return incomingId;
    }
    return randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
