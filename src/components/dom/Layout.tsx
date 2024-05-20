'use client'

import { useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
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
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: -1,
          }}
          eventSource={ref}
          eventPrefix='client'
        />,
        document.body,
      )}
    </div>
  )
}

export { Layout }
