import * as React from 'react';

type Perspective = {
  id: number;
  title: string;
  content: string;
  sourcesColor: string;
  sources: string[]; // Array of strings
};

type Topic = {
  id: number;
  title: string;
  description: string;
  perspectives: Perspective[];
};

type TopicListItemProps = {
  key: string;
  topic: Topic;
};

const TopicListItem: React.FC<TopicListItemProps> = ({ topic }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-5">
      {/* Image Placeholder */}
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-800">{topic.title}</h3>
        <p className="text-gray-600 text-sm mt-1">{topic.description}</p>
      </div>
    </div>
  );
};

export default TopicListItem;