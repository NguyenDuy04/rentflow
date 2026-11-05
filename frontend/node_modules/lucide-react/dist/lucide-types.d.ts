import { SVGProps as SVGProps$1, ForwardRefExoticComponent, RefAttributes } from 'react';

type SVGProps = Record<string, any>;
/**
 * A Lucide icon node (an svgson-like internal format)
 */
type LucideIconNode$1<TName extends string = string, TProps extends Record<string, unknown> = SVGProps> = [name: TName, attributes: TProps] | [name: TName, attributes: TProps, children: LucideIconNode$1<TName, TProps>[]];
/**
 * A Lucide icon object that fully describes an icon to be displayed.
 */
type LucideIconData$1<TName extends string = string, TProps extends Record<string, unknown> = SVGProps> = {
    name?: string;
    node: LucideIconNode$1<TName, TProps>[];
    aliases?: string[];
} & ({
    size?: number;
    width?: never;
    height?: never;
} | {
    size?: never;
    width?: number;
    height?: number;
});

type SVGAttributes = Partial<SVGProps$1<SVGSVGElement>>;
type LucideIconNode = LucideIconNode$1<string, SVGAttributes>;
type LucideIconData = LucideIconData$1<string, SVGAttributes>;
/**
 * @deprecated Use LucideIconNode instead.
 */
type IconNode = LucideIconNode[];
type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface LucideProps extends ElementAttributes {
    size?: string | number;
    /**
     * @deprecated Use `nonScalingStroke` instead.
     */
    absoluteStrokeWidth?: boolean;
    nonScalingStroke?: boolean;
}
type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

export type { IconNode, LucideIcon, LucideIconData, LucideIconNode, LucideProps, SVGAttributes };
