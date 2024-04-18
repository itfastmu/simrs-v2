"use client";

import { Dialog } from "@headlessui/react";
import React, { forwardRef } from "react";
import Image from "next/image";
import FastabiqLogo from "@/assets/img/fastabiq-logo.png";
import { DetailPemeriksaanRad, Permintaan } from "../../schema";
import { getAge } from "@/lib/utils";
import Cookies from "js-cookie";

const CetakHasilRadiologi = forwardRef<
  HTMLDivElement,
  {
    data: {
      pemeriksaan: DetailPemeriksaanRad | undefined;
      permintaan: Permintaan | undefined;
    };
  }
>(({ data }, ref) => {
  const user = Cookies.get("nama");
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
      <div className="h-[1000px] font-[Arial] font-medium">
        <div className="relative flex justify-center border-b-4 border-double border-black pb-1">
          <Image
            src={FastabiqLogo}
            width={80}
            height={80}
            className="absolute left-0 h-20 w-20 object-contain"
            alt="Logo Fastabiq"
            priority
          />
          <div className="text-center">
            <p className="text-2xl">RSU Fastabiq Sehat PKU Muhammadiyah</p>
            <p className="text-xs">
              Jl. Raya Pati - Tayu No. Km 3, Runting, Tambaharjo, Kec. Pati,
              Pati - Jawa Tengah
            </p>
            <p className="text-xs">(0295) 4199008, Fax (0295) 4101177</p>
            <p className="text-xs">E-mail: rsfastabiqsehat@gmail.com</p>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-0.5 text-sm">
          <p className="mb-1.5 self-center text-base">
            HASIL PEMERIKSAAN RADIOLOGI
          </p>
          <div className="grid grid-cols-2">
            <div>
              <div className="flex">
                <p className="w-[95px]">No. RM</p>
                <p className="px-1.5">:</p>
                <p>{data.permintaan?.id_pasien}</p>
              </div>
              <div className="flex">
                <p className="w-[95px]">Nama Pasien</p>
                <p className="px-1.5">:</p>
                <p>{data.permintaan?.nama}</p>
              </div>
              <div className="flex">
                <p className="w-[95px]">J.K./Umur</p>
                <p className="px-1.5">:</p>
                <p>
                  {data.permintaan?.jenis_kelamin.charAt(0)}/
                  {getAge(new Date(data.permintaan?.tanggal_lahir!))} Tahun
                </p>
              </div>
              <div className="flex">
                <p className="w-[95px]">Alamat</p>
                <p className="px-1.5">:</p>
                <p>{data.permintaan?.alamat}</p>
              </div>
              <div className="flex">
                <p className="w-[95px]">No. Kunjungan</p>
                <p className="px-1.5">:</p>
                <p>{data.permintaan?.id_kunjungan}</p>
              </div>
              <div className="flex">
                <p className="w-[95px]">Pemeriksaan</p>
                <p className="px-1.5">:</p>
                <p>{data.pemeriksaan?.nama}</p>
              </div>
            </div>
            <div>
              <div className="flex">
                <p className="w-[125px]">Penanggung Jawab</p>
                <p className="px-1.5">:</p>
                <p>dr. Musdalifah, Sp. Rad.</p>
              </div>
              <div className="flex">
                <p className="w-[125px]">Dokter Pengirim</p>
                <p className="px-1.5">:</p>
                <p>
                  {data.permintaan?.nama_dokter ||
                    data.permintaan?.perujuk_luar ||
                    ""}
                </p>
              </div>
              <div className="flex">
                <p className="w-[125px]">Tgl. Pemeriksaan</p>
                <p className="px-1.5">:</p>
                <p>
                  {data.pemeriksaan?.created_at
                    ? new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "long",
                      }).format(new Date(data.pemeriksaan.created_at))
                    : ""}
                </p>
              </div>
              <div className="flex">
                <p className="w-[125px]">Jam Pemeriksaan</p>
                <p className="px-1.5">:</p>
                <p>
                  {data.pemeriksaan?.created_at
                    ? new Intl.DateTimeFormat("id-ID", {
                        timeStyle: "long",
                      }).format(new Date(data.pemeriksaan.created_at))
                    : ""}
                </p>
              </div>
              <div className="flex">
                <p className="w-[125px]">Klinik</p>
                <p className="px-1.5">:</p>
                <p>{data.permintaan?.klinik}</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex">
            <p className="w-[125px]">Hasil Pemeriksaan</p>
            <p className="px-1.5">:</p>
          </div>
          <div className="min-h-[40px] whitespace-pre border border-black px-1">
            {data.pemeriksaan?.hasil}
          </div>
          <div className="mt-7 flex justify-between px-8">
            <div className="text-center">
              <p>
                Tgl. Cetak{" "}
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                  new Date()
                )}
              </p>
              <p>Petugas Radiologi</p>
              <div className="h-[60px]" />
              <p>{user}</p>
            </div>
            <div className="text-center">
              <p>Penanggung Jawab</p>
              <div className="h-20" />
              <p>dr. Musdalifah, Sp. Rad.</p>
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
CetakHasilRadiologi.displayName = "CetakHasilRadiologi";

export default CetakHasilRadiologi;
