
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  doctorName: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ doctorName, className }) => {
  return (
    <header className={cn(
      "w-full bg-white border-b border-border sticky top-0 z-50 shadow-sm",
      "animate-fade-in",
      className
    )}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex-1">
          <h1 className="text-xl font-medium tracking-tight">GP Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-2">
              <span className="text-sm font-medium">
                {doctorName.split(' ').map(name => name[0]).join('')}
              </span>
            </div>
            <span className="font-medium">{doctorName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
