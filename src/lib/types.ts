export type OperatingSystem =
  | "ios"
  | "android"
  | "windows"
  | "macos"
  | "linux"
  | "unknown";

export type AdminRole = "owner" | "admin";
export type AdminStatus = "invited" | "active" | "disabled";
export type OrganizationRole = "owner" | "member";
export type MembershipStatus = "invited" | "active";
export type ResultTone = "good" | "balanced" | "high";

export interface ScreenTimeEntry {
  id: string;
  tracked_session_id: string | null;
  session_id: string;
  screen_time_minutes: number;
  detected_os: OperatingSystem;
  ip_address: string | null;
  user_agent: string | null;
  submitted_at: string;
  entry_date: string;
}

export interface AdminProfile {
  user_id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember extends OrganizationMembership {
  profile: UserProfile | null;
}

export interface TrackedSession {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  slug: string;
  description: string | null;
  age_group: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

export interface TrackedSessionSummary extends TrackedSession {
  submissions: number;
  average_minutes: number | null;
  last_submission_at: string | null;
  participants: number;
  share_url: string;
  short_share_url: string;
  short_code: string;
  qr_code_data_url: string;
}

export interface SessionAnalytics {
  recommendedMinutes: number;
  overallAverageMinutes: number | null;
  osAverageMinutes: number | null;
  lowerPercentage: number;
  higherPercentage: number;
  participantCount: number;
  alignmentScore: number;
  resultLabel: string;
  resultTone: ResultTone;
  summary: string;
  guidance: string;
  trendPercentage: number | null;
}

export interface OperatingSystemConfig {
  key: OperatingSystem;
  label: string;
  shortLabel: string;
  headline: string;
  description: string;
  settingsButtonLabel: string;
  settingsHint: string;
  settingsLink: string | null;
  steps: string[];
}

export interface OperatingSystemSummary {
  detected_os: OperatingSystem;
  participants: number;
  average_minutes: number;
  minimum_minutes: number;
  maximum_minutes: number;
}

export interface IpStatistic {
  ip_address: string;
  submissions: number;
  last_seen: string;
  average_minutes: number;
}

export interface AdminDashboardData {
  totalParticipants: number;
  totalSubmissions: number;
  todaySubmissions: number;
  overallAverageMinutes: number | null;
  osStatistics: OperatingSystemSummary[];
  ipStatistics: IpStatistic[];
  recentEntries: ScreenTimeEntry[];
  adminProfiles: AdminProfile[];
}

export interface UserDashboardData {
  profile: UserProfile;
  organization: Organization;
  membership: OrganizationMembership;
  trackedSessions: TrackedSessionSummary[];
  organizationMembers: OrganizationMember[];
  recentEntries: ScreenTimeEntry[];
}

export interface SessionPanelData {
  session: TrackedSessionSummary;
  owner: UserProfile | null;
  latestParticipantEntry: ScreenTimeEntry | null;
  participantEntries: ScreenTimeEntry[];
  liveEntries: ScreenTimeEntry[];
  reportEntries: ScreenTimeEntry[];
}

export interface SharedSessionData {
  session: TrackedSession;
  owner: UserProfile | null;
  latestEntry: ScreenTimeEntry | null;
  recentEntries: ScreenTimeEntry[];
  participantEntries: ScreenTimeEntry[];
  publicEntries: ScreenTimeEntry[];
}

export interface FlashMessage {
  type: "success" | "error" | "info";
  message: string;
}
