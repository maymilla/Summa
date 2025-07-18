import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="gradient-bg">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
