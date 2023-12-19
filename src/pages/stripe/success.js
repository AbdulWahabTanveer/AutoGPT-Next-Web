import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function PaymentSuccess() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const longEnUSFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { userId } = router.query;
        if (userId) {
          const response = await axios.get(`/api/user/${userId}`);
          setUser(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router.query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-xl bg-white p-16 shadow-xl">
        <img
          src="https://stripe.com/img/v3/home/twitter.png"
          alt="Stripe Logo"
          className="mx-auto mb-4 h-12"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold">Payment Successful</h2>
          <p className="text-lg text-gray-700">Thank you for your purchase!</p>
        </div>
        {user && (
          <div className="mb-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-lg font-medium">Name</span>
              <span className="break-all text-lg">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lg font-medium">Email</span>
              <span className="break-all text-lg">{user.email}</span>
            </div>
            {/* <div className="flex justify-between">
              <span className="text-lg font-medium">Subscription ID</span>
              <span className="break-all text-lg">
                {user.stripeSubscriptionId}
              </span>
            </div> */}
            <div className="flex justify-between">
              <span className="text-lg font-medium">Subscription Status</span>
              <span className="break-all text-lg">
                {user.subscriptionStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-lg font-medium">Billing Date</span>
              <span className="break-all text-lg">
                {user.subscriptionStartDate
                  ? longEnUSFormatter.format(
                      new Date(user.subscriptionStartDate),
                    )
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-lg font-medium">Valid Thru</span>
              <span className="break-all text-lg">
                {user.subscriptionEndDate
                  ? longEnUSFormatter.format(new Date(user.subscriptionEndDate))
                  : "N/A"}
              </span>
            </div>
            {/* Add more details as needed */}
          </div>
        )}
      </div>
    </div>
  );
}
