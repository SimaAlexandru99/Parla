import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Department {
  value: string;
}

const useFetchDepartments = (partner: string, projectLabel: string, company: string) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!partner || !projectLabel || !company) {
        setDepartments([]);
        setLoadingDepartments(false);
        return;
      }

      setLoadingDepartments(true);
      setError(null);

      try {
        const q = query(
          collection(db, "departments"),
          where("partner", "==", partner),
          where("project", "==", projectLabel),
          where("company", "==", company)
        );
        const querySnapshot = await getDocs(q);
        const departmentList: Department[] = querySnapshot.docs.map((doc) => ({
          value: doc.data().department, // Assuming the department name is stored in the 'department' field
        }));
        setDepartments(departmentList);
      } catch (err: any) {
        console.error("Error fetching departments: ", err);
        setError(err.message || "Error fetching departments.");
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (partner && projectLabel && company) {
      fetchDepartments();
    }
  }, [partner, projectLabel, company]);

  return { departments, loadingDepartments, error };
};

export default useFetchDepartments;
