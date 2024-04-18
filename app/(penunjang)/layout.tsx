import HomeLayout from "../HomeLayout";

export default function PenunjangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayout>{children}</HomeLayout>;
}
