import { buffer } from 'micro';
import { PrismaClient } from '@prisma/client';

const prisma= new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');
    const event = JSON.parse(rawBody);
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'checkout.session.completed':
        console.log(event.data.object);
        await handleSubscriptionCreated(event.data.object);
        break;
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userid; // Extract user ID from metadata
  console.log(userId);
  console.log('Subscription created for user:', userId);
  console.log(subscription);
  if (!userId) {
    console.error('User ID is undefined');
    return;
  }

  // Assuming subscription.start_date is in UNIX timestamp format
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth()+1)
  let endDate = startDate;


  await prisma.user.update({
    where: { id: userId }, // Use the extracted user ID
    data: {
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate, // Convert UNIX timestamp to JavaScript Date
      subscriptionEndDate: endDate, // Convert UNIX timestamp to JavaScript Date
    },
  });
}

async function handleSubscriptionUpdated(subscription) {

  // Assuming subscription.start_date is in UNIX timestamp format
  const startDate = new Date(subscription.created * 1000);
  let endDate = subscription.expires_at ? new Date(subscription.expires_at * 1000) : null;

  // Check if endDate is invalid, and if so, set it to one month after startDate
  if (!endDate || isNaN(endDate.getTime())) {
    endDate = new Date(startDate.getTime());
    endDate.setMonth(startDate.getMonth() + 1); // Add one month to the start date
  }

  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      // Update start and end dates if they change
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      stripeCustomerId: subscription.customer,
    },
  });
}

async function handleSubscriptionDeleted(subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer },
    data: {
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: null,
      subscriptionStatus: 'cancelled',
      subscriptionEndDate: new Date(), // Set end date to current date/time
    },
  });
}
