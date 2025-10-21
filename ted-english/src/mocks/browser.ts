import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export async function prepareMockServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

export type {}; // ensure this module is treated as a module
