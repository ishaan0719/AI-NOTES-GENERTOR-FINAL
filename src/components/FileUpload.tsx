import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF file. Other formats are not currently supported for content extraction.';
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : error
            ? 'border-red-400 bg-red-500/10'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf"
          onChange={handleChange}
          disabled={isProcessing}
        />

        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            error ? 'bg-red-500/20 border border-red-500/30' : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-400" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {error ? 'Upload Error' : 'Upload your PDF document'}
          </h3>

          <p className={`text-sm mb-4 ${error ? 'text-red-400' : 'text-gray-300'}`}>
            {error || 'Drag and drop your PDF file here, or click to browse'}
          </p>

          {!error && (
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>PDF files only</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Up to 50MB</span>
              </div>
            </div>
          )}

          {error && (
            <button
              onClick={() => setError(null)}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          <strong className="text-white">Full Content Extraction:</strong> Upload a PDF and get the complete text content from every page, 
          formatted as readable notes that preserve all the information from your document.
        </p>
      </div>
    </div>
  );
};