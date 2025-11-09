import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBeneficiaryDto } from './create-beneficiary.dto';

/**
 * DTO for creating a new customer
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe'
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Customer company name',
    example: 'Acme Corp'
  })
  @IsNotEmpty({ message: 'Company is required' })
  @IsString({ message: 'Company must be a string' })
  company: string;

  @ApiPropertyOptional({
    description: 'List of beneficiaries for the customer',
    type: [CreateBeneficiaryDto]
  })
  @IsOptional()
  @IsArray({ message: 'Beneficiaries must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateBeneficiaryDto)
  beneficiaries?: CreateBeneficiaryDto[];
}
