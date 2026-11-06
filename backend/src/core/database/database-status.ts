import mongoose from 'mongoose';

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): 'connected' | 'disconnected' {
  return isDatabaseConnected() ? 'connected' : 'disconnected';
}
