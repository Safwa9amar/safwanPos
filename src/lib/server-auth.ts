
import { headers, cookies } from "next/headers";
import jwt from 'jsonwebtoken';

/**
 * Gets the user ID from the JWT token in the cookie.
 * This is a server-side utility.
 * @returns The user's ID if the token is valid, otherwise null.
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
    const cookieStore =await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        return decoded.userId;
    } catch (error) {
        console.error("Error verifying JWT token:", error);
        return null;
    }
}
