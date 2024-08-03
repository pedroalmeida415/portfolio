import { type MutableRefObject, forwardRef, useImperativeHandle, useRef } from 'react'

import { View as ViewImpl } from '@react-three/drei'

import { Three } from '~/helpers/components/Three'

const View = forwardRef<HTMLDivElement, JSX.IntrinsicElements['div']>(({ children, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null)
  useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef as MutableRefObject<HTMLElement>}>{children}</ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
