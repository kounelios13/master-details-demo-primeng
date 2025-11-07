import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { Customer, Beneficiary, ANSWER_OPTIONS, BeneficiaryForm, CustomerForm, CustomersFormGroup } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    RippleModule
  ],
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.css'
})
export class CustomerTableComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private loaderService = inject(LoaderService);
  
  customersForm!: FormGroup<CustomersFormGroup>;
  customers: Customer[] = [];
  answerOptions = ANSWER_OPTIONS;
  expandedRows: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loaderService.show();
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.initForm();
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loaderService.hide();
      }
    });
  }

  private initForm(): void {
    this.customersForm = this.fb.group<CustomersFormGroup>({
      customers: this.fb.array<FormGroup<CustomerForm>>([])
    });

    this.customers.forEach(customer => {
      this.customersArray.push(this.createCustomerFormGroup(customer));
    });
  }

  private createCustomerFormGroup(customer: Customer): FormGroup<CustomerForm> {
    return this.fb.group<CustomerForm>({
      id: this.fb.control<number>(customer.id, { nonNullable: true }),
      name: this.fb.control<string>(customer.name, { nonNullable: true }),
      email: this.fb.control<string>(customer.email, { nonNullable: true }),
      company: this.fb.control<string>(customer.company, { nonNullable: true }),
      beneficiaries: this.fb.array<FormGroup<BeneficiaryForm>>(
        customer.beneficiaries.map(beneficiary => this.createBeneficiaryFormGroup(beneficiary))
      )
    });
  }

  private createBeneficiaryFormGroup(beneficiary: Beneficiary): FormGroup<BeneficiaryForm> {
    return this.fb.group<BeneficiaryForm>({
      id: this.fb.control<number>(beneficiary.id, { nonNullable: true }),
      name: this.fb.control<string>(beneficiary.name, { nonNullable: true }),
      question: this.fb.control<string>(beneficiary.question, { nonNullable: true }),
      answer: this.fb.control<string>(beneficiary.answer, { nonNullable: true }),
      originalAnswer: this.fb.control<string>(beneficiary.originalAnswer, { nonNullable: true })
    });
  }

  get customersArray(): FormArray<FormGroup<CustomerForm>> {
    return this.customersForm.controls.customers;
  }

  getCustomerFormGroup(index: number): FormGroup<CustomerForm> {
    return this.customersArray.at(index);
  }

  getBeneficiariesArray(customerIndex: number): FormArray<FormGroup<BeneficiaryForm>> {
    return this.getCustomerFormGroup(customerIndex).controls.beneficiaries;
  }

  getBeneficiaryFormGroup(customerIndex: number, beneficiaryIndex: number): FormGroup<BeneficiaryForm> {
    return this.getBeneficiariesArray(customerIndex).at(beneficiaryIndex);
  }

  hasChanges(customerIndex: number): boolean {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    return beneficiaries.controls.some(beneficiary => {
      const answer = beneficiary.controls.answer.value;
      const originalAnswer = beneficiary.controls.originalAnswer.value;
      return answer !== originalAnswer;
    });
  }

  isBeneficiaryChanged(customerIndex: number, beneficiaryIndex: number): boolean {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const answer = beneficiary.controls.answer.value;
    const originalAnswer = beneficiary.controls.originalAnswer.value;
    return answer !== originalAnswer;
  }

  saveBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const answer = beneficiary.controls.answer.value;
    beneficiary.patchValue({ originalAnswer: answer });
    console.log('Saved beneficiary:', beneficiary.value);
  }

  resetBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const originalAnswer = beneficiary.controls.originalAnswer.value;
    beneficiary.patchValue({ answer: originalAnswer });
  }

  saveAllChanges(customerIndex: number): void {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    beneficiaries.controls.forEach(beneficiary => {
      const answer = beneficiary.controls.answer.value;
      beneficiary.patchValue({ originalAnswer: answer });
    });
    const customer = this.getCustomerFormGroup(customerIndex);
    console.log('Saved all changes for customer:', customer.value);
  }

  getBeneficiaryCount(customerIndex: number): number {
    return this.getBeneficiariesArray(customerIndex).length;
  }

  getChangedCount(customerIndex: number): number {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    return beneficiaries.controls.filter(beneficiary => {
      const answer = beneficiary.controls.answer.value;
      const originalAnswer = beneficiary.controls.originalAnswer.value;
      return answer !== originalAnswer;
    }).length;
  }
}
