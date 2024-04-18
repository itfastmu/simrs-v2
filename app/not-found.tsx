import HomeLayout from "./HomeLayout";

export default function NotFound() {
  return (
    <HomeLayout>
      <div className="flex h-screen flex-col items-center justify-center text-center text-slate-50">
        <p className="text-lg font-normal">Halaman tidak ditemukan</p>
      </div>
    </HomeLayout>
  );
}
