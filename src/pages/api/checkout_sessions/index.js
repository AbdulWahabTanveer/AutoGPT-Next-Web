import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const lineItems = [
        {
          price: "price_1OOaPMJRX4rls1yaJwQFZHqY", // Replace with your actual plan ID
          quantity: 1,
        },
      ];

      // Ensure there are line items before proceeding
      if (!lineItems || lineItems.length === 0) {
        return res
          .status(400)
          .json({ error: "No line items provided for Stripe session." });
      }

      // Create a Stripe Checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        metadata: { userid: req.body.id ?? "" },
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: lineItems,
        success_url: `${process.env.NEXT_BASE_URL}/stripe/success?userId=${req.body.id}`,
        cancel_url: `${process.env.NEXT_BASE_URL}/stripe/failure?userId=${req.body.id}`,
      });

      res.status(200).json(session);
      // } else {
      //   res.send({
      //     error:
      //       "You must be signed in to view the protected content on this page.",
      //   });
      // }
    } catch (error) {
      console.log("Some error occured");
      console.error(error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
