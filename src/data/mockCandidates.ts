import { Candidate } from '../types/candidate'

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    status: 'active',
    source: 'linkedin',
    title: 'Senior Frontend Developer',
    experience: 5,
    salary: {
      current: 95000,
      expected: 110000,
      currency: 'USD'
    },
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Stanford University',
        year: 2018
      }
    ],
    notes: 'Excellent React skills, looking for senior role with more backend exposure',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContact: new Date('2024-01-18'),
    tags: ['frontend', 'react', 'senior'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahj'
    }
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    status: 'passive',
    source: 'referral',
    title: 'DevOps Engineer',
    experience: 7,
    salary: {
      current: 130000,
      expected: 150000,
      currency: 'USD'
    },
    skills: ['Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform'],
    education: [
      {
        degree: 'MS Software Engineering',
        institution: 'MIT',
        year: 2017
      }
    ],
    notes: 'Strong DevOps background, currently happy but open to the right opportunity',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    lastContact: new Date('2024-01-22'),
    tags: ['devops', 'kubernetes', 'senior'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/michaelchen'
    }
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA'
    },
    status: 'active',
    source: 'job_board',
    title: 'UX/UI Designer',
    experience: 3,
    salary: {
      expected: 75000,
      currency: 'USD'
    },
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'HTML/CSS'],
    education: [
      {
        degree: 'BFA Graphic Design',
        institution: 'UT Austin',
        year: 2020
      }
    ],
    notes: 'Creative designer with strong user research skills, looking for growth opportunities',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    lastContact: new Date('2024-02-03'),
    tags: ['design', 'ux', 'ui', 'mid-level'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
      portfolio: 'https://emilydesigns.com'
    }
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    location: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA'
    },
    status: 'placed',
    source: 'linkedin',
    title: 'Data Scientist',
    experience: 4,
    salary: {
      current: 105000,
      currency: 'USD'
    },
    skills: ['Python', 'Machine Learning', 'SQL', 'Tableau', 'TensorFlow'],
    education: [
      {
        degree: 'PhD Data Science',
        institution: 'University of Washington',
        year: 2019
      }
    ],
    notes: 'Recently placed at tech startup, excellent analytical skills',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-10'),
    lastContact: new Date('2024-02-08'),
    tags: ['data-science', 'python', 'ml', 'placed'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidkim',
      github: 'https://github.com/davidk'
    }
  },
  {
    id: '5',
    firstName: 'Jessica',
    lastName: 'Thompson',
    email: 'jessica.thompson@email.com',
    phone: '+1 (555) 567-8901',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    },
    status: 'active',
    source: 'website',
    title: 'Product Manager',
    experience: 6,
    salary: {
      current: 115000,
      expected: 135000,
      currency: 'USD'
    },
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping', 'Stakeholder Management'],
    education: [
      {
        degree: 'MBA',
        institution: 'Northwestern Kellogg',
        year: 2018
      },
      {
        degree: 'BS Business',
        institution: 'University of Illinois',
        year: 2016
      }
    ],
    notes: 'Strong product leadership experience, looking for senior PM role in tech',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
    lastContact: new Date('2024-01-28'),
    tags: ['product', 'management', 'senior', 'tech'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jessicathompson'
    }
  },
  {
    id: '6',
    firstName: 'Alex',
    lastName: 'Singh',
    email: 'alex.singh@email.com',
    phone: '+1 (555) 678-9012',
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'USA'
    },
    status: 'active',
    source: 'referral',
    title: 'Full Stack Developer',
    experience: 2,
    salary: {
      expected: 80000,
      currency: 'USD'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Boston University',
        year: 2022
      }
    ],
    notes: 'Recent graduate with strong fundamentals, eager to learn and grow',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-08'),
    lastContact: new Date('2024-02-07'),
    tags: ['fullstack', 'javascript', 'junior', 'eager'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexsingh',
      github: 'https://github.com/alexs'
    }
  }
]