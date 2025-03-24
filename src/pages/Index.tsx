
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PriorityColumn from '@/components/PriorityColumn';
import { PatientData, PriorityLevel, DataSource } from '@/lib/types';
import { Filter, SlidersHorizontal, Database } from 'lucide-react';
import { fetchPatientData, getDataSourceDisplayName } from '@/services/patientDataService';
import { isAuthenticatedWithEpic, initiateEpicAuthorization, logoutFromEpic } from '@/services/epicFhirService';
import { toast } from 'sonner';

const Index = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilters, setPriorityFilters] = useState<PriorityLevel[]>(['urgent', 'amber', 'success']);
  const [bloodTestFilter, setBloodTestFilter] = useState<'all' | 'hemoglobin' | 'potassium'>('all');
  const [dataSource, setDataSource] = useState<DataSource>('vista');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const { patients: fetchedPatients, actualSource } = await fetchPatientData(dataSource);
        
        if (fetchedPatients.length > 0) {
          setPatients(fetchedPatients);
          
          if (actualSource === dataSource) {
            toast.success(`Successfully loaded data from ${getDataSourceDisplayName(dataSource)}`);
          }
          
          // Update the data source if it was changed (e.g., fallback to mock)
          if (actualSource !== dataSource) {
            setDataSource(actualSource);
          }
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast.error(`Failed to load data from ${getDataSourceDisplayName(dataSource)}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dataSource]);
  
  const filteredPatients = patients.filter(patient => {
    if (!priorityFilters.includes(patient.priority)) {
      return false;
    }
    
    if (bloodTestFilter === 'hemoglobin') {
      if (patient.priority === 'urgent' && patient.hemoglobin >= 8) return false;
      if (patient.priority === 'amber' && (patient.hemoglobin < 8 || patient.hemoglobin >= 11)) return false;
      if (patient.priority === 'success' && patient.hemoglobin < 11) return false;
      return true;
    } else if (bloodTestFilter === 'potassium') {
      if (patient.priority === 'urgent' && patient.potassium <= 6.0) return false;
      if (patient.priority === 'amber' && (patient.potassium <= 5.0 || patient.potassium > 6.0)) return false;
      if (patient.priority === 'success' && patient.potassium > 5.0) return false;
      return true;
    }
    
    return true;
  });
  
  const urgentPatients = filteredPatients.filter(p => p.priority === 'urgent');
  const amberPatients = filteredPatients.filter(p => p.priority === 'amber');
  const successPatients = filteredPatients.filter(p => p.priority === 'success');

  const togglePriorityFilter = (priority: PriorityLevel) => {
    setPriorityFilters(prev => {
      if (prev.includes(priority)) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };

  const getUrgentColumnWidth = () => {
    if (priorityFilters.length === 1 && priorityFilters.includes('urgent')) {
      return "col-span-3"; 
    } 
    else if (priorityFilters.length === 2 && priorityFilters.includes('urgent')) {
      return "col-span-3 md:col-span-[1.5]";
    }
    return "col-span-1";
  };

  const getNonUrgentColumnWidth = () => {
    if (!priorityFilters.includes('urgent') && priorityFilters.length === 2) {
      return "col-span-3 md:col-span-[1.5]";
    }
    else if (priorityFilters.includes('urgent') && priorityFilters.length === 2) {
      return "col-span-3 md:col-span-[1.5]";
    }
    if (priorityFilters.length === 1) {
      return "col-span-3";
    }
    return "col-span-1";
  };

  const handleDataSourceChange = (source: DataSource) => {
    if (source === dataSource) return;
    
    // If switching to Epic, check authentication
    if (source === 'epic' && !isAuthenticatedWithEpic()) {
      // Epic requires OAuth, so initiate the flow
      initiateEpicAuthorization();
      return;
    }
    
    setDataSource(source);
  };

  const handleEpicLogout = () => {
    if (dataSource === 'epic') {
      setDataSource('mock');
    }
    logoutFromEpic();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-400 via-fuchsia-500 to-purple-500 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto pt-6 pb-10 px-4 md:px-6 md:pt-8">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto"></div>
              <p className="text-white">Loading patient data from {getDataSourceDisplayName(dataSource)}...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center items-start md:items-center animate-fade-in">
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-full shadow-md">
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
              
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-full shadow-md">
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
              
              <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-full shadow-md">
                <div className="flex items-center gap-1 mx-2">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Data Source:</span>
                </div>
                
                <button 
                  onClick={() => handleDataSourceChange('vista')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    dataSource === 'vista' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  VISTA EHR
                </button>
                
                <button 
                  onClick={() => handleDataSourceChange('epic')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    dataSource === 'epic' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Epic EHR
                </button>
                
                <button 
                  onClick={() => handleDataSourceChange('mock')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    dataSource === 'mock' 
                      ? 'bg-teal-100 text-teal-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Mock Data
                </button>
                
                {isAuthenticatedWithEpic() && (
                  <button 
                    onClick={handleEpicLogout}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600"
                  >
                    Logout from Epic
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priorityFilters.includes('urgent') && (
                <PriorityColumn 
                  priority="urgent" 
                  patients={urgentPatients} 
                  className={getUrgentColumnWidth()}
                />
              )}
              {priorityFilters.includes('amber') && (
                <PriorityColumn 
                  priority="amber" 
                  patients={amberPatients} 
                  className={getNonUrgentColumnWidth()}
                />
              )}
              {priorityFilters.includes('success') && (
                <PriorityColumn 
                  priority="success" 
                  patients={successPatients} 
                  className={getNonUrgentColumnWidth()}
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
          SmartLabs EHR Integration &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
