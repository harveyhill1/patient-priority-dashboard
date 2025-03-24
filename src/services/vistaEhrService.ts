
import { toast } from "sonner";
import { PatientData, PriorityLevel, FactorTag } from "@/lib/types";

interface VistaVital {
  snomedCode: string;
  name: string;
  value: string;
  date: string;
  location: string;
}

interface VistaPatient {
  icn: string;
  vitals: VistaVital[];
}

// Base URL for the VISTA EHR API
const VISTA_API_BASE_URL = "http://localhost:8001";

/**
 * Fetches list of patients from VISTA EHR
 * @param count Number of patients to fetch
 */
export const fetchVistaPatients = async (count: number = 10): Promise<string[]> => {
  try {
    const response = await fetch(`${VISTA_API_BASE_URL}/DHPPATICNALL?CNT=${count}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.status}`);
    }
    
    const data = await response.text();
    return data.trim().split(';').filter(Boolean);
  } catch (error) {
    console.error("Error fetching VISTA patients:", error);
    toast.error("Failed to fetch patients from VISTA EHR");
    throw error;
  }
};

/**
 * Fetches patient vitals by ICN
 * @param icn Patient Identifier (Integration Control Number)
 */
export const fetchPatientVitals = async (icn: string): Promise<VistaPatient> => {
  try {
    const response = await fetch(`${VISTA_API_BASE_URL}/DHPPATVITICN?ICN=${icn}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch patient vitals: ${response.status}`);
    }
    
    const data = await response.text();
    return parseVistaPatientData(icn, data);
  } catch (error) {
    console.error(`Error fetching vitals for patient ${icn}:`, error);
    toast.error(`Failed to fetch vitals for patient ${icn}`);
    throw error;
  }
};

/**
 * Parses VISTA patient data response
 */
const parseVistaPatientData = (icn: string, data: string): VistaPatient => {
  try {
    const parts = data.split('^');
    const patientICN = parts[0]; // First part contains ICN
    
    const vitals: VistaVital[] = [];
    
    // Process remaining parts (vitals)
    for (let i = 1; i < parts.length; i++) {
      const vitalParts = parts[i].split('|');
      if (vitalParts.length >= 5) {
        vitals.push({
          snomedCode: vitalParts[0],
          name: vitalParts[1],
          value: vitalParts[2],
          date: vitalParts[3],
          location: vitalParts[4]
        });
      }
    }
    
    return {
      icn: patientICN,
      vitals
    };
  } catch (error) {
    console.error("Error parsing VISTA patient data:", error);
    return {
      icn,
      vitals: []
    };
  }
};

/**
 * Maps VISTA patient data to our application's PatientData format
 */
export const mapVistaToPatientData = (icn: string, vistaPatient: VistaPatient): PatientData => {
  // Extract the most recent vitals by type
  const latestVitals = getLatestVitals(vistaPatient.vitals);
  
  // Extract hemoglobin and potassium values (if available)
  // For this demo, we'll simulate these values since they weren't in the sample data
  const hemoglobin = extractLabValue(vistaPatient.vitals, "hemoglobin") || Math.random() * 10 + 5;
  const potassium = extractLabValue(vistaPatient.vitals, "potassium") || Math.random() * 3 + 3.5;
  
  // Calculate priority based on lab values
  const priority = calculatePriority(hemoglobin, potassium);
  
  // Extract patient factors
  const factors = extractPatientFactors(vistaPatient);
  
  return {
    id: icn,
    name: `Patient ${icn.substring(0, 8)}`, // We don't have name in the sample data
    patientId: icn,
    dateOfBirth: extractDateOfBirth(vistaPatient) || "01/01/1970", // Default if not found
    hemoglobin,
    potassium,
    priority,
    factors,
    snomedCodes: extractSnomedCodes(vistaPatient)
  };
};

/**
 * Get the latest vital reading for each vital type
 */
const getLatestVitals = (vitals: VistaVital[]): Record<string, VistaVital> => {
  const latestByType: Record<string, VistaVital> = {};
  
  vitals.forEach(vital => {
    if (!latestByType[vital.name] || 
        new Date(vital.date) > new Date(latestByType[vital.name].date)) {
      latestByType[vital.name] = vital;
    }
  });
  
  return latestByType;
};

/**
 * Extracts a lab value from vitals (simulated for demo)
 */
const extractLabValue = (vitals: VistaVital[], labName: string): number | null => {
  const vitalFound = vitals.find(v => 
    v.name.toLowerCase().includes(labName.toLowerCase()));
  
  if (vitalFound) {
    // Try to extract numeric value
    const numericValue = parseFloat(vitalFound.value);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
  }
  
  return null;
};

/**
 * Calculate priority based on lab values
 */
const calculatePriority = (hemoglobin: number, potassium: number): PriorityLevel => {
  // Critical values based on common lab reference ranges
  if (hemoglobin < 8 || potassium > 6.0) {
    return "urgent";
  } else if (hemoglobin < 11 || potassium > 5.0 || potassium < 3.5) {
    return "amber";
  } else {
    return "success";
  }
};

/**
 * Extract patient factors (age, frailty, etc.) based on vitals and other data
 */
const extractPatientFactors = (patient: VistaPatient): FactorTag[] => {
  const factors: FactorTag[] = [];
  
  // Check BP for possible hypertension - could indicate frailty
  const bp = patient.vitals.find(v => v.name === "Blood pressure");
  if (bp) {
    const parts = bp.value.split('/');
    if (parts.length === 2) {
      const systolic = parseInt(parts[0], 10);
      const diastolic = parseInt(parts[1], 10);
      
      if (systolic > 160 || diastolic > 100) {
        factors.push("frailty");
      }
    }
  }
  
  // Determine age from DOB (if available)
  const dob = extractDateOfBirth(patient);
  if (dob) {
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    if (age > 75) {
      factors.push("age");
    }
  }
  
  return factors;
};

/**
 * Extract date of birth (simulated for demo)
 */
const extractDateOfBirth = (patient: VistaPatient): string | null => {
  // In a real implementation, you would extract DOB from patient data
  // For this demo, we'll return null
  return null;
};

/**
 * Extract SNOMED codes from vitals
 */
const extractSnomedCodes = (patient: VistaPatient): Record<string, string> => {
  const codes: Record<string, string> = {};
  
  patient.vitals.forEach(vital => {
    codes[vital.name.toLowerCase().replace(/\s+/g, '-')] = vital.snomedCode;
  });
  
  return codes;
};

/**
 * Fetches all patients with their vitals from VISTA EHR
 */
export const fetchAllVistaPatientData = async (count: number = 10): Promise<PatientData[]> => {
  try {
    // Fetch patient ICNs
    const patientICNs = await fetchVistaPatients(count);
    
    // Fetch vitals for each patient
    const patientDataPromises = patientICNs.map(async (icn) => {
      const patientVitals = await fetchPatientVitals(icn);
      return mapVistaToPatientData(icn, patientVitals);
    });
    
    // Wait for all requests to complete
    return await Promise.all(patientDataPromises);
  } catch (error) {
    console.error("Error fetching all VISTA patient data:", error);
    toast.error("Failed to load patients from VISTA EHR");
    return [];
  }
};
