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

export type CelebrationType = 'Birthday' | 'Wedding Anniversary' | 'Thanksgiving' | 'Child Dedication';
export type CelebrationStatus = 'Scheduled' | 'Completed';

export interface Celebration {
  id: string;
  name: string;
  type: CelebrationType;
  date: string;
  status: CelebrationStatus;
  years?: number;
  notes?: string;
}

export type CourseStatus = 'Active' | 'Completed' | 'Upcoming';

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  applications: number;
  currentStudents: number;
  pastStudents: number;
  status: CourseStatus;
}

export type ScheduleStatus = 'Active' | 'Upcoming' | 'Completed' | 'Cancelled';

export interface TrainingSchedule {
  id: string;
  courseId: string;
  course: string;
  instructor: string;
  startDate: string;
  endDate: string;
  dayTime: string;
  venue: string;
  capacity: number;
  status: ScheduleStatus;
}

export interface WorkflowStep {
  label: string;
  order: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  active: boolean;
  createdBy: string;
  lastModified: string;
}

export type ActiveWorkflowStage =
  | 'First Timers'
  | 'Follow-up Call'
  | 'Follow-up Visit'
  | 'Second Timers'
  | 'New Converts';

export type WorkflowCardStatus = 'On Track' | 'Overdue' | 'Pending';

export interface ActiveWorkflowCard {
  id: string;
  memberName: string;
  phone: string;
  assignedTo: string;
  dateAdded: string;
  stage: ActiveWorkflowStage;
  status: WorkflowCardStatus;
  templateId: string;
  currentStepIndex: number;
  notes?: string;
}

export type CalendarEventCategory = 'Service' | 'Bible Study' | 'Youth' | 'Birthday' | 'Meeting' | 'Other';

export interface CalendarEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: CalendarEventCategory;
  description?: string;
  location?: string;
}

export type MediaType = 'Sermon' | 'Podcast' | 'Video';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: MediaType;
  speaker: string;
  date: string;
  duration: string;
  thumbnail?: string;
  url?: string;
  tags?: string[];
  createdBy: string;
}

export interface DirectoryContact {
  id: string;
  name: string;
  role: string;
  group: string;
  phone: string;
  email: string;
  address?: string;
  department?: string;
  joinedDate?: string;
}

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
export type EventCategory = 'Service' | 'Conference' | 'Training' | 'Social' | 'Wedding' | 'Funeral' | 'Outreach';

export interface ChurchEvent {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  description: string;
  capacity: number;
  attendees: number;
  status: EventStatus;
  requiresRegistration: boolean;
  createdBy: string;
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
