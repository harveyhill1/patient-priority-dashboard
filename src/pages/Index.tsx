
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PriorityColumn from '@/components/PriorityColumn';
import { PatientData } from '@/lib/types';

const MOCK_PATIENT_DATA: PatientData[] = [
  // Urgent patients
  { id: "1", name: "Patient 1", hemoglobin: 5.9, potassium: 6.2, priority: "urgent" },
  { id: "2", name: "Patient 2", hemoglobin: 7.1, potassium: 6.0, priority: "urgent" },
  { id: "3", name: "Patient 3", hemoglobin: 6.8, potassium: 6.3, priority: "urgent" },
  { id: "4", name: "Patient 4", hemoglobin: 5.5, potassium: 6.1, priority: "urgent" },
  { id: "5", name: "Patient 5", hemoglobin: 4.9, potassium: 6.5, priority: "urgent" },
  
  // Amber patients
  { id: "6", name: "Patient 6", hemoglobin: 9.5, potassium: 5.4, priority: "amber" },
  { id: "7", name: "Patient 7", hemoglobin: 10.2, potassium: 5.1, priority: "amber" },
  { id: "8", name: "Patient 8", hemoglobin: 8.9, potassium: 5.5, priority: "amber" },
  { id: "9", name: "Patient 9", hemoglobin: 10.6, potassium: 5.3, priority: "amber" },
  { id: "10", name: "Patient 10", hemoglobin: 9.9, potassium: 5.6, priority: "amber" },
  
  // Green patients
  { id: "11", name: "Patient 11", hemoglobin: 13.5, potassium: 4.2, priority: "success" },
  { id: "12", name: "Patient 12", hemoglobin: 14.1, potassium: 4.0, priority: "success" },
  { id: "13", name: "Patient 13", hemoglobin: 12.6, potassium: 3.9, priority: "success" },
  { id: "14", name: "Patient 14", hemoglobin: 13.2, potassium: 4.4, priority: "success" },
  { id: "15", name: "Patient 15", hemoglobin: 15.0, potassium: 4.1, priority: "success" },
];

const Index = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPatients(MOCK_PATIENT_DATA);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const urgentPatients = patients.filter(p => p.priority === 'urgent');
  const amberPatients = patients.filter(p => p.priority === 'amber');
  const successPatients = patients.filter(p => p.priority === 'success');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header doctorName="Dr. Smith" />
      
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 md:py-8">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading patient data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PriorityColumn priority="urgent" patients={urgentPatients} />
            <PriorityColumn priority="amber" patients={amberPatients} />
            <PriorityColumn priority="success" patients={successPatients} />
          </div>
        )}
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          GP Dashboard &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
