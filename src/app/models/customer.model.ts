export interface Beneficiary {
  id: number;
  name: string;
  question: string;
  answer: string;
  originalAnswer: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  beneficiaries: Beneficiary[];
}

export const ANSWER_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Maybe', value: 'maybe' },
  { label: 'N/A', value: 'na' }
];
