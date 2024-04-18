import HomeLayout from "../HomeLayout";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout>{children}</HomeLayout>;
}
