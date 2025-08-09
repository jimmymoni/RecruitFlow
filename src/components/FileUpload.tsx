import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  FileImage,
  FileText
} from 'lucide-react'
import { DocumentUpload, UploadProgress, DocumentCategoryLabels, formatFileSize, getFileTypeIcon } from '../types/document'

interface FileUploadProps {
  onUpload: (uploads: DocumentUpload[]) => void
  onUploadProgress?: (progress: UploadProgress[]) => void
  allowMultiple?: boolean
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  associatedWith?: {
    candidateId?: string
    communicationId?: string
    jobId?: string
  }
  isOpen: boolean
  onClose: () => void
}

const FileUpload = ({
  onUpload,
  onUploadProgress,
  allowMultiple = true,
  acceptedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'csv'],
  maxFileSize = 10, // 10MB default
  maxFiles = 10,
  associatedWith,
  isOpen,
  onClose
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !acceptedTypes.includes(fileExtension)) {
      return `File type .${fileExtension} not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `File size too large. Maximum size: ${maxFileSize}MB`
    }

    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newFiles: File[] = []
    const newErrors: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      } else if (selectedFiles.length + newFiles.length < maxFiles) {
        newFiles.push(file)
      } else {
        newErrors.push(`Maximum ${maxFiles} files allowed`)
      }
    })

    setErrors(prev => [...prev, ...newErrors])
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearErrors = () => {
    setErrors([])
  }

  const simulateUpload = async (file: File): Promise<void> => {
    const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    // Initialize progress
    const initialProgress: UploadProgress = {
      documentId,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }
    
    setUploadProgress(prev => [...prev, initialProgress])
    onUploadProgress?.([initialProgress])

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const updatedProgress: UploadProgress = {
        ...initialProgress,
        progress,
        status: progress === 100 ? 'processing' : 'uploading'
      }
      
      setUploadProgress(prev => 
        prev.map(p => p.documentId === documentId ? updatedProgress : p)
      )
      onUploadProgress?.([updatedProgress])
    }

    // Processing phase
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const completedProgress: UploadProgress = {
      ...initialProgress,
      progress: 100,
      status: 'complete'
    }
    
    setUploadProgress(prev => 
      prev.map(p => p.documentId === documentId ? completedProgress : p)
    )
    onUploadProgress?.([completedProgress])
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const uploads: DocumentUpload[] = selectedFiles.map(file => ({
      file,
      category: 'other', // Default category, can be changed later
      associatedWith,
      tags: [],
      isPublic: false
    }))

    // Start upload simulation for each file
    const uploadPromises = selectedFiles.map(file => simulateUpload(file))
    
    onUpload(uploads)
    
    // Wait for all uploads to complete
    await Promise.all(uploadPromises)
    
    // Reset state
    setTimeout(() => {
      setSelectedFiles([])
      setUploadProgress([])
      onClose()
    }, 1500)
  }

  const getFileIcon = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png'].includes(fileType || '')) {
      return <FileImage className="h-8 w-8" />
    }
    return <FileText className="h-8 w-8" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl shadow-premium border border-dark-600 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload Documents</h2>
              <p className="text-dark-200">Add files to the document library</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Drag and Drop Area */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? 'border-neon-blue bg-neon-blue/10 shadow-glow'
                : 'border-dark-500 hover:border-neon-blue hover:bg-neon-blue/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={allowMultiple}
              accept={acceptedTypes.map(type => `.${type}`).join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-4"
            >
              <Upload className={`h-12 w-12 mx-auto ${isDragOver ? 'text-neon-blue' : 'text-dark-300'}`} />
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-dark-300">
                  or <span className="text-neon-blue font-medium">browse to choose files</span>
                </p>
              </div>
              <div className="text-sm text-dark-400">
                <p>Supported formats: {acceptedTypes.join(', ').toUpperCase()}</p>
                <p>Maximum file size: {maxFileSize}MB • Maximum files: {maxFiles}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Error Messages */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearErrors}
                  className="text-sm text-red-300 hover:text-red-200 transition-colors"
                >
                  Clear errors
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Files */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Selected Files ({selectedFiles.length})</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-3 p-3 bg-dark-600/50 rounded-lg border border-dark-500"
                    >
                      <div className="text-dark-200">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <p className="text-dark-300 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(index)}
                        className="p-1 text-dark-300 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress */}
          <AnimatePresence>
            {uploadProgress.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Upload Progress</h3>
                <div className="space-y-3">
                  {uploadProgress.map((progress) => (
                    <div key={progress.documentId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm truncate">{progress.fileName}</span>
                        <div className="flex items-center space-x-2">
                          {progress.status === 'uploading' && (
                            <Loader className="h-4 w-4 text-neon-blue animate-spin" />
                          )}
                          {progress.status === 'processing' && (
                            <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
                          )}
                          {progress.status === 'complete' && (
                            <CheckCircle className="h-4 w-4 text-neon-green" />
                          )}
                          <span className="text-sm text-dark-200">{progress.progress}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-dark-600 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.progress}%` }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.status === 'complete'
                              ? 'bg-neon-green'
                              : progress.status === 'processing'
                              ? 'bg-yellow-400'
                              : 'bg-neon-blue'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && uploadProgress.length === 0 && (
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-dark-600">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 text-dark-200 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              <Upload className="h-4 w-4" />
              <span>Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default FileUpload