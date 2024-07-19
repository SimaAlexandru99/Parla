import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Project {
  value: string;
}

const useFetchProjects = (partner: string, company: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!partner || !company) {
        setProjects([]);
        setLoadingProjects(false);
        return;
      }

      setLoadingProjects(true);
      setError(null);

      try {
        const q = query(
          collection(db, "projects"),
          where("partner", "==", partner),
          where("company", "==", company)
        );
        const querySnapshot = await getDocs(q);
        const projectList: Project[] = querySnapshot.docs.map((doc) => ({
          value: doc.data().project, // Assuming the project name is stored in the 'project' field
        }));
        setProjects(projectList);
      } catch (err: any) {
        console.error("Error fetching projects: ", err);
        setError(err.message || "Error fetching projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    if (partner && company) {
      fetchProjects();
    }

    return () => {
      setProjects([]);
      setLoadingProjects(false);
      setError(null);
    };
  }, [partner, company]);

  return { projects, loadingProjects, error };
};

export default useFetchProjects;
