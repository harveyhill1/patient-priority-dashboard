
import { PatientData, DataSource } from "@/lib/types";
import { fetchAllVistaPatientData } from "./vistaEhrService";
import { fetchEpicPatients, isAuthenticatedWithEpic, initiateEpicAuthorization } from "./epicFhirService";
import { toast } from "sonner";

// Mock data from the Index page
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
    factors: ["age", "frailty"],
    source: "mock"
  },
  // ... more mock patients would be here
  // We're showing just one for brevity
];

/**
 * Fetches patient data from the selected source
 * @param source The data source to use
 * @param count Number of patients to fetch
 */
export const fetchPatientData = async (source: DataSource, count: number = 15): Promise<{ 
  patients: PatientData[], 
  actualSource: DataSource 
}> => {
  try {
    let patients: PatientData[] = [];
    let actualSource = source;
    
    switch (source) {
      case 'vista':
        patients = await fetchAllVistaPatientData(count);
        if (patients.length === 0) {
          actualSource = 'mock';
          patients = MOCK_PATIENT_DATA.map(p => ({ ...p, source: 'mock' }));
          toast.warning("Could not connect to VISTA EHR, using mock data");
        } else {
          patients = patients.map(p => ({ ...p, source: 'vista' }));
        }
        break;
        
      case 'epic':
        if (!isAuthenticatedWithEpic()) {
          initiateEpicAuthorization();
          return { patients: [], actualSource: source };
        }
        
        patients = await fetchEpicPatients(count);
        if (patients.length === 0) {
          actualSource = 'mock';
          patients = MOCK_PATIENT_DATA.map(p => ({ ...p, source: 'mock' }));
          toast.warning("Could not fetch data from Epic EHR, using mock data");
        }
        break;
        
      case 'mock':
      default:
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        patients = MOCK_PATIENT_DATA.map(p => ({ ...p, source: 'mock' }));
        break;
    }
    
    return { patients, actualSource };
  } catch (error) {
    console.error(`Error fetching patient data from ${source}:`, error);
    toast.error(`Failed to load data from ${source.toUpperCase()}, using mock data`);
    return { 
      patients: MOCK_PATIENT_DATA.map(p => ({ ...p, source: 'mock' })), 
      actualSource: 'mock' 
    };
  }
};

/**
 * Gets the display name for a data source
 */
export const getDataSourceDisplayName = (source: DataSource): string => {
  switch (source) {
    case 'vista':
      return 'VISTA EHR';
    case 'epic':
      return 'Epic EHR';
    case 'mock':
      return 'Mock Data';
    default:
      return 'Unknown Source';
  }
};
