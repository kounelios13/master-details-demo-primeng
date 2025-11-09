import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Customer, Beneficiary } from '@master-details-demo-primeng/shared-models';
import { CreateCustomerDto, UpdateCustomerDto, CreateBeneficiaryDto, UpdateBeneficiaryDto } from './dto';

/**
 * Controller handling customer-related operations
 * All endpoints require JWT authentication
 */
@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Get all customers with their beneficiaries
   */
  @Get()
  @ApiOperation({ summary: 'Get all customers', description: 'Retrieves all customers with their associated beneficiaries' })
  @ApiResponse({ status: 200, description: 'List of customers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  /**
   * Get a single customer by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID', description: 'Retrieves a single customer with their beneficiaries' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer | null> {
    return this.customersService.findOne(id);
  }

  /**
   * Create a new customer
   */
  @Post()
  @ApiOperation({ summary: 'Create customer', description: 'Creates a new customer with optional beneficiaries' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto);
  }

  /**
   * Update an existing customer
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update customer', description: 'Updates an existing customer (partial update supported)' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer | null> {
    return this.customersService.update(id, updateCustomerDto);
  }

  /**
   * Delete a customer
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer', description: 'Deletes a customer and all associated beneficiaries' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'number' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customersService.delete(id);
  }

  /**
   * Add a beneficiary to a customer
   */
  @Post(':id/beneficiaries')
  @ApiOperation({ summary: 'Add beneficiary', description: 'Adds a new beneficiary to an existing customer' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'number' })
  @ApiResponse({ status: 201, description: 'Beneficiary added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  addBeneficiary(
    @Param('id', ParseIntPipe) id: number,
    @Body() createBeneficiaryDto: CreateBeneficiaryDto,
  ): Promise<Beneficiary> {
    return this.customersService.addBeneficiary(id, createBeneficiaryDto);
  }

  /**
   * Update a beneficiary
   */
  @Put('beneficiaries/:beneficiaryId')
  @ApiOperation({ summary: 'Update beneficiary', description: 'Updates an existing beneficiary (partial update supported)' })
  @ApiParam({ name: 'beneficiaryId', description: 'Beneficiary ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Beneficiary updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  updateBeneficiary(
    @Param('beneficiaryId', ParseIntPipe) beneficiaryId: number,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ): Promise<Beneficiary | null> {
    return this.customersService.updateBeneficiary(beneficiaryId, updateBeneficiaryDto);
  }

  /**
   * Delete a beneficiary
   */
  @Delete('beneficiaries/:beneficiaryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete beneficiary', description: 'Deletes a beneficiary' })
  @ApiParam({ name: 'beneficiaryId', description: 'Beneficiary ID', type: 'number' })
  @ApiResponse({ status: 204, description: 'Beneficiary deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Beneficiary not found' })
  deleteBeneficiary(@Param('beneficiaryId', ParseIntPipe) beneficiaryId: number): Promise<void> {
    return this.customersService.deleteBeneficiary(beneficiaryId);
  }
}
