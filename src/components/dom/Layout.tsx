'use client'

import { useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { NoToneMapping } from 'three'
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

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
      {children}
      {createPortal(
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
            antialias: false,
            toneMapping: NoToneMapping,
          }}
          eventSource={ref}
          eventPrefix='client'
          camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
        />,
        document.body,
      )}
    </div>
  )
}

export { Layout }
