import Image from "next/image";
import logoFastMu from "@/assets/img/fastabiq-logo.png";
import LoginForm from "./_components/login";

export default function Home() {
  return (
    <main className="container mx-auto h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-96 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-600 dark:bg-slate-700">
          <Image
            className="mx-auto"
            src={logoFastMu}
            alt="Login Logo"
            width={90}
            height={90}
            priority
            unoptimized
          />
          <p className="pt-3 font-bold tracking-tight text-sky-700">
            SIMRS FASTMU
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
