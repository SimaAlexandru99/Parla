export interface UserData {
  email: string; // Making email required as an example
  firstName?: string;
  lastName?: string;
  partner?: string;
  profileIcon?: string;
  role?: string;
  department?: string;
  project?: string;
  teamLeader?: string;
  company?: string;
  dob?: string;
  firstLoginCompleted: boolean; // Making this required as it seems to be a crucial field
}