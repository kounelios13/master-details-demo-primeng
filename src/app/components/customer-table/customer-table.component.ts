import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { Customer, Beneficiary, MOCK_CUSTOMERS, ANSWER_OPTIONS } from '../../models/customer.model';

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
  styleUrls: ['./customer-table.component.css']
})
export class CustomerTableComponent implements OnInit {
  customersForm!: FormGroup;
  customers: Customer[] = [];
  answerOptions = ANSWER_OPTIONS;
  expandedRows: { [key: string]: boolean} = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.customers = MOCK_CUSTOMERS;
    this.initForm();
  }

  private initForm(): void {
    this.customersForm = this.fb.group({
      customers: this.fb.array([])
    });

    this.customers.forEach(customer => {
      this.customersArray.push(this.createCustomerFormGroup(customer));
    });
  }

  private createCustomerFormGroup(customer: Customer): FormGroup {
    return this.fb.group({
      id: [customer.id],
      name: [customer.name],
      email: [customer.email],
      company: [customer.company],
      beneficiaries: this.fb.array(
        customer.beneficiaries.map(beneficiary => this.createBeneficiaryFormGroup(beneficiary))
      )
    });
  }

  private createBeneficiaryFormGroup(beneficiary: Beneficiary): FormGroup {
    return this.fb.group({
      id: [beneficiary.id],
      name: [beneficiary.name],
      question: [beneficiary.question],
      answer: [beneficiary.answer],
      originalAnswer: [beneficiary.originalAnswer]
    });
  }

  get customersArray(): FormArray {
    return this.customersForm.get('customers') as FormArray;
  }

  getCustomerFormGroup(index: number): FormGroup {
    return this.customersArray.at(index) as FormGroup;
  }

  getBeneficiariesArray(customerIndex: number): FormArray {
    return this.getCustomerFormGroup(customerIndex).get('beneficiaries') as FormArray;
  }

  getBeneficiaryFormGroup(customerIndex: number, beneficiaryIndex: number): FormGroup {
    return this.getBeneficiariesArray(customerIndex).at(beneficiaryIndex) as FormGroup;
  }

  hasChanges(customerIndex: number): boolean {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    return beneficiaries.controls.some(beneficiary => {
      const answer = beneficiary.get('answer')?.value;
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      return answer !== originalAnswer;
    });
  }

  isBeneficiaryChanged(customerIndex: number, beneficiaryIndex: number): boolean {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const answer = beneficiary.get('answer')?.value;
    const originalAnswer = beneficiary.get('originalAnswer')?.value;
    return answer !== originalAnswer;
  }

  saveBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const answer = beneficiary.get('answer')?.value;
    beneficiary.patchValue({ originalAnswer: answer });
    console.log('Saved beneficiary:', beneficiary.value);
  }

  resetBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const originalAnswer = beneficiary.get('originalAnswer')?.value;
    beneficiary.patchValue({ answer: originalAnswer });
  }

  saveAllChanges(customerIndex: number): void {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    beneficiaries.controls.forEach(beneficiary => {
      const answer = beneficiary.get('answer')?.value;
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
      const answer = beneficiary.get('answer')?.value;
      const originalAnswer = beneficiary.get('originalAnswer')?.value;
      return answer !== originalAnswer;
    }).length;
  }
}
