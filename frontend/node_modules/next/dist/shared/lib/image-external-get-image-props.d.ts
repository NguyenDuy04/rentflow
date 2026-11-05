import type { ImageProps } from './get-img-props';
/**
 * For more advanced use cases, you can call `getImageProps()`
 * to get the props that would be passed to the underlying `<img>` element,
 * and instead pass to them to another component, style, canvas, etc.
 *
 * Read more: [Next.js docs: `getImageProps`](https://nextjs.org/docs/app/api-reference/components/image#getimageprops)
 */
export declare function getImageProps(imgProps: ImageProps): {
    props: import("./get-img-props").ImgProps;
};
