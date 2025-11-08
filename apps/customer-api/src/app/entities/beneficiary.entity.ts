import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';

@Entity('beneficiaries')
export class BeneficiaryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  question!: string;

  @Column()
  answer!: string;

  @Column()
  originalAnswer!: string;

  @Column()
  customerId!: number;

  @ManyToOne(() => CustomerEntity, (customer) => customer.beneficiaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: CustomerEntity;
}
