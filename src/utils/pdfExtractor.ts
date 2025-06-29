import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker using Vite-compatible approach
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  title?: string;
  figures: FigureReference[];
  tables: TableReference[];
  graphs: GraphReference[];
  hasImages: boolean;
}

export interface FigureReference {
  id: string;
  caption?: string;
  description: string;
  position: string;
}

export interface TableReference {
  id: string;
  caption?: string;
  description: string;
  estimatedRows?: number;
  estimatedColumns?: number;
}

export interface GraphReference {
  id: string;
  type: string;
  caption?: string;
  description: string;
}

export interface ExtractedPDFContent {
  pages: ExtractedPage[];
  totalPages: number;
  title?: string;
  totalFigures: number;
  totalTables: number;
  totalGraphs: number;
}

const detectFiguresAndTables = (text: string, pageNumber: number) => {
  const figures: FigureReference[] = [];
  const tables: TableReference[] = [];
  const graphs: GraphReference[] = [];

  // Enhanced patterns for figure references
  const figurePatterns = [
    /Figure\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Fig\.\s*(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Image\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Diagram\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Illustration\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Photo\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Picture\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Exhibit\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Plate\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    // References to figures in text
    /(?:see|refer to|shown in|as in|according to)\s+Figure\s+(\d+(?:\.\d+)?)/gi,
    /(?:see|refer to|shown in|as in|according to)\s+Fig\.\s*(\d+(?:\.\d+)?)/gi
  ];

  // Enhanced patterns for table references
  const tablePatterns = [
    /Table\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Tab\.\s*(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Schedule\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Matrix\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    // References to tables in text
    /(?:see|refer to|shown in|as in|according to)\s+Table\s+(\d+(?:\.\d+)?)/gi,
    /(?:see|refer to|shown in|as in|according to)\s+Tab\.\s*(\d+(?:\.\d+)?)/gi
  ];

  // Enhanced patterns for graphs and charts
  const graphPatterns = [
    /Chart\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Graph\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Plot\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Histogram\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Bar\s+Chart\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Line\s+Graph\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Pie\s+Chart\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    /Scatter\s+Plot\s+(\d+(?:\.\d+)?)[:\.]?\s*([^\n]*)/gi,
    // References to graphs in text
    /(?:see|refer to|shown in|as in|according to)\s+Chart\s+(\d+(?:\.\d+)?)/gi,
    /(?:see|refer to|shown in|as in|according to)\s+Graph\s+(\d+(?:\.\d+)?)/gi
  ];

  // Detect figures
  figurePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const figureNumber = match[1] || 'unknown';
      const caption = match[2]?.trim() || '';
      
      figures.push({
        id: `fig-${pageNumber}-${figureNumber}`,
        caption: caption || undefined,
        description: `Figure ${figureNumber} on page ${pageNumber}`,
        position: `Page ${pageNumber}`
      });
    }
  });

  // Detect tables
  tablePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const tableNumber = match[1] || 'unknown';
      const caption = match[2]?.trim() || '';
      
      tables.push({
        id: `table-${pageNumber}-${tableNumber}`,
        caption: caption || undefined,
        description: `Table ${tableNumber} on page ${pageNumber}`,
        position: `Page ${pageNumber}`
      });
    }
  });

  // Detect graphs
  graphPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const graphNumber = match[1] || 'unknown';
      const caption = match[2]?.trim() || '';
      const type = pattern.source.includes('Chart') ? 'chart' : 
                   pattern.source.includes('Graph') ? 'graph' : 
                   pattern.source.includes('Plot') ? 'plot' :
                   pattern.source.includes('Histogram') ? 'histogram' : 'chart';
      
      graphs.push({
        id: `graph-${pageNumber}-${graphNumber}`,
        type: type,
        caption: caption || undefined,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${graphNumber} on page ${pageNumber}`
      });
    }
  });

  return { figures, tables, graphs };
};

const detectImportantContent = (text: string): string => {
  // Enhanced patterns for important content
  const importantPatterns = [
    // Key terms and definitions
    /(?:key|important|significant|critical|essential|fundamental|primary|main|major|crucial|vital)\s+(?:point|concept|idea|principle|factor|element|aspect|finding|result|conclusion)/gi,
    // Conclusions and results
    /(?:conclusion|result|finding|outcome|summary|therefore|thus|hence|consequently|in summary|to conclude|finally)/gi,
    // Emphasis words
    /(?:note that|it is important|significantly|remarkably|notably|particularly|especially|crucially|most importantly|above all)/gi,
    // Numbers and statistics
    /\d+(?:\.\d+)?%|\d+(?:,\d{3})*(?:\.\d+)?/g,
    // Definitions
    /(?:defined as|refers to|means|is the|represents|can be described as)/gi,
    // Strong statements
    /(?:must|should|will|always|never|all|every|each|only|solely|exclusively)/gi,
    // Research findings
    /(?:research shows|studies indicate|evidence suggests|data reveals|analysis shows)/gi
  ];

  let processedText = text;

  // Bold important phrases and sentences
  importantPatterns.forEach(pattern => {
    processedText = processedText.replace(pattern, (match) => `**${match}**`);
  });

  return processedText;
};

export const extractPDFContent = async (
  file: File, 
  onProgress?: (progress: number, currentPage: number) => void
): Promise<ExtractedPDFContent> => {
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    const pages: ExtractedPage[] = [];
    let totalFigures = 0;
    let totalTables = 0;
    let totalGraphs = 0;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress((pageNum / totalPages) * 80, pageNum);
      }
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Check for images/graphics on the page
      const operatorList = await page.getOperatorList();
      const hasImages = operatorList.fnArray.some(fn => 
        fn === pdfjsLib.OPS.paintImageXObject || 
        fn === pdfjsLib.OPS.paintInlineImageXObject
      );
      
      // Combine text items into readable text with proper formatting
      let pageText = '';
      let lastY = -1;
      let lastX = -1;
      
      textContent.items.forEach((item: any) => {
        const currentY = item.transform[5];
        const currentX = item.transform[4];
        const text = item.str.trim();
        
        if (!text) return;
        
        // Detect new lines based on Y position changes
        if (lastY !== -1 && Math.abs(lastY - currentY) > 5) {
          pageText += '\n\n';
        } else if (lastX !== -1 && currentX - lastX > 50) {
          pageText += ' ';
        }
        
        pageText += text;
        
        // Add space after text if it doesn't end with punctuation or space
        if (!text.match(/[.!?:;,\s]$/)) {
          pageText += ' ';
        }
        
        lastY = currentY;
        lastX = currentX + item.width;
      });
      
      // Clean up and format the text
      pageText = pageText
        .replace(/\n\n+/g, '\n\n')
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();
      
      // Detect figures, tables, and graphs with enhanced detection
      const { figures, tables, graphs } = detectFiguresAndTables(pageText, pageNum);
      totalFigures += figures.length;
      totalTables += tables.length;
      totalGraphs += graphs.length;
      
      // Extract potential title from first meaningful line
      const lines = pageText.split('\n').filter(line => line.trim().length > 0);
      const potentialTitle = lines[0]?.length < 100 && lines[0]?.length > 5 
        ? lines[0].trim() 
        : `Page ${pageNum}`;
      
      pages.push({
        pageNumber: pageNum,
        text: pageText,
        title: potentialTitle,
        figures,
        tables,
        graphs,
        hasImages
      });
    }
    
    if (onProgress) {
      onProgress(100, totalPages);
    }
    
    return {
      pages,
      totalPages,
      title: file.name.replace(/\.[^/.]+$/, ''),
      totalFigures,
      totalTables,
      totalGraphs
    };
    
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw new Error('Failed to extract PDF content. Please ensure the file is a valid PDF.');
  }
};

export const formatPageContent = (page: ExtractedPage): string => {
  if (!page.text || page.text.trim().length === 0) {
    let content = `**📄 Page ${page.pageNumber}**\n\n`;
    
    if (page.hasImages || page.figures.length > 0) {
      content += `*This page contains visual content (images/figures) that cannot be extracted as text.*\n\n`;
    } else {
      content += `*This page appears to be empty or contains only non-text content.*\n\n`;
    }
    
    return content;
  }
  
  let formattedContent = `**📄 Page ${page.pageNumber}**\n\n`;
  
  // Add visual content references first with enhanced formatting
  if (page.figures.length > 0 || page.tables.length > 0 || page.graphs.length > 0 || page.hasImages) {
    formattedContent += `**🎯 Visual Content on This Page:**\n\n`;
    
    if (page.figures.length > 0) {
      formattedContent += `**📊 Figures Referenced:**\n\n`;
      page.figures.forEach(figure => {
        formattedContent += `• **${figure.description}**\n\n`;
        if (figure.caption) {
          formattedContent += `  📝 Caption: *${figure.caption}*\n\n`;
        }
        formattedContent += `  📍 Location: ${figure.position}\n\n`;
      });
    }
    
    if (page.tables.length > 0) {
      formattedContent += `**📋 Tables Referenced:**\n\n`;
      page.tables.forEach(table => {
        formattedContent += `• **${table.description}**\n\n`;
        if (table.caption) {
          formattedContent += `  📝 Caption: *${table.caption}*\n\n`;
        }
        formattedContent += `  📍 Location: ${table.position}\n\n`;
      });
    }
    
    if (page.graphs.length > 0) {
      formattedContent += `**📈 Graphs/Charts Referenced:**\n\n`;
      page.graphs.forEach(graph => {
        formattedContent += `• **${graph.description}** (${graph.type})\n\n`;
        if (graph.caption) {
          formattedContent += `  📝 Caption: *${graph.caption}*\n\n`;
        }
        formattedContent += `  📍 Location: Page ${page.pageNumber}\n\n`;
      });
    }
    
    if (page.hasImages && page.figures.length === 0) {
      formattedContent += `• **Visual elements detected** (images, diagrams, or graphics present)\n\n`;
      formattedContent += `  📍 Location: Page ${page.pageNumber}\n\n`;
    }
    
    formattedContent += `---\n\n`;
  }
  
  // Process and format the main text content with enhanced formatting
  const sections = page.text
    .split('\n\n')
    .map(section => section.trim())
    .filter(section => section.length > 0);
  
  if (sections.length === 0) {
    formattedContent += `*No readable text content found on this page.*\n\n`;
    return formattedContent;
  }
  
  formattedContent += `**📝 Text Content:**\n\n`;
  
  sections.forEach((section, index) => {
    // Check if section looks like a heading
    if (section.length < 80 && 
        (section === section.toUpperCase() || 
         section.split(' ').length <= 8 ||
         section.match(/^[A-Z][A-Za-z\s]+$/) ||
         section.match(/^\d+\.?\s+[A-Z]/))) {
      
      // Format as heading with emoji
      formattedContent += `### 🔸 ${section}\n\n`;
      
    } else {
      // Split into sentences and format as bullet points with better spacing
      const sentences = section.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      
      if (sentences.length === 1 && sentences[0].length < 150) {
        // Short single sentence - treat as important point
        const processedSentence = detectImportantContent(sentences[0]);
        formattedContent += `• **${processedSentence.trim()}**\n\n`;
      } else {
        // Multiple sentences - format as bullet points with enhanced formatting
        sentences.forEach(sentence => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence.length > 10) {
            const processedSentence = detectImportantContent(trimmedSentence);
            
            // Check if sentence contains important keywords or visual references
            const isImportant = /(?:important|significant|key|critical|essential|note|conclusion|result|finding|figure|table|chart|graph|shows|indicates|demonstrates)/i.test(trimmedSentence);
            
            if (isImportant) {
              formattedContent += `• **${processedSentence}**\n\n`;
            } else {
              formattedContent += `• ${processedSentence}\n\n`;
            }
          }
        });
      }
    }
  });
  
  return formattedContent.trim();
};