import { NextPage } from "next";
// import Layout from "../components/Layout";
import CheckoutCard from "../components/CheckoutCard";

const CheckOutPage: NextPage = () => {
  return (
    // <Layout title="Donate with Checkout | Next.js + TypeScript Example">
    <div className="flex h-screen items-center justify-center">
      <div>
        <CheckoutCard />
      </div>
    </div>
    // </Layout>
  );
};

export default CheckOutPage;
