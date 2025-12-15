
import React from 'react';

interface MemoDisplayProps {
  memoContent: string;
}

const parseMarkdown = (content: string): React.ReactNode[] => {
  const sections = content.split('## ').filter(section => section.trim() !== '');

  return sections.map((section, index) => {
    const lines = section.split('\n').filter(line => line.trim() !== '');
    const title = lines.shift() || '';
    
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    lines.forEach((line) => {
      const isListItem = line.startsWith('- ');
      
      if (isListItem) {
        listItems.push(line.substring(2));
      } else {
        if (listItems.length > 0) {
          elements.push(
            <ul key={`ul-${index}-${elements.length}`} className="list-disc list-inside pl-2 space-y-1">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100 font-medium">$1</strong>') }} />
              ))}
            </ul>
          );
          listItems = [];
        }
        elements.push(<p key={`p-${index}-${elements.length}`} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100 font-medium">$1</strong>') }} />);
      }
    });

    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${index}-last`} className="list-disc list-inside pl-2 space-y-1">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100 font-medium">$1</strong>') }} />
          ))}
        </ul>
      );
    }

    return (
      <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 border-b border-gray-600 pb-2">{title}</h3>
        <div className="space-y-4 text-gray-300 prose prose-invert prose-sm md:prose-base max-w-none">
          {elements}
        </div>
      </div>
    );
  });
};

export const MemoDisplay: React.FC<MemoDisplayProps> = ({ memoContent }) => {
  const parsedContent = parseMarkdown(memoContent);

  return (
    <div id="memo-display" className="space-y-8">
      {parsedContent}
    </div>
  );
};
