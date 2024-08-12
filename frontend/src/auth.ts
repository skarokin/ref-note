import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const {handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        session({ session }) {
            (session.user as AdapterUser).username = session.user.email.split("@")[0];
            return session;
        }
    }
});

// we want to have username field in the session object so we must extend the User type (AdapterUser already extends User so
// we are just adding the username field)
interface AdapterUser {
    username?: string;
}