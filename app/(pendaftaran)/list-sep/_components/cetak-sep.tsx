"use client";

// import { Dialog } from "@headlessui/react";
import React, { forwardRef } from "react";
import BPJSLogo from "@/assets/img/bpjs-logo.png";
import Image from "next/image";

const CetakSEP = forwardRef<HTMLDivElement, { text: string }>(
  ({ text }, ref) => {
    return (
      //   <Dialog
      //     as="div"
      //     open={true}
      //     className="relative z-[1020]"
      //     onClose={() => false}
      //   >
      //     <div className="fixed inset-0 bg-black bg-opacity-25" />
      //     <div className="fixed inset-0 overflow-y-auto">
      //       <div className="flex min-h-full items-center justify-center p-4 text-center">
      //         <Dialog.Panel
      //           className="w-full max-w-3xl transform overflow-hidden bg-white px-8 py-5 text-left align-middle transition-all"
      //           ref={ref}
      //         >
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
              <p>SURAT ELIGIBILITAS PESERTA</p>
              <p className="text-sm">RSU Fastabiq Sehat PKU Muhammadiyah</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-0.5 text-sm">
            <div className="grid grid-cols-2">
              <div>
                <div className="flex">
                  <p className="w-[110px]">No. SEP</p>
                  <p className="px-1.5">:</p>
                  <p>0158R0101123V003776</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Tgl. SEP</p>
                  <p className="px-1.5">:</p>
                  <p>16 November 2023</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">No. Kartu</p>
                  <p className="px-1.5">:</p>
                  <p>0000092998449 (MR. 056758)</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Nama Peserta</p>
                  <p className="px-1.5">:</p>
                  <p>SULIYANI (Perempuan)</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Tgl. Lahir</p>
                  <p className="px-1.5">:</p>
                  <p>16 November 1972</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">No. Telepon</p>
                  <p className="px-1.5">:</p>
                  <p>082135816140</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Dokter</p>
                  <p className="px-1.5">:</p>
                  <p>dr. Firman Muntaqo, Sp.KFR</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Faskes Perujuk</p>
                  <p className="px-1.5">:</p>
                  <p>Klinik Tamara Sehat</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Diagnosis Awal</p>
                  <p className="px-1.5">:</p>
                  <p>N18 - Chronic kidney disease</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Catatan</p>
                  <p className="px-1.5">:</p>
                  <p>-</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-center font-semibold text-red-600">
                  Pasien Potensi PRB
                </p>
                <div className="flex">
                  <p className="w-[110px]">Peserta</p>
                  <p className="px-1.5">:</p>
                  <p>PEKERJA MANDIRI</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Jns. Rawat</p>
                  <p className="px-1.5">:</p>
                  <p>Rawat Jalan</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Jns. Kunjungan</p>
                  <p className="px-1.5">:</p>
                  <p>- Konsultasi dokter (pertama)</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Poli Perujuk</p>
                  <p className="px-1.5">:</p>
                  <p>-</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Kls. Hak</p>
                  <p className="px-1.5">:</p>
                  <p>Kelas 1</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Kls. Rawat</p>
                  <p className="px-1.5">:</p>
                  <p>-</p>
                </div>
                <div className="flex">
                  <p className="w-[110px]">Penjamin</p>
                  <p className="px-1.5">:</p>
                  <p></p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="self-end">
                <p className="text-[10px]/[14px] italic">
                  *Saya Menyetujui BPJS Kesehatan menggunakan informasi Medis
                  Pasien jika diperlukan.
                </p>
                <p className="text-[10px]/[14px] italic">
                  *SEP bukan sebagai bukti penjaminan peserta
                </p>
                <p className="text-[10px]/[14px] font-semibold italic">
                  *Masa berlaku rujukan sampai 18 Januari 2024
                </p>
                <p className="text-[10px]/[14px]">
                  Tgl.Cetak: 18-11-2023 17:38 PM
                </p>
              </div>
              <div className="pr-8">
                <p>Pasien/Keluarga Pasien</p>
                <div className="h-10" />
                <p>____________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      //         </Dialog.Panel>
      //       </div>
      //     </div>
      //   </Dialog>
    );
  }
);
CetakSEP.displayName = "CetakSEP";

export default CetakSEP;
