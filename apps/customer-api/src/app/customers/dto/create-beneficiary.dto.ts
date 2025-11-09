import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new beneficiary
 */
export class CreateBeneficiaryDto {
  @ApiProperty({
    description: 'Beneficiary name',
    example: 'Jane Smith'
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name!: string;

  @ApiProperty({
    description: 'Security question',
    example: 'What is your favorite color?'
  })
  @IsNotEmpty({ message: 'Question is required' })
  @IsString({ message: 'Question must be a string' })
  question!: string;

  @ApiProperty({
    description: 'Answer to the security question',
    example: 'yes',
    enum: ['yes', 'no', 'maybe']
  })
  @IsNotEmpty({ message: 'Answer is required' })
  @IsString({ message: 'Answer must be a string' })
  @IsIn(['yes', 'no', 'maybe'], { message: 'Answer must be one of: yes, no, maybe' })
  answer!: string;
}
