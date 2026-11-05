import { type TurbopackMessageSentToBrowser } from '../../../../server/dev/hot-reloader-types';
import { type StaticIndicatorState } from './hot-reloader-app';
export declare function createWebSocket(staticIndicatorState: StaticIndicatorState): WebSocket;
export declare function createProcessTurbopackMessage(sendMessage: (data: string) => void): (msg: TurbopackMessageSentToBrowser) => void;
export declare function useWebSocketPing(webSocket: WebSocket | undefined): void;
