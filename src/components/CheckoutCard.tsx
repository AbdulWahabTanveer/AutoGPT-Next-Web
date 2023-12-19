import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import fetchPostJSON from "./utils/fetchPostJson";
import getStripe from "../utils/get-stripeJs";

interface User {
  name: string;
  email: string;
  stripeSubscriptionId: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

const CheckoutCard = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const date = new Date();

  const longEnUSFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  useEffect(() => {
    console.log("useeffect called");
    const fetchUser = async () => {
      try {
        const { userId } = router.query;
        if (userId && typeof userId === "string") {
          const response = await axios.get(`/api/user/${userId}`);
          setUser(response.data);
        }
      } catch (err) {
        console.log(err);
        if (axios.isAxiosError(err) && err.response) {
          setError(
            err.response.data.error ||
              "An error occurred while fetching user data.",
          );
        } else {
          setErrorMessage("An error occurred while fetching user data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router.query]);

  const session = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(session);
      if (!session) {
        setErrorMessage("User must be signed in");
        return;
      }
      const checkoutSession = await fetchPostJSON("/api/checkout_sessions", {
        id: session.data?.user?.id,
      });
      if (
        !checkoutSession ||
        checkoutSession.statusCode === 500 ||
        checkoutSession.statusCode === 403 ||
        !checkoutSession.id
      ) {
        console.error("Checkout session error:", checkoutSession.message);
        setErrorMessage(checkoutSession.message || "Error processing request");
        return;
      }

      // Redirect to Checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSession.id,
      });

      if (error) {
        console.warn("Stripe error:", error.message);
        setErrorMessage(error.message);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setErrorMessage("Error processing payment");
    }
  };

  return (
    <div className="mx-auto my-8 max-w-lg overflow-hidden rounded-xl bg-white p-16 shadow-xl">
      <img
        src="https://stripe.com/img/v3/home/twitter.png"
        alt="Stripe Logo"
        className="mx-auto mb-4 h-12"
      />
      <div className="mb-6 p-10 text-center">
        <h2 className="mb-2 text-2xl font-bold">Premium Plan</h2>
        <p className="text-lg text-gray-700">
          Unlimited access to all features
        </p>
      </div>
      <div className="mb-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-lg font-medium">Price</span>
          <span className="text-lg">$50/month</span>
        </div>
        <div className="flex justify-between">
          <span className="mr-6 text-lg font-medium">Your Email</span>
          <span className="ml-6 text-lg">{user?.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="mr-6 text-lg font-medium">Billing Date</span>
          <span className="text-lg">{longEnUSFormatter.format(date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-lg font-medium">Valid thru</span>
          <span className="text-lg">
            {longEnUSFormatter.format(date.setMonth(date.getMonth() + 1))}
          </span>
        </div>

        {/* Add more details as needed */}
      </div>
      <form onSubmit={handleSubmit} className="text-center">
        <button
          className="mt-8 rounded bg-blue-500 px-6 py-3 text-lg font-bold text-white hover:bg-blue-700"
          type="submit"
        >
          Proceed to Checkout
        </button>
        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default CheckoutCard;
