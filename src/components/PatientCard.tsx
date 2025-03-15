import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PatientData, PriorityLevel, getFactorLabel, severeMentalIllnessSnomedCodes } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, Check, Send, Bell, UserRound, Calendar, Hash, AlertTriangle, MessageSquare, PhoneCall } from 'lucide-react';
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
  const [showMessagePreview, setShowMessagePreview] = useState(false);
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

  const getAIClinicalSummary = (patient: PatientData): string => {
    if (patient.priority === 'urgent') {
      if (patient.factors.includes('age') && patient.factors.includes('frailty')) {
        return "Last admission (03/2024): Fall resulting in hip fracture. Recent clinic letter notes declining mobility and increased frailty. Currently on 5 medications including blood pressure medication which may contribute to current results.";
      } else if (patient.factors.includes('severe-mental-illness')) {
        return "Last admission (01/2024): Acute psychotic episode requiring stabilization. Clinic letter indicates poor medication compliance. Periodic monitoring of blood levels recommended due to lithium therapy.";
      } else if (patient.factors.includes('learning-disability')) {
        return "No recent admissions. Clinic letter from LD team (02/2024) notes difficulties with medication adherence. Caregiver reports reduced oral intake over past 2 weeks.";
      } else {
        return "Last admission (11/2023): GI bleed requiring 2 units transfusion. Clinic follow-up showed improvement but incomplete recovery. Recent reports of fatigue and shortness of breath.";
      }
    } else if (patient.priority === 'amber') {
      if (patient.factors.includes('severe-mental-illness')) {
        return "Last psychiatry review (01/2024): Stable on current medication regimen. Blood work monitoring due to antipsychotic therapy. Weight gain and metabolic concerns noted at last visit.";
      } else if (patient.factors.includes('learning-disability')) {
        return "Annual health check (02/2024): Generally stable. Support worker reports good compliance with vitamin supplements. Previous issues with iron deficiency noted, but improved with supplements.";
      } else if (patient.factors.includes('age') || patient.factors.includes('frailty')) {
        return "Geriatric assessment (12/2023): Mild cognitive impairment, living independently with support. Previous history of falls. Recent changes to medication regimen to address hypertension.";
      } else {
        return "Routine check-up (01/2024): Previously healthy with no significant medical history. Recent reports of increased fatigue. Blood tests ordered to investigate anemia suggested by pale conjunctiva.";
      }
    } else {
      if (patient.factors.length > 0) {
        return "Recent clinic appointment (02/2024): All chronic conditions well-managed. No reported concerns. Current medication regimen appears effective with good compliance reported.";
      } else {
        return "Routine physical (03/2024): Generally healthy with no significant medical history. Recent lifestyle changes include improved diet and exercise routine. No reported concerns.";
      }
    }
  };

  const handleAlertPatient = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAlertSent(true);
    
    toast({
      title: "Alert sent",
      description: `Emergency alert sent to ${patient.name}`,
      variant: "destructive",
    });
    
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
    e.stopPropagation();
    setConfirmed(true);
    
    toast({
      title: "Marked as read",
      description: `${patient.name}'s results confirmed as read`,
      variant: "default",
    });
  };

  const handlePredictAndBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppointmentBooked(true);
    
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
    
    setTimeout(() => {
      setPatientResponded(true);
      toast({
        title: "Appointment confirmed",
        description: `${patient.name} confirmed appointment for ${formattedDate}`,
        variant: "default",
      });
    }, 3000);
  };

  const toggleMessagePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessagePreview(!showMessagePreview);
  };

  const getMessageContent = () => {
    const hasVulnerabilityFactors = patient.factors.length > 0;
    
    if (patient.priority === 'urgent') {
      return {
        method: 'Phone Call',
        icon: <PhoneCall className="h-4 w-4 mr-1" />,
        message: "Your blood test has come back. Your blood result is low. You need to go to A&E immediately. Please confirm you have received and understood this message."
      };
    } else if (patient.priority === 'amber') {
      if (hasVulnerabilityFactors) {
        return {
          method: 'Phone Call',
          icon: <PhoneCall className="h-4 w-4 mr-1" />,
          message: "Your recent blood test shows some abnormal results that require attention. We recommend you schedule an appointment with your GP within the next few days. Would you like us to arrange this for you?"
        };
      } else {
        return {
          method: 'SMS',
          icon: <MessageSquare className="h-4 w-4 mr-1" />,
          message: "Your recent blood test shows mild abnormalities. Please schedule a follow-up appointment in the next few weeks. Reply YES to confirm receipt of this message."
        };
      }
    } else { // success priority
      if (hasVulnerabilityFactors) {
        return {
          method: 'Phone Call',
          icon: <PhoneCall className="h-4 w-4 mr-1" />,
          message: "Your blood test results are normal. For optimal health, we recommend taking vitamin D supplements available from your local pharmacy. Would you like more information about this?"
        };
      } else {
        return {
          method: 'Information Leaflet',
          icon: <MessageSquare className="h-4 w-4 mr-1" />,
          message: "Your blood test results are normal. For optimal health, consider checking your ferritin and vitamin D levels which can be done at your local pharmacy. You can purchase supplements over the counter if needed."
        };
      }
    }
  };

  const messageContent = getMessageContent();
  
  const renderActionButton = () => {
    switch (patient.priority) {
      case 'urgent':
        return (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
                showMessagePreview ? "bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              )}
              onClick={toggleMessagePreview}
              title="Preview message"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Preview message</span>
            </button>
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
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
          </div>
        );
      case 'amber':
        return (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
                showMessagePreview ? "bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              )}
              onClick={toggleMessagePreview}
              title="Preview message"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Preview message</span>
            </button>
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
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
          </div>
        );
      case 'success':
        return (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
                showMessagePreview ? "bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              )}
              onClick={toggleMessagePreview}
              title="Preview message"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Preview message</span>
            </button>
            <button
              className={cn(
                "p-1.5 rounded-md transition-all",
                confirmed ? "bg-gray-200 text-gray-500" : "bg-success/20 text-success hover:bg-success/30"
              )}
              onClick={handleConfirmAsRead}
              disabled={confirmed}
              title="Confirm as read"
            >
              {confirmed ? <Check className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              <span className="sr-only">Confirm as read</span>
            </button>
          </div>
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
        className,
        "relative"
      )}
      style={{
        animationDelay: `${Math.random() * 0.3}s`
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {renderActionButton()}
      
      {showMessagePreview && (
        <div 
          className="fixed inset-0 w-full h-full z-50 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowMessagePreview(false);
          }}
        >
          <div className="absolute inset-0 bg-black/20" aria-hidden="true"></div>
          <div 
            className="relative bg-white shadow-lg rounded-lg border border-gray-200 p-6 w-full max-w-md m-4 text-sm animate-in fade-in-0 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {patient.priority === 'urgent' ? (
                  <AlertTriangle className="h-5 w-5 text-urgent" />
                ) : patient.priority === 'amber' ? (
                  <Bell className="h-5 w-5 text-amber" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-success" />
                )}
                <h3 className="text-lg font-semibold">Communication Preview</h3>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowMessagePreview(false)}
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Patient: <span className="font-medium text-gray-900">{patient.name}</span></p>
              <p className="text-sm text-gray-500">ID: <span className="font-medium text-gray-900">{patient.patientId}</span></p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Method</h4>
              <div className="flex items-center gap-2 mb-1">
                {messageContent.icon}
                <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-slate-100 text-slate-800">
                  {messageContent.method}
                </span>
              </div>
              {patient.factors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <p className="text-xs text-amber-600 mb-1">Due to patient vulnerability factors:</p>
                  {patient.factors.map((factor) => (
                    <span 
                      key={factor}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800"
                    >
                      {getFactorLabel(factor)}
                      {factor === 'severe-mental-illness' && (
                        <span className="ml-1 text-xs text-gray-500">
                          SNOMED: {Object.values(severeMentalIllnessSnomedCodes)[0]}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message Content</h4>
              <div className={cn(
                "p-4 rounded border text-sm",
                patient.priority === 'urgent' ? "bg-urgent/5 border-urgent/20" : 
                patient.priority === 'amber' ? "bg-amber/5 border-amber/20" : 
                "bg-success/5 border-success/20"
              )}>
                <p>{messageContent.message}</p>
              </div>
            </div>
            
            <button 
              className={cn(
                "w-full py-2.5 px-4 rounded-md text-sm font-medium text-white",
                patient.priority === 'urgent' 
                  ? "bg-urgent hover:bg-urgent/90" 
                  : patient.priority === 'amber'
                  ? "bg-amber hover:bg-amber/90"
                  : "bg-success hover:bg-success/90"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (patient.priority === 'urgent') {
                  handleAlertPatient(e);
                } else if (patient.priority === 'amber') {
                  handlePredictAndBook(e);
                } else {
                  handleConfirmAsRead(e);
                }
                setShowMessagePreview(false);
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                <span>Send Communication Now</span>
              </div>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3 pr-8">
        <div>
          <h3 className="text-base font-semibold">{patient.name}</h3>
          <div className="flex flex-col gap-1 mt-1 text-xs text-foreground/70">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>DOB: {patient.dateOfBirth}</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>ID: {patient.patientId}</span>
            </div>
          </div>
        </div>
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

      {patient.factors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {patient.factors.map((factor) => (
            <span 
              key={factor}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {getFactorLabel(factor)}
              {factor === 'severe-mental-illness' && (
                <span className="ml-1 text-xs text-gray-500">
                  [SNOMED: {Object.values(severeMentalIllnessSnomedCodes)[0]}]
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-4 pt-4 border-t border-foreground/10 animate-fade-in">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              AI Clinical Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {getAIClinicalSummary(patient)}
            </p>
          </div>
          
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
          
          {patient.factors.includes('severe-mental-illness') && (
            <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-md">
              <h5 className="text-sm font-medium text-slate-800 mb-1">SNOMED Codes - Severe Mental Illness</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(severeMentalIllnessSnomedCodes).map(([condition, code]) => (
                  <div key={condition} className="flex justify-between">
                    <span className="capitalize">{condition.replace('-', ' ')}</span>
                    <span className="font-mono">{code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
