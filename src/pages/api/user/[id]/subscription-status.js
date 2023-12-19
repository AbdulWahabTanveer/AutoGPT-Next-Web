import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const userid = req.query.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }
    // console.log(
    //   user &&
    //     user.subscriptionId &&
    //     user.stripeCustomerId &&
    //     user.subscriptionStatus === "active" &&
    //     user.subscriptionEndDate < new Date(),
    // );
    // console.log(
    //   user,
    //   user.subscriptionId,
    //   user.stripeCustomerId,
    //   user.subscriptionStatus === "active",
    //   user.subscriptionEndDate > new Date(),
    // );
    // Implement your logic to determine if the user is subscribed
    const isSubscribed =
      user &&
      user.stripeSubscriptionId &&
      user.stripeCustomerId &&
      user.subscriptionStatus === "active" &&
      user.subscriptionEndDate > new Date();

    res.status(200).json({ isSubscribed });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error fetching user subscription status",
    });
  }
}
