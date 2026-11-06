"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadinessResponseSchema = exports.LivenessResponseSchema = void 0;
const zod_1 = require("zod");
exports.LivenessResponseSchema = zod_1.z.object({
    status: zod_1.z.literal('ok'),
    timestamp: zod_1.z.string(),
});
exports.ReadinessResponseSchema = zod_1.z.object({
    status: zod_1.z.enum(['ready', 'not_ready']),
    database: zod_1.z.enum(['connected', 'disconnected']),
    timestamp: zod_1.z.string(),
});
