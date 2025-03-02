
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PriorityColumn from '@/components/PriorityColumn';
import { PatientData, PriorityLevel } from '@/lib/types';
import { Filter, CircleSlash, AlertCircle, CheckCircle, SlidersHorizontal } from 'lucide-react';

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
  const [priorityFilters, setPriorityFilters] = useState<PriorityLevel[]>(['urgent', 'amber', 'success']);
  const [bloodTestFilter, setBloodTestFilter] = useState<'all' | 'hemoglobin' | 'potassium'>('all');

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
  
  // Filter patients by selected priority and blood test type
  const filteredPatients = patients.filter(patient => {
    // Filter by priority
    if (!priorityFilters.includes(patient.priority)) {
      return false;
    }
    
    // Filter by blood test type
    if (bloodTestFilter === 'hemoglobin') {
      // Hemoglobin filter logic
      if (patient.priority === 'urgent' && patient.hemoglobin >= 8) return false;
      if (patient.priority === 'amber' && (patient.hemoglobin < 8 || patient.hemoglobin >= 11)) return false;
      if (patient.priority === 'success' && patient.hemoglobin < 11) return false;
      return true;
    } else if (bloodTestFilter === 'potassium') {
      // Potassium filter logic
      if (patient.priority === 'urgent' && patient.potassium <= 6.0) return false;
      if (patient.priority === 'amber' && (patient.potassium <= 5.0 || patient.potassium > 6.0)) return false;
      if (patient.priority === 'success' && patient.potassium > 5.0) return false;
      return true;
    }
    
    // If no specific blood test filter is applied, show all
    return true;
  });
  
  const urgentPatients = filteredPatients.filter(p => p.priority === 'urgent');
  const amberPatients = filteredPatients.filter(p => p.priority === 'amber');
  const successPatients = filteredPatients.filter(p => p.priority === 'success');

  const togglePriorityFilter = (priority: PriorityLevel) => {
    setPriorityFilters(prev => {
      if (prev.includes(priority)) {
        // Remove priority if already included
        return prev.filter(p => p !== priority);
      } else {
        // Add priority if not included
        return [...prev, priority];
      }
    });
  };

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
          <>
            {/* Filters section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center animate-fade-in">
              {/* Priority filters */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-1 mr-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Priority:</span>
                </div>
                
                <button 
                  onClick={() => togglePriorityFilter('urgent')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    priorityFilters.includes('urgent') 
                      ? 'bg-urgent/20 text-urgent' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <CircleSlash className="h-4 w-4" />
                  <span>Critical</span>
                </button>
                
                <button 
                  onClick={() => togglePriorityFilter('amber')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    priorityFilters.includes('amber') 
                      ? 'bg-amber/20 text-amber' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Abnormal</span>
                </button>
                
                <button 
                  onClick={() => togglePriorityFilter('success')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    priorityFilters.includes('success') 
                      ? 'bg-success/20 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Normal</span>
                </button>
              </div>
              
              {/* Blood test type filter */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-1 mr-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Test Type:</span>
                </div>
                
                <button 
                  onClick={() => setBloodTestFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    bloodTestFilter === 'all' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  All
                </button>
                
                <button 
                  onClick={() => setBloodTestFilter('hemoglobin')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    bloodTestFilter === 'hemoglobin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Hemoglobin (Hb)
                </button>
                
                <button 
                  onClick={() => setBloodTestFilter('potassium')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    bloodTestFilter === 'potassium' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Potassium (K+)
                </button>
              </div>
            </div>
            
            {/* Patient columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priorityFilters.includes('urgent') && (
                <PriorityColumn 
                  priority="urgent" 
                  patients={urgentPatients} 
                  className={priorityFilters.length < 3 ? "md:col-span-3" : ""}
                />
              )}
              {priorityFilters.includes('amber') && (
                <PriorityColumn 
                  priority="amber" 
                  patients={amberPatients} 
                  className={priorityFilters.length < 3 ? "md:col-span-3" : ""}
                />
              )}
              {priorityFilters.includes('success') && (
                <PriorityColumn 
                  priority="success" 
                  patients={successPatients} 
                  className={priorityFilters.length < 3 ? "md:col-span-3" : ""}
                />
              )}
              
              {filteredPatients.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">No patients match the selected filters</p>
                </div>
              )}
            </div>
          </>
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
