// Core User Roles
export type Role = 'CITIZEN' | 'VOLUNTEER' | 'RESCUE_TEAM' | 'ADMIN';

export type BloodGroup =
  | 'A_POS'
  | 'A_NEG'
  | 'B_POS'
  | 'B_NEG'
  | 'O_POS'
  | 'O_NEG'
  | 'AB_POS'
  | 'AB_NEG'
  | 'UNKNOWN';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type TeamType =
  | 'FIRE_RESCUE'
  | 'MEDICAL_EMERGENCY'
  | 'FLOOD_RESCUE'
  | 'DISASTER_RESPONSE_FORCE'
  | 'POLICE_SECURITY'
  | 'GENERAL_RELIEF';

export type OperationalStatus = 'STANDBY' | 'DISPATCHED' | 'ON_SITE' | 'RETURNING' | 'OFF_DUTY';

export type DisasterType =
  | 'FLOOD'
  | 'EARTHQUAKE'
  | 'FIRE'
  | 'CYCLONE'
  | 'LANDSLIDE'
  | 'TSUNAMI'
  | 'BUILDING_COLLAPSE'
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DisasterStatus = 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type EmergencyType =
  | 'MEDICAL'
  | 'TRAPPED'
  | 'FIRE'
  | 'WATER_LEVEL_RISING'
  | 'GENERAL_LIFE_THREAT';

export type SosStatus =
  | 'ACTIVE'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_RESCUE'
  | 'RESOLVED'
  | 'FALSE_ALARM';

export type SosPriority = 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM';

export interface CitizenProfile {
  id?: number;
  medicalConditions?: string;
  allergies?: string;
  specialNeeds?: string;
  isElderlyOrChild?: boolean;
}

export interface VolunteerProfile {
  id?: number;
  skills?: string;
  availabilityStatus: AvailabilityStatus;
  totalPoints: number;
  tasksCompleted: number;
  currentTier: string;
  isVerified: boolean;
  preferredRadiusKm?: number;
}

export interface RescueTeamProfile {
  id?: number;
  unitName: string;
  callSign?: string;
  teamType: TeamType;
  memberCount: number;
  vehicleType?: string;
  equipmentList?: string;
  operationalStatus: OperationalStatus;
}

