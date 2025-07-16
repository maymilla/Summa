"use client";

import { use, useState, useEffect } from "react";
import Header from "../../../components/Header";
import PerspectiveCard from "../../../components/PerspectiveCard";
import CommunityNote from "../../../components/CommunityNote";

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
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-xl text-gray-500">{error || 'Topic not found'}</p>
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="container-responsive py-8 pb-16">
        {/* Main Title */}
        <div className="mb-8 px-4">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-black leading-normal text-left">
            {topic.judul}
          </h1>
        </div>

        {/* Perspective Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 justify-items-center">
          {topic.perspectives.map((perspective, index) => {
            const colors = ['#B965B0', '#22C55E', '#3B82F6'];
            const perspectiveSources = sources.filter(source => source.idpers === perspective.idpers);
            return (
              <PerspectiveCard
                key={perspective.idpers}
                title={`Perspective ${perspective.idpers}`}
                content={perspective.content}
                sourcesColor={colors[index % colors.length]}
                sources={perspectiveSources.map(source => source.sources)}
              />
            );
          })}
        </div>

        {/* Community Notes Section */}
        <div className="mb-16">
          <h2 className="text-lg sm:text-xl font-bold text-black text-left mb-6 px-4">
            Community Notes
          </h2>
          
          {/* Community Note Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
            {communityNotes.map((note, index) => (
              <CommunityNote
                key={note.idcomm}
                content={note.notes}
                sources={[]}
                colorCycle={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
