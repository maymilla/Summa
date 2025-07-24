"use client";

import Header from "../../components/Header";
import TopicCard from "../../components/TopicCard";
import { useState, useEffect } from "react";

interface Topic {
  idtopic: number;
  judul: string;
  desc: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const isSearching = searchQuery.trim() !== "";

  const calculateSimilarity = (topic: Topic, query: string): number => {
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(term => term.length > 1);
    if (searchTerms.length === 0) return 0;
    
    const titleLower = topic.judul.toLowerCase();
    const descLower = topic.desc.toLowerCase();
    const titleWords = titleLower.split(/\s+/);
    const descWords = descLower.split(/\s+/);
    
    let score = 0;
    
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += term.length > 3 ? 15 : 10;
      }
      
      if (descLower.includes(term)) {
        score += term.length > 3 ? 8 : 5;
      }
      
      titleWords.forEach(word => {
        if (word === term) score += 12;
        else if (word.includes(term) && term.length > 2) score += 6;
        else if (term.includes(word) && word.length > 2) score += 4;
      });
      
        
      descWords.forEach(word => {
        if (word === term) score += 6;
        else if (word.includes(term) && term.length > 2) score += 2;        else if (term.includes(word) && word.length > 2) score += 1;
      });
    });
    
    const matchedTerms = searchTerms.filter(term => 
      titleLower.includes(term) || descLower.includes(term)
    );
    if (matchedTerms.length > 1) {
      score += matchedTerms.length * 5;
    }
    
    return score;
  };

  const filteredTopics = isSearching
    ? topics
        .map(topic => ({
          topic,
          similarity: calculateSimilarity(topic, searchQuery)
        }))
        .filter(item => item.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3) 
        .map(item => item.topic)
    : []; 

  return (
    <div
      className="min-h-screen w-full flex flex-col smooth-transition"
      style={{
        background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)",
      }}
    >
      {/* Header */}
      <Header />

      {/* Search Container */}
      <div
        className={`w-full transition-all duration-500 ease-in-out ${
          isSearching
            ? "pt-10 pb-0 px-4" 
            : "flex-grow flex items-center justify-center px-4" 
        }`}
      >

        <div className="relative w-full max-w-[603px] mx-auto">
          <div className={`w-full flex flex-col smooth-transition text-black text-3xl justify-center pt-8 px-4 text-center p-10`}>
            <h2>Discover diverse perspectives.</h2>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full h-[40px] px-[22px] bg-white py-2 rounded-full opacity-80 shadow-lg border-none outline-none text-black text-sm font-normal transition-all duration-300 ease-in-out hover:opacity-100 hover:shadow-xl focus:opacity-100 focus:shadow-xl focus:border-none focus:outline-none focus:ring-0"
            style={{ border: 'none', outline: 'none' }}
          />
        </div>
      </div>

      {/* Topic Cards Results */}
      {isSearching && (
        <div className="flex-grow flex items-center justify-center px-4 pb-8 animate-fade-in">
          <div className="w-full max-w-fit">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic, index) => (
                  <div 
                    key={topic.idtopic} 
                    className="animate-slide-up smooth-transition relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TopicCard
                      id={topic.idtopic}
                      title={topic.judul}
                      description={topic.desc}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-600 py-8 animate-fade-in">
                  <h3 className="text-lg font-semibold">No similar topics found</h3>
                  <p>Try different keywords to find topics related to your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}