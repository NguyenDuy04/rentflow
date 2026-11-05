import type { ExportRouteResult } from '../types';
import type { RenderOpts } from '../../server/app-render/types';
import type { NextParsedUrlQuery } from '../../server/request-meta';
import type { RouteCacheMetadata } from './types';
import type { MockedRequest, MockedResponse } from '../../server/lib/mock-request';
import type { OpaqueFallbackRouteParams } from '../../server/request/fallback-params';
import type { RequestLifecycleOpts } from '../../server/base-server';
import type { AppSharedContext } from '../../server/app-render/app-render';
import type { RouteMatch } from '../../server/route-modules/app-page/module';
import type { MultiFileWriter } from '../../lib/multi-file-writer';
/**
 * Renders & exports a page associated with the /app directory
 */
export declare function exportAppPage(req: MockedRequest, res: MockedResponse, page: string, path: string, pathname: string, query: NextParsedUrlQuery, fallbackRouteParams: OpaqueFallbackRouteParams | null, partialRenderOpts: Omit<RenderOpts, keyof RequestLifecycleOpts>, htmlFilepath: string, debugOutput: boolean, isDynamicError: boolean, fileWriter: MultiFileWriter, sharedContext: AppSharedContext, routeMatch: RouteMatch, routeCache?: RouteCacheMetadata): Promise<ExportRouteResult>;
