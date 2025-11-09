import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
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
import { NotificationService } from '../../services/ui/notification.service';
import { ErrorHandlingService } from '../../services/ui/error-handling.service';

/**
 * Component displaying customer table with expandable beneficiary rows
 * Includes inline editing, CRUD operations, and change tracking
 */
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
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlingService);
  private confirmationService = inject(ConfirmationService);
  
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

  /**
   * Log out the current user and navigate to login
   */
  logout(): void {
    this.authService.logout();
    this.notificationService.info('Logged out', 'You have been successfully logged out');
    this.router.navigate(['/login']);
  }

  /**
   * Load all customers from the API
   */
  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.initForm();
      },
      error: (error) => {
        this.errorHandler.logError(error, 'Load Customers');
        this.notificationService.handleError(error, 'Failed to load customers');
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
        this.notificationService.success('Saved', 'Beneficiary updated successfully');
      },
      error: (error) => {
        this.errorHandler.logError(error, 'Save Beneficiary');
        this.notificationService.handleError(error, 'Failed to save beneficiary');
      }
    });
  }

  resetBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const originalAnswer = beneficiary.controls.originalAnswer.value;
    beneficiary.patchValue({ answer: originalAnswer });
    this.notificationService.info('Reset', 'Changes have been discarded');
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
    let failed = 0;
    
    updates.forEach(update => {
      this.customerService.updateBeneficiary(update.id, { answer: update.answer }).subscribe({
        next: () => {
          completed++;
          if (completed + failed === updates.length) {
            if (failed === 0) {
              beneficiaries.controls.forEach(beneficiary => {
                const answer = beneficiary.controls.answer.value;
                beneficiary.patchValue({ originalAnswer: answer });
              });
              this.notificationService.success('Saved', `All ${completed} changes saved successfully`);
            } else {
              this.notificationService.warning('Partially Saved', `${completed} saved, ${failed} failed`);
            }
          }
        },
        error: (error) => {
          failed++;
          this.errorHandler.logError(error, 'Save All Changes');
          if (completed + failed === updates.length) {
            if (failed === updates.length) {
              this.notificationService.handleError(error, 'Failed to save changes');
            } else {
              this.notificationService.warning('Partially Saved', `${completed} saved, ${failed} failed`);
            }
          }
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
    if (this.customerForm.invalid) {
      this.notificationService.warning('Invalid Form', 'Please fill in all required fields correctly');
      return;
    }

    const customerData = {
      name: this.customerForm.value.name ?? '',
      email: this.customerForm.value.email ?? '',
      company: this.customerForm.value.company ?? '',
      beneficiaries: []
    };

    this.customerService.createCustomer(customerData).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeCustomerDialog();
        this.notificationService.success('Customer Added', 'New customer created successfully');
      },
      error: (error) => {
        this.errorHandler.logError(error, 'Create Customer');
        this.notificationService.handleError(error, 'Failed to create customer');
      }
    });
  }

  /**
   * Delete a customer with confirmation dialog
   */
  deleteCustomer(customerIndex: number): void {
    const customer = this.getCustomerFormGroup(customerIndex);
    const customerId = customer.controls.id.value;
    const customerName = customer.controls.name.value;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${customerName}? This will also delete all associated beneficiaries.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customerService.deleteCustomer(customerId).subscribe({
          next: () => {
            this.loadCustomers();
            this.notificationService.success('Customer Deleted', `${customerName} has been deleted`);
          },
          error: (error) => {
            this.errorHandler.logError(error, 'Delete Customer');
            this.notificationService.handleError(error, 'Failed to delete customer');
          }
        });
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
    if (this.beneficiaryForm.invalid || this.currentCustomerIndex === -1) {
      this.notificationService.warning('Invalid Form', 'Please fill in all required fields');
      return;
    }

    const customer = this.getCustomerFormGroup(this.currentCustomerIndex);
    const customerId = customer.controls.id.value;

    const beneficiaryData = {
      name: this.beneficiaryForm.value.name ?? '',
      question: this.beneficiaryForm.value.question ?? '',
      answer: this.beneficiaryForm.value.answer ?? 'yes',
      originalAnswer: this.beneficiaryForm.value.answer ?? 'yes'
    };

    this.customerService.addBeneficiary(customerId, beneficiaryData).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeBeneficiaryDialog();
        this.notificationService.success('Beneficiary Added', 'New beneficiary created successfully');
      },
      error: (error) => {
        this.errorHandler.logError(error, 'Add Beneficiary');
        this.notificationService.handleError(error, 'Failed to add beneficiary');
      }
    });
  }

  /**
   * Delete a beneficiary with confirmation dialog
   */
  deleteBeneficiary(customerIndex: number, beneficiaryIndex: number): void {
    const beneficiary = this.getBeneficiaryFormGroup(customerIndex, beneficiaryIndex);
    const beneficiaryId = beneficiary.controls.id.value;
    const beneficiaryName = beneficiary.controls.name.value;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete beneficiary ${beneficiaryName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customerService.deleteBeneficiary(beneficiaryId).subscribe({
          next: () => {
            this.loadCustomers();
            this.notificationService.success('Beneficiary Deleted', `${beneficiaryName} has been deleted`);
          },
          error: (error) => {
            this.errorHandler.logError(error, 'Delete Beneficiary');
            this.notificationService.handleError(error, 'Failed to delete beneficiary');
          }
        });
      }
    });
  }
}
