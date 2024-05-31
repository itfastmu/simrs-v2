"use client";

import { Dialog } from "@headlessui/react";
import React, { forwardRef } from "react";
import BPJSLogo from "@/assets/img/bpjs-logo.png";
import Image from "next/image";
import { KunjunganRajal, SKDPSch } from "../../schema";
import { SKDP } from "../page";

const CetakSKDP = forwardRef<
  HTMLDivElement,
  { data?: (KunjunganRajal | SKDP) & { skdp: SKDPSch } }
>(({ data }, ref) => {
  return (
    // <Dialog
    //   as="div"
    //   open={true}
    //   className="relative z-[1020]"
    //   onClose={() => false}
    // >
    //   <div className="fixed inset-0 bg-black bg-opacity-25" />
    //   <div className="fixed inset-0 overflow-y-auto">
    //     <div className="flex min-h-full items-center justify-center p-4 text-center">
    //       <Dialog.Panel
    //         className="w-full max-w-3xl transform overflow-hidden bg-white text-left align-middle transition-all"
    //         ref={ref}
    //       >
    <div
      className="w-full overflow-hidden px-8 py-5 text-left align-middle"
      ref={ref}
    >
      <div className="h-[360px] font-[Arial] font-medium">
        <div className="flex">
          <Image
            src={BPJSLogo}
            width={160}
            className="w-40 object-scale-down"
            alt="Logo BPJS"
            priority
          />
          <div className="ml-6 w-72 text-center">
            <p>SURAT RENCANA KONTROL</p>
            <p className="text-sm">RSU Fastabiq Sehat PKU Muhammadiyah</p>
          </div>
          <p className="flex-1 pl-4 text-sm">No. {data?.sep}</p>
        </div>
        <div className="mt-6 flex flex-col gap-0.5 text-sm">
          <div className="flex">
            <p className="w-[118px]">Kepada Yth</p>
            <p>{data?.skdp.dokter}</p>
          </div>
          <p className="ml-[118px]">
            Sp./Sub. {data?.skdp.klinik?.replace("Klinik ", "")}
          </p>
          <p>Mohon Pemeriksaan dan Penanganan Lebih Lanjut :</p>
          <div className="flex">
            <p className="w-[110px]">No. Kartu</p>
            <p className="px-1.5">:</p>
            <p>{data?.noka}</p>
          </div>
          <div className="flex">
            <p className="w-[110px]">Nama Peserta</p>
            <p className="px-1.5">:</p>
            <p>{data?.nama}</p>
          </div>
          <div className="flex">
            <p className="w-[110px]">Tgl. Lahir</p>
            <p className="px-1.5">:</p>
            <p>
              {data?.tanggal_lahir
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "long",
                  }).format(new Date(data.tanggal_lahir))
                : ""}
            </p>
          </div>
          <div className="flex">
            <p className="w-[110px]">Diagnosis</p>
            <p className="px-1.5">:</p>
            {/* <p>{data?.diagnosis}</p> */}
          </div>
          <div className="flex">
            <p className="w-[110px]">Rencana Kontrol</p>
            <p className="px-1.5">:</p>
            <p>
              {data?.skdp.tanggal
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "long",
                  }).format(new Date(data.skdp.tanggal))
                : ""}
            </p>
          </div>
          <p className="mt-2">
            Demikian atas bantuannya, diucapkan banyak terima kasih.
          </p>
          <div className="flex justify-between">
            <div className="self-end">
              <p className="text-[10px]/[14px]">
                {"Tgl. Entri " +
                  new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "short",
                  }).format(new Date()) +
                  " | Tgl. Cetak " +
                  new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date())}
                {/* Tgl.Entri: 2023-11-18 | Tgl.Cetak: 18-11-2023 17:38 PM */}
              </p>
            </div>
            <div className="pr-8">
              <p>Mengetahui DPJP,</p>
              <div className="h-10" />
              <p>{data?.skdp.dokter}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    //       </Dialog.Panel>
    //     </div>
    //   </div>
    // </Dialog>
  );
});
CetakSKDP.displayName = "CetakSKDP";

export default CetakSKDP;
