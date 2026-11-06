"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponseSchema = exports.ApiResponseSchema = exports.ApiErrorDetailSchema = exports.ApiMetaSchema = void 0;
const zod_1 = require("zod");
exports.ApiMetaSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().optional(),
    total: zod_1.z.number().int().nonnegative().optional(),
    timestamp: zod_1.z.string().optional(),
});
exports.ApiErrorDetailSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.unknown().optional(),
    requestId: zod_1.z.string().optional(),
});
const ApiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    statusCode: zod_1.z.number().int(),
    data: dataSchema,
    message: zod_1.z.string().optional(),
    meta: exports.ApiMetaSchema.optional(),
});
exports.ApiResponseSchema = ApiResponseSchema;
exports.ApiErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    statusCode: zod_1.z.number().int(),
    error: exports.ApiErrorDetailSchema,
});
