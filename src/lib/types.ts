
export type PriorityLevel = 'urgent' | 'amber' | 'success';

export interface PatientData {
  id: string;
  name: string;
  hemoglobin: number; // Hb value
  potassium: number; // K+ value
  priority: PriorityLevel;
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
