import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface TeamLeader {
  value: string;
}

const useFetchTeamLeaders = (
  department: string,
  project: string,
  partner: string,
  company: string
) => {
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [loadingTeamLeaders, setLoadingTeamLeaders] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamLeaders = async () => {
      if (!department || !project || !partner || !company) {
        setTeamLeaders([]);
        setLoadingTeamLeaders(false);
        return;
      }

      setLoadingTeamLeaders(true);
      setError(null);

      try {
        const q = query(
          collection(db, "team_leaders"),
          where("department", "==", department),
          where("project", "==", project),
          where("partner", "==", partner),
          where("company", "==", company)
        );
        const querySnapshot = await getDocs(q);
        const teamLeaderList: TeamLeader[] = querySnapshot.docs.map((doc) => ({
          value: doc.data().name, // Assuming the team leader's name is stored in the 'name' field
        }));
        setTeamLeaders(teamLeaderList);
      } catch (err: any) {
        console.error("Error fetching team leaders: ", err);
        setError(err.message || "Error fetching team leaders.");
      } finally {
        setLoadingTeamLeaders(false);
      }
    };

    fetchTeamLeaders();
  }, [department, project, partner, company]);

  return { teamLeaders, loadingTeamLeaders, error };
};

export default useFetchTeamLeaders;
