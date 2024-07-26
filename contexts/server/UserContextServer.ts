import { cookies } from 'next/headers';
import { auth, db } from "@/lib/firebase/admin-config";

export async function getUserData() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value);
    const uid = decodedClaims.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      return userDoc.data();
    }
  } catch (error) {
    console.error('Error verifying session cookie:', error);
  }

  return null;
}