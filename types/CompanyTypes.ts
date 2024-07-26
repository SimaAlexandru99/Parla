export interface CompanyData {
  database: string;
  // Add other properties that companyData might have
  name?: string;
  id?: string;
  // ... other relevant fields
}

export interface FetchUserCompanyDatabaseResult {
  companyData: CompanyData | null;
  loading: boolean;
  error: string | null;  // Changed from Error | null to string | null
}