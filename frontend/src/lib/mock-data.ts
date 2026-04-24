import { Member, EMember, FirstTimer, SecondTimer, NewConvert, Report, Request, Message, CommunicationTemplate, Announcement, ChurchEvent, DirectoryContact, MediaItem, CalendarEvent, WorkflowTemplate, ActiveWorkflowCard, Course, TrainingSchedule, Celebration, Role, Group, PermissionMatrix, FollowUpOfficer, BelieversClass, Testimony, ActivityLog, UrgentFollowUp, MinisterOnDuty, PrayerRequest, BirthdayReminder } from './types';

export const followUpOfficers: FollowUpOfficer[] = [
  { id: 'fo-1', name: 'Shola Damson', department: 'Follow-up', phone: '+234 801 111 2222', email: 'shola@church.org' },
  { id: 'fo-2', name: 'Aisha Bello', department: 'Follow-up', phone: '+234 802 222 3333', email: 'aisha@church.org' },
  { id: 'fo-3', name: 'David Okoro', department: 'Pastoral Care', phone: '+234 803 333 4444', email: 'david@church.org' },
  { id: 'fo-4', name: 'Grace Adeyemi', department: 'Follow-up', phone: '+234 804 444 5555', email: 'grace@church.org' },
  { id: 'fo-5', name: 'Samuel Eze', department: 'Pastoral Care', phone: '+234 805 555 6666', email: 'samuel@church.org' },
  { id: 'fo-6', name: 'Ruth Balogun', department: "Women's Team", phone: '+234 806 666 7777', email: 'ruth@church.org' },
];

export const members: Member[] = Array.from({ length: 20 }, (_, i) => ({
  id: `m-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  middleName: i % 3 === 0 ? 'Olu' : undefined,
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
  countryCode: '+234',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  maritalStatus: i % 3 === 0 ? 'Married' : 'Single',
  spouse: i % 3 === 0 ? { name: 'Mary Adebayo', weddingDate: '2020-06-15' } : undefined,
  status: 'active',
}));

export const eMembers: EMember[] = Array.from({ length: 20 }, (_, i) => ({
  id: `em-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  middleName: i % 3 === 0 ? 'Kay' : undefined,
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  country: 'Ghana',
  countryCode: '+233',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
  dateOfBirth: '1990-05-12',
  maritalStatus: i % 2 === 0 ? 'Single' : 'Married',
  serviceAttended: 'Sunday',
  spouse: i % 2 === 0 ? undefined : { name: 'Peter Bamidele', weddingDate: '2018-11-20' },
}));

export const firstTimers: FirstTimer[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ft-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  gender: i % 2 === 0 ? 'Male' : 'Female',
  name: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  countryCode: '+234',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  followUpOfficerId: 'fo-1',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
  maritalStatus: 'Single',
  worshippedOnlineBefore: false,
}));

