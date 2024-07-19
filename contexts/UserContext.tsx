'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { auth, db } from "@/lib/firebase/config"; // Adjust the import path as needed
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

interface UserContextType {
  uid: string | null;
  firstName: string;
  email: string;
  lastName: string;
  partner: string;
  profileIcon: string;
  role: string;
  department: string;
  project: string;
  teamLeader: string;
  company: string;
  handleLogout: () => void;
  setUserContext: (user: Partial<UserContextType>) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetchUserData = (uid: string, attempt: number = 1, maxAttempts: number = 3, delay: number = 1000): Promise<Partial<UserContextType>> => {
  return new Promise<Partial<UserContextType>>((resolve, reject) => {
    const userDocRef = doc(db, "users", uid);
    const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as Partial<UserContextType>;
        console.log('Fetched user data:', userData); // Log the user data
        resolve(userData);
      } else if (attempt < maxAttempts) {
        setTimeout(() => {
          fetchUserData(uid, attempt + 1, maxAttempts, delay).then(resolve).catch(reject);
        }, delay);
      } else {
        reject(new Error("User data not found"));
      }
    }, (error) => {
      if (attempt < maxAttempts) {
        setTimeout(() => {
          fetchUserData(uid, attempt + 1, maxAttempts, delay).then(resolve).catch(reject);
        }, delay);
      } else {
        reject(error);
      }
    });

    return () => unsubscribeDoc();
  });
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [partner, setPartner] = useState<string>("");
  const [profileIcon, setProfileIcon] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [teamLeader, setTeamLeader] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid)
          .then((userData) => {
            setUid(currentUser.uid);
            setFirstName(userData.firstName || "");
            setEmail(userData.email || "");
            setLastName(userData.lastName || "");
            setPartner(userData.partner || "");
            setProfileIcon(userData.profileIcon || "");
            setRole(userData.role || "");
            setDepartment(userData.department || "");
            setProject(userData.project || "");
            setTeamLeader(userData.teamLeader || "");
            setCompany(userData.company || "");
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setUid(null);
            setFirstName("");
            setEmail("");
            setLastName("");
            setPartner("");
            setProfileIcon("");
            setRole("");
            setDepartment("");
            setProject("");
            setTeamLeader("");
            setCompany("");
          })
          .finally(() => setLoading(false));
      } else {
        setUid(null);
        setFirstName("");
        setEmail("");
        setLastName("");
        setPartner("");
        setProfileIcon("");
        setRole("");
        setDepartment("");
        setProject("");
        setTeamLeader("");
        setCompany("");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUid(null);
      setFirstName("");
      setEmail("");
      setLastName("");
      setPartner("");
      setProfileIcon("");
      setRole("");
      setDepartment("");
      setProject("");
      setTeamLeader("");
      setCompany("");
      setLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  const setUserContext = (user: Partial<UserContextType>) => {
    if (user.uid !== undefined) setUid(user.uid);
    if (user.firstName !== undefined) setFirstName(user.firstName);
    if (user.email !== undefined) setEmail(user.email);
    if (user.lastName !== undefined) setLastName(user.lastName);
    if (user.partner !== undefined) setPartner(user.partner);
    if (user.profileIcon !== undefined) setProfileIcon(user.profileIcon);
    if (user.role !== undefined) setRole(user.role);
    if (user.department !== undefined) setDepartment(user.department);
    if (user.project !== undefined) setProject(user.project);
    if (user.teamLeader !== undefined) setTeamLeader(user.teamLeader);
    if (user.company !== undefined) setCompany(user.company);
  };

  const contextValue = useMemo(() => ({
    uid,
    firstName,
    email,
    lastName,
    partner,
    profileIcon,
    role,
    department,
    project,
    teamLeader,
    company,
    handleLogout,
    setUserContext,
    loading,
  }), [
    uid,
    firstName,
    email,
    lastName,
    partner,
    profileIcon,
    role,
    department,
    project,
    teamLeader,
    company,
    loading,
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
