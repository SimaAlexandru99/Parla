import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

const createUserProfile = async (
  user: any,
  firstName: string,
  lastName: string,
  companyName: string,
  profileIcon: string
) => {
  const userProfile = {
    uid: user.uid,
    firstName,
    lastName,
    email: user.email,
    company: companyName,
    profileIcon,
    firstLoginCompleted: false,
  };

  console.log("Creating user profile with data:", userProfile);

  await setDoc(doc(db, "users", user.uid), userProfile);
  console.log("User profile has been created in Firestore");
};

export default createUserProfile;
