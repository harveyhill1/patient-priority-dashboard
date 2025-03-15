
import React from 'react';
import { cn } from '@/lib/utils';
import { PatientData, PriorityLevel, getColorByPriority, getLabelByPriority } from '@/lib/types';
import PatientCard from './PatientCard';

interface PriorityColumnProps {
  priority: PriorityLevel;
  patients: PatientData[];
  className?: string;
}

const PriorityColumn: React.FC<PriorityColumnProps> = ({ 
  priority, 
  patients,
  className
}) => {
  const getBackgroundColor = () => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100';
      case 'amber':
        return 'bg-amber-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-white';
    }
  };
  
  const getTitleColor = () => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700';
      case 'amber':
        return 'text-amber-700';
      case 'success':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  const getBadgeColor = () => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-200 text-red-700';
      case 'amber':
        return 'bg-amber-200 text-amber-700';
      case 'success':
        return 'bg-green-200 text-green-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col w-full rounded-3xl shadow-md overflow-hidden",
        getBackgroundColor(),
        "transition-all duration-500 ease-in-out",
        "animate-fade-in",
        className
      )}
      style={{
        animationDelay: `${priority === 'urgent' ? 0 : priority === 'amber' ? 0.1 : 0.2}s`
      }}
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className={cn("text-xl font-semibold", getTitleColor())}>
          {priority === 'urgent' ? 'Urgent' : priority === 'amber' ? 'Abnormal' : 'Green'}
        </h2>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium",
          getBadgeColor()
        )}>
          {patients.length} patients
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh]">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No patients in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityColumn;
