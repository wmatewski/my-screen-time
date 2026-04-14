export type OperatingSystem =
  | "ios"
  | "android"
  | "windows"
  | "macos"
  | "linux"
  | "unknown";

export type AdminRole = "owner" | "admin";
export type AdminStatus = "invited" | "active" | "disabled";
export type ResultTone = "good" | "balanced" | "high";

export interface ScreenTimeEntry {
  id: string;
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

export interface FlashMessage {
  type: "success" | "error" | "info";
  message: string;
}