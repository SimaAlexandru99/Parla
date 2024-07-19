import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const fetchCompanyByDomain = async (domain: string) => {
  const q = query(collection(db, "companies"), where("domain", "==", domain));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].data();
};

export default fetchCompanyByDomain;
