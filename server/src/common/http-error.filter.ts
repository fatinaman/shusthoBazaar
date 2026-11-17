import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const appError = error as { status?: number; message?: string; details?: unknown; name?: string; issues?: Array<{ path: PropertyKey[]; message: string }> };

    if (appError?.name === 'ZodError') {
      return response.status(400).json({
        error: 'Request validation failed.',
        details: appError.issues?.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      const payload = error.getResponse();
      if (typeof payload === 'object' && payload !== null && 'error' in payload) {
        return response.status(status).json(payload);
      }
      const message = typeof payload === 'string'
        ? payload
        : (payload as { message?: string | string[] }).message;
      return response.status(status).json({
        error: status >= 500 ? 'Internal server error.' : Array.isArray(message) ? message[0] : message || error.message,
      });
    }

    const status = Number.isInteger(appError?.status) ? appError.status! : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= 500) console.error(error);
    return response.status(status).json({
      error: status >= 500
        ? 'Internal server error.'
        : appError.message || `Route not found: ${request.method} ${request.path}`,
      ...(appError.details ? { details: appError.details } : {}),
    });
  }
}
