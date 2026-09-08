import { redirect } from "next/navigation";

export const SellerRootPage = () => {
  redirect("/seller/dashboard");
};

export default SellerRootPage;
