import * as React from 'react';
import type { ErrorBaseProps } from '../errors/error-overlay/error-overlay';
import type { ErrorOverlayTabBarRenderer } from '../errors/error-overlay-pagination/error-overlay-pagination';
export declare function VulnerabilityInsight({ renderTabBar, canGoPrevious, canGoNext, onPrevious, onNext, onClose, rendered, transitionDurationMs, versionInfo, }: ErrorBaseProps & {
    renderTabBar: ErrorOverlayTabBarRenderer | undefined;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: (() => void) | undefined;
    onNext: (() => void) | undefined;
    onClose: (() => void) | undefined;
}): React.JSX.Element;
