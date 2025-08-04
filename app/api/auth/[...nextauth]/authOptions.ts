import GoogleProvider from 'next-auth/providers/google';
import CredentialProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/utils/models/user.model';
import jwt from 'jsonwebtoken';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          return null;
        }

        const isValid = await user.comparePassword(credentials.password);
        
        if (!isValid) {
          return null;
        }

        // Generate a custom access token for credentials provider
        const accessToken = jwt.sign(
          { userId: user._id.toString(), email: user.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '1d' }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          accessToken, // Include the custom token
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    //@ts-ignore
    async jwt({ token, account, user }) {
      if (account && user) {
        // For OAuth (e.g., Google), use provider's access token
        if (account.provider === 'google') {
          token.accessToken = account.access_token;
        }
        // For credentials, use the token from authorize
        if (account.provider === 'credentials') {
          token.accessToken = user.accessToken;
        }
        token.id = user.id;
      }
      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.accessToken = token.accessToken; // Ensure accessToken is passed
      }
      return session;
    },
  },
};

export default authOptions;