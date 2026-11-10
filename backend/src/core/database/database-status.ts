import mongoose from 'mongoose';
import { DatabaseUnavailableError } from '../errors/app-error';

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): 'connected' | 'disconnected' {
  return isDatabaseConnected() ? 'connected' : 'disconnected';
}

export function assertDatabaseConnected(): void {
  if (!isDatabaseConnected()) {
    throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.');
  }
}
