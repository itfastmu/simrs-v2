import HomeLayout from "../HomeLayout";

export default function FarmasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout>{children}</HomeLayout>;
}
