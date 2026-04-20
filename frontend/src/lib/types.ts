export type ServiceType = 'Sunday' | 'Wednesday' | 'Friday' | 'Special Service';

export interface SpouseLink {
  memberId?: string;
  name: string;
  weddingDate: string;
  anniversaryPhoto?: string;
}

export interface FollowUpOfficer {
  id: string;
  name: string;
  department: string;
  phone: string;
  email: string;
}

export interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phone: string;
  avatar?: string;
  department?: string;
  maritalStatus?: string;
  spouse?: SpouseLink;
  status?: 'active' | 'inactive';
}

export interface EMember {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  country: string;
  countryCode?: string;
  phone: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  serviceAttended?: ServiceType;
  spouse?: SpouseLink;
}

export interface FirstTimer {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  name: string;
  countryCode?: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  followUpOfficerId?: string;
  date: string;
  calls: number;
  visits: number;
  avatar?: string;
  maritalStatus?: string;
  spouse?: SpouseLink;
  worshippedOnlineBefore?: boolean;
}

export interface SecondTimer {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  name: string;
  countryCode?: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  followUpOfficerId?: string;
  date: string;
  calls: number;
  visits: number;
  avatar?: string;
  maritalStatus?: string;
  spouse?: SpouseLink;
  worshippedOnlineBefore?: boolean;
}

export type BelieversClass = 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' | 'Not started';

export interface NewConvert {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  name: string;
  countryCode?: string;
  phone: string;
  email: string;
  serviceAttended: string;
  assignedFollowUp: string;
  date: string;
  calls: number;
  visits: number;
  believersClass?: BelieversClass;
  classAttendance?: boolean[];
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
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
  category: 'Counseling' | 'Prayer' | 'Complaint' | 'Suggestion';
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

export interface PermissionMatrix {
  [module: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: PermissionMatrix;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  leader: string;
  membersCount: number;
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

export type TestimonyCategory = 'Healing' | 'Financial' | 'Marriage' | 'Salvation' | 'Other';
export type TestimonyStatus = 'Pending' | 'Published';

export interface Testimony {
  id: string;
  name: string;
  date: string;
  category: TestimonyCategory;
  status: TestimonyStatus;
  content: string;
  photo?: string;
  sharedBy: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  location: string;
  category: 'Login' | 'Member' | 'Communication' | 'Workflow' | 'Settings' | 'Other';
}

export interface NavItem {
  label: string;
  icon: string;
  href?: string;
  children?: { label: string; href: string }[];
}
