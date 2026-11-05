import type { ReadonlyReducerState, ReducerState, RefreshAction } from '../router-reducer-types';
import { FreshnessPolicy } from '../../render-tree';
export declare function refreshReducer(state: ReadonlyReducerState, action: RefreshAction): ReducerState;
export declare function refreshDynamicData(state: ReadonlyReducerState, freshnessPolicy: FreshnessPolicy.RefreshAll | FreshnessPolicy.HMRRefresh, signal: AbortSignal | undefined): ReducerState;
