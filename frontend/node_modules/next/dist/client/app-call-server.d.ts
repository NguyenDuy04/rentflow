/**
 * Invoke a Server Action. The returned promise resolves with the action's
 * return value once the response has been processed. Navigation and
 * revalidation side effects of the action are handled by the router; they are
 * not observable through the returned promise.
 */
export { callServer } from './sequential-call-server';
