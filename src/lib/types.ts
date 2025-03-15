
export type PriorityLevel = 'urgent' | 'amber' | 'success';
export type FactorTag = 'age' | 'learning-disability' | 'care-home' | 'frailty' | 'severe-mental-illness';

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
      return 'Green';
    default:
      return 'Green';
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
