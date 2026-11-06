import { Router } from 'express';
import { healthController } from './health.controller';

export const healthRoutes = Router();

healthRoutes.get('/liveness', healthController.getLiveness);
healthRoutes.get('/readiness', healthController.getReadiness);
