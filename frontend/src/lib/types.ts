export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department?: string;
  status?: 'active' | 'inactive';
}

export interface EMember {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  email: string;
  avatar?: string;
}

export interface FirstTimer {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  date: string;
  calls: number;
  visits: number;
}

export interface SecondTimer {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  date: string;
  calls: number;
  visits: number;
}

export interface NewConvert {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  date: string;
  calls: number;
  visits: number;
}

export interface ProfileDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  occupation: string;
  date: string;
  group: string;
  dateJoined: string;
  spouse?: string;
}

export interface Report {
  id: string;
  content: string;
  addedBy: string;
  date: string;
}

export interface Request {
  id: string;
  title: string;
  content: string;
  category: 'Counseling' | 'Celebration' | 'Prayer' | 'Complaint' | 'Suggestion';
  status: 'Treated' | 'In Progress' | 'Not treated';
  submittedBy: string;
  assignedTo: string;
  addedBy: string;
  date: string;
}

export interface Message {
  id: string;
  type: 'SMS' | 'Email';
  recipient: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  sentBy: string;
  date: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'SMS' | 'Email';
  subject?: string;
  content: string;
  createdBy: string;
  lastModified: string;
}

export type AnnouncementAudience =
  | 'All Members'
  | 'Workers'
  | 'Choir'
  | 'Ushering'
  | 'Youth'
  | 'Children';

export type AnnouncementStatus = 'Scheduled' | 'Published' | 'Draft';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  scheduledDate: string;
  status: AnnouncementStatus;
  createdBy: string;
  createdDate: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href?: string;
  children?: { label: string; href: string }[];
}
