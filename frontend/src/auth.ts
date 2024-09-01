import NextAuth from "next-auth";
import Google from "next-auth/providers/google"

const config = {
    providers: [    
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                  redirect_uri: `${process.env.AUTH_URL}/api/auth/callback/google`,
                },
            },
            checks: ["state"],
        }),
    ],
    // we want to have username field in the session object so we must extend the User type
    callbacks: {
        // @ts-ignore
        session({ session }) {
            (session.user as AdapterUser).username = session.user.email.split("@")[0];
            return session;
        },
    }
};

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// we want to have username field in the session object so we must extend the User type (AdapterUser already extends User so
// we are just adding the username field)
interface AdapterUser {
    username?: string;
}