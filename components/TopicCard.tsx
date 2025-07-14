import Link from "next/link";

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
}

export default function TopicCard({ id, title, description }: TopicCardProps) {
  return (
    <Link href={`/topic/${id}`} className="block">
      <div className="w-[419px] h-[551px] bg-white rounded-[30px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
        {/* Image Container */}
        <div className="flex justify-center items-center p-5">
          <div className="w-[379px] h-[373px] bg-[#D9D9D9] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"></div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <h3 className="text-lg font-bold text-black leading-5 mb-2 h-10 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {title}
          </h3>
          <p className="text-sm text-black font-normal leading-relaxed h-12 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
