import type { RuntimeErrorBoundary } from '../../../../server/dev/hot-reloader-types';
import type { OverlayState } from '../../shared';
import type { StackFrame } from '../../../shared/stack-frame';
import { type ReadyRuntimeError } from '../../utils/get-error-by-type';
export type SupportedErrorEvent = {
    id: number;
    error: Error;
    frames: readonly StackFrame[];
    type: 'runtime' | 'recoverable' | 'console';
};
export type RuntimeErrorEvent = SupportedErrorEvent & {
    /** A React root failure or a Next.js unrecoverable rendering path. */
    isFatal: boolean;
    boundary: RuntimeErrorBoundary | undefined;
};
type Props = {
    children: (params: {
        runtimeErrors: ReadyRuntimeError[];
        totalErrorCount: number;
        normalErrorCount: number;
        instantErrorCount: number;
    }) => React.ReactNode;
    state: OverlayState;
    isAppDir: boolean;
};
export declare const RenderError: (props: Props) => import("react").JSX.Element;
export {};
