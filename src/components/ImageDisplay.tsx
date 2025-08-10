import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Image as ImageIcon, X, Download, Maximize2 } from 'lucide-react'

interface ImageDisplayProps {
  src?: string
  alt?: string
  fallback?: 'avatar' | 'document' | 'logo' | 'placeholder'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shape?: 'square' | 'circle'
  className?: string
  showActions?: boolean
  onDownload?: () => void
  onFullscreen?: () => void
  loading?: boolean
}

const ImageDisplay = ({
  src,
  alt = "Image",
  fallback = 'placeholder',
  size = 'md',
  shape = 'square',
  className = "",
  showActions = false,
  onDownload,
  onFullscreen,
  loading = false
}: ImageDisplayProps) => {
  const [isLoading, setIsLoading] = useState(loading)
  const [hasError, setHasError] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    full: 'w-full h-full'
  }

  const shapeClasses = {
    square: 'rounded-lg',
    circle: 'rounded-full'
  }

  const getFallbackIcon = () => {
    switch (fallback) {
      case 'avatar': return User
      case 'document': return ImageIcon
      case 'logo': return ImageIcon
      default: return ImageIcon
    }
  }

  const getFallbackBg = () => {
    switch (fallback) {
      case 'avatar': return 'bg-gradient-to-br from-blue-500 to-purple-500'
      case 'document': return 'bg-gradient-to-br from-green-500 to-blue-500'
      case 'logo': return 'bg-gradient-to-br from-orange-500 to-red-500'
      default: return 'bg-gradient-to-br from-gray-500 to-gray-700'
    }
  }

  const FallbackIcon = getFallbackIcon()

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleFullscreen = () => {
    setShowFullscreen(true)
    onFullscreen?.()
  }

  if (!src || hasError) {
    // Show fallback
    return (
      <div className={`
        ${sizeClasses[size]} ${shapeClasses[shape]} ${getFallbackBg()}
        flex items-center justify-center text-white ${className}
      `}>
        <FallbackIcon className={`${
          size === 'xs' ? 'h-4 w-4' :
          size === 'sm' ? 'h-6 w-6' :
          size === 'md' ? 'h-8 w-8' :
          size === 'lg' ? 'h-12 w-12' :
          'h-16 w-16'
        }`} />
      </div>
    )
  }

  return (
    <>
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
            w-full h-full ${shapeClasses[shape]} overflow-hidden 
            ${showActions ? 'group cursor-pointer' : ''}
          `}
        >
          {isLoading && (
            <div className={`
              absolute inset-0 ${shapeClasses[shape]} ${getFallbackBg()}
              flex items-center justify-center animate-pulse
            `}>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`
              w-full h-full object-cover transition-all duration-300
              ${showActions ? 'group-hover:scale-105' : ''}
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
          />

          {/* Action Overlay */}
          {showActions && !isLoading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center space-x-2">
                {onFullscreen && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleFullscreen}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </motion.button>
                )}
                {onDownload && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onDownload}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default ImageDisplay