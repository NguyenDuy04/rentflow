import { getSerializedRuntimeErrorState, subscribeToRuntimeErrorState } from 'next/dist/compiled/next-devtools';
import { HMR_MESSAGE_SENT_TO_SERVER } from '../../../server/dev/hot-reloader-types';
let reportCurrentState = null;
export function reportCurrentRuntimeErrorState() {
    reportCurrentState?.();
}
export function createRuntimeErrorStateReporter(sendMessage) {
    let lastSerializedState = null;
    const report = (errorState, force = false)=>{
        const pathname = window.location.pathname;
        const serializedState = JSON.stringify({
            pathname,
            errorState
        });
        if (!force && serializedState === lastSerializedState) {
            return;
        }
        lastSerializedState = serializedState;
        const update = {
            event: HMR_MESSAGE_SENT_TO_SERVER.RUNTIME_ERRORS,
            pathname,
            errorState
        };
        sendMessage(JSON.stringify(update));
    };
    subscribeToRuntimeErrorState((state)=>report(state));
    const reportCurrent = (force)=>{
        const state = getSerializedRuntimeErrorState();
        if (state) {
            report({
                errors: state.errors,
                routerType: state.routerType
            }, force);
        }
    };
    reportCurrentState = ()=>reportCurrent(false);
    return {
        reportCurrent () {
            reportCurrent(true);
        }
    };
}

//# sourceMappingURL=runtime-error-state.js.map