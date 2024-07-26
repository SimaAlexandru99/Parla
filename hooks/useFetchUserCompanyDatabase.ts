import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useUser } from "@/contexts/client/UserContext";

interface CompanyData {
  database: string;
  domain: string;
  name: string;
}

const useFetchUserCompanyDatabase = () => {
  const { uid } = useUser();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);

      if (!uid) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user document to get the company ID
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User data not found.");
        }

        const userData = userDoc.data() as { company?: string };
        const companyName = userData?.company;

        if (!companyName) {
          throw new Error("User's company not found.");
        }

        // Search for the company document by name
        const companiesRef = collection(db, "companies");
        const q = query(companiesRef, where("name", "==", companyName));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error("Company data not found.");
        }

        const companyDoc = querySnapshot.docs[0];
        setCompanyData(companyDoc.data() as CompanyData);
      } catch (error) {
        setError((error as Error).message || "Error fetching data.");
        console.error("Error fetching company data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [uid]);

  return { companyData, loading, error };
};

export default useFetchUserCompanyDatabase;
