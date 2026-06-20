/// <reference types="vite/client" />

declare module '*.jsx' {
  import type { FC, SVGProps } from 'react';

  type SvgIcon = FC<SVGProps<SVGSVGElement> & { className?: string }>;

  export const Dot: SvgIcon;
  export const Guitar: SvgIcon;
  export const ThumbsUp: SvgIcon;
  export const Paintbrush: SvgIcon;
  export const Notebook: SvgIcon;
  export const Joystick: SvgIcon;
  export const LaptopCheck: SvgIcon;
  export const Plus: SvgIcon;
  export const Logo: SvgIcon;
}
