import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Customer, Beneficiary, ANSWER_OPTIONS, BeneficiaryForm, CustomerForm, CustomersFormGroup } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/api/auth.service';

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
    RippleModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.css'
})
export class CustomerTableComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  customersForm!: FormGroup<CustomersFormGroup>;
  customers: Customer[] = [];
  answerOptions = ANSWER_OPTIONS;
  expandedRows: { [key: string]: boolean } = {};

  // Dialog states
  showCustomerDialog = false;
  showBeneficiaryDialog = false;
  customerDialogTitle = '';
  currentCustomerIndex = -1;

  // Customer form
  customerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: ['', Validators.required]
  });

  // Beneficiary form
  beneficiaryForm = this.fb.group({
    name: ['', Validators.required],
    question: ['', Validators.required],
    answer: ['yes' as string, Validators.required]
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.initForm();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
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
    // Ensure originalAnswer is set, defaulting to answer if missing
    const originalAnswer = beneficiary.originalAnswer || beneficiary.answer;
    
    return this.fb.group<BeneficiaryForm>({
      id: this.fb.control<number>(beneficiary.id, { nonNullable: true }),
      name: this.fb.control<string>(beneficiary.name, { nonNullable: true }),
      question: this.fb.control<string>(beneficiary.question, { nonNullable: true }),
      answer: this.fb.control<string>(beneficiary.answer, { nonNullable: true }),
      originalAnswer: this.fb.control<string>(originalAnswer, { nonNullable: true })
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
    const beneficiaryId = beneficiary.controls.id.value;
    const answer = beneficiary.controls.answer.value;
    
    this.customerService.updateBeneficiary(beneficiaryId, { answer }).subscribe({
      next: () => {
        beneficiary.patchValue({ originalAnswer: answer });
      },
      error: (error) => {
        console.error('Error saving beneficiary:', error);
      }
    });
  }

  resetBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const originalAnswer = beneficiary.controls.originalAnswer.value;
    beneficiary.patchValue({ answer: originalAnswer });
  }

  saveAllChanges(customerIndex: number): void {
    const beneficiaries = this.getBeneficiariesArray(customerIndex);
    const updates = beneficiaries.controls
      .filter(beneficiary => {
        const answer = beneficiary.controls.answer.value;
        const originalAnswer = beneficiary.controls.originalAnswer.value;
        return answer !== originalAnswer;
      })
      .map(beneficiary => ({
        id: beneficiary.controls.id.value,
        answer: beneficiary.controls.answer.value
      }));

    if (updates.length === 0) return;

    let completed = 0;
    
    updates.forEach(update => {
      this.customerService.updateBeneficiary(update.id, { answer: update.answer }).subscribe({
        next: () => {
          completed++;
          if (completed === updates.length) {
            beneficiaries.controls.forEach(beneficiary => {
              const answer = beneficiary.controls.answer.value;
              beneficiary.patchValue({ originalAnswer: answer });
            });
          }
        },
        error: (error) => {
          console.error('Error saving beneficiary:', error);
        }
      });
    });
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

  // Customer CRUD operations
  openNewCustomerDialog(): void {
    this.customerDialogTitle = 'Add New Customer';
    this.customerForm.reset({ name: '', email: '', company: '' });
    this.showCustomerDialog = true;
  }

  closeCustomerDialog(): void {
    this.showCustomerDialog = false;
    this.customerForm.reset();
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const customerData = {
      name: this.customerForm.value.name!,
      email: this.customerForm.value.email!,
      company: this.customerForm.value.company!,
      beneficiaries: []
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeCustomerDialog();
      },
      error: (error) => {
        console.error('Error creating customer:', error);
      }
    });
  }

  deleteCustomer(customerIndex: number): void {
    const customer = this.getCustomerFormGroup(customerIndex);
    const customerId = customer.controls.id.value;
    
    if (!confirm(`Are you sure you want to delete ${customer.controls.name.value}?`)) {
      return;
    }

    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
      }
    });
  }

  // Beneficiary CRUD operations
  openNewBeneficiaryDialog(customerIndex: number): void {
    this.currentCustomerIndex = customerIndex;
    this.beneficiaryForm.reset({ name: '', question: '', answer: 'yes' });
    this.showBeneficiaryDialog = true;
  }

  closeBeneficiaryDialog(): void {
    this.showBeneficiaryDialog = false;
    this.beneficiaryForm.reset();
    this.currentCustomerIndex = -1;
  }

  saveBeneficiaryNew(): void {
    if (this.beneficiaryForm.invalid || this.currentCustomerIndex === -1) return;

    const customer = this.getCustomerFormGroup(this.currentCustomerIndex);
    const customerId = customer.controls.id.value;

    const beneficiaryData = {
      name: this.beneficiaryForm.value.name!,
      question: this.beneficiaryForm.value.question!,
      answer: this.beneficiaryForm.value.answer!,
      originalAnswer: this.beneficiaryForm.value.answer!
    };

    this.customerService.addBeneficiary(customerId, beneficiaryData).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeBeneficiaryDialog();
      },
      error: (error) => {
        console.error('Error adding beneficiary:', error);
      }
    });
  }

  deleteBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const beneficiaryId = beneficiary.controls.id.value;
    
    if (!confirm(`Are you sure you want to delete ${beneficiary.controls.name.value}?`)) {
      return;
    }

    this.customerService.deleteBeneficiary(beneficiaryId).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error deleting beneficiary:', error);
      }
    });
  }
}
