
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PatientData, PriorityLevel } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, Check, Send, Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PatientCardProps {
  patient: PatientData;
  className?: string;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, className }) => {
  const [expanded, setExpanded] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [patientResponded, setPatientResponded] = useState(false);
  const { toast } = useToast();

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

  const handleAlertPatient = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setAlertSent(true);
    
    toast({
      title: "Alert sent",
      description: `Emergency alert sent to ${patient.name}`,
      variant: "destructive",
    });
    
    // Simulate patient responding after 3 seconds
    setTimeout(() => {
      setPatientResponded(true);
      toast({
        title: "Patient responded",
        description: `${patient.name} has confirmed receipt with 'YES'`,
        variant: "default",
      });
    }, 3000);
  };

  const handleConfirmAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setConfirmed(true);
    
    toast({
      title: "Marked as read",
      description: `${patient.name}'s results confirmed as read`,
      variant: "default",
    });
  };

  const handlePredictAndBook = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setAppointmentBooked(true);
    
    // Calculate next appointment date (1 month from now)
    const nextAppointmentDate = new Date();
    nextAppointmentDate.setMonth(nextAppointmentDate.getMonth() + 1);
    const formattedDate = nextAppointmentDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    toast({
      title: "Appointment scheduled",
      description: `Suggested appointment for ${formattedDate} sent to ${patient.name}`,
      variant: "default",
    });
    
    // Simulate patient responding after 3 seconds
    setTimeout(() => {
      setPatientResponded(true);
      toast({
        title: "Appointment confirmed",
        description: `${patient.name} confirmed appointment for ${formattedDate}`,
        variant: "default",
      });
    }, 3000);
  };

  const renderActionButton = () => {
    switch (patient.priority) {
      case 'urgent':
        return (
          <button
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-md transition-all",
              alertSent ? "bg-gray-200 text-gray-500" : "bg-urgent/20 text-urgent hover:bg-urgent/30"
            )}
            onClick={handleAlertPatient}
            disabled={alertSent}
            title="Alert patient"
          >
            {alertSent ? 
              (patientResponded ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />) : 
              <Send className="h-4 w-4" />
            }
            <span className="sr-only">Alert patient</span>
          </button>
        );
      case 'amber':
        return (
          <button
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-md transition-all",
              appointmentBooked ? "bg-gray-200 text-gray-500" : "bg-amber/20 text-amber hover:bg-amber/30"
            )}
            onClick={handlePredictAndBook}
            disabled={appointmentBooked}
            title="Predict and book"
          >
            {appointmentBooked ? 
              (patientResponded ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />) : 
              <Send className="h-4 w-4" />
            }
            <span className="sr-only">Predict and book</span>
          </button>
        );
      case 'success':
        return (
          <button
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-md transition-all",
              confirmed ? "bg-gray-200 text-gray-500" : "bg-success/20 text-success hover:bg-success/30"
            )}
            onClick={handleConfirmAsRead}
            disabled={confirmed}
            title="Confirm as read"
          >
            {confirmed ? <Check className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <span className="sr-only">Confirm as read</span>
          </button>
        );
      default:
        return null;
    }
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
      {renderActionButton()}
      
      <div className="flex justify-between items-center mb-2 pr-8">
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
          
          {patient.priority === 'urgent' && (
            <div className="mt-4 p-3 bg-urgent/10 border border-urgent/20 rounded-md">
              <h5 className="text-sm font-medium text-urgent mb-1">Emergency Action Required</h5>
              <p className="text-xs text-foreground/80">
                Patient needs immediate medical attention. Send an emergency alert to direct the patient to A&E.
              </p>
              {alertSent && (
                <div className="mt-2 text-xs border-t border-urgent/20 pt-2">
                  <div className="font-medium">Message sent:</div>
                  <p className="italic mt-1">
                    "Your blood test has come back. Your blood result is low. You need to go to A&E immediately. 
                    Please respond YES to confirm you have received and understood."
                  </p>
                  {patientResponded && (
                    <div className="mt-1 text-success font-medium">Patient responded: YES</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {patient.priority === 'amber' && (
            <div className="mt-4 p-3 bg-amber/10 border border-amber/20 rounded-md">
              <h5 className="text-sm font-medium text-amber mb-1">Follow-up Required</h5>
              <p className="text-xs text-foreground/80">
                Based on trend analysis, patient's blood markers are expected to reach critical levels in 4-6 weeks.
                Schedule a follow-up test.
              </p>
              {appointmentBooked && (
                <div className="mt-2 text-xs border-t border-amber/20 pt-2">
                  <div className="font-medium">Message sent:</div>
                  <p className="italic mt-1">
                    "Based on your recent blood test results, we recommend scheduling your next test. 
                    Text YES if you can make your next blood test on 15th April 2025."
                  </p>
                  {patientResponded && (
                    <div className="mt-1 text-success font-medium">Patient confirmed appointment</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {patient.priority === 'success' && (
            <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md">
              <h5 className="text-sm font-medium text-success mb-1">Results Normal</h5>
              <p className="text-xs text-foreground/80">
                All blood test results are within normal ranges. No immediate action required.
              </p>
              {confirmed && (
                <div className="mt-2 text-xs border-t border-success/20 pt-2 text-success">
                  <div className="font-medium">Results confirmed as read</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientCard;
