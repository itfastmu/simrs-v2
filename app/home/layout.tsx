import HomeLayout from "../HomeLayout";

export default function RajalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout>{children}</HomeLayout>;
}
