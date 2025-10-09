import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Type } from 'lucide-react';

const HTMLEditor = () => {
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState('editor'); // 'editor' or 'html'
  const editorRef = useRef(null);
  const [isUpdatingFromHTML, setIsUpdatingFromHTML] = useState(false);
  const prevViewModeRef = useRef(viewMode);

  // Handle paste events to preserve formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    // Use HTML data if available, otherwise convert plain text to paragraphs
    let contentToPaste = htmlData || textData.split('\n\n')
      .filter(para => para.trim())
      .map(para => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
      .join('');

    // Clean HTML content only when pasting
    if (htmlData) {
      contentToPaste = cleanHTML(contentToPaste);
    }

    // Insert at cursor position
    document.execCommand('insertHTML', false, contentToPaste);
    updateContent();
  };

  // Clean HTML by removing attributes
  const cleanHTML = (html) => {
    // Remove all HTML attributes except href for links
    return html.replace(/<(\w+)([^>]*?)>/g, (match, tag, attributes) => {
      if (tag.toLowerCase() === 'a' && attributes.includes('href=')) {
        // Keep href attribute for links
        const hrefMatch = attributes.match(/href=["']([^"']*)["']/);
        return hrefMatch ? `<${tag} href="${hrefMatch[1]}">` : `<${tag}>`;
      }
      return `<${tag}>`;
    });
  };

  // Update content state from editor
  const updateContent = () => {
    if (editorRef.current && !isUpdatingFromHTML) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Handle HTML textarea changes
  const handleHTMLChange = (e) => {
    setContent(e.target.value);
  };

  // Apply formatting using document.execCommand
  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  // Custom formatting functions
  const applyCustomFormat = (tag, attributes = '') => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText) {
        const wrapper = document.createElement(tag);
        if (attributes) {
          const [attr, val] = attributes.split('=');
          wrapper.setAttribute(attr, val.replace(/"/g, ''));
        }

        try {
          range.surroundContents(wrapper);
          selection.removeAllRanges();
        } catch (e) {
          // Fallback for complex selections
          const html = attributes
            ? `<${tag} ${attributes}>${selectedText}</${tag}>`
            : `<${tag}>${selectedText}</${tag}>`;
          document.execCommand('insertHTML', false, html);
        }
        updateContent();
      }
    }
  };

  // Handle list creation
  const createList = (listType) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        const items = selectedText.split('\n').filter(item => item.trim());
        const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
        const listHTML = `<${listType}>${listItems}</${listType}>`;
        document.execCommand('insertHTML', false, listHTML);
        updateContent();
      } else {
        // Create empty list
        const listHTML = listType === 'ul' ? '<ul><li></li></ul>' : '<ol><li></li></ol>';
        document.execCommand('insertHTML', false, listHTML);
        updateContent();
      }
    }
  };

  // Handle link creation
  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('createLink', url);
    }
  };

  // Sync editor content only when switching to editor view from HTML view
  useEffect(() => {
    if (viewMode === 'editor' && prevViewModeRef.current === 'html' && editorRef.current) {
      setIsUpdatingFromHTML(true);
      editorRef.current.innerHTML = content;
      // Use requestAnimationFrame to ensure DOM is updated before resetting flag
      requestAnimationFrame(() => {
        setIsUpdatingFromHTML(false);
      });
    }
    prevViewModeRef.current = viewMode;
  }, [viewMode, content]);

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => applyFormatting('bold') },
    { icon: Italic, label: 'Italic', action: () => applyFormatting('italic') },
    { icon: Underline, label: 'Underline', action: () => applyFormatting('underline') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => applyFormatting('strikeThrough') },
    { icon: Type, label: 'H1', action: () => applyFormatting('formatBlock', 'h1') },
    { icon: Type, label: 'H2', action: () => applyFormatting('formatBlock', 'h2') },
    { icon: Type, label: 'H3', action: () => applyFormatting('formatBlock', 'h3') },
    { icon: List, label: 'Bullet List', action: () => createList('ul') },
    { icon: ListOrdered, label: 'Numbered List', action: () => createList('ol') },
    { icon: AlignLeft, label: 'Align Left', action: () => applyFormatting('justifyLeft') },
    { icon: AlignCenter, label: 'Align Center', action: () => applyFormatting('justifyCenter') },
    { icon: AlignRight, label: 'Align Right', action: () => applyFormatting('justifyRight') },
    { icon: Link, label: 'Link', action: createLink }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Live HTML Editor</h1>

      {/* Formatting Toolbar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-2">
          {formatButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
              title={button.label}
            >
              <button.icon size={16} />
              {button.label.includes('H') ? (
                <span className="text-xs">{button.label}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'editor'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Live Editor
          </button>
          <button
            onClick={() => setViewMode('html')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'html'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            HTML Code
          </button>
        </div>
      </div>

      {/* Editor/View Area */}
      <div id={'editor-window'} className="border-2 border-gray-300 rounded-lg min-h-96 bg-white">
        {viewMode === 'editor' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            onPaste={handlePaste}
            className="w-full h-96 p-4 outline-none overflow-auto prose max-w-none"
            style={{ minHeight: '384px' }}
            suppressContentEditableWarning={true}
          />
        ) : (
          <textarea
            value={content}
            onChange={handleHTMLChange}
            className="w-full h-96 p-4 font-mono text-sm resize-none outline-none border-none"
            placeholder="HTML code will appear here..."
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            alert('HTML copied to clipboard!');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
        >
          Copy HTML
        </button>

        <button
          onClick={() => {
            setContent('');
            if (editorRef.current) {
              editorRef.current.innerHTML = '';
            }
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong>
          • Paste formatted content directly to preserve styling
          • Select text and use toolbar buttons to apply formatting
          • Switch to HTML view to see/edit the raw code
          • Changes in HTML view will be reflected when you switch back to the editor
        </p>
      </div>
    </div>
  );
};

export default HTMLEditor;

