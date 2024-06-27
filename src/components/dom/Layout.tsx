'use client'

import { useRef } from 'react'
import Scene from '@/components/canvas/Scene'

const Layout = ({ children }) => {
  const ref = useRef<HTMLDivElement | null>()

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      <div id='smooth-wrapper'>
        <div id='smooth-content'>{children}</div>
      </div>
      <Scene
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: '-1',
        }}
        gl={{
          stencil: false,
          depth: false,
        }}
        flat
        eventSource={ref}
        eventPrefix='client'
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
      />
    </div>
  )
}

export { Layout }
