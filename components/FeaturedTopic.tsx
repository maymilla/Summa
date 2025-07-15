import { useState } from "react";
import * as React from 'react';

type Topic = {
  id: number;
  title: string;
  description: string;
};

type FeaturedTopicProps = {
  items: Topic[]; 
};

const FeaturedTopic: React.FC<FeaturedTopicProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) {
    return <div>No featured topics available.</div>;
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const currentItem = items[currentIndex];

  return (
    <div className="flex flex-col items-center w-100">
      <div className="relative w-full">
        <div className="w-full h-80 bg-gray-200 rounded-2xl shadow-lg flex items-center justify-center">
          <span className="text-gray-400">Featured Image</span>
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition"
          aria-label="Previous topic"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition"
          aria-label="Next topic"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="text-center mt-6">
        <h2 className="font-bold text-2xl text-gray-800">{currentItem.title}</h2>
        <p className="text-gray-600 mt-2 max-w-md">{currentItem.description}</p>
      </div>
    </div>
  );
};

export default FeaturedTopic;