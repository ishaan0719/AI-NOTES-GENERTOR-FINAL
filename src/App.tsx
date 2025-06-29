import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { NotesView } from './components/NotesView';
import { HistoryView } from './components/HistoryView';
import { useFileProcessor } from './hooks/useFileProcessor';
import { ViewMode } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('upload');
  const { files, currentFile, processFile, deleteFile, clearHistory, setCurrentFile } = useFileProcessor();

  const handleFileSelect = async (file: File) => {
    try {
      setCurrentView('processing');
      const processedFile = await processFile(file);
      if (processedFile.status === 'completed') {
        setCurrentView('notes');
      }
    } catch (error) {
      console.error('File processing failed:', error);
    }
  };

  const handleViewNotes = () => {
    setCurrentView('notes');
  };

  const handleViewFile = (file: any) => {
    setCurrentFile(file);
    setCurrentView('notes');
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Transform Documents into
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Smart Notes</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Upload your PDFs and presentations and let our AI create beautifully structured, 
                  comprehensive notes that help you learn and retain information better.
                </p>
              </div>
              
              <FileUpload onFileSelect={handleFileSelect} />
              
              <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Documents</h3>
                  <p className="text-gray-400 text-sm">Support for PDF files and presentation formats (PPT, PPTX)</p>
                </div>
                
                <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Processing</h3>
                  <p className="text-gray-400 text-sm">Advanced AI analyzes and structures your content intelligently</p>
                </div>
                
                <div className="text-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Structured Notes</h3>
                  <p className="text-gray-400 text-sm">Get organized notes with summaries, key points, and sections</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return currentFile ? (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProcessingView file={currentFile} onViewNotes={handleViewNotes} />
            </div>
          </div>
        ) : null;

      case 'notes':
        return currentFile?.notes ? (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <NotesView notes={currentFile.notes} fileName={currentFile.name} />
            </div>
          </div>
        ) : null;

      case 'history':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <HistoryView 
                files={files}
                onDeleteFile={deleteFile}
                onViewFile={handleViewFile}
                onClearHistory={clearHistory}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      {renderCurrentView()}
    </div>
  );
}

export default App;