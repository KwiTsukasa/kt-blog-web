import { describe, expect, it, vi } from 'vitest'

import {
  uploadCubism2WebGLArrayBuffer,
  uploadCubism2WebGLElementArrayBuffer,
} from '../../components/blog/live2d/vendor/cubism2Core/webglBuffers'

/**
 * Creates the WebGL subset and ordered call log used by both upload paths.
 * @param createdBuffer Handle returned by `createBuffer`, including the allowed null result.
 * @returns Recording WebGL subset, call log, and configured creation result.
 */
function createRecordingWebGLContext(
  createdBuffer: WebGLBuffer | null = { id: 'created' } as unknown as WebGLBuffer,
) {
  const calls: unknown[][] = []
  return {
    calls,
    createdBuffer,
    gl: {
      ARRAY_BUFFER: 34962,
      DYNAMIC_DRAW: 35048,
      ELEMENT_ARRAY_BUFFER: 34963,
      bindBuffer: vi.fn((...args: unknown[]) => calls.push(['bindBuffer', ...args])),
      bufferData: vi.fn((...args: unknown[]) => calls.push(['bufferData', ...args])),
      createBuffer: vi.fn(() => {
        calls.push(['createBuffer'])
        return createdBuffer
      }),
    },
  }
}

describe('Cubism2 WebGL buffers immutable source behavior', () => {
  it('preserves reviewed webglBuffers.ts source behavior through semantic TypeScript', () => {
    const { calls, createdBuffer, gl } = createRecordingWebGLContext()
    const values = new Float32Array([1, 2])

    expect(uploadCubism2WebGLArrayBuffer(gl as never, null, values)).toBe(createdBuffer)
    expect(calls).toEqual([
      ['createBuffer'],
      ['bindBuffer', gl.ARRAY_BUFFER, createdBuffer],
      ['bufferData', gl.ARRAY_BUFFER, values, gl.DYNAMIC_DRAW],
    ])

    const reused = createRecordingWebGLContext()
    const existingBuffer = { id: 'existing' } as unknown as WebGLBuffer
    expect(uploadCubism2WebGLArrayBuffer(reused.gl as never, existingBuffer, values)).toBe(
      existingBuffer,
    )
    expect(reused.calls).toEqual([
      ['bindBuffer', reused.gl.ARRAY_BUFFER, existingBuffer],
      ['bufferData', reused.gl.ARRAY_BUFFER, values, reused.gl.DYNAMIC_DRAW],
    ])

    const unavailable = createRecordingWebGLContext(null)
    expect(uploadCubism2WebGLArrayBuffer(unavailable.gl as never, null, values)).toBeNull()
    expect(unavailable.calls).toEqual([
      ['createBuffer'],
      ['bindBuffer', unavailable.gl.ARRAY_BUFFER, null],
      ['bufferData', unavailable.gl.ARRAY_BUFFER, values, unavailable.gl.DYNAMIC_DRAW],
    ])
  })

  it('reuses, binds, and uploads an element buffer without creating another handle', () => {
    const { calls, gl } = createRecordingWebGLContext()
    const existingBuffer = { id: 'existing' } as unknown as WebGLBuffer
    const values = new Int16Array([0, 1, 2])

    expect(uploadCubism2WebGLElementArrayBuffer(gl as never, existingBuffer, values)).toBe(
      existingBuffer,
    )
    expect(calls).toEqual([
      ['bindBuffer', gl.ELEMENT_ARRAY_BUFFER, existingBuffer],
      ['bufferData', gl.ELEMENT_ARRAY_BUFFER, values, gl.DYNAMIC_DRAW],
    ])

    const created = createRecordingWebGLContext()
    expect(uploadCubism2WebGLElementArrayBuffer(created.gl as never, null, values)).toBe(
      created.createdBuffer,
    )
    expect(created.calls).toEqual([
      ['createBuffer'],
      ['bindBuffer', created.gl.ELEMENT_ARRAY_BUFFER, created.createdBuffer],
      ['bufferData', created.gl.ELEMENT_ARRAY_BUFFER, values, created.gl.DYNAMIC_DRAW],
    ])

    const unavailable = createRecordingWebGLContext(null)
    expect(uploadCubism2WebGLElementArrayBuffer(unavailable.gl as never, null, values)).toBeNull()
    expect(unavailable.calls).toEqual([
      ['createBuffer'],
      ['bindBuffer', unavailable.gl.ELEMENT_ARRAY_BUFFER, null],
      ['bufferData', unavailable.gl.ELEMENT_ARRAY_BUFFER, values, unavailable.gl.DYNAMIC_DRAW],
    ])
  })
})
