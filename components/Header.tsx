import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center w-full px-7 pt-5 pb-6 relative">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-black">
        Summa
      </Link>

      {/* Navigation */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-3 py-1.5 bg-black text-white text-m font-normal rounded-[20px]"
        >
          search
        </Link>
        <button 
          className="inline-flex items-center justify-center px-3 py-1.5 text-black text-m font-normal relative group"
          title="Coming soon!"
        >
          explore
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Coming soon!
          </div>
        </button>
      </div>

      {/* Profile Avatar */}
      <div className="w-[50px] h-[50px] bg-[#D9D9D9] rounded-full flex-shrink-0 ml-auto"></div>
    </header>
  );
}
