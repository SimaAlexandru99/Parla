import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Partner {
  value: string;
}

const useFetchPartners = (company: string | undefined) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!company) {
          throw new Error("No company provided.");
        }

        const q = query(collection(db, "partners"), where("company", "==", company));
        const querySnapshot = await getDocs(q);

        const partnerList = querySnapshot.docs.map((doc) => ({
          value: doc.data().name, // Assuming the partner name is stored in the 'name' field
        }));

        setPartners(partnerList);
      } catch (error) {
        setError((error as Error).message || "Error fetching partners.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (company) {
      fetchPartners();
    } else {
      setLoading(false); // Avoid infinite loading state
    }
  }, [company]);

  return { partners, loading, error };
};

export default useFetchPartners;
