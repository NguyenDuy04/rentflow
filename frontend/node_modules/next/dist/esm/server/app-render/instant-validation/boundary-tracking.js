export function createValidationBoundaryTracking(/** Pass if the render is expected to render the same IDs as a previous one. */ matchPrevious) {
    return {
        requiredIds: matchPrevious ? new Map(matchPrevious.requiredIds) : new Map(),
        renderedIds: new Set()
    };
}
export function allRequiredBoundariesRendered(state) {
    for (const id of state.requiredIds.keys()){
        if (!state.renderedIds.has(id)) {
            return false;
        }
    }
    return true;
}

//# sourceMappingURL=boundary-tracking.js.map