import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface User {
  email: string;
  nama: string;
}

export default function Header() {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if we have a session cookie first
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsProfileOpen(false);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
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
          className={`inline-flex items-center justify-center px-3 py-1.5 text-sm sm:text-base font-normal rounded-[20px] whitespace-nowrap transition-colors ${
            pathname === '/search' 
              ? 'bg-black text-white' 
              : 'bg-transparent text-black'
          }`}
        >
          search
        </Link>
        <Link
          href="/explore"
          className={`inline-flex items-center justify-center px-3 py-1.5 text-sm sm:text-base font-normal rounded-[20px] whitespace-nowrap transition-colors ${
            pathname === '/explore' 
              ? 'bg-black text-white' 
              : 'bg-transparent text-black'
          }`}
        >
          explore
        </Link>
      </div>

      {/* Profile Avatar */}
      <div className="relative ml-auto" ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-[#D9D9D9] rounded-full flex-shrink-0 hover:bg-gray-300 transition-colors focus:outline-none"
        />
        
        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-[20px] shadow-lg border border-gray-100 py-4 px-5 z-50">
            {/* User Info */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-black mb-1">
                {user?.nama || "Guest User"}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.email || "guest@example.com"}
              </p>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-[16px] transition-colors focus:outline-0 focus:ring-2 focus:ring-black focus:ring-opacity-20"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}