
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  doctorName?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ doctorName = "Dr. User", className }) => {
  return (
    <header className={cn(
      "w-full bg-gradient-to-r from-red-400 via-fuchsia-500 to-purple-500 py-5",
      className
    )}>
      <div className="container mx-auto px-4 flex justify-center items-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Smart<span className="text-black">Labs</span><span className="italic font-bold">i</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
