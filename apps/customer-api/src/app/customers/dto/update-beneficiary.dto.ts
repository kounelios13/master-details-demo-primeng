import { PartialType } from '@nestjs/swagger';
import { CreateBeneficiaryDto } from './create-beneficiary.dto';

/**
 * DTO for updating an existing beneficiary
 * All fields are optional for partial updates
 */
export class UpdateBeneficiaryDto extends PartialType(CreateBeneficiaryDto) {}
