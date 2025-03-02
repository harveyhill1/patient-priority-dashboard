
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PatientData, PriorityLevel } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PatientCardProps {
  patient: PatientData;
  className?: string;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, className }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityClass = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'urgent':
        return 'patient-card-urgent';
      case 'amber':
        return 'patient-card-amber';
      case 'success':
        return 'patient-card-success';
      default:
        return 'patient-card-success';
    }
  };

  const getHemoglobinLabel = (value: number): string => {
    if (value < 8) return 'Very Low';
    if (value < 11) return 'Low';
    return 'Normal';
  };

  const getPotassiumLabel = (value: number): string => {
    if (value > 6.0) return 'High';
    if (value > 5.0) return 'Elevated';
    return 'Normal';
  };

  const renderValueIndicator = (
    value: number, 
    reference: 'hemoglobin' | 'potassium'
  ) => {
    let bgColor = 'bg-success/20';
    let textColor = 'text-success';
    
    if (reference === 'hemoglobin') {
      if (value < 8) {
        bgColor = 'bg-urgent/20';
        textColor = 'text-urgent';
      } else if (value < 11) {
        bgColor = 'bg-amber/20';
        textColor = 'text-amber';
      }
    } else {
      if (value > 6.0) {
        bgColor = 'bg-urgent/20';
        textColor = 'text-urgent';
      } else if (value > 5.0) {
        bgColor = 'bg-amber/20';
        textColor = 'text-amber';
      }
    }
    
    return (
      <span className={cn(
        "text-xs font-medium px-1.5 py-0.5 rounded-full ml-2",
        bgColor,
        textColor
      )}>
        {reference === 'hemoglobin' 
          ? getHemoglobinLabel(value) 
          : getPotassiumLabel(value)
        }
      </span>
    );
  };

  // Mock historical data - in a real app, this would come from an API
  const mockHistoricalData = [
    { date: '6 months ago', hemoglobin: Math.max(patient.hemoglobin - 1.5, 5), potassium: Math.max(patient.potassium - 0.5, 3.5) },
    { date: '3 months ago', hemoglobin: Math.max(patient.hemoglobin - 0.8, 5.5), potassium: Math.max(patient.potassium - 0.3, 3.8) },
    { date: '1 month ago', hemoglobin: patient.hemoglobin - 0.3, potassium: patient.potassium - 0.1 },
    { date: 'Current', hemoglobin: patient.hemoglobin, potassium: patient.potassium },
  ];

  return (
    <div 
      className={cn(
        "patient-card animate-fade-in-up cursor-pointer",
        getPriorityClass(patient.priority),
        expanded && "expanded-card",
        className
      )}
      style={{
        animationDelay: `${Math.random() * 0.3}s`
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold">{patient.name}</h3>
        <div className="text-foreground/60">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-foreground/80">Hb:</span>
            <span className="text-sm font-medium ml-1.5">
              {patient.hemoglobin} g/dL
            </span>
            {renderValueIndicator(patient.hemoglobin, 'hemoglobin')}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-foreground/80">K+:</span>
            <span className="text-sm font-medium ml-1.5">
              {patient.potassium} mmol/L
            </span>
            {renderValueIndicator(patient.potassium, 'potassium')}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-foreground/10 animate-fade-in">
          <h4 className="text-sm font-medium mb-3">Blood Test History</h4>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockHistoricalData}
                margin={{ top: 5, right: 10, left: 0, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left" 
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickCount={5}
                  label={{ 
                    value: 'Hb (g/dL)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 10, textAnchor: 'middle' } 
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right" 
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickCount={5}
                  label={{ 
                    value: 'K+ (mmol/L)', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fontSize: 10, textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: '12px' }}
                  formatter={(value, name) => {
                    if (name === 'hemoglobin') return [`${value} g/dL`, 'Hemoglobin'];
                    if (name === 'potassium') return [`${value} mmol/L`, 'Potassium'];
                    return [value, name];
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="hemoglobin" 
                  stroke="#b91c1c" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  animationDuration={500}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="potassium" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
