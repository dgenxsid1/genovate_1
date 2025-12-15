
import React, { useState, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface LoanAnalysisFormProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export const LoanAnalysisForm: React.FC<LoanAnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && (selectedFile.type === 'text/plain' || selectedFile.type === 'text/csv' || selectedFile.type === 'text/markdown')) {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert('Please upload a valid file type: .txt, .csv, or .md');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (inputType === 'upload' && file) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const content = readEvent.target?.result as string;
        if (content.trim()) onSubmit(content);
      };
      reader.readAsText(file);
    } else if (inputType === 'text' && textInput.trim()) {
      onSubmit(textInput);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isSubmitDisabled = isLoading || (inputType === 'upload' && !file) || (inputType === 'text' && !textInput.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex border-b border-gray-700">
        <button type="button" onClick={() => setInputType('upload')} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${inputType === 'upload' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
          Upload File
        </button>
        <button type="button" onClick={() => setInputType('text')} className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${inputType === 'text' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>
          Enter Text
        </button>
      </div>

      <div className="pt-2 min-h-[150px]">
        {inputType === 'upload' && (
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${isDragging ? 'border-cyan-500 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-600'}`}
              onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" accept=".txt,.csv,.md" disabled={isLoading} />
              <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                <DocumentArrowUpIcon className="h-10 w-10" />
                <p className="font-semibold text-gray-300">Drag & drop your data file here</p>
                <p className="text-sm">or click to browse</p>
              </div>
            </div>
            {file && (
              <div className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <p className="text-sm text-gray-300 truncate px-2">{file.name}</p>
                <button type="button" onClick={clearFile} disabled={isLoading} className="p-1 text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {inputType === 'text' && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter property details here. Include address (e.g., 123 Main St, Anytown, ST 12345), property type, size, price, etc."
            className="w-full h-40 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
            aria-label="Property Information Text Input"
            disabled={isLoading}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <SparklesIcon className="h-5 w-5" />
        <span>{isLoading ? 'Analyzing...' : 'Generate Memo'}</span>
      </button>
    </form>
  );
};
