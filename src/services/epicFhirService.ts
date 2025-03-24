
import { toast } from "sonner";
import { 
  PatientData, 
  PriorityLevel, 
  FactorTag, 
  EpicFhirPatient, 
  EpicFhirDiagnosticReport, 
  EpicFhirObservation,
  EpicAuthToken
} from "@/lib/types";

// EPIC FHIR configuration
const EPIC_CONFIG = {
  AUTHORIZATION_URL: "https://oauth.epic.com/authorize",
  TOKEN_URL: "https://oauth.epic.com/token",
  FHIR_BASE_URL: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
  CLIENT_ID: "YOUR_CLIENT_ID_HERE", // Replace with your actual client ID
  REDIRECT_URI: `${window.location.origin}/epic-callback`, // Callback URL within our app
  SCOPES: ["openid", "fhirUser", "offline_access", "launch/patient"],
  TEST_PATIENT_ID: "erXuFYUfucBZaryVksYEcMg3" // Camila Lopez test patient
};

// Local storage keys
const TOKEN_STORAGE_KEY = "epic_auth_token";
const STATE_STORAGE_KEY = "epic_auth_state";

/**
 * Initiates OAuth authorization flow with Epic
 */
export const initiateEpicAuthorization = (): void => {
  try {
    // Generate a random state to protect against CSRF
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STATE_STORAGE_KEY, state);
    
    // Create authorization URL
    const authUrl = new URL(EPIC_CONFIG.AUTHORIZATION_URL);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", EPIC_CONFIG.CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", EPIC_CONFIG.REDIRECT_URI);
    authUrl.searchParams.append("scope", EPIC_CONFIG.SCOPES.join(" "));
    authUrl.searchParams.append("state", state);
    
    // Redirect to Epic authorization page
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error("Error initiating Epic authorization:", error);
    toast.error("Failed to connect to Epic EHR");
  }
};

/**
 * Handles the OAuth callback from Epic
 * @param urlParams URL search parameters from the callback
 */
export const handleEpicCallback = async (urlParams: URLSearchParams): Promise<boolean> => {
  try {
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    
    // Check for errors in the callback
    if (error) {
      throw new Error(`Authorization error: ${error}`);
    }
    
    // Validate state to prevent CSRF
    if (!code || !state || state !== localStorage.getItem(STATE_STORAGE_KEY)) {
      throw new Error("Invalid authorization response");
    }
    
    // Exchange code for token
    const tokenResponse = await fetch(EPIC_CONFIG.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: EPIC_CONFIG.REDIRECT_URI,
        client_id: EPIC_CONFIG.CLIENT_ID
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }
    
    const tokenData: EpicAuthToken = await tokenResponse.json();
    
    // Add received_at timestamp
    tokenData.received_at = Date.now();
    
    // Store token in localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    
    // Clear state from storage
    localStorage.removeItem(STATE_STORAGE_KEY);
    
    toast.success("Successfully connected to Epic EHR");
    return true;
  } catch (error) {
    console.error("Error handling Epic callback:", error);
    toast.error("Failed to authenticate with Epic EHR");
    return false;
  }
};

/**
 * Gets the current auth token, refreshing if necessary
 */
export const getEpicAuthToken = async (): Promise<string | null> => {
  try {
    const tokenJson = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokenJson) {
      return null;
    }
    
    const token: EpicAuthToken = JSON.parse(tokenJson);
    const now = Date.now();
    const expiresAt = (token.received_at || 0) + (token.expires_in * 1000);
    
    // If token is expired or about to expire in the next 5 minutes
    if (now > expiresAt - 300000) {
      if (token.refresh_token) {
        // Refresh the token
        const refreshResponse = await fetch(EPIC_CONFIG.TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
            client_id: EPIC_CONFIG.CLIENT_ID
          })
        });
        
        if (refreshResponse.ok) {
          const newToken: EpicAuthToken = await refreshResponse.json();
          newToken.received_at = Date.now();
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newToken));
          return newToken.access_token;
        }
      }
      
      // If refresh failed or no refresh token, clear storage and return null
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    
    // Return existing valid token
    return token.access_token;
  } catch (error) {
    console.error("Error getting Epic auth token:", error);
    return null;
  }
};

/**
 * Fetches patient data from Epic FHIR API
 */
