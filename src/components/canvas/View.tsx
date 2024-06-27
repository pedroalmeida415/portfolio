import { forwardRef, useImperativeHandle, useRef } from 'react'
import { View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'

type Props = JSX.IntrinsicElements['div'] & {
  orbit?: boolean
}

const View = forwardRef<HTMLDivElement, Props>(({ children, orbit, ...props }, ref) => {
  const localRef = useRef(null)
  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>{children}</ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
