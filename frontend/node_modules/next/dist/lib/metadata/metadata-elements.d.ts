import React from 'react';
import type { SelectedMetadata } from './metadata-resolution-primitives';
import type { ResolvedViewport } from './types/metadata-interface';
export declare function createViewportElements(viewport: ResolvedViewport): React.ReactElement[];
export declare function createMetadataElements(metadata: SelectedMetadata): React.ReactElement[];
