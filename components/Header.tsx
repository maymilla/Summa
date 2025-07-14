import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center w-full px-4 sm:px-7 pt-5 pb-6 relative min-w-[320px]">
      {/* Logo */}
      <Link href="/search" className="text-xl sm:text-2xl font-bold text-black flex-shrink-0">
        Summa
      </Link>

      {/* Navigation */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:gap-8">
        <Link
          href="/search"
          className="inline-flex items-center justify-center px-3 py-1.5 bg-black text-white text-sm sm:text-base font-normal rounded-[20px] whitespace-nowrap"
        >
          search
        </Link>
        <button 
          className="inline-flex items-center justify-center px-3 py-1.5 text-black text-sm sm:text-base font-normal relative group whitespace-nowrap"
          title="Coming soon!"
        >
          explore
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            Coming soon!
          </div>
        </button>
      </div>

      {/* Profile Avatar */}
      <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-[#D9D9D9] rounded-full flex-shrink-0 ml-auto"></div>
    </header>
  );
}
