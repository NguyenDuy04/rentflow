import { type NextIncomingMessage } from '../../request-meta';
import type { ServerComponentsHmrCache } from '../../response-cache';
import type { DevRenderContext } from './module';
/** Capture HMR inputs at the App Page handler boundary in dev. */
export declare function createDevRenderContext(req: NextIncomingMessage, hmrCacheFallback?: ServerComponentsHmrCache): DevRenderContext | undefined;
