import type { FlightRouterState, FlightSegmentPath, InitialRSCPayload } from '../shared/lib/app-router-types';
export declare function createInitialRSCPayloadFromFallbackPrerender(response: Response, fallbackInitialRSCPayload: InitialRSCPayload): InitialRSCPayload;
export declare function getNextFlightSegmentPath(flightSegmentPath: FlightSegmentPath): FlightSegmentPath;
/**
 * This function is used to prepare the flight router state for the request.
 * It removes markers that are not needed by the server, and are purely used
 * for stashing state on the client.
 * @param flightRouterState - The flight router state to prepare.
 * @param isHmrRefresh - Whether this is an HMR refresh request.
 * @returns The prepared flight router state.
 */
export declare function prepareFlightRouterStateForRequest(flightRouterState: FlightRouterState, isHmrRefresh?: boolean): string;
