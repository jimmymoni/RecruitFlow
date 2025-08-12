import { useCallback, useRef, useState, useEffect } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
  delta?: number
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

export const useSwipeGestures = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    delta = 10
  } = options

  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)
  const [isSwipping, setIsSwipping] = useState(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    touchEnd.current = null
    setIsSwipping(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
    
    const touch = e.targetTouches[0]
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [preventDefaultTouchmoveEvent])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      setIsSwipping(false)
      return
    }

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const absDistanceX = Math.abs(distanceX)
    const absDistanceY = Math.abs(distanceY)
    const timeDiff = touchEnd.current.time - touchStart.current.time

    // Ignore very short or very long swipes
    if (timeDiff < 50 || timeDiff > 1000) {
      setIsSwipping(false)
      return
    }

    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    // Determine primary swipe direction
    if (absDistanceX > absDistanceY) {
      // Horizontal swipe
      if (absDistanceX > threshold) {
        if (isLeftSwipe && onSwipeLeft) {
          onSwipeLeft()
        } else if (isRightSwipe && onSwipeRight) {
          onSwipeRight()
        }
      }
    } else {
      // Vertical swipe
      if (absDistanceY > threshold) {
        if (isUpSwipe && onSwipeUp) {
          onSwipeUp()
        } else if (isDownSwipe && onSwipeDown) {
          onSwipeDown()
        }
      }
    }

    setIsSwipping(false)
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  const swipeHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }

  return {
    swipeHandlers,
    isSwipping
  }
}

// Hook for long press gesture
interface LongPressOptions {
  onLongPress: () => void
  duration?: number
  preventDefault?: boolean
}

export const useLongPress = (options: LongPressOptions) => {
  const { onLongPress, duration = 500, preventDefault = true } = options
  const timeoutRef = useRef<number | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    setIsLongPressing(false)
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true)
      onLongPress()
    }, duration)
  }, [onLongPress, duration, preventDefault])

  const onTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLongPressing(false)
  }, [])

  const onTouchMove = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLongPressing(false)
  }, [])

  const longPressHandlers = {
    onTouchStart,
    onTouchEnd,
    onTouchMove
  }

  return {
    longPressHandlers,
    isLongPressing
  }
}

// Hook for pull-to-refresh gesture
interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  distanceToRefresh?: number
  resistance?: number
}

export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const {
    onRefresh,
    threshold = 100,
    distanceToRefresh = 150,
    resistance = 2.5
  } = options

  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const touchStart = useRef<number>(0)
  const scrollTop = useRef<number>(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement
    scrollTop.current = element.scrollTop
    touchStart.current = e.touches[0].clientY
    setIsPulling(false)
    setPullDistance(0)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement
    const currentTouch = e.touches[0].clientY
    const distance = currentTouch - touchStart.current

    // Only pull when at the top of the container
    if (scrollTop.current === 0 && distance > 0) {
      setIsPulling(true)
      const adjustedDistance = Math.min(distance / resistance, distanceToRefresh)
      setPullDistance(adjustedDistance)
      
      if (adjustedDistance > threshold) {
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    }
  }, [threshold, distanceToRefresh, resistance])

  const onTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh error:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    setIsPulling(false)
    setPullDistance(0)
  }, [pullDistance, threshold, onRefresh, isRefreshing])

  const pullToRefreshHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }

  return {
    pullToRefreshHandlers,
    isPulling,
    pullDistance,
    isRefreshing,
    shouldShowRefresh: pullDistance > threshold
  }
}

// Hook for detecting device type and touch capabilities
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasTouch: false,
    userAgent: '',
    screenSize: {
      width: 0,
      height: 0
    }
  })

  const detectDevice = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                    (hasTouch && screenWidth < 768)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                    (hasTouch && screenWidth >= 768 && screenWidth < 1024)
    const isDesktop = !isMobile && !isTablet

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      hasTouch,
      userAgent,
      screenSize: {
        width: screenWidth,
        height: screenHeight
      }
    })
  }, [])

  // Detect device on mount and window resize
  useEffect(() => {
    detectDevice()
    
    const handleResize = () => {
      detectDevice()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [detectDevice])

  return deviceInfo
}

export default useSwipeGestures