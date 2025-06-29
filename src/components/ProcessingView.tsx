import React, { useEffect, useState } from 'react';
import { Brain, FileText, Clock, CheckCircle, XCircle, BookOpen, Eye, AlertCircle } from 'lucide-react';
import { ProcessedFile } from '../types';

interface ProcessingViewProps {
  file: ProcessedFile;
  onViewNotes: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ file, onViewNotes }) => {
  const [processingStage, setProcessingStage] = useState<string>('Initializing...');

  useEffect(() => {
    if (file.processingStage) {
      setProcessingStage(file.processingStage);
    }
  }, [file.processingStage]);

  const getStatusIcon = () => {
    switch (file.status) {
      case 'processing':
        return <Brain className="w-8 h-8 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (file.status) {
      case 'processing':
        return 'Extracting actual content from your PDF. Every page is being read and the full text is being captured for your notes.';
      case 'completed':
        return 'PDF content extraction complete! All text from every page has been captured and formatted into readable notes.';
      case 'failed':
        return file.error || 'Content extraction failed. Please try uploading the PDF again.';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">
                {file.name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{formatFileSize(file.size)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{file.uploadDate.toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-4">{getStatusMessage()}</p>
            
            {file.status === 'processing' && (
              <>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${file.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-blue-500/20">
                  <div className="flex items-center justify-center space-x-2 text-sm text-blue-400 mb-2">
                    <Eye className="w-4 h-4 animate-pulse" />
                    <span className="font-medium">{processingStage}</span>
                  </div>
                  <div className="text-xs text-blue-300">
                    {Math.round(file.progress)}% complete • Extracting full PDF content
                  </div>
                  {file.currentPage && (
                    <div className="mt-2 text-xs text-purple-300">
                      Currently processing page {file.currentPage}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${file.progress > 5 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    <span>PDF structure reading</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${file.progress > 85 ? 'bg-green-400' : file.progress > 5 ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`}></div>
                    <span>Text extraction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${file.progress > 95 ? 'bg-green-400' : file.progress > 85 ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`}></div>
                    <span>Content formatting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${file.progress >= 100 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    <span>Notes generation</span>
                  </div>
                </div>
              </>
            )}

            {file.status === 'completed' && file.notes && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
                  <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">PDF Content Extracted Successfully!</span>
                  </div>
                  <p className="text-sm text-green-300">
                    All text content from your PDF has been extracted and formatted into readable notes.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {file.notes.sections.length}
                    </div>
                    <div className="text-xs text-blue-300 font-medium">Pages</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">
                      {file.notes.wordCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-300 font-medium">Words</div>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      {file.notes.keyPoints.length}
                    </div>
                    <div className="text-xs text-purple-300 font-medium">Key Points</div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 text-center">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Full Content Preserved</span>
                  </div>
                  <p className="text-xs text-yellow-300">
                    Your notes contain the complete text from every page of your PDF
                  </p>
                </div>

                <button
                  onClick={onViewNotes}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  View Full PDF Content Notes
                </button>
              </div>
            )}

            {file.status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Content Extraction Failed</span>
                  </div>
                  <p className="text-sm text-red-300">
                    {file.error || 'Unable to extract content from the PDF. Please check the file and try again.'}
                  </p>
                </div>
                
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};