'use client'

import { type PropsWithChildren, useRef } from 'react'

import { useAtomValue } from 'jotai'

import { getParticlesDataAtom } from '~/store'

import Canvas from '~/components/canvas/canvas'

export const Layout = ({ children }: PropsWithChildren) => {
  const particlesData = useAtomValue(getParticlesDataAtom)

  const eventSourceRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <main ref={eventSourceRef} className='h-screen w-full touch-auto overflow-auto'>
        {particlesData.state === 'hasData' && children}
        {particlesData.state === 'loading' && (
          <div className='progress'>
            <div className='progress-value'></div>
          </div>
        )}
      </main>
      <Canvas eventSource={eventSourceRef} />
    </>
  )
}
