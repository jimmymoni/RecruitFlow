import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  FileText,
  Image as ImageIcon,
  Loader,
  AlertCircle
} from 'lucide-react'
import { Document as DocumentType } from '../types/document'

interface DocumentViewerProps {
  document: DocumentType
  documents?: DocumentType[]
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  onDownload?: (document: DocumentType) => void
}

interface ViewerState {
  currentPage: number
  totalPages: number
  zoomLevel: number
  rotation: number
  isFullscreen: boolean
  isLoading: boolean
  error: string | null
}

const DocumentViewer = ({
  document,
  documents = [],
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onDownload
}: DocumentViewerProps) => {
  const [viewerState, setViewerState] = useState<ViewerState>({
    currentPage: 1,
    totalPages: 1,
    zoomLevel: 1,
    rotation: 0,
    isFullscreen: false,
    isLoading: true,
    error: null
  })

  const isPDF = document?.fileType === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png'].includes(document?.fileType || '')
  const canView = isPDF || isImage

  const handleZoomIn = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel * 1.2, 5)
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel / 1.2, 0.2)
    }))
  }, [])

  const handleRotate = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }))
  }, [])

  const handleFullscreen = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setViewerState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }))
  }, [])

  const handleDownload = useCallback(() => {
    if (onDownload && document) {
      onDownload(document)
    } else {
      // Fallback: trigger browser download
      const link = document.createElement('a')
      link.href = document.url
      link.download = document.originalName
      link.click()
    }
  }, [document, onDownload])

  const renderPDFViewer = () => (
    <div className="relative w-full h-full bg-dark-600 rounded-xl flex items-center justify-center p-6">
      {viewerState.isLoading && (
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 text-neon-blue animate-spin" />
          <p className="text-dark-200">Loading PDF...</p>
        </div>
      )}
      
      {viewerState.error && (
        <div className="flex flex-col items-center space-y-4 text-red-400">
          <AlertCircle className="h-8 w-8" />
          <p>Failed to load PDF</p>
          <button
            onClick={handleDownload}
            className="text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            Download to view externally
          </button>
        </div>
      )}

      {/* PDF Placeholder - In real implementation, use react-pdf here */}
      {!viewerState.error && (
        <div className="relative w-full h-full">
          <div 
            className="w-full h-full bg-white rounded shadow-lg flex items-center justify-center"
            style={{
              transform: `scale(${viewerState.zoomLevel}) rotate(${viewerState.rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <div className="text-gray-800 text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold">{document.originalName}</h3>
                <p className="text-gray-600">PDF Document Preview</p>
                <p className="text-sm text-gray-500 mt-2">
                  Page {viewerState.currentPage} of {viewerState.totalPages}
                </p>
              </div>
              <div className="text-xs text-gray-400 max-w-md">
                <p>This is a placeholder for PDF content.</p>
                <p>In production, react-pdf would render the actual PDF here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderImageViewer = () => (
    <div className="relative w-full h-full bg-dark-600 rounded-xl overflow-hidden p-4">
      <motion.img
        src={document.url}
        alt={document.originalName}
        className="w-full h-full object-contain"
        style={{
          transform: `scale(${viewerState.zoomLevel}) rotate(${viewerState.rotation}deg)`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onLoad={() => setViewerState(prev => ({ ...prev, isLoading: false }))}
        onError={() => setViewerState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to load image' 
        }))}
      />
      
      {viewerState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="h-8 w-8 text-neon-blue animate-spin" />
        </div>
      )}
    </div>
  )

  const renderUnsupported = () => (
    <div className="relative w-full h-full bg-dark-600 rounded-xl flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <FileText className="h-16 w-16 mx-auto text-dark-400" />
        <div>
          <h3 className="text-xl font-semibold text-white">{document.originalName}</h3>
          <p className="text-dark-300">Preview not available for {document.fileType?.toUpperCase()} files</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300 mx-auto"
        >
          <Download className="h-4 w-4" />
          <span>Download File</span>
        </motion.button>
      </div>
    </div>
  )

  if (!isOpen || !document) return null

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 ${
        viewerState.isFullscreen ? 'bg-black' : ''
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`${
            viewerState.isFullscreen 
              ? 'h-full w-full' 
              : 'h-[85vh] max-w-6xl mx-auto mt-8 mb-8'
          } flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-dark-800/80 backdrop-blur-xl rounded-t-xl border-b border-dark-600">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                {isImage ? (
                  <ImageIcon className="h-4 w-4 text-white" />
                ) : (
                  <FileText className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white truncate max-w-md">
                  {document.originalName}
                </h3>
                <p className="text-dark-300 text-sm">
                  {document.fileType?.toUpperCase()} • {(document.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              {documents.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onPrevious}
                    disabled={!onPrevious}
                    className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                  <span className="text-dark-300 text-sm">
                    {documents.findIndex(d => d.id === document.id) + 1} of {documents.length}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onNext}
                    disabled={!onNext}
                    className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 bg-dark-800/50 backdrop-blur-xl rounded-b-xl overflow-hidden m-2 mb-20">
            <div className="h-full p-6">
              {canView ? (
                isPDF ? renderPDFViewer() : renderImageViewer()
              ) : (
                renderUnsupported()
              )}
            </div>
          </div>

          {/* Controls */}
          {canView && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center space-x-3 bg-dark-800/90 backdrop-blur-xl rounded-xl px-6 py-3 border border-dark-600 shadow-premium"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleZoomOut}
                  className="p-2 text-dark-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </motion.button>
                
                <span className="text-dark-200 text-sm min-w-16 text-center">
                  {Math.round(viewerState.zoomLevel * 100)}%
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleZoomIn}
                  className="p-2 text-dark-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </motion.button>
                
                <div className="h-6 w-px bg-dark-600 mx-2"></div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRotate}
                  className="p-2 text-dark-300 hover:text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFullscreen}
                  className="p-2 text-dark-300 hover:text-white transition-colors"
                  title={viewerState.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {viewerState.isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </motion.button>
                
                <div className="h-6 w-px bg-dark-600 mx-2"></div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDownload}
                  className="p-2 text-dark-300 hover:text-neon-blue transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DocumentViewer