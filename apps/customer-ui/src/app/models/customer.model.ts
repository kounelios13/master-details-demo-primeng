import { FormControl, FormArray, FormGroup } from '@angular/forms';

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

// Typed form interfaces
export interface BeneficiaryForm {
  id: FormControl<number>;
  name: FormControl<string>;
  question: FormControl<string>;
  answer: FormControl<string>;
  originalAnswer: FormControl<string>;
}

export interface CustomerForm {
  id: FormControl<number>;
  name: FormControl<string>;
  email: FormControl<string>;
  company: FormControl<string>;
  beneficiaries: FormArray<FormGroup<BeneficiaryForm>>;
}

export interface CustomersFormGroup {
  customers: FormArray<FormGroup<CustomerForm>>;
}

export const ANSWER_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Maybe', value: 'maybe' },
  { label: 'N/A', value: 'na' }
];
