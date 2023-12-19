import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the User model if you have added additional properties
   */
  interface User extends DefaultSession["user"] {
    id: string;
    role?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    image?: string;
  }

  /**
   * Extend the Session model to include the extended User model
   */
  interface Session {
    user?: User;
  }
}
