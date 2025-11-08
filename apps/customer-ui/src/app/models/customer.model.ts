import { FormControl, FormArray, FormGroup } from '@angular/forms';

// Re-export shared models
export { Customer, Beneficiary, ANSWER_OPTIONS } from '@master-details-demo-primeng/shared-models';

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
