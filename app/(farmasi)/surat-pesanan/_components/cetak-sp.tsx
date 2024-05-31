"use client";

// import { Dialog } from "@headlessui/react";
import React, { forwardRef } from "react";
import { DetailPesanan, SuratPesanan } from "../../schema";
import { cn } from "@/lib/utils";

const CetakSP = forwardRef<
  HTMLDivElement,
  {
    data:
      | (SuratPesanan & {
          total: string | null;
          suplier: string | undefined;
          detail: DetailPesanan[];
        })
      | undefined;
  }
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
    //         className="w-full max-w-3xl transform overflow-hidden bg-white px-10 py-16 text-left align-middle transition-all"
    //         ref={ref}
    //       >
    <div
      className={cn(
        "w-full overflow-hidden px-10 py-16 text-left align-middle"
      )}
      ref={ref}
    >
      <div className="h-[800px] border border-black p-8 font-['Times_New_Roman'] font-medium">
        <div className="flex flex-col text-center">
          <p className="text-lg font-bold underline">
            SURAT PESANAN OBAT/BAHAN OBAT/PREKURSOR FARMASI*
          </p>
          <p className="text-sm">Nomor: {data?.id}</p>
        </div>
        <div className="mt-6 flex flex-col gap-0.5 text-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <p>Yang bertanda tangan dibawah ini:</p>
              <div className="flex">
                <p className="w-[110px]">Nama</p>
                <p className="px-1.5">:</p>
                <p>......</p>
              </div>
              <div className="flex">
                <p className="w-[110px]">Jabatan</p>
                <p className="px-1.5">:</p>
                <p>......</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p>
                Mengajukan pesanan Obat/Bahan Obat/Prekursor Farmasi* kepada:
              </p>
              <div className="flex">
                <p className="w-[110px]">Nama Distributor</p>
                <p className="px-1.5">:</p>
                <p>{data?.suplier}</p>
              </div>
              <div className="flex">
                <p className="w-[110px]">Alamat</p>
                <p className="px-1.5">:</p>
                <p>......</p>
              </div>
              <div className="flex">
                <p className="w-[110px]">Telp.</p>
                <p className="px-1.5">:</p>
                <p>......</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p>
                dengan Obat/Bahan Obat/Prekursor Farmasi* yang dipesan adalah:
              </p>
              {data?.detail?.map((val, idx) => (
                <p key={idx.toString()}>
                  {val.nama_obat + " " + val.jumlah + " " + val.satuan}
                </p>
              ))}
            </div>
            <div className="flex flex-col">
              <p>
                Obat/Bahan Obat/Prekursor Farmasi tersebut akan dipergunakan
                untuk:
              </p>
              <div className="flex">
                <p className="w-[110px]">Nama Sarana</p>
                <p className="px-1.5">:</p>
                <p>Instalasi Farmasi RSU Fastabiq Sehat PKU Muhammadiyah</p>
              </div>
              <div className="flex">
                <p className="w-[110px]">Nama Sarana</p>
                <p className="px-1.5">:</p>
                <p>
                  Jl. Raya Pati - Tayu No. Km 3, Runting, Tambaharjo, Kec. Pati,
                  Pati - Jawa Tengah
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <div>
              <p>
                Pati,{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                }).format(
                  data?.created_at ? new Date(data.created_at) : new Date()
                )}
              </p>
              <div className="h-10" />
              <p>__________________________</p>
              <p>No. SIPA/SIKTTK</p>
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
CetakSP.displayName = "CetakSP";

export default CetakSP;
