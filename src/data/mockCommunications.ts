import { Communication } from '../types/communication'

export const mockCommunications: Communication[] = [
  {
    id: '1',
    candidateId: '1', // Sarah Johnson
    type: 'email',
    subject: 'Senior Developer Position at TechCorp',
    content: 'Hi Sarah, I came across your profile and was impressed by your React experience. I have an exciting senior developer role at TechCorp that might interest you. Would you be available for a brief call this week?',
    direction: 'outbound',
    date: new Date('2024-02-08T10:30:00'),
    outcome: 'positive',
    tags: ['initial-outreach', 'senior-dev-role'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-08T10:30:00'),
    updatedAt: new Date('2024-02-08T10:30:00')
  },
  {
    id: '2',
    candidateId: '1',
    type: 'email',
    subject: 'Re: Senior Developer Position at TechCorp',
    content: 'Hi John, Thank you for reaching out! The role sounds interesting. I\'d be happy to learn more. I\'m available for a call tomorrow afternoon or Friday morning.',
    direction: 'inbound',
    date: new Date('2024-02-08T16:45:00'),
    outcome: 'positive',
    tags: ['interested', 'scheduling'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-08T16:45:00'),
    updatedAt: new Date('2024-02-08T16:45:00')
  },
  {
    id: '3',
    candidateId: '1',
    type: 'call',
    subject: 'Initial screening call',
    content: 'Great conversation! Sarah is very interested in the role. She has strong React/TypeScript skills and is looking for more backend exposure. Available for interview next week.',
    direction: 'outbound',
    date: new Date('2024-02-09T14:00:00'),
    duration: 25,
    outcome: 'positive',
    tags: ['screening-passed', 'interview-ready'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-09T14:30:00'),
    updatedAt: new Date('2024-02-09T14:30:00')
  },
  {
    id: '4',
    candidateId: '2', // Michael Chen
    type: 'linkedin',
    subject: 'DevOps Engineer Opportunity',
    content: 'Hi Michael, I noticed your impressive DevOps background at your current company. I have a senior DevOps role that offers great growth opportunities. Interested in learning more?',
    direction: 'outbound',
    date: new Date('2024-02-05T09:15:00'),
    outcome: 'neutral',
    tags: ['linkedin-outreach', 'devops'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-05T09:15:00'),
    updatedAt: new Date('2024-02-05T09:15:00')
  },
  {
    id: '5',
    candidateId: '2',
    type: 'note',
    content: 'Michael is currently happy at his role but open to the right opportunity. He\'s particularly interested in cloud architecture and Kubernetes. Suggested following up in 3 months or if we get a perfect match.',
    direction: 'outbound',
    date: new Date('2024-02-06T11:20:00'),
    outcome: 'follow-up-needed',
    tags: ['passive', 'kubernetes', 'follow-up-3months'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-06T11:20:00'),
    updatedAt: new Date('2024-02-06T11:20:00')
  },
  {
    id: '6',
    candidateId: '3', // Emily Rodriguez
    type: 'call',
    subject: 'UX Designer Role Discussion',
    content: 'Emily is very enthusiastic about UX/UI work. She showed great portfolio pieces and has solid user research experience. Salary expectations align with budget. Scheduling client interview.',
    direction: 'outbound',
    date: new Date('2024-02-07T15:30:00'),
    duration: 30,
    outcome: 'positive',
    tags: ['portfolio-review', 'client-interview'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-07T16:00:00'),
    updatedAt: new Date('2024-02-07T16:00:00')
  },
  {
    id: '7',
    candidateId: '4', // David Kim
    type: 'email',
    subject: 'Placement Confirmation - Data Scientist Role',
    content: 'Congratulations David! The client has confirmed your offer for the Data Scientist position. Please review the attached offer letter and let me know if you have any questions.',
    direction: 'outbound',
    date: new Date('2024-02-10T13:45:00'),
    outcome: 'positive',
    tags: ['offer-extended', 'placement'],
    attachments: [
      {
        fileName: 'offer_letter_david_kim.pdf',
        url: '/documents/offers/david_kim_offer.pdf',
        type: 'application/pdf'
      }
    ],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-10T13:45:00'),
    updatedAt: new Date('2024-02-10T13:45:00')
  },
  {
    id: '8',
    candidateId: '5', // Jessica Thompson
    type: 'meeting',
    subject: 'Client Interview - Product Manager Role',
    content: 'Jessica had an excellent interview with the client. They were impressed with her product strategy experience and roadmapping skills. Client wants to move forward with reference checks.',
    direction: 'outbound',
    date: new Date('2024-02-09T11:00:00'),
    duration: 60,
    outcome: 'positive',
    tags: ['client-interview', 'reference-check'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-09T12:30:00'),
    updatedAt: new Date('2024-02-09T12:30:00')
  },
  {
    id: '9',
    candidateId: '6', // Alex Singh
    type: 'text',
    content: 'Hi Alex! Quick update - the client loved your technical assessment. They want to schedule a final interview for next Tuesday. Are you available in the afternoon?',
    direction: 'outbound',
    date: new Date('2024-02-08T17:20:00'),
    outcome: 'positive',
    tags: ['technical-passed', 'final-interview'],
    createdBy: 'John Recruiter',
    createdAt: new Date('2024-02-08T17:20:00'),
    updatedAt: new Date('2024-02-08T17:20:00')
  }
]