export interface RescueUnitSummary {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  unitName: string;
  callSign?: string;
  teamType?: TeamType;
  operationalStatus?: OperationalStatus;
  memberCount?: number;
  vehicleType?: string;
  equipmentList?: string;
  activeAssignmentCount?: number;
  isAvailable?: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  bloodGroup?: BloodGroup;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  address?: string;
  isActive: boolean;
  roleProfile?: CitizenProfile | VolunteerProfile | RescueTeamProfile | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
  profile?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: Role;
  bloodGroup?: BloodGroup;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  medicalConditions?: string;
  allergies?: string;
  specialNeeds?: string;
  isElderlyOrChild?: boolean;
  skills?: string;
  availabilityStatus?: AvailabilityStatus;
  preferredRadiusKm?: number;
  unitName?: string;
  callSign?: string;
  teamType?: TeamType;
  memberCount?: number;
  vehicleType?: string;
  equipmentList?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface DisasterReport {
  id: number;
  reporterId: number;
  reporterName?: string;
  reporterPhone?: string;
  title: string;
  disasterType: DisasterType;
  severity: Severity;
  description: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  mediaUrls?: string;
  estimatedAffectedPeople?: number;
  status: DisasterStatus;
  verifiedById?: number;
  verifiedByName?: string;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisasterPayload {
  title: string;
  disasterType: DisasterType;
  severity: Severity;
  description: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  mediaUrls?: string;
  estimatedAffectedPeople?: number;
}

export interface VerifyDisasterPayload {
  status: DisasterStatus;
  updatedSeverity?: Severity;
}

export interface SosAlert {
  id: number;
  userId: number;
  userName?: string;
  userPhone?: string;
  userBloodGroup?: BloodGroup;
  userEmergencyContactName?: string;
  userEmergencyContactPhone?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  emergencyType: EmergencyType;
  trappedCount: number;
  medicalAttentionNeeded: boolean;
  additionalNotes?: string;
  status: SosStatus;
  priority: SosPriority;
  triageScore?: number;
  assignedTeamId?: number;
  assignedTeamName?: string;
  assignedTeamPhone?: string;
  assignedTeamType?: TeamType | string;
  assignedCallSign?: string;
  assignedOperationalStatus?: OperationalStatus | string;
  distanceKm?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface TriggerSosPayload {
  latitude: number;
  longitude: number;
  locationName?: string;
  emergencyType: EmergencyType;
  trappedCount?: number;
  medicalAttentionNeeded?: boolean;
  additionalNotes?: string;
  priority?: SosPriority;
}

// ==========================================
// Phase 4: Shelters and Hospitals Types
// ==========================================

export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSED';

export interface Shelter {
  id: number;
  name: string;
  type: string;
  totalCapacity: number;
  currentOccupancy: number;
  availableCapacity?: number;
  occupancyPercentage?: number;
  latitude: number;
  longitude: number;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  foodAvailable: boolean;
  medicalSupportAvailable: boolean;
  petFriendly: boolean;
  powerBackup: boolean;
  status: ShelterStatus;
  distanceKm?: number;
  updatedAt?: string;
}

export interface CreateShelterPayload {
  name: string;
  type?: string;
  totalCapacity: number;
  currentOccupancy?: number;
  latitude: number;
  longitude: number;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  foodAvailable?: boolean;
  medicalSupportAvailable?: boolean;
  petFriendly?: boolean;
  powerBackup?: boolean;
  status?: ShelterStatus;
}

export interface UpdateOccupancyPayload {
  currentOccupancy: number;
}

export type HospitalStatus = 'OPERATIONAL' | 'FULL' | 'EMERGENCY_ONLY' | 'CLOSED';

export interface Hospital {
  id: number;
  name: string;
  totalBeds: number;
  availableGeneralBeds: number;
  availableIcuBeds: number;
  availableVentilators: number;
  emergencyPhone: string;
  latitude: number;
  longitude: number;
  address: string;
  hasTraumaCenter: boolean;
  hasBloodBank: boolean;
  status: HospitalStatus;
  distanceKm?: number;
  updatedAt?: string;
}

export interface CreateHospitalPayload {
  name: string;
  totalBeds: number;
  availableGeneralBeds: number;
  availableIcuBeds: number;
  availableVentilators: number;
  emergencyPhone: string;
  latitude: number;
  longitude: number;
  address: string;
  hasTraumaCenter?: boolean;
  hasBloodBank?: boolean;
  status?: HospitalStatus;
}

export interface UpdateBedsPayload {
  availableGeneralBeds?: number;
  availableIcuBeds?: number;
  availableVentilators?: number;
  status?: HospitalStatus;
}

// ==========================================
// Phase 5: Volunteer Hub, Tasks, Rewards, Notifications & Admin Types
// ==========================================

export type TaskCategory =
  | 'FOOD_DISTRIBUTION'
  | 'FIRST_AID'
  | 'SEARCH_ASSISTANCE'
  | 'SHELTER_SUPPORT'
  | 'EVACUATION_HELP'
  | 'LOGISTICS'
  | 'COMMUNITY_PATROL'
  | 'OTHER';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'SOS_ALERT'
  | 'DISASTER_VERIFIED'
  | 'REWARD_EARNED'
  | 'SYSTEM_BROADCAST'
  | 'ADMIN_ALERT';

export interface VolunteerProfileResponse {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  bloodGroup?: BloodGroup;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  address?: string;
  skills?: string;
  availabilityStatus: AvailabilityStatus;
  totalPoints: number;
  tasksCompleted: number;
  currentTier: string;
  isVerified: boolean;
  preferredRadiusKm?: number;
  leaderboardRank?: number;
  updatedAt?: string;
}

export interface UpdateVolunteerProfilePayload {
  skills?: string;
  availabilityStatus?: AvailabilityStatus;
  preferredRadiusKm?: number;
  phone?: string;
  bloodGroup?: BloodGroup;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface LeaderboardEntry {
  userId: number;
  fullName: string;
  totalPoints: number;
  tasksCompleted: number;
  currentTier: string;
  isVerified: boolean;
  rank: number;
}

export interface VolunteerTask {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  pointsReward: number;
  latitude: number;
  longitude: number;
  locationName: string;
  contactPhone?: string;
  createdById?: number;
  createdByName?: string;
  assignedVolunteerId?: number;
  assignedVolunteerName?: string;
  relatedDisasterId?: number;
  distanceKm?: number;
  assignedAt?: string;
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  pointsReward?: number;
  latitude: number;
  longitude: number;
  locationName: string;
  contactPhone?: string;
  relatedDisasterId?: number;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  completionNotes?: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCitizens: number;
  totalVolunteers: number;
  totalRescueTeams: number;
  activeUsers: number;
  activeSosCount: number;
  verifiedDisasterCount: number;
  openShelterCount: number;
  operationalHospitalsCount: number;
  totalAvailableBeds: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
}

export interface AdminUserSummary {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  bloodGroup?: BloodGroup;
  isActive: boolean;
  address?: string;
  createdAt: string;
  volunteerPoints?: number;
  volunteerTier?: string;
  volunteerVerified?: boolean;
  rescueUnitName?: string;
  rescueTeamType?: string;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface UpdateUserRolePayload {
  role: Role;
}


