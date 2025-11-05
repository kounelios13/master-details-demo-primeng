export interface Beneficiary {
  id: number;
  name: string;
  question: string;
  answer: string;
  originalAnswer: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  beneficiaries: Beneficiary[];
}

export const ANSWER_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Maybe', value: 'maybe' },
  { label: 'N/A', value: 'na' }
];

// Sample data
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
    beneficiaries: [
      {
        id: 101,
        name: 'Alice Smith',
        question: 'Is primary beneficiary?',
        answer: 'yes',
        originalAnswer: 'yes'
      },
      {
        id: 102,
        name: 'Bob Johnson',
        question: 'Receives notifications?',
        answer: 'no',
        originalAnswer: 'no'
      },
      {
        id: 103,
        name: 'Carol Williams',
        question: 'Has access rights?',
        answer: 'maybe',
        originalAnswer: 'maybe'
      }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    company: 'Tech Solutions Inc',
    beneficiaries: [
      {
        id: 201,
        name: 'David Brown',
        question: 'Is primary beneficiary?',
        answer: 'no',
        originalAnswer: 'no'
      },
      {
        id: 202,
        name: 'Emma Davis',
        question: 'Receives notifications?',
        answer: 'yes',
        originalAnswer: 'yes'
      }
    ]
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    company: 'Global Enterprises',
    beneficiaries: [
      {
        id: 301,
        name: 'Frank Miller',
        question: 'Is primary beneficiary?',
        answer: 'yes',
        originalAnswer: 'yes'
      },
      {
        id: 302,
        name: 'Grace Wilson',
        question: 'Receives notifications?',
        answer: 'yes',
        originalAnswer: 'yes'
      },
      {
        id: 303,
        name: 'Henry Moore',
        question: 'Has access rights?',
        answer: 'na',
        originalAnswer: 'na'
      },
      {
        id: 304,
        name: 'Iris Taylor',
        question: 'Receives notifications?',
        answer: 'maybe',
        originalAnswer: 'maybe'
      }
    ]
  },
  {
    id: 4,
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    company: 'Innovation Labs',
    beneficiaries: [
      {
        id: 401,
        name: 'Jack Anderson',
        question: 'Is primary beneficiary?',
        answer: 'no',
        originalAnswer: 'no'
      }
    ]
  },
  {
    id: 5,
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    company: 'Digital Dynamics',
    beneficiaries: [
      {
        id: 501,
        name: 'Karen Thomas',
        question: 'Is primary beneficiary?',
        answer: 'yes',
        originalAnswer: 'yes'
      },
      {
        id: 502,
        name: 'Larry Jackson',
        question: 'Receives notifications?',
        answer: 'no',
        originalAnswer: 'no'
      },
      {
        id: 503,
        name: 'Maria White',
        question: 'Has access rights?',
        answer: 'yes',
        originalAnswer: 'yes'
      }
    ]
  }
];
