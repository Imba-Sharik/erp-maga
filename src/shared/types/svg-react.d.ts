declare module '*.svg?react' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
  const ReactComponent: ForwardRefExoticComponent<
    SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>
  >
  export default ReactComponent
}
