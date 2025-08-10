import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Camera, User } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  currentImage?: string
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'square' | 'circle'
  type?: 'avatar' | 'document' | 'general'
}

const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  placeholder = "Upload Image",
  className = "",
  size = 'md',
  shape = 'square',
  type = 'general'
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }

  const shapeClasses = {
    square: 'rounded-xl',
    circle: 'rounded-full'
  }

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setPreview(previewUrl)
        onImageSelect(file, previewUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getPlaceholderIcon = () => {
    switch (type) {
      case 'avatar': return User
      case 'document': return ImageIcon
      default: return Camera
    }
  }

  const PlaceholderIcon = getPlaceholderIcon()

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          ${sizeClasses[size]} ${shapeClasses[shape]}
          relative overflow-hidden cursor-pointer
          border-2 border-dashed transition-all duration-300
          ${dragActive 
            ? 'border-blue-400 bg-blue-500/10' 
            : preview 
              ? 'border-transparent' 
              : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClick}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemove}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70">
            <PlaceholderIcon className="h-8 w-8 mb-2" />
            <span className="text-xs text-center px-2">{placeholder}</span>
          </div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      
      {dragActive && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded-xl flex items-center justify-center z-10">
          <div className="text-blue-400 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <span className="text-sm font-medium">Drop image here</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload