import { renderHook, act } from '@testing-library/react'
import { useToast } from '../hooks/useToast'

describe('useToast', () => {

    it('should start with empty toasts', () => {
        const { result } = renderHook(() => useToast())
        expect(result.current.toasts).toEqual([])
    })

    it('should add a toast and remove it after 3 seconds', () => {
        jest.useFakeTimers()
        const { result } = renderHook(() => useToast())
        act(() => {
            result.current.addToast('Test message', 'success')
        })

        expect(result.current.toasts.length).toBe(1)
        expect(result.current.toasts[0].message).toBe('Test message')
        expect(result.current.toasts[0].type).toBe('success')
        // Fast-forward 4 seconds
        act(() => {
            jest.advanceTimersByTime(4000)
        })
        expect(result.current.toasts.length).toBe(0)
    })

    it('should remove a toast by id when removeToast is called', () => {
        jest.useFakeTimers()
        const { result } = renderHook(() => useToast())
        act(() => {
            result.current.addToast('Test message', 'success')
        })
        expect(result.current.toasts.length).toBe(1)

        const id = result.current.toasts[0].id
        act(() => {
            result.current.removeToast(id)
        })
        expect(result.current.toasts.length).toBe(0)
    })

    it('should support multiple toasts', () => {
        const { result } = renderHook(() => useToast())
        act(() => {
            result.current.addToast('First', 'success')
            result.current.addToast('Second', 'error')
        })
        expect(result.current.toasts.length).toBe(2)
    })

    afterEach(() => {
        jest.useRealTimers()  // restore real timers after each test
    })
})