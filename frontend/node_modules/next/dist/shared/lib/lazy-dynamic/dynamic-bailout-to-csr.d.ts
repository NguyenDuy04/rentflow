import { type ReactElement } from 'react';
interface BailoutToCSRForNextDynamicProps {
    children: ReactElement;
}
/**
 * Signals during server rendering that this subtree should be client-rendered.
 */
export declare function BailoutToCSRForNextDynamic({ children, }: BailoutToCSRForNextDynamicProps): ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
export {};
