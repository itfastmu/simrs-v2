import Taskbar from "@/components/taskbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Taskbar />
    </>
  );
}
