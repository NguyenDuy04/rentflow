import type { ActionManifest } from '../../build/webpack/plugins/flight-client-entry-plugin';
import type { ClientReferenceManifest } from '../../build/webpack/plugins/flight-manifest-plugin';
import type { DeepReadonly } from '../../shared/lib/deep-readonly';
export interface ServerModuleMap {
    readonly [name: string]: {
        readonly id: string | number;
        readonly name: string;
        readonly chunks: Readonly<Array<string>>;
        readonly async?: boolean;
    };
}
export declare function getActionNotFoundError(actionId: string | null): Error;
export declare function getInvalidServerReferenceIdError(id: string): Error;
/**
 * The flight entry loader keys actions by bundlePath. bundlePath corresponds
 * with the relative path (including 'app') to the page entrypoint.
 */
export declare function normalizeWorkerPageName(pageName: string): string;
/**
 * Checks if the requested action has a worker for the current page.
 * If not, it returns the first worker that has a handler for the action.
 */
export declare function selectWorkerForForwarding(actionId: string, pageName: string): string | undefined;
export declare function setManifestsSingleton({ page, clientReferenceManifest, serverActionsManifest: rawServerActionsManifest, }: {
    page: string;
    clientReferenceManifest: DeepReadonly<ClientReferenceManifest>;
    serverActionsManifest: DeepReadonly<ActionManifest>;
}): void;
/**
 * Returns the usual client_reference_manifest.json.
 *
 * In dev, it also looks up references of other pages (due to overlapping processing on
 * navigations).
 *
 * Inside a use-cache workUnitStore, clientModules instead map to a stable dummy value (see comments
 * above).
 */
export declare function getClientReferenceManifest(): DeepReadonly<ClientReferenceManifest>;
/**
 * A mapping of client reference names to the RSC module id. (So a double lookup of clientModules ->
 * rscModuleMapping)
 */
export declare function getRscModuleMappingForUseCache(): DeepReadonly<ClientReferenceManifest['rscModuleMapping']>;
export declare function getServerActionsManifest(): DeepReadonly<ActionManifest>;
export declare function getServerModuleMap(): ServerModuleMap;
