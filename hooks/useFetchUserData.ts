// useFetchUserData.ts
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useUser } from "@/contexts/UserContext";
import { UserData } from "@/types/UserTypes"; // Import the UserData interface

const useFetchUserData = () => {
  const { uid } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!uid) {
          throw new Error("No user logged in.");
        }

        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? (userDoc.data() as UserData) : null;

        if (!userData) {
          throw new Error("User data not found.");
        }

        setUserData(userData);
      } catch (error) {
        setError((error as Error).message || "Error fetching data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchUserData();
    } else {
      setLoading(false); // Avoid infinite loading state
    }
  }, [uid]);

  return { userData, loading, error };
};

export default useFetchUserData;
