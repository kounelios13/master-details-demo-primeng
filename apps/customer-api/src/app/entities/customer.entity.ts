import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BeneficiaryEntity } from './beneficiary.entity';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  company!: string;

  @OneToMany(() => BeneficiaryEntity, (beneficiary) => beneficiary.customer, {
    cascade: true,
    eager: true,
  })
  beneficiaries!: BeneficiaryEntity[];
}
