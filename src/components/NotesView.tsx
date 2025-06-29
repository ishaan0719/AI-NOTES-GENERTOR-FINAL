import React, { useState } from 'react';
import { Download, Share2, Copy, Search, Hash, BookOpen, FileText, ChevronDown, ChevronRight, Eye, Image, BarChart3, Table, Camera, MapPin } from 'lucide-react';
import { GeneratedNotes, NoteSection } from '../types';

interface NotesViewProps {
  notes: GeneratedNotes;
  fileName: string;
}

const SectionComponent: React.FC<{ section: NoteSection; level: number }> = ({ section, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubsections = section.subsections && section.subsections.length > 0;

  const headingClass = level === 0 
    ? 'text-xl font-bold text-white' 
    : level === 1 
    ? 'text-lg font-semibold text-gray-200'
    : 'text-base font-medium text-gray-300';

  const formatContent = (content: string) => {
    // Split content into sections and format with beautiful styling
    const sections = content.split('\n\n').filter(p => p.trim().length > 0);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Handle different types of content with beautiful formatting
      
      // Main page headers (📄 Page X)
      if (trimmedSection.startsWith('**📄 Page')) {
        return (
          <div key={index} className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl shadow-lg">
              <h3 className="text-2xl font-bold flex items-center space-x-3">
                <FileText className="w-7 h-7" />
                <span>{trimmedSection.replace(/\*\*/g, '')}</span>
              </h3>
            </div>
          </div>
        );
      }
      
      // Visual content sections with enhanced styling
      if (trimmedSection.includes('🎯 Visual Content on This Page:')) {
        return (
          <div key={index} className="mb-8">
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-2 border-purple-500/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-purple-300 mb-6 flex items-center space-x-3">
                <Camera className="w-7 h-7" />
                <span>Visual Content on This Page</span>
              </h4>
              <div className="space-y-6">
                {formatVisualContent(trimmedSection)}
              </div>
            </div>
          </div>
        );
      }
      
      // Section headings with emojis (### 🔸)
      if (trimmedSection.startsWith('### 🔸')) {
        const headingText = trimmedSection.replace('### 🔸', '').trim();
        return (
          <div key={index} className="mb-8">
            <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-l-8 border-indigo-400 p-6 rounded-r-2xl shadow-lg backdrop-blur-sm">
              <h4 className="text-2xl font-bold text-indigo-300 flex items-center space-x-3">
                <span className="text-2xl text-indigo-400">🔸</span>
                <span>{headingText}</span>
              </h4>
            </div>
          </div>
        );
      }
      
      // Text content header
      if (trimmedSection.includes('📝 Text Content:')) {
        return (
          <div key={index} className="mb-6">
            <h4 className="text-2xl font-bold text-gray-200 flex items-center space-x-3 pb-4 border-b-2 border-gray-600">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span>Content Summary</span>
            </h4>
          </div>
        );
      }
      
      // Bullet points with enhanced spacing and styling
      if (trimmedSection.startsWith('•')) {
        const bulletText = trimmedSection.substring(1).trim();
        const isImportant = bulletText.startsWith('**') && bulletText.includes('**');
        
        return (
          <div key={index} className="mb-6">
            <div className={`flex items-start space-x-4 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm ${
              isImportant 
                ? 'bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-400/30 shadow-md' 
                : 'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-gray-600/30 shadow-sm'
            }`}>
              <div className={`w-3 h-3 rounded-full mt-3 flex-shrink-0 ${
                isImportant ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'
              }`}></div>
              <div className="flex-1">
                <p className={`leading-relaxed text-lg ${
                  isImportant 
                    ? 'text-white font-semibold' 
                    : 'text-gray-300'
                }`}>
                  {formatTextWithBold(bulletText)}
                </p>
              </div>
            </div>
          </div>
        );
      }
      
      // Horizontal dividers
      if (trimmedSection === '---') {
        return (
          <div key={index} className="mb-8">
            <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>
          </div>
        );
      }
      
      // Regular paragraphs with enhanced styling
      return (
        <div key={index} className="mb-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border-2 border-gray-600/30 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
            <p className="text-gray-300 leading-relaxed text-lg">
              {formatTextWithBold(trimmedSection)}
            </p>
          </div>
        </div>
      );
    });
  };

  const formatVisualContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('📊 Figures Referenced:')) {
        elements.push(
          <div key={index} className="mb-6">
            <h5 className="text-xl font-bold text-purple-300 flex items-center space-x-3 mb-4">
              <Image className="w-6 h-6" />
              <span>Figures Referenced</span>
            </h5>
          </div>
        );
      } else if (trimmedLine.includes('📋 Tables Referenced:')) {
        elements.push(
          <div key={index} className="mb-6">
            <h5 className="text-xl font-bold text-purple-300 flex items-center space-x-3 mb-4">
              <Table className="w-6 h-6" />
              <span>Tables Referenced</span>
            </h5>
          </div>
        );
      } else if (trimmedLine.includes('📈 Graphs/Charts Referenced:')) {
        elements.push(
          <div key={index} className="mb-6">
            <h5 className="text-xl font-bold text-purple-300 flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6" />
              <span>Graphs/Charts Referenced</span>
            </h5>
          </div>
        );
      } else if (trimmedLine.startsWith('•')) {
        const bulletText = trimmedLine.substring(1).trim();
        elements.push(
          <div key={index} className="ml-6 mb-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30 shadow-sm backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-purple-200 leading-relaxed font-medium">
                  {formatTextWithBold(bulletText)}
                </p>
              </div>
            </div>
          </div>
        );
      } else if (trimmedLine.includes('📝 Caption:')) {
        elements.push(
          <div key={index} className="ml-8 mb-3">
            <div className="bg-purple-500/10 rounded-lg p-3 border-l-4 border-purple-400">
              <p className="text-purple-300 text-sm italic font-medium">
                {trimmedLine}
              </p>
            </div>
          </div>
        );
      } else if (trimmedLine.includes('📍 Location:')) {
        elements.push(
          <div key={index} className="ml-8 mb-4">
            <div className="flex items-center space-x-2 text-purple-300">
              <MapPin className="w-4 h-4" />
              <p className="text-sm font-medium">
                {trimmedLine}
              </p>
            </div>
          </div>
        );
      }
    });
    
    return elements;
  };

  const formatTextWithBold = (text: string) => {
    // Handle bold text formatting with enhanced styling
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold text-white bg-yellow-500/20 px-1 rounded">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`${level > 0 ? 'ml-8' : ''} mb-12`}>
      <div
        className={`flex items-center space-x-4 cursor-pointer hover:bg-gray-700/30 rounded-2xl p-4 transition-all duration-200 ${
          hasSubsections ? '' : 'cursor-default'
        }`}
        onClick={() => hasSubsections && setIsExpanded(!isExpanded)}
      >
        {hasSubsections && (
          isExpanded ? <ChevronDown className="w-6 h-6 text-gray-400" /> : <ChevronRight className="w-6 h-6 text-gray-400" />
        )}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className={headingClass}>{section.title}</h3>
        </div>
      </div>
      
      <div className="mt-8 mb-10">
        <div className="bg-gray-800/50 border-2 border-gray-600/30 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            <div className="space-y-6">
              {formatContent(section.content)}
            </div>
          </div>
        </div>
      </div>

      {hasSubsections && isExpanded && (
        <div className="space-y-10 ml-6">
          {section.subsections!.map((subsection) => (
            <SectionComponent key={subsection.id} section={subsection} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const NotesView: React.FC<NotesViewProps> = ({ notes, fileName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Count visual elements from the notes content
  const countVisualElements = () => {
    let figures = 0;
    let tables = 0;
    let graphs = 0;
    
    notes.sections.forEach(section => {
      const content = section.content;
      figures += (content.match(/📊 Figures Referenced:/g) || []).length;
      tables += (content.match(/📋 Tables Referenced:/g) || []).length;
      graphs += (content.match(/📈 Graphs\/Charts Referenced:/g) || []).length;
    });
    
    return { figures, tables, graphs };
  };

  const { figures, tables, graphs } = countVisualElements();

  const handleDownload = () => {
    let content = `# ${notes.title}\n\n`;
    
    // Add summary
    content += `## Document Summary\n\n${notes.summary}\n\n`;
    
    // Add visual content summary
    if (figures > 0 || tables > 0 || graphs > 0) {
      content += `## Visual Content Summary\n\n`;
      if (figures > 0) content += `- **${figures} Figures** referenced throughout the document\n`;
      if (tables > 0) content += `- **${tables} Tables** referenced throughout the document\n`;
      if (graphs > 0) content += `- **${graphs} Graphs/Charts** referenced throughout the document\n`;
      content += `\n*Note: Visual elements are referenced in the text but cannot be extracted from the PDF.*\n\n`;
    }
    
    // Add key points if available
    if (notes.keyPoints.length > 0) {
      content += `## Key Points\n\n`;
      notes.keyPoints.forEach((point, index) => {
        content += `${index + 1}. ${point}\n\n`;
      });
    }
    
    // Add full content from each page with proper formatting
    content += `## Complete PDF Content\n\n`;
    notes.sections.forEach(section => {
      content += `### ${section.title}\n\n`;
      
      // Clean and format content for markdown
      const formattedContent = section.content
        .replace(/\*\*📄 Page \d+\*\*/g, '') // Remove page headers
        .replace(/🎯|📊|📋|📈|📝|🔸|📍|📝/g, '') // Remove emojis
        .replace(/\*\*(.*?)\*\*/g, '**$1**') // Keep bold formatting
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0 && paragraph !== '---')
        .join('\n\n');
      
      content += `${formattedContent}\n\n---\n\n`;
      
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          content += `#### ${subsection.title}\n\n`;
          const formattedSubContent = subsection.content
            .replace(/\*\*📄 Page \d+\*\*/g, '')
            .replace(/🎯|📊|📋|📈|📝|🔸|📍|📝/g, '')
            .replace(/\*\*(.*?)\*\*/g, '**$1**')
            .split('\n\n')
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0 && paragraph !== '---')
            .join('\n\n');
          content += `${formattedSubContent}\n\n---\n\n`;
        });
      }
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}-enhanced-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    let content = `${notes.title}\n\n${notes.summary}\n\n`;
    if (notes.keyPoints.length > 0) {
      content += `Key Points:\n`;
      notes.keyPoints.forEach((point, index) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += '\n';
    }
    notes.sections.forEach(section => {
      content += `${section.title}\n\n${section.content}\n\n`;
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          content += `${subsection.title}\n\n${subsection.content}\n\n`;
        });
      }
    });
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800/50 rounded-3xl shadow-2xl border-2 border-gray-600/30 mb-10 backdrop-blur-sm">
        <div className="p-10 border-b border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{notes.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center space-x-3 bg-blue-500/10 px-4 py-3 rounded-xl border border-blue-500/30">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <span className="font-semibold text-blue-300">{notes.sections.length} pages</span>
                </div>
                <div className="flex items-center space-x-3 bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/30">
                  <BookOpen className="w-6 h-6 text-green-400" />
                  <span className="font-semibold text-green-300">{notes.wordCount.toLocaleString()} words</span>
                </div>
                {figures > 0 && (
                  <div className="flex items-center space-x-3 bg-purple-500/10 px-4 py-3 rounded-xl border border-purple-500/30">
                    <Image className="w-6 h-6 text-purple-400" />
                    <span className="font-semibold text-purple-300">{figures} figures</span>
                  </div>
                )}
                {tables > 0 && (
                  <div className="flex items-center space-x-3 bg-orange-500/10 px-4 py-3 rounded-xl border border-orange-500/30">
                    <Table className="w-6 h-6 text-orange-400" />
                    <span className="font-semibold text-orange-300">{tables} tables</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors duration-200 border-2 border-gray-600"
              >
                <Copy className="w-5 h-5" />
                <span className="hidden sm:inline">Copy All</span>
              </button>
              <button
                className="flex items-center space-x-2 px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors duration-200 border-2 border-gray-600"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5" />
                <span>Download Enhanced Notes</span>
              </button>
            </div>
          </div>

          {/* Search and Tags */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-6">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search through the complete PDF content, figures, tables, and graphs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-white placeholder-gray-400"
              />
            </div>
            
            {notes.tags.length > 0 && (
              <div className="flex items-center space-x-3 flex-wrap">
                {notes.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-full text-sm font-semibold transition-colors duration-200 ${
                      selectedTag === tag
                        ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-500/30'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-2 border-gray-600'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span>Document Overview</span>
          </h2>
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-8 border-2 border-blue-500/20 backdrop-blur-sm">
            <p className="text-gray-200 leading-relaxed text-xl">
              {notes.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Content Summary */}
      {(figures > 0 || tables > 0 || graphs > 0) && (
        <div className="bg-gray-800/50 rounded-3xl shadow-2xl border-2 border-gray-600/30 mb-10 backdrop-blur-sm">
          <div className="p-10">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span>Visual Content Summary</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {figures > 0 && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border-2 border-purple-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <Image className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-bold text-purple-300">Figures</h3>
                  </div>
                  <p className="text-4xl font-bold text-purple-400 mb-3">{figures}</p>
                  <p className="text-purple-300 font-medium">Figures referenced throughout the document</p>
                </div>
              )}
              {tables > 0 && (
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border-2 border-orange-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <Table className="w-8 h-8 text-orange-400" />
                    <h3 className="text-xl font-bold text-orange-300">Tables</h3>
                  </div>
                  <p className="text-4xl font-bold text-orange-400 mb-3">{tables}</p>
                  <p className="text-orange-300 font-medium">Tables referenced throughout the document</p>
                </div>
              )}
              {graphs > 0 && (
                <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl p-8 border-2 border-green-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <BarChart3 className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-green-300">Graphs & Charts</h3>
                  </div>
                  <p className="text-4xl font-bold text-green-400 mb-3">{graphs}</p>
                  <p className="text-green-300 font-medium">Graphs and charts referenced throughout the document</p>
                </div>
              )}
            </div>
            <div className="mt-8 p-6 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl backdrop-blur-sm">
              <p className="text-yellow-300 font-medium">
                <strong className="text-yellow-200">Note:</strong> Visual elements (figures, tables, graphs) are detected and referenced in the text content below, 
                but the actual images cannot be extracted from the PDF. The text describes where these visual elements appear and their captions when available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Points */}
      {notes.keyPoints.length > 0 && (
        <div className="bg-gray-800/50 rounded-3xl shadow-2xl border-2 border-gray-600/30 mb-10 backdrop-blur-sm">
          <div className="p-10">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <span>Key Points Extracted</span>
            </h2>
            <div className="grid gap-6">
              {notes.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-6 p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border-2 border-yellow-500/30 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 backdrop-blur-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <p className="text-gray-200 leading-relaxed text-lg font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Format Notice */}
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl shadow-2xl border-2 border-green-500/30 mb-10 backdrop-blur-sm">
        <div className="p-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Enhanced PDF Content with Visual References</h2>
          </div>
          <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
            <p>
              <strong className="text-white">Complete Content Extraction:</strong> Every page of your PDF has been carefully processed to extract all readable text content.
            </p>
            <p>
              <strong className="text-white">Visual Element Detection:</strong> Figures, tables, graphs, and charts mentioned in the text are identified and highlighted with special formatting.
            </p>
            <p>
              <strong className="text-white">Enhanced Readability:</strong> Important points are bolded, content is organized with bullet points, and proper spacing makes everything easy to read.
            </p>
            <p>
              <strong className="text-white">Structured Format:</strong> Each page is clearly separated with headers, and visual content references are prominently displayed.
            </p>
          </div>
        </div>
      </div>

      {/* Full Page Content */}
      <div className="bg-gray-800/50 rounded-3xl shadow-2xl border-2 border-gray-600/30 backdrop-blur-sm">
        <div className="p-10">
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>Complete PDF Content - Page by Page</span>
          </h2>
          <div className="space-y-12">
            {notes.sections.map((section) => (
              <SectionComponent key={section.id} section={section} level={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};