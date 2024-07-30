'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { isEqual } from 'lodash'; // You might need to install this package

interface UserData {
  uid: string | null;
  firstName: string | null;
  email: string | null;
  lastName: string | null;
  partner: string | null;
  profileIcon: string | null;
  role: string | null;
  department: string | null;
  project: string | null;
  teamLeader: string | null;
  company: string | null;
}

interface UserContextType extends UserData {
  handleLogout: () => Promise<void>;
  setUserContext: (user: Partial<UserContextType>) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialUserState: UserData = {
  uid: null,
  firstName: null,
  email: null,
  lastName: null,
  partner: null,
  profileIcon: null,
  role: null,
  department: null,
  project: null,
  teamLeader: null,
  company: null,
};

export const UserProvider = ({
  children,
  initialUserData,
}: {
  children: ReactNode;
  initialUserData?: Partial<UserData>;
}) => {
  const [userData, setUserData] = useState<UserData>({
    ...initialUserState,
    ...initialUserData,
  });
  const [loading, setLoading] = useState(!initialUserData);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserData(initialUserState);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUserContext = useCallback((user: Partial<UserContextType>) => {
    setUserData((prevData) => {
      const newData = { ...prevData, ...user };
      return isEqual(prevData, newData) ? prevData : newData;
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const fetchedUserData = doc.data() as UserData;
            setUserData((prevData) => {
              const newData = { ...prevData, ...fetchedUserData };
              return isEqual(prevData, newData) ? prevData : newData;
            });
          }
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUserData(initialUserState);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const contextValue: UserContextType = {
    ...userData,
    handleLogout,
    setUserContext,
    loading,
  };

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