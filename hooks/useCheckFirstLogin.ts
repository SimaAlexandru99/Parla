import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useUser } from "@/contexts/UserContext"; // Adjust the import path as needed
import { UserData } from "@/types/UserTypes"; // Import the UserData interface

const useCheckFirstLogin = () => {
  const router = useRouter();
  const [firebaseUser, loading, error] = useAuthState(auth);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const { setUserContext } = useUser();

  const checkIfFirstLogin = useCallback(
    async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          const firstLoginCompleted = userData.firstLoginCompleted;

          setUserContext({
            uid,
            firstName: userData.firstName || "",
            email: userData.email || "",
            lastName: userData.lastName || "",
            partner: userData.partner || "",
            profileIcon: userData.profileIcon || "",
            role: userData.role || "",
            department: userData.department || "",
            project: userData.project || "",
            teamLeader: userData.teamLeader || "",
            company: userData.company || "",
          });

          if (firstLoginCompleted) {
            setCheckingLogin(false);
          } else {
            router.push("/get-started");
          }
        } else {
          console.log("No user data found in Firestore.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking first login status:", error);
        setCheckingLogin(false);
      } finally {
        setCheckingLogin(false);
      }
    },
    [router, setUserContext]
  );

  useEffect(() => {
    if (loading) return; // If loading, do nothing

    if (firebaseUser) {
      checkIfFirstLogin(firebaseUser.uid);
    } else {
      setCheckingLogin(false);
    }
  }, [firebaseUser, loading, checkIfFirstLogin]);

  return { firebaseUser, loading, error, checkingLogin };
};

export default useCheckFirstLogin;
