export interface UserData {
    firstLoginCompleted?: boolean;
    firstName?: string;
    email?: string;
    lastName?: string;
    partner?: string;
    profileIcon?: string;
    role?: string;
    department?: string;
    project?: string;
    teamLeader?: string;
    company?: string;
    dob?: string; // Added dob as it was used in one of the interfaces
  }

  export interface CompanyData {
    database: string;
    domain: string;
    name: string;
    // Add any other fields if they exist in the document
  }