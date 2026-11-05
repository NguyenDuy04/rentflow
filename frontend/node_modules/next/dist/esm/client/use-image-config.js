'use client';
import { useContext } from 'react';
import { prepareImageConfig } from '../shared/lib/image-config';
import { ImageConfigContext } from '../shared/lib/image-config-context.shared-runtime';
// This is replaced by the bundler define plugin.
const configEnv = process.env.__NEXT_IMAGE_OPTS;
export function useImageConfig() {
    const configContext = useContext(ImageConfigContext);
    return prepareImageConfig(configEnv, configContext);
}

//# sourceMappingURL=use-image-config.js.map