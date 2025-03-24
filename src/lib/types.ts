
export type PriorityLevel = 'urgent' | 'amber' | 'success';
export type FactorTag = 'age' | 'learning-disability' | 'care-home' | 'frailty' | 'severe-mental-illness';
export type DataSource = 'vista' | 'epic' | 'mock';

// SNOMED codes for severe mental illness
export const severeMentalIllnessSnomedCodes = {
  'schizophrenia': '58214004',
  'bipolar-disorder': '13746004',
  'major-depression': '370143000',
  'schizoaffective-disorder': '68890003',
  'delusional-disorder': '48500005',
  'psychotic-disorder': '69322001'
};

export interface PatientData {
  id: string;
  name: string;
  patientId: string;
  dateOfBirth: string;
  hemoglobin: number; // Hb value
  potassium: number; // K+ value
  priority: PriorityLevel;
  factors: FactorTag[];
  snomedCodes?: {
    [key: string]: string;
  };
  source?: DataSource;
}

export const getColorByPriority = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'urgent':
      return 'red';
    case 'amber':
      return 'amber';
    case 'success':
      return 'green';
    default:
      return 'green';
  }
};

export const getLabelByPriority = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'amber':
      return 'Abnormal';
    case 'success':
      return 'Normal';
    default:
      return 'Normal';
  }
};

export const getFactorLabel = (factor: FactorTag): string => {
  switch (factor) {
    case 'age':
      return 'Age >75';
    case 'learning-disability':
      return 'Learning Disability';
    case 'care-home':
      return 'Care Home';
    case 'frailty':
      return 'Frailty';
    case 'severe-mental-illness':
      return 'Severe Mental Illness';
    default:
      return 'Unknown';
  }
};

export const getSnomedCodeForMentalIllness = (condition: keyof typeof severeMentalIllnessSnomedCodes): string => {
  return severeMentalIllnessSnomedCodes[condition] || '';
};

// Additional FHIR related types
export interface FhirPatientReference {
  reference: string;
  display?: string;
}

export interface FhirResource {
  resourceType: string;
  id: string;
}

// Epic FHIR specific types
export interface EpicFhirPatient extends FhirResource {
  resourceType: 'Patient';
  id: string;
  name: Array<{
    use?: string;
    family: string;
    given: string[];
  }>;
  birthDate?: string;
  gender?: string;
}

export interface EpicFhirDiagnosticReport extends FhirResource {
  resourceType: 'DiagnosticReport';
  id: string;
  status: string;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: FhirPatientReference;
  effectiveDateTime?: string;
  issued?: string;
  result?: Array<{
    reference: string;
  }>;
}

export interface EpicFhirObservation extends FhirResource {
  resourceType: 'Observation';
  id: string;
  status: string;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: FhirPatientReference;
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
}

export interface EpicAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  patient?: string;
  received_at?: number;
}
