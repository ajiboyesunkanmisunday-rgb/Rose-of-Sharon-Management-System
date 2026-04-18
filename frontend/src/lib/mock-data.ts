import { Member, EMember, FirstTimer, SecondTimer, NewConvert, Report, Request, Message, CommunicationTemplate, Announcement, ChurchEvent, DirectoryContact, MediaItem } from './types';

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
  { id: 'ev-1', name: 'Sunday Worship Service', date: '04/19/2026', startTime: '09:00', endTime: '11:30', location: 'Main Auditorium', category: 'Service', description: 'Weekly worship service with sermon, worship, and fellowship.', capacity: 600, attendees: 450, status: 'Upcoming', requiresRegistration: false, createdBy: 'Pastor David' },
  { id: 'ev-2', name: 'Annual Church Conference', date: '05/01/2026', startTime: '08:00', endTime: '17:00', location: 'Convention Center', category: 'Conference', description: 'Three-day annual conference with guest speakers and workshops.', capacity: 1500, attendees: 1200, status: 'Upcoming', requiresRegistration: true, createdBy: 'Admin' },
  { id: 'ev-3', name: 'Leadership Training Workshop', date: '04/25/2026', startTime: '10:00', endTime: '15:00', location: 'Fellowship Hall', category: 'Training', description: 'Intensive leadership development workshop for church workers.', capacity: 100, attendees: 85, status: 'Upcoming', requiresRegistration: true, createdBy: 'Pastor James' },
  { id: 'ev-4', name: 'Youth Fun Day', date: '04/18/2026', startTime: '12:00', endTime: '18:00', location: 'Church Grounds', category: 'Social', description: 'A day of games, music, and fellowship for the youth.', capacity: 150, attendees: 120, status: 'Upcoming', requiresRegistration: false, createdBy: 'Youth Pastor' },
  { id: 'ev-5', name: 'Midweek Bible Study', date: '04/15/2026', startTime: '18:00', endTime: '20:00', location: 'Room 201', category: 'Service', description: 'Weekly Bible study and prayer meeting.', capacity: 150, attendees: 95, status: 'Ongoing', requiresRegistration: false, createdBy: 'Pastor David' },
  { id: 'ev-6', name: 'Workers Training Seminar', date: '04/10/2026', startTime: '09:00', endTime: '14:00', location: 'Training Room', category: 'Training', description: 'Training seminar for newly appointed workers.', capacity: 80, attendees: 60, status: 'Completed', requiresRegistration: true, createdBy: 'Admin' },
  { id: 'ev-7', name: 'Easter Celebration Service', date: '03/29/2026', startTime: '09:00', endTime: '12:00', location: 'Main Auditorium', category: 'Service', description: 'Special Easter Sunday celebration service.', capacity: 1000, attendees: 800, status: 'Completed', requiresRegistration: false, createdBy: 'Pastor David' },
  { id: 'ev-8', name: 'Church Picnic & Fellowship', date: '03/22/2026', startTime: '11:00', endTime: '17:00', location: 'City Park', category: 'Social', description: 'Annual outdoor fellowship picnic with food and games.', capacity: 300, attendees: 200, status: 'Completed', requiresRegistration: true, createdBy: 'Admin' },
  { id: 'ev-9', name: 'Marriage Enrichment Seminar', date: '05/10/2026', startTime: '14:00', endTime: '18:00', location: 'Fellowship Hall', category: 'Training', description: 'Seminar for married couples on strengthening their marriage.', capacity: 150, attendees: 0, status: 'Upcoming', requiresRegistration: true, createdBy: 'Pastor David' },
  { id: 'ev-10', name: 'Community Outreach', date: '05/15/2026', startTime: '08:00', endTime: '16:00', location: 'City Center', category: 'Outreach', description: 'Evangelism and community service outreach.', capacity: 200, attendees: 0, status: 'Upcoming', requiresRegistration: true, createdBy: 'Admin' },
  { id: 'ev-11', name: 'Choir Anniversary Concert', date: '05/22/2026', startTime: '16:00', endTime: '20:00', location: 'Main Auditorium', category: 'Service', description: 'Special concert celebrating the choir department anniversary.', capacity: 800, attendees: 0, status: 'Upcoming', requiresRegistration: false, createdBy: 'Choir Director' },
  { id: 'ev-12', name: 'Children\'s Day Celebration', date: '05/28/2026', startTime: '10:00', endTime: '15:00', location: 'Main Auditorium', category: 'Social', description: 'Special program for the children of the church.', capacity: 400, attendees: 0, status: 'Upcoming', requiresRegistration: false, createdBy: 'Children Coordinator' },
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
