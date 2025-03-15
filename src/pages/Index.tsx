import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PriorityColumn from '@/components/PriorityColumn';
import { PatientData, PriorityLevel, FactorTag } from '@/lib/types';
import { Filter, SlidersHorizontal } from 'lucide-react';

// Random names for more realistic data
const MOCK_PATIENT_DATA: PatientData[] = [
  // Urgent patients
  { 
    id: "1", 
    name: "Sarah Johnson", 
    patientId: "PTN-73621",
    dateOfBirth: "12/05/1948", 
    hemoglobin: 5.9, 
    potassium: 6.2, 
    priority: "urgent",
    factors: ["age", "frailty"] 
  },
  { 
    id: "2", 
    name: "Michael Chen", 
    patientId: "PTN-45982",
    dateOfBirth: "23/11/1985", 
    hemoglobin: 7.1, 
    potassium: 6.0, 
    priority: "urgent",
    factors: ["severe-mental-illness"] 
  },
  { 
    id: "3", 
    name: "Emma Davis", 
    patientId: "PTN-29374",
    dateOfBirth: "04/08/1992", 
    hemoglobin: 6.8, 
    potassium: 6.3, 
    priority: "urgent",
    factors: ["learning-disability"] 
  },
  { 
    id: "4", 
    name: "Robert Williams", 
    patientId: "PTN-61845",
    dateOfBirth: "15/03/1975", 
    hemoglobin: 5.5, 
    potassium: 6.1, 
    priority: "urgent",
    factors: [] 
  },
  { 
    id: "5", 
    name: "Margaret Taylor", 
    patientId: "PTN-38246",
    dateOfBirth: "30/01/1942", 
    hemoglobin: 4.9, 
    potassium: 6.5, 
    priority: "urgent",
    factors: ["age", "care-home"] 
  },
  
  // Amber patients
  { 
    id: "6", 
    name: "David Brown", 
    patientId: "PTN-58291",
    dateOfBirth: "19/07/1964", 
    hemoglobin: 9.5, 
    potassium: 5.4, 
    priority: "amber",
    factors: [] 
  },
  { 
    id: "7", 
    name: "Jennifer Lee", 
    patientId: "PTN-13579",
    dateOfBirth: "02/12/1980", 
    hemoglobin: 10.2, 
    potassium: 5.1, 
    priority: "amber",
    factors: ["severe-mental-illness"] 
  },
  { 
    id: "8", 
    name: "Thomas Wilson", 
    patientId: "PTN-24680",
    dateOfBirth: "27/09/1990", 
    hemoglobin: 8.9, 
    potassium: 5.5, 
    priority: "amber",
    factors: ["learning-disability"] 
  },
  { 
    id: "9", 
    name: "Elizabeth Martinez", 
    patientId: "PTN-97531",
    dateOfBirth: "08/06/1971", 
    hemoglobin: 10.6, 
    potassium: 5.3, 
    priority: "amber",
    factors: [] 
  },
  { 
    id: "10", 
    name: "Richard Thompson", 
    patientId: "PTN-86420",
    dateOfBirth: "14/04/1939", 
    hemoglobin: 9.9, 
    potassium: 5.6, 
    priority: "amber",
    factors: ["age", "frailty"] 
  },
  
  // Green patients
  { 
    id: "11", 
    name: "Susan Moore", 
    patientId: "PTN-75319",
    dateOfBirth: "21/10/1988", 
    hemoglobin: 13.5, 
    potassium: 4.2, 
    priority: "success",
    factors: [] 
  },
  { 
    id: "12", 
    name: "James Anderson", 
    patientId: "PTN-42687",
    dateOfBirth: "17/02/1976", 
    hemoglobin: 14.1, 
    potassium: 4.0, 
    priority: "success",
    factors: [] 
  },
  { 
    id: "13", 
    name: "Patricia Garcia", 
    patientId: "PTN-91374",
    dateOfBirth: "05/05/1982", 
    hemoglobin: 12.6, 
    potassium: 3.9, 
    priority: "success",
    factors: [] 
  },
  { 
    id: "14", 
    name: "John Smith", 
    patientId: "PTN-57138",
    dateOfBirth: "29/08/1945", 
    hemoglobin: 13.2, 
    potassium: 4.4, 
    priority: "success",
    factors: ["age", "care-home"] 
  },
  { 
    id: "15", 
    name: "Mary Johnson", 
    patientId: "PTN-28465",
    dateOfBirth: "11/11/1994", 
    hemoglobin: 15.0, 
    potassium: 4.1, 
    priority: "success",
    factors: ["learning-disability"] 
  },
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
    <div className="min-h-screen bg-gradient-to-r from-red-400 via-fuchsia-500 to-purple-500 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto pt-6 pb-10 px-4 md:px-6 md:pt-8">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto"></div>
              <p className="text-white">Loading patient data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center items-start md:items-center animate-fade-in">
              {/* Priority filters */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-md">
                <div className="flex items-center gap-1 mx-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Priority:</span>
                </div>
                
                <button 
                  onClick={() => togglePriorityFilter('urgent')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    priorityFilters.includes('urgent') 
                      ? 'bg-red-200 text-red-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Critical
                </button>
                
                <button 
                  onClick={() => togglePriorityFilter('amber')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    priorityFilters.includes('amber') 
                      ? 'bg-amber-200 text-amber-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Abnormal
                </button>
                
                <button 
                  onClick={() => togglePriorityFilter('success')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    priorityFilters.includes('success') 
                      ? 'bg-green-200 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Normal
                </button>
              </div>
              
              {/* Blood test type filter */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-md">
                <div className="flex items-center gap-1 mx-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Test Type:</span>
                </div>
                
                <button 
                  onClick={() => setBloodTestFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    bloodTestFilter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  All
                </button>
                
                <button 
                  onClick={() => setBloodTestFilter('hemoglobin')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    bloodTestFilter === 'hemoglobin' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Hemoglobin (Hb)
                </button>
                
                <button 
                  onClick={() => setBloodTestFilter('potassium')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    bloodTestFilter === 'potassium' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-500'
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
                <div className="col-span-3 text-center py-12 bg-white/80 rounded-lg">
                  <p className="text-gray-600">No patients match the selected filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="py-4 text-center text-sm text-white/70">
        <div className="container">
          SmartLabsi &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
