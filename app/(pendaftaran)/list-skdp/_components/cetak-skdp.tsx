"use client";

import { Dialog } from "@headlessui/react";
import React, { forwardRef } from "react";
import BPJSLogo from "@/assets/img/bpjs-logo.png";
import Image from "next/image";

const CetakSKDP = forwardRef<HTMLDivElement, { text?: string }>(
  ({ text }, ref) => {
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
      //         className="w-full max-w-3xl transform overflow-hidden bg-white px-8 py-5 text-left align-middle transition-all"
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
            <p className="flex-1 pl-4 text-sm">No. 0158R0101123K003250</p>
          </div>
          <div className="mt-6 flex flex-col gap-0.5 text-sm">
            <div className="flex">
              <p className="w-[118px]">Kepada Yth</p>
              <p>dr. Jalu Panjongko, Sp.PD</p>
            </div>
            <p className="ml-[118px]">Sp./Sub. Penyakit Dalam</p>
            <p>Mohon Pemeriksaan dan Penanganan Lebih Lanjut :</p>
            <div className="flex">
              <p className="w-[110px]">No. Kartu</p>
              <p className="px-1.5">:</p>
              <p>0001725536619</p>
            </div>
            <div className="flex">
              <p className="w-[110px]">Nama Peserta</p>
              <p className="px-1.5">:</p>
              <p>BONDAN KRISTIAWAN (Laki-Laki)</p>
            </div>
            <div className="flex">
              <p className="w-[110px]">Tgl. Lahir</p>
              <p className="px-1.5">:</p>
              <p>5 Maret 1969</p>
            </div>
            <div className="flex">
              <p className="w-[110px]">Diagnosis</p>
              <p className="px-1.5">:</p>
              <p>N18 - Chronic kidney disease</p>
            </div>
            <div className="flex">
              <p className="w-[110px]">Rencana Kontrol</p>
              <p className="px-1.5">:</p>
              <p>18 November 2023</p>
            </div>
            <p className="mt-2">
              Demikian atas bantuannya, diucapkan banyak terima kasih.
            </p>
            <div className="flex justify-between">
              <div className="self-end">
                <p className="text-[10px]/[14px]">
                  Tgl.Entri: 2023-11-18 | Tgl.Cetak: 18-11-2023 17:38 PM
                </p>
              </div>
              <div className="pr-8">
                <p>Mengetahui DPJP,</p>
                <div className="h-10" />
                <p>dr. Jalu Panjongko, Sp.PD</p>
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
  }
);
CetakSKDP.displayName = "CetakSKDP";

export default CetakSKDP;
