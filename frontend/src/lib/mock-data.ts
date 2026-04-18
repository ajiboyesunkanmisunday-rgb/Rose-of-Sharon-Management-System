import { Member, EMember, FirstTimer, SecondTimer, NewConvert, Report, Request, Message, CommunicationTemplate } from './types';

export const members: Member[] = Array.from({ length: 20 }, (_, i) => ({
  id: `m-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  status: 'active',
}));

export const eMembers: EMember[] = Array.from({ length: 20 }, (_, i) => ({
  id: `em-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  country: 'Ghana',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
}));

export const firstTimers: FirstTimer[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ft-${i + 1}`,
  name: 'John Michael',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
}));

export const secondTimers: SecondTimer[] = Array.from({ length: 20 }, (_, i) => ({
  id: `st-${i + 1}`,
  name: 'John Michael',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
}));

export const newConverts: NewConvert[] = Array.from({ length: 20 }, (_, i) => ({
  id: `nc-${i + 1}`,
  name: 'John Michael',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
}));

export const sampleReports: Report[] = [
  {
    id: 'r-1',
    content: 'Reached out to the member after Sunday service to check in and welcome them officially. They responded positively and expressed interest in joining a department. A second follow-up has been scheduled for later this week.',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'r-2',
    content: 'Member requested prayers regarding their job situation and upcoming interviews. Shared encouragement, and confirmed that the prayer team has been notified. Will follow up next week for updates.',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'r-3',
    content: 'Reached out to the member after Sunday service to check in and welcome them officially. They responded positively and expressed interest in joining a department. A second follow-up has been scheduled for later this week.',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'r-4',
    content: 'Member requested prayers regarding their job situation and upcoming interviews. Shared encouragement, and confirmed that the prayer team has been notified. Will follow up next week for updates.',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'r-5',
    content: 'Reached out to the member after Sunday service to check in and welcome them officially. They responded positively and expressed interest in joining a department. A second follow-up has been scheduled for later this week.',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
];

export const sampleRequests: Request[] = [
  {
    id: 'req-1',
    title: 'Counseling',
    content: 'I would like to speak with a counselor regarding some personal and family concerns. It\'s been affecting my focus and emotional well-being lately. I\'m available for a session anytime this week.',
    category: 'Counseling',
    status: 'Treated',
    submittedBy: 'John Michael',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'req-2',
    title: 'Counseling',
    content: 'I would like to speak with a counselor regarding some personal and family concerns. It\'s been affecting my focus and emotional well-being lately. I\'m available for a session anytime this week.',
    category: 'Celebration',
    status: 'In Progress',
    submittedBy: 'Sarah Bamidele',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'req-3',
    title: 'Complaint',
    content: 'I noticed some delays in communication regarding recent events and updates. It made it difficult to plan accordingly. I would appreciate more timely updates going forward.',
    category: 'Prayer',
    status: 'Not treated',
    submittedBy: 'John Michael',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'req-4',
    title: 'Complaint',
    content: 'I noticed some delays in communication regarding recent events and updates. It made it difficult to plan accordingly. I would appreciate more timely updates going forward.',
    category: 'Complaint',
    status: 'In Progress',
    submittedBy: 'Sarah Bamidele',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'req-5',
    title: 'Complaint',
    content: 'I noticed some delays in communication regarding recent events and updates. It made it difficult to plan accordingly. I would appreciate more timely updates going forward.',
    category: 'Suggestion',
    status: 'In Progress',
    submittedBy: 'John Michael',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
];

export const allRequests: Request[] = Array.from({ length: 20 }, (_, i) => ({
  id: `req-${i + 1}`,
  title: ['Counseling', 'Complaint', 'Prayer Request', 'Suggestion', 'Testimony'][i % 5],
  content: [
    'I would like to speak with a counselor regarding personal concerns.',
    'I noticed delays in communication regarding recent events.',
    'Please pray for my family during this challenging time.',
    'I suggest we start a youth mentorship program.',
    'God has been faithful! I got a new job after months of prayer.',
  ][i % 5],
  category: (['Counseling', 'Complaint', 'Prayer', 'Suggestion', 'Suggestion'] as const)[i % 5],
  status: (['Treated', 'In Progress', 'Not treated'] as const)[i % 3],
  submittedBy: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  assignedTo: 'Pastor David',
  addedBy: 'Shola Damson',
  date: '04/03/2026',
}));

export const messages: Message[] = Array.from({ length: 20 }, (_, i) => ({
  id: `msg-${i + 1}`,
  type: i % 2 === 0 ? 'SMS' as const : 'Email' as const,
  recipient: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  recipientPhone: i % 2 === 0 ? '08011252365' : '09037311234',
  recipientEmail: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
  subject: i % 2 === 0 ? undefined : 'Sunday Service Reminder',
  content: i % 2 === 0 ? 'Dear member, you are reminded of the upcoming Sunday service...' : 'Dear member, please find attached the details for this week\'s service...',
  status: ['Delivered', 'Pending', 'Failed'][i % 3] as 'Delivered' | 'Pending' | 'Failed',
  sentBy: 'Admin',
  date: '04/03/2026',
}));

export const communicationTemplates: CommunicationTemplate[] = [
  { id: 'tpl-1', name: 'Sunday Reminder', type: 'SMS', content: 'Dear {name}, this is a reminder for our Sunday service at 9:00 AM.', createdBy: 'Admin', lastModified: '03/15/2026' },
  { id: 'tpl-2', name: 'Welcome Message', type: 'Email', subject: 'Welcome to Rose of Sharon!', content: 'Dear {name}, welcome to RCCG Rose of Sharon. We are glad to have you...', createdBy: 'Admin', lastModified: '03/10/2026' },
  { id: 'tpl-3', name: 'Birthday Greeting', type: 'SMS', content: 'Happy Birthday {name}! Wishing you a blessed year ahead. - RCCG Rose of Sharon', createdBy: 'Admin', lastModified: '02/28/2026' },
  { id: 'tpl-4', name: 'Event Invitation', type: 'Email', subject: 'You are Invited!', content: 'Dear {name}, you are cordially invited to {event} on {date}...', createdBy: 'Admin', lastModified: '03/20/2026' },
  { id: 'tpl-5', name: 'Follow-up Message', type: 'SMS', content: 'Hi {name}, we hope you enjoyed the service. We would love to see you again!', createdBy: 'Admin', lastModified: '03/25/2026' },
  { id: 'tpl-6', name: 'Prayer Request Acknowledgment', type: 'Email', subject: 'Prayer Request Received', content: 'Dear {name}, we have received your prayer request and our team is praying for you.', createdBy: 'Admin', lastModified: '03/28/2026' },
];

export const profileDetails = {
  firstName: 'John',
  lastName: 'Michael',
  email: 'john123@gmail.com',
  phoneNumber: '08093465363',
  whatsappNumber: '08093465363',
  address: '123 Salami Street, Ikotun, Lagos, Nigeria.',
  gender: 'Male',
  dateOfBirth: '01/03/1976',
  maritalStatus: 'Single',
  occupation: 'Tech',
  date: '01/03/2026',
  group: 'Choir',
  dateJoined: '01/03/2026',
  spouse: '',
};
