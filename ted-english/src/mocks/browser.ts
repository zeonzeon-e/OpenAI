import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

let worker: ReturnType<typeof setupWorker> | undefined;

export const setupMocks = async () => {
  if (typeof window === 'undefined') return;
  if (worker) return;
  worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass' });
};
