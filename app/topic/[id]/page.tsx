"use client";

import { use, useState, useEffect } from "react";
import Header from "../../../components/Header";
import PerspectiveCard from "../../../components/PerspectiveCard";
import CommunityNote from "../../../components/CommunityNote";
import Loader from "../../../components/Loader";

interface TopicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Perspective {
  idpers: number;
  content: string;
}

interface CommunityNote {
  idcomm: number;
  idpers: number;
  notes: string;
  userEmail: string;
}

interface Source {
  idsource: number;
  idpers: number;
  sources: string;
}

interface Topic {
  idtopic: number;
  judul: string;
  desc: string;
  perspectives: Perspective[];
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [communityNotes, setCommunityNotes] = useState<CommunityNote[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const topicResponse = await fetch(`/api/topics/${id}`);
        if (!topicResponse.ok) {
          throw new Error('Topic not found');
        }
        const topicData = await topicResponse.json();
        setTopic(topicData);

        const commResponse = await fetch('/api/comm');
        if (commResponse.ok) {
          const commData = await commResponse.json();
          const topicComms = commData.filter((comm: CommunityNote) => 
            topicData.perspectives.some((p: Perspective) => p.idpers === comm.idpers)
          );
          setCommunityNotes(topicComms);
        }

        const sourcesResponse = await fetch('/api/sources');
        if (sourcesResponse.ok) {
          const sourcesData = await sourcesResponse.json();
          const topicSources = sourcesData.filter((source: Source) => 
            topicData.perspectives.some((p: Perspective) => p.idpers === source.idpers)
          );
          setSources(topicSources);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center smooth-transition"
        style={{
          background: "linear-gradient(180deg, #E2F1FF 0%, #F7F1FF 100%)",
        }}
      >
        <div className="animate-fade-in">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center smooth-transition">
        <div className="animate-fade-in">
          <p className="text-xl text-gray-500">{error || 'Topic not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg smooth-transition">
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="container-responsive py-8 pb-16 animate-fade-in">
        {/* Main Title */}
        <div className="mb-8 px-4 animate-slide-down">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-black leading-normal text-left">
            {topic.judul}
          </h1>
        </div>

        {/* Perspective Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 justify-items-center">
          {topic.perspectives.map((perspective, index) => {
            const colors = ['rgb(250, 210, 246)', 'rgb(220, 204, 255)', 'rgb(196, 226, 255)'];
            const perspectiveSources = sources.filter(source => source.idpers === perspective.idpers);
            return (
              <div 
                key={perspective.idpers}
                className="animate-slide-up smooth-transition"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <PerspectiveCard
                  title={`Perspective ${perspective.idpers}`}
                  content={perspective.content}
                  sourcesColor={colors[index % colors.length]}
                  sources={perspectiveSources.map(source => source.sources)}
                />
              </div>
            );
          })}
        </div>

        {/* Community Notes Section */}
        <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg sm:text-xl font-bold text-black text-left mb-6 px-4">
            Community Notes
          </h2>
          
          {/* Community Note Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
            {communityNotes.map((note, index) => (
              <div 
                key={note.idcomm}
                className="animate-slide-up smooth-transition"
                style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
              >
                <CommunityNote
                  content={note.notes}
                  sources={[]}
                  colorCycle={index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
