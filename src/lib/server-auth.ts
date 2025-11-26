
import { headers } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * Gets the user ID from the Authorization header of the incoming request.
 * This is a server-side utility.
 * @returns The user's ID if the token is valid, otherwise null.
 */
export async function getUserIdFromRequest(): Promise<string | null> {
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get('Authorization');
    const idToken = authHeader?.split('Bearer ')[1];
    if (!idToken) {
        return null;
    }
    try {
        const auth = getAdminAuth();
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}
