import imageSizeOf from 'next/dist/compiled/image-size';
export async function getImageSize(buffer) {
    const { width, height } = imageSizeOf(buffer);
    return {
        width,
        height
    };
}

//# sourceMappingURL=get-image-size.js.map