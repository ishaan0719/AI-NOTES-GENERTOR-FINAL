import React, { useState } from 'react';
import { Calendar, FileText, Trash2, Download, Search, Filter, Eye } from 'lucide-react';
import { ProcessedFile } from '../types';

interface HistoryViewProps {
  files: ProcessedFile[];
  onDeleteFile: (fileId: string) => void;
  onViewFile: (file: ProcessedFile) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  files, 
  onDeleteFile, 
  onViewFile,
  onClearHistory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: ProcessedFile['status']) => {
    const styles = {
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (files.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No files processed yet</h3>
          <p className="text-gray-400">Start by uploading a document to see your processing history here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Processing History</h1>
          <p className="text-gray-400">{files.length} files processed</p>
        </div>
        
        {files.length > 0 && (
          <button
            onClick={onClearHistory}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200 border border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 mb-6 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm">
        <div className="divide-y divide-gray-700">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-6 hover:bg-gray-700/30 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{file.uploadDate.toLocaleDateString()}</span>
                      </span>
                      {getStatusBadge(file.status)}
                    </div>
                    
                    {file.status === 'completed' && file.notes && (
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>{file.notes.sections.length} sections</span>
                        <span>{file.notes.keyPoints.length} key points</span>
                        <span>{file.notes.wordCount} words</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {file.status === 'completed' && (
                    <button
                      onClick={() => onViewFile(file)}
                      className="flex items-center space-x-1 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200 border border-blue-500/30"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  )}
                  
                  {file.status === 'completed' && file.notes && (
                    <button
                      onClick={() => {
                        const content = `# ${file.notes!.title}\n\n## Summary\n${file.notes!.summary}\n\n${file.notes!.sections.map(section => `## ${section.title}\n${section.content}\n`).join('\n')}`;
                        const blob = new Blob([content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${file.name.replace(/\.[^/.]+$/, "")}-notes.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors duration-200 border border-gray-600"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="flex items-center space-x-1 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200 border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 && files.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
          <p className="text-gray-400">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};