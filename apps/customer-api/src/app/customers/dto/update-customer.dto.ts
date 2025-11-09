import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

/**
 * DTO for updating an existing customer
 * All fields are optional for partial updates
 */
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
