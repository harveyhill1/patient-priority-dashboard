
export type PriorityLevel = 'urgent' | 'amber' | 'success';
export type FactorTag = 'age' | 'learning-disability' | 'care-home' | 'frailty' | 'severe-mental-illness';

export interface PatientData {
  id: string;
  name: string;
  patientId: string;
  dateOfBirth: string;
  hemoglobin: number; // Hb value
  potassium: number; // K+ value
  priority: PriorityLevel;
  factors: FactorTag[];
}

export const getColorByPriority = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'urgent':
      return 'urgent';
    case 'amber':
      return 'amber';
    case 'success':
      return 'success';
    default:
      return 'success';
  }
};

export const getLabelByPriority = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'amber':
      return 'Amber';
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
