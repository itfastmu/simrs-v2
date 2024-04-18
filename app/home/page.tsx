import { Motivation } from "@/components/motivation";
import Image from "next/image";
import logoFastMu from "@/assets/img/fastabiq-logo.png";
import { IoStar } from "react-icons/io5";

export default function Home() {
  return (
    <>
      <div className="mx-auto mt-10 h-32 md:w-10/12 xl:w-8/12">
        <Motivation />
      </div>
      <div className="mx-auto mt-8 w-full">
        <Image src={logoFastMu} alt="Logo" className="mx-auto my-2 h-24 w-24" />
        <p className="text-center text-3xl font-bold uppercase text-blue-800">
          SIMRS FASTMU
        </p>
        <div className="my-5">
          <p className="text-center text-2xl font-bold uppercase text-sky-900">
            RSU Fastabiq Sehat PKU Muhammadiyah Pati
          </p>
          <p className="text-center text-xl font-bold uppercase text-red-600">
            terakreditasi paripurna
          </p>
          <div className="flex justify-center">
            <IoStar size="1.5rem" className="mx-2 text-[#FFD700]" />
            <IoStar size="1.5rem" className="mx-2 text-[#FFD700]" />
            <IoStar size="1.5rem" className="mx-2 text-[#FFD700]" />
            <IoStar size="1.5rem" className="mx-2 text-[#FFD700]" />
            <IoStar size="1.5rem" className="mx-2 text-[#FFD700]" />
          </div>
        </div>
        <p className="text-center text-lg text-slate-50">
          Jl. Raya Pati - Tayu No. Km 3, Runting, Tambaharjo, Kec. Pati, Pati -
          Jawa Tengah
        </p>
      </div>
    </>
  );
}
