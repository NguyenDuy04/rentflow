import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;

type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;

interface LucideProps extends ElementAttributes {
  size?: string | number;
  /**
   * @deprecated Use `nonScalingStroke` instead.
   */
  absoluteStrokeWidth?: boolean;
  nonScalingStroke?: boolean;
}

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

declare const icon: LucideIcon;

export { icon as default };
