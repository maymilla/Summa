"use client";

import Header from "../../components/Header";
import TopicListItem from "../../components/TopicListItem";
import FeaturedTopic from "../../components/FeaturedTopic";
import { useState, useEffect } from "react";

interface Topic {
  idtopic: number;
  judul: string;
  desc: string;
}

export default function ExplorePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [featuredTopics, setFeaturedTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
          setFeaturedTopics(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);
  return (
    <div className="min-h-screen w-full font-sans" style={{ background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)" }}>
      <Header />

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Explore topics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 p-15px">
          {/* Left Column: List of Topics */}
          <div className="lg:col-span-3 flex flex-col space-y-5 p-5">
            {topics.map((topic) => (
              <TopicListItem
                key={topic.idtopic.toString()}
                topic={{
                  id: topic.idtopic,
                  title: topic.judul,
                  description: topic.desc,
                  perspectives: []
                }}
              />
            ))}
          </div>

          {/* Right Column: Featured Topic Carousel */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <FeaturedTopic items={featuredTopics.map(topic => ({
              id: topic.idtopic,
              title: topic.judul,
              description: topic.desc
            }))} />
          </div>
        </div>
      </main>
    </div>
  );
}