export const fetchEpicPatients = async (count: number = 10): Promise<PatientData[]> => {
  try {
    const accessToken = await getEpicAuthToken();
    
    if (!accessToken) {
      toast.error("Not authenticated with Epic EHR");
      return [];
    }
    
    // For demo purposes, we're using a test patient ID
    // In a real implementation, you would search for patients
    const patientResponse = await fetch(`${EPIC_CONFIG.FHIR_BASE_URL}/Patient/${EPIC_CONFIG.TEST_PATIENT_ID}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });
    
    if (!patientResponse.ok) {
      throw new Error(`Failed to fetch patient: ${patientResponse.status}`);
    }
    
    const patientData: EpicFhirPatient = await patientResponse.json();
    
    // Fetch diagnostic reports for this patient
    const reportResponse = await fetch(
      `${EPIC_CONFIG.FHIR_BASE_URL}/DiagnosticReport?patient=${EPIC_CONFIG.TEST_PATIENT_ID}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json"
        }
      }
    );
    
    if (!reportResponse.ok) {
      throw new Error(`Failed to fetch diagnostic reports: ${reportResponse.status}`);
    }
    
    const reportData = await reportResponse.json();
    const reports: EpicFhirDiagnosticReport[] = reportData.entry?.map((entry: any) => entry.resource) || [];
    
    // Fetch lab observations (hemoglobin, potassium)
    // In a real implementation, you would search for specific codes
    const observationsResponse = await fetch(
      `${EPIC_CONFIG.FHIR_BASE_URL}/Observation?patient=${EPIC_CONFIG.TEST_PATIENT_ID}&category=laboratory`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json"
        }
      }
    );
    
    if (!observationsResponse.ok) {
      throw new Error(`Failed to fetch observations: ${observationsResponse.status}`);
    }
    
    const observationsData = await observationsResponse.json();
    const observations: EpicFhirObservation[] = observationsData.entry?.map((entry: any) => entry.resource) || [];
    
    // Map FHIR data to our app's PatientData format
    return mapEpicToPatientData(patientData, reports, observations, count);
  } catch (error) {
    console.error("Error fetching Epic patient data:", error);
    toast.error("Failed to load patients from Epic EHR");
    return [];
  }
};

/**
 * Maps Epic FHIR data to our application's PatientData format
 */
const mapEpicToPatientData = (
  patient: EpicFhirPatient,
  reports: EpicFhirDiagnosticReport[],
  observations: EpicFhirObservation[],
  count: number
): PatientData[] => {
  // Create a simulated dataset based on the test patient
  const patients: PatientData[] = [];
  
  // Get patient name
  const firstName = patient.name?.[0]?.given?.[0] || "Unknown";
  const lastName = patient.name?.[0]?.family || "Patient";
  const fullName = `${firstName} ${lastName}`;
  
  // Get patient DOB
  const dob = patient.birthDate || "1970-01-01";
  
  // Extract hemoglobin and potassium values from observations
  // In a real implementation, you would look for specific LOINC codes
  const hemoglobinObs = observations.find(obs => 
    obs.code.coding.some(coding => coding.display.toLowerCase().includes("hemoglobin")));
    
  const potassiumObs = observations.find(obs => 
    obs.code.coding.some(coding => coding.display.toLowerCase().includes("potassium")));
  
  // For demo purposes, create variations of the test patient
  for (let i = 0; i < count; i++) {
    // Vary lab values to create different priorities
    let hemoglobin = hemoglobinObs?.valueQuantity?.value || (i % 3 === 0 ? 7.0 : i % 3 === 1 ? 10.0 : 14.0);
    let potassium = potassiumObs?.valueQuantity?.value || (i % 3 === 0 ? 6.3 : i % 3 === 1 ? 5.3 : 4.2);
    
    // Add small variations
    hemoglobin += (Math.random() - 0.5) * 1.5;
    potassium += (Math.random() - 0.5) * 0.5;
    
    // Calculate priority based on lab values
    const priority = calculatePriority(hemoglobin, potassium);
    
    // Extract factors
    const factors: FactorTag[] = extractFactors(patient, i);
    
    // Create a unique patient ID
    const uniqueId = `epic-${patient.id}-${i}`;
    
    patients.push({
      id: uniqueId,
      name: `${firstName} ${i === 0 ? lastName : lastName + "-" + i}`,
      patientId: `EPIC-${patient.id.substring(0, 5)}-${i}`,
      dateOfBirth: formatDate(dob),
      hemoglobin,
      potassium,
      priority,
      factors,
      source: 'epic'
    });
  }
  
  return patients;
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
 * Extract patient factors
 */
const extractFactors = (patient: EpicFhirPatient, index: number): FactorTag[] => {
  const factors: FactorTag[] = [];
  
  // Calculate age from birthDate
  if (patient.birthDate) {
    const birthDate = new Date(patient.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age > 75) {
      factors.push("age");
    }
  }
  
  // Add some random factors for variety in our demo
  if (index % 4 === 0) {
    factors.push("frailty");
  }
  if (index % 5 === 1) {
    factors.push("learning-disability");
  }
  if (index % 7 === 2) {
    factors.push("care-home");
  }
  if (index % 8 === 3) {
    factors.push("severe-mental-illness");
  }
  
  return factors;
};

/**
 * Format a date string from YYYY-MM-DD to DD/MM/YYYY
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${
      (date.getMonth() + 1).toString().padStart(2, '0')}/${
      date.getFullYear()}`;
  } catch (error) {
    return dateStr;
  }
};

/**
 * Checks if user is authenticated with Epic
 */
export const isAuthenticatedWithEpic = (): boolean => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) !== null;
};

/**
 * Logs out from Epic EHR
 */
export const logoutFromEpic = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  toast.info("Logged out from Epic EHR");
};