export const secondTimers: SecondTimer[] = Array.from({ length: 20 }, (_, i) => ({
  id: `st-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  gender: i % 2 === 0 ? 'Male' : 'Female',
  name: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  countryCode: '+234',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  followUpOfficerId: 'fo-2',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
  maritalStatus: 'Single',
  worshippedOnlineBefore: true,
}));

const _bcClasses: BelieversClass[] = ['Not started', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

export const newConverts: NewConvert[] = Array.from({ length: 20 }, (_, i) => ({
  id: `nc-${i + 1}`,
  firstName: i % 2 === 0 ? 'John' : 'Sarah',
  lastName: i % 2 === 0 ? 'Michael' : 'Bamidele',
  gender: i % 2 === 0 ? 'Male' : 'Female',
  name: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  countryCode: '+234',
  phone: i % 2 === 0 ? '08011252365' : '09037311234',
  email: i % 2 === 0 ? 'john123@gmail.com' : 'jonn123@gmail.com',
  serviceAttended: 'Sunday Service',
  assignedFollowUp: 'Shola Damson',
  date: '01/03/2026',
  calls: 2,
  visits: 1,
  believersClass: _bcClasses[i % _bcClasses.length],
  classAttendance: Array.from({ length: 5 }, (_, j) => j < (i % 6)),
  addressStreet: '123 Sample Street',
  addressCity: 'Lagos',
  addressState: 'Lagos',
  addressCountry: 'Nigeria',
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
    status: 'Resolved',
    submittedBy: 'John Michael',
    assignedTo: 'Pastor David',
    addedBy: 'Shola Damson',
    date: '04/03/2026',
  },
  {
    id: 'req-2',
    title: 'Counseling',
    content: 'I would like to speak with a counselor regarding some personal and family concerns. It\'s been affecting my focus and emotional well-being lately. I\'m available for a session anytime this week.',
    category: 'Counseling',
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
    status: 'Received',
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
  status: (['Received', 'Assigned', 'In Progress', 'Resolved'] as const)[i % 4],
  submittedBy: (i === 2 || i === 7) ? '' : (i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele'),
  assignedTo: 'Pastor David',
  addedBy: 'Shola Damson',
  date: '04/03/2026',
}));

const _msgStatuses: Array<'Sent' | 'Scheduled' | 'Failed'> = ['Sent', 'Sent', 'Scheduled', 'Sent', 'Failed', 'Scheduled', 'Sent', 'Sent', 'Scheduled', 'Sent', 'Sent', 'Failed', 'Scheduled', 'Sent', 'Sent', 'Sent', 'Failed', 'Sent', 'Sent', 'Sent'];
const _msgTimes: string[] = ['08:15 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:45 AM', '12:15 PM', '01:00 PM', '02:20 PM', '03:10 PM', '03:45 PM', '04:00 PM', '04:30 PM', '05:15 PM', '06:00 PM', '06:40 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:45 PM'];

export const messages: Message[] = Array.from({ length: 20 }, (_, i) => ({
  id: `msg-${i + 1}`,
  type: i % 2 === 0 ? 'SMS' as const : 'Email' as const,
  recipient: i % 2 === 0 ? 'John Michael' : 'Sarah Bamidele',
  recipientPhone: i % 2 === 0 ? '08011252365' : '09037311234',
  recipientEmail: i % 2 === 0 ? 'john123@gmail.com' : 'sarah345@gmail.com',
  subject: i % 2 === 0 ? undefined : 'Sunday Service Reminder',
  content: i % 2 === 0 ? 'Dear member, you are reminded of the upcoming Sunday service...' : 'Dear member, please find attached the details for this week\'s service...',
  status: _msgStatuses[i],
  sentBy: 'Admin',
  date: '04/03/2026',
  time: _msgTimes[i],
}));

export const urgentFollowUps: UrgentFollowUp[] = Array.from({ length: 20 }, (_, i) => {
  const categories: UrgentFollowUp['category'][] = ['First Timer', 'Second Timer', 'New Convert', 'Prayer Request'];
  const names = ['John Michael', 'Sarah Bamidele', 'David Okonkwo', 'Grace Adeyemi', 'Emmanuel Nwosu', 'Blessing Okoro', 'Peter Adewale', 'Ruth Balogun', 'Mary Eze', 'Samuel Chukwu', 'Esther Obi', 'James Adewale', 'Tobi Lawal', 'Funke Ade', 'Chinedu Obi', 'Ngozi Eze', 'Yetunde Ojo', 'Kunle Bello', 'Zainab Musa', 'Segun Oyelade'];
  const officers = followUpOfficers.map(f => f.name);
  const days = [12, 9, 7, 15, 3, 5, 0, 8, 20, 2, 4, 6, 11, 1, 0, 14, 17, 3, 5, 9];
  const d = days[i];
  const status: UrgentFollowUp['status'] = d === 0 ? 'Due Today' : d >= 10 ? 'Critical' : 'Overdue';
  return {
    id: `uf-${i + 1}`,
    name: names[i],
    phone: i % 2 === 0 ? '08011252365' : '09037311234',
    assignedOfficer: officers[i % officers.length],
    daysOverdue: d,
    status,
    lastContact: '04/03/2026',
    category: categories[i % 4],
  };
});

export const communicationTemplates: CommunicationTemplate[] = [
  { id: 'tpl-1', name: 'Sunday Reminder', type: 'SMS', content: 'Dear {name}, this is a reminder for our Sunday service at 9:00 AM.', createdBy: 'Admin', lastModified: '03/15/2026' },
  { id: 'tpl-2', name: 'Welcome Message', type: 'Email', subject: 'Welcome to Rose of Sharon!', content: 'Dear {name}, welcome to RCCG Rose of Sharon. We are glad to have you...', createdBy: 'Admin', lastModified: '03/10/2026' },
  { id: 'tpl-3', name: 'Birthday Greeting', type: 'SMS', content: 'Happy Birthday {name}! Wishing you a blessed year ahead. - RCCG Rose of Sharon', createdBy: 'Admin', lastModified: '02/28/2026' },
  { id: 'tpl-4', name: 'Event Invitation', type: 'Email', subject: 'You are Invited!', content: 'Dear {name}, you are cordially invited to {event} on {date}...', createdBy: 'Admin', lastModified: '03/20/2026' },
  { id: 'tpl-5', name: 'Follow-up Message', type: 'SMS', content: 'Hi {name}, we hope you enjoyed the service. We would love to see you again!', createdBy: 'Admin', lastModified: '03/25/2026' },
  { id: 'tpl-6', name: 'Prayer Request Acknowledgment', type: 'Email', subject: 'Prayer Request Received', content: 'Dear {name}, we have received your prayer request and our team is praying for you.', createdBy: 'Admin', lastModified: '03/28/2026' },
];

export const allAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Sunday Service Change',
    body: 'Please be informed that this Sunday\'s service will start at 10:00 AM instead of the usual 9:00 AM. We look forward to worshipping with you.',
    audience: 'All Members',
    scheduledDate: '04/25/2026',
    status: 'Scheduled',
    createdBy: 'Pastor David',
    createdDate: '04/15/2026',
  },
  {
    id: 'ann-2',
    title: 'Choir Rehearsal Reminder',
    body: 'Choir members are reminded of the special rehearsal on Saturday at 4:00 PM ahead of the upcoming anniversary service.',
    audience: 'Choir',
    scheduledDate: '04/20/2026',
    status: 'Published',
    createdBy: 'Admin',
    createdDate: '04/14/2026',
  },
  {
    id: 'ann-3',
    title: 'Workers Meeting',
    body: 'All church workers are invited to the monthly workers meeting on Friday at 6:00 PM in the main hall.',
    audience: 'Workers',
    scheduledDate: '04/19/2026',
    status: 'Published',
    createdBy: 'Pastor David',
    createdDate: '04/13/2026',
  },
  {
    id: 'ann-4',
    title: 'Youth Conference Registration',
    body: 'Registration for the annual youth conference is now open. Visit the youth desk or register online before May 1st.',
    audience: 'Youth',
    scheduledDate: '04/30/2026',
    status: 'Scheduled',
    createdBy: 'Youth Pastor',
    createdDate: '04/12/2026',
  },
  {
    id: 'ann-5',
    title: 'Children\'s Day Preparations',
    body: 'Parents, please ensure your children wear white on Children\'s Day. A special program has been prepared.',
    audience: 'Children',
    scheduledDate: '05/01/2026',
    status: 'Draft',
    createdBy: 'Children Coordinator',
    createdDate: '04/10/2026',
  },
  {
    id: 'ann-6',
    title: 'Ushering Schedule Update',
    body: 'The new ushering roster has been published. Please check the notice board or contact your team lead.',
    audience: 'Ushering',
    scheduledDate: '04/18/2026',
    status: 'Published',
    createdBy: 'Head Usher',
    createdDate: '04/11/2026',
  },
  {
    id: 'ann-7',
    title: 'Thanksgiving Service',
    body: 'Join us for our monthly thanksgiving service on the last Sunday of this month. Come with a grateful heart.',
    audience: 'All Members',
    scheduledDate: '04/27/2026',
    status: 'Scheduled',
    createdBy: 'Pastor David',
    createdDate: '04/09/2026',
  },
  {
    id: 'ann-8',
    title: 'Mid-Year Evaluation',
    body: 'All department heads are to submit their mid-year evaluation reports by the end of next week.',
    audience: 'Workers',
    scheduledDate: '05/03/2026',
    status: 'Draft',
    createdBy: 'Admin',
    createdDate: '04/08/2026',
  },
];

export const allEvents: ChurchEvent[] = [
  { id: 'ev-1', name: 'Sunday Worship Service', topic: 'Walking in Divine Purpose', type: 'Hybrid', createdDate: '04/01/2026', eventDate: '04/19/2026', date: '04/19/2026', startTime: '09:00', endTime: '11:30', location: 'Main Auditorium', category: 'Service', description: 'Weekly worship service with sermon, worship, and fellowship.', capacity: 600, attendees: 450, status: 'Upcoming', requiresRegistration: false, createdBy: 'Pastor David', newConvertsCount: 12, firstTimersCount: 25, secondTimersCount: 18, eMembersCount: 40 },
  { id: 'ev-2', name: 'Annual Church Conference', topic: 'Kingdom Builders 2026', type: 'Physical', createdDate: '04/10/2026', eventDate: '05/01/2026', date: '05/01/2026', startTime: '08:00', endTime: '17:00', location: 'Convention Center', category: 'Conference', description: 'Three-day annual conference with guest speakers and workshops.', capacity: 1500, attendees: 1200, status: 'Upcoming', requiresRegistration: true, createdBy: 'Admin', newConvertsCount: 30, firstTimersCount: 80, secondTimersCount: 50, eMembersCount: 150 },
  { id: 'ev-3', name: 'Leadership Training Workshop', topic: 'Leading with Vision', type: 'Physical', createdDate: '04/05/2026', eventDate: '04/25/2026', date: '04/25/2026', startTime: '10:00', endTime: '15:00', location: 'Fellowship Hall', category: 'Training', description: 'Intensive leadership development workshop for church workers.', capacity: 100, attendees: 85, status: 'Upcoming', requiresRegistration: true, createdBy: 'Pastor James', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 5 },
  { id: 'ev-4', name: 'Youth Fun Day', topic: 'Youth on Fire', type: 'Physical', createdDate: '03/28/2026', eventDate: '04/18/2026', date: '04/18/2026', startTime: '12:00', endTime: '18:00', location: 'Church Grounds', category: 'Social', description: 'A day of games, music, and fellowship for the youth.', capacity: 150, attendees: 120, status: 'Upcoming', requiresRegistration: false, createdBy: 'Youth Pastor', newConvertsCount: 5, firstTimersCount: 10, secondTimersCount: 8, eMembersCount: 12 },
  { id: 'ev-5', name: 'Midweek Bible Study', topic: 'The Book of Acts', type: 'Hybrid', createdDate: '03/25/2026', eventDate: '04/15/2026', date: '04/15/2026', startTime: '18:00', endTime: '20:00', location: 'Room 201', category: 'Service', description: 'Weekly Bible study and prayer meeting.', capacity: 150, attendees: 95, status: 'Ongoing', requiresRegistration: false, createdBy: 'Pastor David', newConvertsCount: 3, firstTimersCount: 7, secondTimersCount: 5, eMembersCount: 20 },
  { id: 'ev-6', name: 'Workers Training Seminar', topic: 'Serving with Excellence', type: 'Physical', createdDate: '03/20/2026', eventDate: '04/10/2026', date: '04/10/2026', startTime: '09:00', endTime: '14:00', location: 'Training Room', category: 'Training', description: 'Training seminar for newly appointed workers.', capacity: 80, attendees: 60, status: 'Completed', requiresRegistration: true, createdBy: 'Admin', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 3 },
  { id: 'ev-7', name: 'Easter Celebration Service', topic: 'He is Risen', type: 'Hybrid', createdDate: '03/08/2026', eventDate: '03/29/2026', date: '03/29/2026', startTime: '09:00', endTime: '12:00', location: 'Main Auditorium', category: 'Service', description: 'Special Easter Sunday celebration service.', capacity: 1000, attendees: 800, status: 'Completed', requiresRegistration: false, createdBy: 'Pastor David', newConvertsCount: 45, firstTimersCount: 120, secondTimersCount: 60, eMembersCount: 80 },
  { id: 'ev-8', name: 'Church Picnic & Fellowship', topic: 'One Family', type: 'Physical', createdDate: '03/01/2026', eventDate: '03/22/2026', date: '03/22/2026', startTime: '11:00', endTime: '17:00', location: 'City Park', category: 'Social', description: 'Annual outdoor fellowship picnic with food and games.', capacity: 300, attendees: 200, status: 'Completed', requiresRegistration: true, createdBy: 'Admin', newConvertsCount: 8, firstTimersCount: 15, secondTimersCount: 12, eMembersCount: 25 },
  { id: 'ev-9', name: 'Marriage Enrichment Seminar', topic: 'Covenant Couples', type: 'Physical', createdDate: '04/20/2026', eventDate: '05/10/2026', date: '05/10/2026', startTime: '14:00', endTime: '18:00', location: 'Fellowship Hall', category: 'Training', description: 'Seminar for married couples on strengthening their marriage.', capacity: 150, attendees: 0, status: 'Upcoming', requiresRegistration: true, createdBy: 'Pastor David', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 0 },
  { id: 'ev-10', name: 'Community Outreach', topic: 'Reaching the Lost', type: 'Physical', createdDate: '04/22/2026', eventDate: '05/15/2026', date: '05/15/2026', startTime: '08:00', endTime: '16:00', location: 'City Center', category: 'Outreach', description: 'Evangelism and community service outreach.', capacity: 200, attendees: 0, status: 'Upcoming', requiresRegistration: true, createdBy: 'Admin', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 0 },
  { id: 'ev-11', name: 'Choir Anniversary Concert', topic: 'Voices Raised', type: 'Hybrid', createdDate: '05/01/2026', eventDate: '05/22/2026', date: '05/22/2026', startTime: '16:00', endTime: '20:00', location: 'Main Auditorium', category: 'Service', description: 'Special concert celebrating the choir department anniversary.', capacity: 800, attendees: 0, status: 'Upcoming', requiresRegistration: false, createdBy: 'Choir Director', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 0 },
  { id: 'ev-12', name: 'Children\'s Day Celebration', topic: 'Little Lights', type: 'Physical', createdDate: '05/07/2026', eventDate: '05/28/2026', date: '05/28/2026', startTime: '10:00', endTime: '15:00', location: 'Main Auditorium', category: 'Social', description: 'Special program for the children of the church.', capacity: 400, attendees: 0, status: 'Upcoming', requiresRegistration: false, createdBy: 'Children Coordinator', newConvertsCount: 0, firstTimersCount: 0, secondTimersCount: 0, eMembersCount: 0 },
];

export const directoryContacts: DirectoryContact[] = [
  { id: 'dir-1', name: 'Pastor James Adewale', role: 'Senior Pastor', group: 'Pastoral', phone: '+234 801 234 5678', email: 'james.adewale@church.org', address: '15 Allen Avenue, Ikeja, Lagos', department: 'Pastoral', joinedDate: '01/15/2015' },
  { id: 'dir-2', name: 'Grace Nwosu', role: 'Associate Pastor', group: 'Pastoral', phone: '+234 802 345 6789', email: 'grace.nwosu@church.org', address: '22 Adeniyi Jones, Ikeja', department: 'Pastoral', joinedDate: '03/10/2017' },
  { id: 'dir-3', name: 'Emmanuel Okafor', role: 'Deacon', group: 'Deacons', phone: '+234 803 456 7890', email: 'emmanuel.okafor@church.org', address: '45 Opebi Road, Ikeja', department: 'Deacons', joinedDate: '06/20/2018' },
  { id: 'dir-4', name: 'Sarah Bamidele', role: 'Choir Director', group: 'Music', phone: '+234 804 567 8901', email: 'sarah.bamidele@church.org', address: '8 Toyin Street, Ikeja', department: 'Music', joinedDate: '08/01/2019' },
  { id: 'dir-5', name: 'David Okonkwo', role: 'Youth Leader', group: 'Youth', phone: '+234 805 678 9012', email: 'david.okonkwo@church.org', address: '12 Awolowo Road, Ikoyi', department: 'Youth', joinedDate: '02/14/2020' },
  { id: 'dir-6', name: 'Blessing Okoro', role: "Children's Teacher", group: 'Children', phone: '+234 806 789 0123', email: 'blessing.okoro@church.org', address: '3 Marina Street, Lagos Island', department: 'Children', joinedDate: '09/05/2020' },
  { id: 'dir-7', name: 'John Michael', role: 'Usher Coordinator', group: 'Ushering', phone: '+234 807 890 1234', email: 'john.michael@church.org', address: '123 Salami Street, Ikotun, Lagos', department: 'Ushering', joinedDate: '01/12/2021' },
  { id: 'dir-8', name: 'Ruth Balogun', role: "Women's Leader", group: 'Women', phone: '+234 808 901 2345', email: 'ruth.balogun@church.org', address: '7 Queen Street, Ikeja', department: 'Women', joinedDate: '04/18/2021' },
  { id: 'dir-9', name: 'Peter Adewale', role: "Men's Leader", group: 'Men', phone: '+234 809 012 3456', email: 'peter.adewale@church.org', address: '20 Ogunlana Drive, Surulere', department: 'Men', joinedDate: '07/22/2021' },
  { id: 'dir-10', name: 'Mary Eze', role: 'Media Coordinator', group: 'Media', phone: '+234 810 123 4567', email: 'mary.eze@church.org', address: '14 Olayinka Street, Yaba', department: 'Media', joinedDate: '11/03/2021' },
  { id: 'dir-11', name: 'Samuel Chukwu', role: 'Technical Director', group: 'Media', phone: '+234 811 234 5678', email: 'samuel.chukwu@church.org', address: '9 Adeola Hopewell, Victoria Island', department: 'Media', joinedDate: '02/09/2022' },
  { id: 'dir-12', name: 'Esther Obi', role: 'Welfare Secretary', group: 'Welfare', phone: '+234 812 345 6789', email: 'esther.obi@church.org', address: '28 Aguiyi Ironsi, Maitama', department: 'Welfare', joinedDate: '05/15/2022' },
];

export const mediaItems: MediaItem[] = [
  { id: 'med-1', title: 'Walking in Faith', description: 'A sermon on trusting God through life\'s challenges and walking boldly in faith.', type: 'Sermon', speaker: 'Pastor James Adewale', date: '04/13/2026', duration: '45 min', tags: ['faith', 'sunday sermon'], createdBy: 'Media Team' },
  { id: 'med-2', title: 'The Power of Prayer', description: 'Midweek teaching on the transforming power of consistent prayer.', type: 'Sermon', speaker: 'Pastor David', date: '04/10/2026', duration: '38 min', tags: ['prayer', 'midweek'], createdBy: 'Media Team' },
  { id: 'med-3', title: 'Morning Devotion Episode 12', description: 'Weekly devotional podcast featuring scripture reflection and worship.', type: 'Podcast', speaker: 'Deaconess Grace', date: '04/12/2026', duration: '22 min', tags: ['devotion', 'podcast'], createdBy: 'Media Team' },
  { id: 'med-4', title: 'Youth Conference Highlights', description: 'Full-length recording of the 2026 Youth Conference keynote session.', type: 'Video', speaker: 'Various Speakers', date: '04/05/2026', duration: '1h 25min', tags: ['youth', 'conference'], createdBy: 'Media Team' },
  { id: 'med-5', title: 'Identity in Christ', description: 'Teaching series on understanding our identity as believers.', type: 'Sermon', speaker: 'Pastor James Adewale', date: '04/06/2026', duration: '42 min', tags: ['identity', 'teaching'], createdBy: 'Media Team' },
  { id: 'med-6', title: 'Marriage & Family Podcast', description: 'Guest interview on building strong Christian marriages and families.', type: 'Podcast', speaker: 'Pastor & Mrs. Adeyemi', date: '04/08/2026', duration: '35 min', tags: ['marriage', 'family'], createdBy: 'Media Team' },
  { id: 'med-7', title: 'Easter Sunday Service', description: 'Full Easter celebration service with worship, communion, and sermon.', type: 'Video', speaker: 'Pastor James Adewale', date: '03/29/2026', duration: '1h 45min', tags: ['easter', 'service'], createdBy: 'Media Team' },
  { id: 'med-8', title: 'Praise Night 2026', description: 'Recording of the annual praise and worship night.', type: 'Video', speaker: 'Choir', date: '03/22/2026', duration: '2h 10min', tags: ['praise', 'worship'], createdBy: 'Media Team' },
  { id: 'med-9', title: 'The Book of Acts Series - Part 1', description: 'Beginning of a new teaching series through the Book of Acts.', type: 'Sermon', speaker: 'Pastor David', date: '03/15/2026', duration: '48 min', tags: ['acts', 'series'], createdBy: 'Media Team' },
  { id: 'med-10', title: 'Counseling Corner Podcast', description: 'Christian counseling discussion on emotional healing.', type: 'Podcast', speaker: 'Counseling Team', date: '03/18/2026', duration: '28 min', tags: ['counseling', 'healing'], createdBy: 'Media Team' },
  { id: 'med-11', title: 'Easter Service Gallery', description: 'Photo highlights from Easter Sunday service.', type: 'Picture', speaker: 'Media Team', date: '03/29/2026', duration: '—', thumbnail: '/rccg-logo.png', tags: ['easter', 'gallery'], createdBy: 'Media Team' },
  { id: 'med-12', title: 'Youth Fun Day Pictures', description: 'Moments from the Youth Fun Day.', type: 'Picture', speaker: 'Media Team', date: '04/18/2026', duration: '—', thumbnail: '/rccg-logo.png', tags: ['youth', 'gallery'], createdBy: 'Media Team' },
  { id: 'med-13', title: 'Conference Opening Ceremony', description: 'Photos from the annual conference opening.', type: 'Picture', speaker: 'Media Team', date: '05/01/2026', duration: '—', thumbnail: '/rccg-logo.png', tags: ['conference'], createdBy: 'Media Team' },
  { id: 'med-14', title: 'Praise Night Highlights', description: 'Gallery from the annual praise night.', type: 'Picture', speaker: 'Media Team', date: '03/22/2026', duration: '—', thumbnail: '/rccg-logo.png', tags: ['praise', 'worship'], createdBy: 'Media Team' },
];

export const ministersOnDuty: MinisterOnDuty[] = [
  { id: 'mod-1', date: '2026-04-05', program: 'Sunday Sermon', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
  { id: 'mod-2', date: '2026-04-07', program: 'Tuesday Digging Deep', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: true },
  { id: 'mod-3', date: '2026-04-10', program: 'Friday Prayer', minister: 'Deaconess Grace', phone: '+234 803 333 4444', reminderEnabled: false },
  { id: 'mod-4', date: '2026-04-12', program: 'Sunday Sermon', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: true },
  { id: 'mod-5', date: '2026-04-14', program: 'Tuesday Digging Deep', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
  { id: 'mod-6', date: '2026-04-17', program: 'Friday Prayer', minister: 'Elder Samuel', phone: '+234 805 555 6666', reminderEnabled: true },
  { id: 'mod-7', date: '2026-04-19', program: 'Sunday Sermon', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
  { id: 'mod-8', date: '2026-04-19', program: 'Fresh Anointing', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: false },
  { id: 'mod-9', date: '2026-04-21', program: 'Tuesday Digging Deep', minister: 'Deaconess Grace', phone: '+234 803 333 4444', reminderEnabled: true },
  { id: 'mod-10', date: '2026-04-24', program: 'Friday Prayer', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
  { id: 'mod-11', date: '2026-04-26', program: 'Sunday Sermon', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: true },
  { id: 'mod-12', date: '2026-04-28', program: 'Tuesday Digging Deep', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: false },
  { id: 'mod-13', date: '2026-04-01', program: 'Fresh Anointing', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
  { id: 'mod-14', date: '2026-04-03', program: 'Friday Prayer', minister: 'Deaconess Grace', phone: '+234 803 333 4444', reminderEnabled: true },
  { id: 'mod-15', date: '2026-04-05', program: 'Fresh Anointing', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: true },
  { id: 'mod-16', date: '2026-04-12', program: 'Fresh Anointing', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: false },
  { id: 'mod-17', date: '2026-04-15', program: 'Other', minister: 'Guest Minister', phone: '+234 809 999 0000', reminderEnabled: false },
  { id: 'mod-18', date: '2026-04-22', program: 'Other', minister: 'Pastor James', phone: '+234 802 222 3333', reminderEnabled: true },
  { id: 'mod-19', date: '2026-04-26', program: 'Fresh Anointing', minister: 'Deaconess Grace', phone: '+234 803 333 4444', reminderEnabled: true },
  { id: 'mod-20', date: '2026-04-30', program: 'Tuesday Digging Deep', minister: 'Pastor David', phone: '+234 801 111 2222', reminderEnabled: true },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'cal-1', name: 'Sunday Service', date: '2026-04-05', time: '9:00 AM', category: 'Service', description: 'Weekly Sunday worship service.', location: 'Main Auditorium' },
  { id: 'cal-2', name: 'Sunday Service', date: '2026-04-12', time: '9:00 AM', category: 'Service', description: 'Weekly Sunday worship service.', location: 'Main Auditorium' },
  { id: 'cal-3', name: 'Sunday Service', date: '2026-04-19', time: '9:00 AM', category: 'Service', description: 'Weekly Sunday worship service.', location: 'Main Auditorium' },
  { id: 'cal-4', name: 'Sunday Service', date: '2026-04-26', time: '9:00 AM', category: 'Service', description: 'Weekly Sunday worship service.', location: 'Main Auditorium' },
  { id: 'cal-5', name: 'Bible Study', date: '2026-04-01', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
  { id: 'cal-6', name: 'Bible Study', date: '2026-04-08', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
  { id: 'cal-7', name: 'Bible Study', date: '2026-04-15', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
  { id: 'cal-8', name: 'Bible Study', date: '2026-04-22', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
  { id: 'cal-9', name: 'Bible Study', date: '2026-04-29', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
  { id: 'cal-10', name: 'Youth Meeting', date: '2026-04-10', time: '5:00 PM', category: 'Youth', description: 'Youth department meeting.', location: 'Youth Hall' },
  { id: 'cal-11', name: 'Youth Meeting', date: '2026-04-24', time: '5:00 PM', category: 'Youth', description: 'Youth department meeting.', location: 'Youth Hall' },
  { id: 'cal-12', name: 'Birthday: John M.', date: '2026-04-16', time: 'All Day', category: 'Birthday', description: 'John Michael birthday.' },
  { id: 'cal-13', name: 'Sunday Service', date: '2026-05-03', time: '9:00 AM', category: 'Service', description: 'Weekly Sunday worship service.', location: 'Main Auditorium' },
  { id: 'cal-14', name: 'Bible Study', date: '2026-05-06', time: '6:30 PM', category: 'Bible Study', description: 'Midweek Bible study session.', location: 'Room 201' },
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wft-1',
    name: 'Guest Follow-up Workflow',
    description: 'Automated pipeline for tracking and following up with first-time guests from their initial visit through conversion.',
    trigger: 'First Timer Registration',
    steps: [
      { label: 'First visit registration', order: 1 },
      { label: 'Call within 48 hours', order: 2 },
      { label: 'Visit within 1 week', order: 3 },
      { label: 'Second service invite', order: 4 },
      { label: 'Convert tracking', order: 5 },
    ],
    active: true,
    createdBy: 'Pastor David',
    lastModified: '04/10/2026',
  },
  {
    id: 'wft-2',
    name: 'New Member Onboarding',
    description: 'Step-by-step onboarding process for new members joining the church, from welcome to full integration.',
    trigger: 'Member Registration',
    steps: [
      { label: 'Welcome message', order: 1 },
      { label: 'Assign to group', order: 2 },
      { label: 'Orientation class', order: 3 },
      { label: 'Mentor assignment', order: 4 },
    ],
    active: true,
    createdBy: 'Deacon Sarah',
    lastModified: '03/28/2026',
  },
  {
    id: 'wft-3',
    name: 'Prayer Request Pipeline',
    description: 'Workflow for managing prayer requests from submission through counselor follow-up and resolution.',
    trigger: 'Prayer Request Submitted',
    steps: [
      { label: 'Receive request', order: 1 },
      { label: 'Assign counselor', order: 2 },
      { label: 'Follow-up', order: 3 },
      { label: 'Mark resolved', order: 4 },
    ],
    active: false,
    createdBy: 'Sister Joy',
    lastModified: '03/15/2026',
  },
];

export const activeWorkflowCards: ActiveWorkflowCard[] = [
  { id: 'aw-1', memberName: 'John Michael', phone: '08011252365', assignedTo: 'Shola Damson', dateAdded: '04/14/2026', stage: 'First Timers', status: 'On Track', templateId: 'wft-1', currentStepIndex: 0 },
  { id: 'aw-2', memberName: 'Sarah Bamidele', phone: '09037311234', assignedTo: 'Shola Damson', dateAdded: '04/13/2026', stage: 'First Timers', status: 'On Track', templateId: 'wft-1', currentStepIndex: 0 },
  { id: 'aw-3', memberName: 'David Okonkwo', phone: '08023456789', assignedTo: 'Pastor James', dateAdded: '04/12/2026', stage: 'First Timers', status: 'Pending', templateId: 'wft-1', currentStepIndex: 0 },
  { id: 'aw-4', memberName: 'Grace Adeyemi', phone: '08034567890', assignedTo: 'Shola Damson', dateAdded: '04/10/2026', stage: 'Follow-up Call', status: 'On Track', templateId: 'wft-1', currentStepIndex: 1 },
  { id: 'aw-5', memberName: 'Emmanuel Nwosu', phone: '08045678901', assignedTo: 'Pastor David', dateAdded: '04/08/2026', stage: 'Follow-up Call', status: 'Overdue', templateId: 'wft-1', currentStepIndex: 1 },
  { id: 'aw-6', memberName: 'Blessing Okoro', phone: '08056789012', assignedTo: 'Deaconess Grace', dateAdded: '04/05/2026', stage: 'Follow-up Visit', status: 'On Track', templateId: 'wft-1', currentStepIndex: 2 },
  { id: 'aw-7', memberName: 'Peter Adewale', phone: '08067890123', assignedTo: 'Shola Damson', dateAdded: '04/03/2026', stage: 'Follow-up Visit', status: 'Pending', templateId: 'wft-1', currentStepIndex: 2 },
  { id: 'aw-8', memberName: 'Ruth Balogun', phone: '08078901234', assignedTo: 'Pastor James', dateAdded: '03/28/2026', stage: 'Second Timers', status: 'On Track', templateId: 'wft-1', currentStepIndex: 3 },
  { id: 'aw-9', memberName: 'Mary Eze', phone: '08089012345', assignedTo: 'Deaconess Grace', dateAdded: '03/20/2026', stage: 'New Converts', status: 'On Track', templateId: 'wft-1', currentStepIndex: 4 },
];

export const trainingCourses: Course[] = [
  { id: 'course-1', name: 'Water Baptism Class', description: 'A foundational course preparing believers for water baptism through biblical teachings and spiritual readiness.', category: 'Spiritual Formation', instructor: 'Pastor David', duration: '6 weeks', startDate: '04/01/2026', endDate: '05/15/2026', applications: 12, currentStudents: 28, pastStudents: 145, status: 'Active' },
  { id: 'course-2', name: 'New Believers Foundation', description: 'An introductory program designed to ground new converts in the basics of Christian faith and church life.', category: 'Discipleship', instructor: 'Deaconess Grace', duration: '8 weeks', startDate: '04/10/2026', endDate: '06/10/2026', applications: 8, currentStudents: 35, pastStudents: 210, status: 'Active' },
  { id: 'course-3', name: 'Leadership Training', description: 'An advanced course equipping members with leadership skills for ministry and church service.', category: 'Leadership', instructor: 'Pastor James', duration: '12 weeks', startDate: '05/01/2026', endDate: '07/30/2026', applications: 15, currentStudents: 20, pastStudents: 95, status: 'Upcoming' },
  { id: 'course-4', name: 'Marriage Counseling', description: 'A comprehensive program for couples preparing for marriage or seeking to strengthen their union.', category: 'Counseling', instructor: 'Pastor & Mrs. Adeyemi', duration: '4 weeks', startDate: '03/01/2026', endDate: '03/30/2026', applications: 6, currentStudents: 14, pastStudents: 72, status: 'Completed' },
  { id: 'course-5', name: 'Sunday School Teachers Training', description: 'Training for Sunday School teachers on curriculum delivery and child engagement.', category: 'Teaching', instructor: 'Elder Samuel', duration: '8 weeks', startDate: '04/15/2026', endDate: '06/15/2026', applications: 5, currentStudents: 12, pastStudents: 48, status: 'Active' },
  { id: 'course-6', name: 'Youth Ministry Training', description: 'Specialized training for those working with the youth department.', category: 'Youth Ministry', instructor: 'Brother Emmanuel', duration: '8 weeks', startDate: '05/10/2026', endDate: '07/10/2026', applications: 10, currentStudents: 15, pastStudents: 60, status: 'Upcoming' },
];

export const trainingSchedules: TrainingSchedule[] = [
  { id: 'sch-1', courseId: 'course-1', course: 'Water Baptism Class', instructor: 'Pastor David', startDate: '04/01/2026', endDate: '05/15/2026', dayTime: 'Saturdays, 10:00 AM', venue: 'Main Hall', capacity: 50, status: 'Active' },
  { id: 'sch-2', courseId: 'course-2', course: 'New Believers Foundation', instructor: 'Deaconess Grace', startDate: '04/10/2026', endDate: '06/10/2026', dayTime: 'Sundays, 2:00 PM', venue: 'Room 3', capacity: 60, status: 'Active' },
  { id: 'sch-3', courseId: 'course-3', course: 'Leadership Training', instructor: 'Pastor James', startDate: '05/01/2026', endDate: '07/30/2026', dayTime: 'Wednesdays, 6:00 PM', venue: 'Conference Room', capacity: 30, status: 'Upcoming' },
  { id: 'sch-4', courseId: 'course-4', course: 'Marriage Counseling', instructor: 'Pastor & Mrs. Adeyemi', startDate: '03/01/2026', endDate: '03/30/2026', dayTime: 'Fridays, 5:00 PM', venue: 'Counseling Room', capacity: 20, status: 'Completed' },
  { id: 'sch-5', courseId: 'course-5', course: 'Sunday School Teachers', instructor: 'Elder Samuel', startDate: '04/15/2026', endDate: '06/15/2026', dayTime: 'Saturdays, 9:00 AM', venue: 'Room 2', capacity: 25, status: 'Active' },
  { id: 'sch-6', courseId: 'course-6', course: 'Youth Ministry Training', instructor: 'Brother Emmanuel', startDate: '05/10/2026', endDate: '07/10/2026', dayTime: 'Fridays, 4:00 PM', venue: 'Youth Center', capacity: 30, status: 'Upcoming' },
];

export const celebrations: Celebration[] = [
  { id: 'cel-1', name: 'John Michael', type: 'Birthday', date: '04/16/2026', status: 'Scheduled', notes: 'Send a greeting in the morning.' },
  { id: 'cel-2', name: 'Sarah Bamidele', type: 'Birthday', date: '04/18/2026', status: 'Scheduled' },
  { id: 'cel-3', name: 'David Okonkwo', type: 'Birthday', date: '04/19/2026', status: 'Scheduled' },
  { id: 'cel-4', name: 'Grace Adeyemi', type: 'Birthday', date: '04/20/2026', status: 'Scheduled' },
  { id: 'cel-5', name: 'Emmanuel Nwosu', type: 'Birthday', date: '04/21/2026', status: 'Scheduled' },
  { id: 'cel-6', name: 'Blessing Okoro', type: 'Birthday', date: '04/22/2026', status: 'Scheduled' },
  { id: 'cel-7', name: 'John & Sarah Michael', type: 'Wedding Anniversary', date: '04/20/2026', status: 'Scheduled', years: 5 },
  { id: 'cel-8', name: 'David & Grace Okonkwo', type: 'Wedding Anniversary', date: '04/21/2026', status: 'Scheduled', years: 10 },
  { id: 'cel-9', name: 'Peter & Mary Adewale', type: 'Wedding Anniversary', date: '04/22/2026', status: 'Scheduled', years: 3 },
  { id: 'cel-10', name: 'James & Ruth Balogun', type: 'Wedding Anniversary', date: '04/23/2026', status: 'Scheduled', years: 8 },
  { id: 'cel-11', name: 'John Michael', type: 'Child Dedication', date: '04/25/2026', status: 'Scheduled', notes: 'For baby Joshua.' },
  { id: 'cel-12', name: 'Sarah Bamidele', type: 'Thanksgiving', date: '04/18/2026', status: 'Treated', notes: 'Thanksgiving for promotion at work.', createdDate: '04/10/2026' },
  { id: 'cel-13', name: 'David Okonkwo', type: 'Thanksgiving', date: '05/02/2026', status: 'Pending', notes: 'Wedding thanksgiving.', createdDate: '04/15/2026' },
  { id: 'cel-14', name: 'Grace Adeyemi', type: 'Thanksgiving', date: '04/20/2026', status: 'Pending', createdDate: '04/12/2026' },
  { id: 'cel-15', name: 'Emmanuel Nwosu', type: 'Child Dedication', date: '05/10/2026', status: 'Completed' },
];

const emptyMatrix: PermissionMatrix = {
  Dashboard: { view: true, create: false, edit: false, delete: false },
  'User Management': { view: false, create: false, edit: false, delete: false },
  Communication: { view: false, create: false, edit: false, delete: false },
  Workflows: { view: false, create: false, edit: false, delete: false },
  Requests: { view: false, create: false, edit: false, delete: false },
  Reports: { view: false, create: false, edit: false, delete: false },
  Settings: { view: false, create: false, edit: false, delete: false },
};

const fullMatrix: PermissionMatrix = {
  Dashboard: { view: true, create: true, edit: true, delete: true },
  'User Management': { view: true, create: true, edit: true, delete: true },
  Communication: { view: true, create: true, edit: true, delete: true },
  Workflows: { view: true, create: true, edit: true, delete: true },
  Requests: { view: true, create: true, edit: true, delete: true },
  Reports: { view: true, create: true, edit: true, delete: true },
  Settings: { view: true, create: true, edit: true, delete: true },
};

export const roles: Role[] = [
  { id: 'role-1', name: 'Admin', description: 'Full system access', userCount: 3, permissions: fullMatrix },
  { id: 'role-2', name: 'Pastor', description: 'Pastoral oversight and management', userCount: 2, permissions: { ...fullMatrix, Settings: { view: true, create: false, edit: false, delete: false } } },
  { id: 'role-3', name: 'Associate Pastor', description: 'Assistant pastoral role', userCount: 3, permissions: { ...fullMatrix, Settings: { view: false, create: false, edit: false, delete: false } } },
  { id: 'role-4', name: 'Follow-up Officer', description: 'Manages guest follow-ups and workflows', userCount: 8, permissions: { ...emptyMatrix, 'User Management': { view: true, create: true, edit: true, delete: false }, Workflows: { view: true, create: false, edit: true, delete: false }, Requests: { view: true, create: true, edit: true, delete: false } } },
  { id: 'role-5', name: 'Department Head', description: 'Leads a department', userCount: 12, permissions: { ...emptyMatrix, 'User Management': { view: true, create: false, edit: false, delete: false }, Communication: { view: true, create: true, edit: false, delete: false } } },
  { id: 'role-6', name: 'Member', description: 'Regular church member', userCount: 245, permissions: { ...emptyMatrix, Dashboard: { view: true, create: false, edit: false, delete: false } } },
];

export const groups: Group[] = [
  { id: 'grp-1', name: 'Choir', description: 'Church choir and worship team', leader: 'Sarah Bamidele', membersCount: 28 },
  { id: 'grp-2', name: 'Ushering', description: 'Church ushering team', leader: 'John Michael', membersCount: 22 },
  { id: 'grp-3', name: 'Technical / Media', description: 'Media, sound, and technical support', leader: 'Samuel Chukwu', membersCount: 15 },
  { id: 'grp-4', name: 'Protocol', description: 'Protocol team for guests and events', leader: 'Peter Adewale', membersCount: 12 },
  { id: "grp-5", name: "Children's Church", description: "Children's ministry teachers and helpers", leader: 'Blessing Okoro', membersCount: 18 },
  { id: 'grp-6', name: 'Youth Fellowship', description: 'Youth department leadership', leader: 'David Okonkwo', membersCount: 45 },
  { id: 'grp-7', name: 'Prayer Warriors', description: 'Intercessory prayer team', leader: 'Ruth Balogun', membersCount: 32 },
  { id: 'grp-8', name: 'Evangelism', description: 'Evangelism and outreach team', leader: 'Emmanuel Nwosu', membersCount: 20 },
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

export const testimonies: Testimony[] = [
  { id: 'tst-1', name: 'John Michael', date: '04/15/2026', category: 'Healing', status: 'Read', content: 'God healed me from a long-standing back pain after prayers during Sunday service. I am forever grateful!', sharedBy: 'Pastor David', location: 'Lagos, Nigeria', featured: true, featuredDate: '04/16/2026' },
  { id: 'tst-2', name: 'Sarah Bamidele', date: '04/14/2026', category: 'Financial', status: 'Read', content: 'I received a breakthrough in my business after months of prayer and fasting. Debts have been cleared.', sharedBy: 'Shola Damson', location: 'Abuja, Nigeria' },
  { id: 'tst-3', name: '', date: '04/12/2026', category: 'Marriage', status: 'Not Read', content: 'After years of separation, God restored my marriage. My family is united again.', sharedBy: 'Pastor James', location: 'Accra, Ghana' },
  { id: 'tst-4', name: 'Grace Adeyemi', date: '04/10/2026', category: 'Salvation', status: 'Read', content: 'I gave my life to Christ during last month\'s crusade. Life has never been the same.', sharedBy: 'Deaconess Grace', location: 'Ibadan, Nigeria', featured: true, featuredDate: '04/11/2026' },
  { id: 'tst-5', name: 'Emmanuel Nwosu', date: '04/08/2026', category: 'Healing', status: 'Read', content: 'I was diagnosed with an illness but the Lord healed me completely. Medical tests confirmed it.', sharedBy: 'Pastor David', location: 'Port Harcourt, Nigeria' },
  { id: 'tst-6', name: 'Blessing Okoro', date: '04/06/2026', category: 'Financial', status: 'Not Read', content: 'I got a new job after months of unemployment. God\'s timing is always perfect.', sharedBy: 'Shola Damson', location: 'Enugu, Nigeria' },
  { id: 'tst-7', name: 'Peter Adewale', date: '04/04/2026', category: 'Other', status: 'Read', content: 'My son passed his entrance exams with flying colors after a year of intercession.', sharedBy: 'Pastor James', location: 'Lagos, Nigeria', featured: true, featuredDate: '04/05/2026' },
  { id: 'tst-8', name: '', date: '04/02/2026', category: 'Marriage', status: 'Not Read', content: 'God blessed us with a child after 7 years of waiting. He is indeed a miracle worker.', sharedBy: 'Deaconess Grace', location: 'Kumasi, Ghana' },
  { id: 'tst-9', name: 'Mary Eze', date: '03/30/2026', category: 'Salvation', status: 'Read', content: 'My entire family came to Christ this month. Our home now has peace and joy.', sharedBy: 'Pastor David', location: 'Abuja, Nigeria' },
  { id: 'tst-10', name: 'Samuel Chukwu', date: '03/28/2026', category: 'Healing', status: 'Not Read', content: 'The Lord healed me of chronic migraines that had plagued me for years. Praise God!', sharedBy: 'Shola Damson', location: 'Lagos, Nigeria' },
];

export const activityLogs: ActivityLog[] = [
  { id: 'log-1', action: 'Logged in', performedBy: 'Pastor David', timestamp: '04/20/2026 08:15 AM', location: 'Lagos, Nigeria', category: 'Login' },
  { id: 'log-2', action: 'Added member John Michael', performedBy: 'Shola Damson', timestamp: '04/20/2026 09:02 AM', location: 'Lagos, Nigeria', category: 'Member' },
  { id: 'log-3', action: 'Sent SMS campaign "Sunday Reminder"', performedBy: 'Admin', timestamp: '04/19/2026 06:45 PM', location: 'Lagos, Nigeria', category: 'Communication' },
  { id: 'log-4', action: 'Updated role permissions for Follow-up Officer', performedBy: 'Admin', timestamp: '04/19/2026 03:20 PM', location: 'Abuja, Nigeria', category: 'Settings' },
  { id: 'log-5', action: 'Moved workflow card to Follow-up Call', performedBy: 'Shola Damson', timestamp: '04/19/2026 02:10 PM', location: 'Lagos, Nigeria', category: 'Workflow' },
  { id: 'log-6', action: 'Logged in', performedBy: 'Deaconess Grace', timestamp: '04/19/2026 11:30 AM', location: 'Lagos, Nigeria', category: 'Login' },
  { id: 'log-7', action: 'Deleted member record st-15', performedBy: 'Admin', timestamp: '04/18/2026 04:55 PM', location: 'Lagos, Nigeria', category: 'Member' },
  { id: 'log-8', action: 'Created announcement "Workers Meeting"', performedBy: 'Pastor David', timestamp: '04/18/2026 01:10 PM', location: 'Lagos, Nigeria', category: 'Communication' },
  { id: 'log-9', action: 'Changed password', performedBy: 'Shola Damson', timestamp: '04/18/2026 10:05 AM', location: 'Lagos, Nigeria', category: 'Settings' },
  { id: 'log-10', action: 'Registered new convert Mary Eze', performedBy: 'Pastor James', timestamp: '04/18/2026 09:15 AM', location: 'Lagos, Nigeria', category: 'Member' },
  { id: 'log-11', action: 'Logged in', performedBy: 'Admin', timestamp: '04/17/2026 08:00 AM', location: 'Abuja, Nigeria', category: 'Login' },
  { id: 'log-12', action: 'Updated workflow template "Guest Follow-up"', performedBy: 'Pastor David', timestamp: '04/17/2026 02:30 PM', location: 'Lagos, Nigeria', category: 'Workflow' },
  { id: 'log-13', action: 'Sent bulk email to Workers group', performedBy: 'Admin', timestamp: '04/17/2026 11:20 AM', location: 'Lagos, Nigeria', category: 'Communication' },
  { id: 'log-14', action: 'Added new group "Prayer Warriors"', performedBy: 'Admin', timestamp: '04/16/2026 04:45 PM', location: 'Lagos, Nigeria', category: 'Settings' },
  { id: 'log-15', action: 'Assigned member to workflow stage', performedBy: 'Shola Damson', timestamp: '04/16/2026 03:00 PM', location: 'Lagos, Nigeria', category: 'Workflow' },
  { id: 'log-16', action: 'Logged in', performedBy: 'Pastor James', timestamp: '04/16/2026 09:30 AM', location: 'Lagos, Nigeria', category: 'Login' },
  { id: 'log-17', action: 'Exported member list to CSV', performedBy: 'Admin', timestamp: '04/15/2026 05:20 PM', location: 'Abuja, Nigeria', category: 'Other' },
  { id: 'log-18', action: 'Updated member profile Sarah Bamidele', performedBy: 'Shola Damson', timestamp: '04/15/2026 02:45 PM', location: 'Lagos, Nigeria', category: 'Member' },
  { id: 'log-19', action: 'Scheduled SMS blast', performedBy: 'Admin', timestamp: '04/15/2026 10:15 AM', location: 'Lagos, Nigeria', category: 'Communication' },
  { id: 'log-20', action: 'Created new role "Youth Coordinator"', performedBy: 'Admin', timestamp: '04/14/2026 03:50 PM', location: 'Abuja, Nigeria', category: 'Settings' },
  { id: 'log-21', action: 'Logged in', performedBy: 'Shola Damson', timestamp: '04/14/2026 08:05 AM', location: 'Lagos, Nigeria', category: 'Login' },
  { id: 'log-22', action: 'Completed workflow card aw-9', performedBy: 'Deaconess Grace', timestamp: '04/13/2026 06:30 PM', location: 'Lagos, Nigeria', category: 'Workflow' },
  { id: 'log-23', action: 'Archived announcement ann-6', performedBy: 'Admin', timestamp: '04/13/2026 01:10 PM', location: 'Lagos, Nigeria', category: 'Communication' },
  { id: 'log-24', action: 'Uploaded media item "Easter Sunday Service"', performedBy: 'Media Team', timestamp: '04/13/2026 10:45 AM', location: 'Lagos, Nigeria', category: 'Other' },
  { id: 'log-25', action: 'Logged out', performedBy: 'Pastor David', timestamp: '04/12/2026 09:00 PM', location: 'Lagos, Nigeria', category: 'Login' },
];

export const prayerRequests: PrayerRequest[] = [
  { id: 'pr-1', submittedBy: 'John Michael', phone: '+234 801 000 0001', email: 'john@example.com', category: 'Healing', request: 'Please pray for my recovery from a surgery scheduled next week. I believe God will see me through.', status: 'Assigned', assignedTo: 'Pastor David', date: '04/22/2026', isAnonymous: false },
  { id: 'pr-2', submittedBy: 'Anonymous', category: 'Finance', request: 'I am going through a serious financial difficulty and need God\'s intervention urgently.', status: 'Pending', date: '04/21/2026', isAnonymous: true },
  { id: 'pr-3', submittedBy: 'Sarah Bamidele', phone: '+234 802 000 0002', email: 'sarah@example.com', category: 'Marriage', request: 'Please intercede for my marriage. We have been having disagreements and need peace to be restored.', status: 'Prayed For', assignedTo: 'Deaconess Grace', date: '04/20/2026', isAnonymous: false },
  { id: 'pr-4', submittedBy: 'Emmanuel Nwosu', phone: '+234 803 000 0003', category: 'Family', request: 'My teenage son has been rebellious lately. Please pray for restoration of our family bond.', status: 'Pending', date: '04/19/2026', isAnonymous: false },
  { id: 'pr-5', submittedBy: 'Anonymous', category: 'Salvation', request: 'Please pray for my husband who is yet to give his life to Christ. I have been praying for years.', status: 'Assigned', assignedTo: 'Pastor James', date: '04/18/2026', isAnonymous: true },
  { id: 'pr-6', submittedBy: 'Grace Adeyemi', phone: '+234 804 000 0004', email: 'grace@example.com', category: 'Career', request: 'I have been job hunting for six months. Please agree with me in prayer for a breakthrough.', status: 'Prayed For', assignedTo: 'Shola Damson', date: '04/17/2026', isAnonymous: false },
  { id: 'pr-7', submittedBy: 'Peter Adewale', phone: '+234 805 000 0005', category: 'Healing', request: 'My mother was diagnosed with diabetes. Please pray for her complete healing.', status: 'Closed', assignedTo: 'Pastor David', date: '04/15/2026', isAnonymous: false },
  { id: 'pr-8', submittedBy: 'Anonymous', category: 'Other', request: 'Please pray for my peace of mind. I have been struggling with anxiety and fear.', status: 'Pending', date: '04/14/2026', isAnonymous: true },
  { id: 'pr-9', submittedBy: 'Mary Eze', phone: '+234 806 000 0006', email: 'mary@example.com', category: 'Finance', request: 'My business is struggling. Please pray for wisdom and divine direction.', status: 'Assigned', assignedTo: 'Deaconess Grace', date: '04/13/2026', isAnonymous: false },
  { id: 'pr-10', submittedBy: 'Samuel Chukwu', phone: '+234 807 000 0007', category: 'Salvation', request: 'Kindly pray for my entire family to come to know the Lord personally.', status: 'Prayed For', assignedTo: 'Pastor James', date: '04/12/2026', isAnonymous: false },
  { id: 'pr-11', submittedBy: 'Blessing Okoro', phone: '+234 808 000 0008', email: 'blessing@example.com', category: 'Healing', request: 'I have been battling with chronic headaches for months. Please pray for divine healing.', status: 'Pending', date: '04/11/2026', isAnonymous: false },
  { id: 'pr-12', submittedBy: 'Anonymous', category: 'Marriage', request: 'Please pray for God to send the right life partner. I have been trusting God for years.', status: 'Assigned', assignedTo: 'Deaconess Grace', date: '04/10/2026', isAnonymous: true },
  { id: 'pr-13', submittedBy: 'Ruth Balogun', phone: '+234 809 000 0009', category: 'Family', request: 'My sister has been estranged from the family for two years. Please pray for reconciliation.', status: 'Prayed For', assignedTo: 'Shola Damson', date: '04/08/2026', isAnonymous: false },
  { id: 'pr-14', submittedBy: 'David Okoro', phone: '+234 810 000 0010', email: 'dokoro@example.com', category: 'Career', request: 'I am awaiting results for a major professional exam. Please agree with me in faith.', status: 'Closed', assignedTo: 'Pastor David', date: '04/06/2026', isAnonymous: false },
  { id: 'pr-15', submittedBy: 'Aisha Bello', phone: '+234 811 000 0011', email: 'aisha@example.com', category: 'Other', request: 'Please pray for our nation. Things are tough and we need God\'s intervention on a national level.', status: 'Prayed For', assignedTo: 'Pastor James', date: '04/04/2026', isAnonymous: false },
];

export const birthdayReminders: BirthdayReminder[] = [
  { id: 'br-1', name: 'John Michael', type: 'Birthday', date: '04/25', daysUntil: 1, phone: '+234 801 000 0001' },
  { id: 'br-2', name: 'Sarah & Peter Bamidele', type: 'Anniversary', date: '04/27', daysUntil: 3, phone: '+234 802 000 0002' },
  { id: 'br-3', name: 'Grace Adeyemi', type: 'Birthday', date: '04/29', daysUntil: 5, phone: '+234 804 000 0004' },
  { id: 'br-4', name: 'Emmanuel Nwosu', type: 'Birthday', date: '05/02', daysUntil: 8, phone: '+234 803 000 0003' },
  { id: 'br-5', name: 'John & Mary Michael', type: 'Anniversary', date: '05/05', daysUntil: 11, phone: '+234 801 000 0001' },
  { id: 'br-6', name: 'Blessing Okoro', type: 'Birthday', date: '05/10', daysUntil: 16, phone: '+234 808 000 0008' },
  { id: 'br-7', name: 'Samuel Chukwu', type: 'Birthday', date: '05/15', daysUntil: 21, phone: '+234 807 000 0007' },
];
