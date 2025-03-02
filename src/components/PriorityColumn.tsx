
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
  const priorityColor = getColorByPriority(priority);
  const priorityLabel = getLabelByPriority(priority);
  
  return (
    <div 
      className={cn(
        "flex flex-col w-full bg-white rounded-xl shadow-sm border border-border overflow-hidden",
        "transition-all duration-500 ease-in-out",
        "animate-fade-in",
        className
      )}
      style={{
        animationDelay: `${priority === 'urgent' ? 0 : priority === 'amber' ? 0.1 : 0.2}s`
      }}
    >
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b",
        `bg-${priorityColor}/10 text-${priorityColor}`
      )}>
        <h2 className="text-lg font-semibold">{priorityLabel}</h2>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          `bg-${priorityColor}/20 text-${priorityColor}`
        )}>
          {patients.length} patients
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[70vh]">
        {patients.map((patient) => (
          <PatientCard 
            key={patient.id} 
            patient={patient}
          />
        ))}
      </div>
    </div>
  );
};

export default PriorityColumn;
