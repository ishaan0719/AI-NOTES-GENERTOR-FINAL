import { useState, useCallback } from 'react';
import { ProcessedFile, GeneratedNotes } from '../types';
import { extractPDFContent, formatPageContent } from '../utils/pdfExtractor';

const processFileContent = async (
  file: File, 
  onProgress: (progress: number, stage: string, currentPage?: number) => void
): Promise<GeneratedNotes> => {
  try {
    // Stage 1: Extract PDF content
    onProgress(5, 'Reading PDF structure...');
    
    const extractedContent = await extractPDFContent(file, (extractProgress, currentPage) => {
      const overallProgress = 5 + (extractProgress * 0.8); // 5% to 85%
      onProgress(overallProgress, `Extracting content from page ${currentPage}...`, currentPage);
    });
    
    onProgress(85, 'Processing extracted content...');
    
    // Stage 2: Format the content into structured notes
    const sections = extractedContent.pages.map(page => ({
      id: `page-${page.pageNumber}`,
      title: page.title || `Page ${page.pageNumber}`,
      content: formatPageContent(page)
    }));
    
    onProgress(95, 'Finalizing notes structure...');
    
    // Generate summary from first few pages
    const firstPageContent = extractedContent.pages.slice(0, 3)
      .map(p => p.text)
      .join(' ')
      .substring(0, 500);
    
    const summary = `This document contains ${extractedContent.totalPages} pages of content. ${firstPageContent}...`;
    
    // Extract key points from content
    const keyPoints = extractKeyPointsFromContent(extractedContent.pages);
    
    // Generate tags based on content
    const tags = generateTagsFromContent(extractedContent.pages);
    
    onProgress(100, 'Complete!');
    
    return {
      title: `Full Content: ${extractedContent.title}`,
      summary,
      sections,
      keyPoints,
      tags,
      wordCount: calculateTotalWordCount(extractedContent.pages)
    };
    
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

const extractKeyPointsFromContent = (pages: any[]): string[] => {
  const keyPoints: string[] = [];
  
  pages.forEach(page => {
    if (page.text) {
      // Look for sentences that might be key points
      const sentences = page.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      // Take first meaningful sentence from each page as a key point
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        if (firstSentence.length > 10 && firstSentence.length < 200) {
          keyPoints.push(`Page ${page.pageNumber}: ${firstSentence}`);
        }
      }
    }
  });
  
  return keyPoints.slice(0, 15); // Limit to 15 key points
};

const generateTagsFromContent = (pages: any[]): string[] => {
  const allText = pages.map(p => p.text).join(' ').toLowerCase();
  
  // Common academic/document terms to look for
  const potentialTags = [
    'introduction', 'conclusion', 'analysis', 'methodology', 'results',
    'discussion', 'theory', 'practice', 'implementation', 'evaluation',
    'research', 'study', 'data', 'findings', 'recommendations'
  ];
  
  const foundTags = potentialTags.filter(tag => 
    allText.includes(tag) || allText.includes(tag + 's')
  );
  
  return foundTags.slice(0, 8);
};

const calculateTotalWordCount = (pages: any[]): number => {
  return pages.reduce((total, page) => {
    return total + (page.text ? page.text.split(/\s+/).length : 0);
  }, 0);
};

export const useFileProcessor = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [currentFile, setCurrentFile] = useState<ProcessedFile | null>(null);

  const processFile = useCallback(async (file: File) => {
    // Only process PDF files for now
    if (file.type !== 'application/pdf') {
      throw new Error('Currently only PDF files are supported for content extraction.');
    }

    const newFile: ProcessedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'processing',
      progress: 0
    };

    setFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);

    try {
      const notes = await processFileContent(file, (progress, stage, currentPage) => {
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, progress, processingStage: stage, currentPage }
            : f
        ));
        
        if (currentFile?.id === newFile.id) {
          setCurrentFile(prev => prev ? { 
            ...prev, 
            progress, 
            processingStage: stage, 
            currentPage 
          } : prev);
        }
      });
      
      const completedFile: ProcessedFile = {
        ...newFile,
        status: 'completed',
        progress: 100,
        notes
      };

      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? completedFile : f
      ));
      setCurrentFile(completedFile);
      
      return completedFile;
    } catch (error) {
      const failedFile: ProcessedFile = {
        ...newFile,
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Processing failed'
      };

      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? failedFile : f
      ));
      setCurrentFile(failedFile);
      
      throw error;
    }
  }, [currentFile]);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (currentFile?.id === fileId) {
      setCurrentFile(null);
    }
  }, [currentFile]);

  const clearHistory = useCallback(() => {
    setFiles([]);
    setCurrentFile(null);
  }, []);

  return {
    files,
    currentFile,
    processFile,
    deleteFile,
    clearHistory,
    setCurrentFile
  };
};