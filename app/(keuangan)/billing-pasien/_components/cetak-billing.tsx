"use client";

import Image from "next/image";
import { forwardRef } from "react";
import FastabiqLogo from "@/assets/img/fastabiq-logo.png";
import { BillingState } from "../page";
import { TBillingPasien } from "../../schema";
import { cn, getAge } from "@/lib/utils";

const CetakBilling = forwardRef<
  HTMLDivElement,
  {
    billing: BillingState;
    billingPasien: TBillingPasien | undefined;
    small?: boolean;
  }
>(({ billing, billingPasien, small = false }, ref) => {
  return (
    <div className={cn("p-2 font-[Arial]", small && "w-[295px]")} ref={ref}>
      <div className="grid grid-cols-5 justify-center">
        <Image
          src={FastabiqLogo}
          width={small ? 40 : 80}
          className={cn("w-20 object-scale-down", small && "w-10")}
          alt="Logo Fastabiq"
          priority
        />
        <div
          className={cn(
            "col-span-3 flex flex-col text-center text-sm",
            small && "text-[8px]/[12px]"
          )}
        >
          <p className={cn("text-xl font-medium", small && "text-sm")}>
            RSU Fastabiq Sehat PKU Muhammadiyah
          </p>
          <p>
            Jl. Pati - Tayu Km. 03, Tambaharjo, Kec. Pati, Pati, Jawa Tengah
          </p>
          <p>
            (0295) 4199008, Fax (0295) 4101177, E-mail:
            rsfastabiqsehat@gmail.com
          </p>
          <p className={cn("my-1 text-base uppercase", small && "text-xs")}>
            BILLING
          </p>
        </div>
        <p
          className={cn(
            "self-center pl-5 text-base uppercase",
            small && "self-baseline text-xs"
          )}
        >
          {billing.data?.cara_bayar}
        </p>
      </div>
      <div
        className={cn(
          "flex flex-col gap-0.5 text-sm",
          small && "text-[10px]/[14px]"
        )}
      >
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>No. Rawat</p>
          <p className="px-1.5 align-top">:</p>
          <p>{billing.data?.kodebooking}</p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Unit/Instansi</p>
          <p className="px-1.5 align-top">:</p>
          <p>{billing.data?.instansi}</p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Tanggal & Jam</p>
          <p className="px-1.5 align-top">:</p>
          <p>
            {billing.data?.created_at
              ? new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeStyle: "long",
                }).format(new Date(billing.data.created_at))
              : ""}
          </p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>No. RM</p>
          <p className="px-1.5 align-top">:</p>
          <p>{billing.data?.nomer}</p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Nama Pasien</p>
          <p className="px-1.5 align-top">:</p>
          <p>
            {billing.data?.nama} (
            {getAge(new Date(billing.data?.tanggal_lahir!))} Tahun)
          </p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Alamat Pasien</p>
          <p className="px-1.5 align-top">:</p>
          <p>{billing.data?.alamat}</p>
        </div>
        <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Dokter</p>
          <p className="px-1.5 align-top">:</p>
          <p>{billing.data?.dokter}</p>
        </div>
        {/* <div className="flex">
          <p className={cn("w-44", small && "w-20")}>Administrasi Rekam Medis</p>
          <p className="px-1.5 align-top">:</p>
          <p className="ml-auto">Rp 23.000,00</p>
        </div> */}
        <table className="w-full">
          <tbody>
            <tr>
              <td
                className={cn("w-44 align-top", small && "w-20")}
                rowSpan={(billingPasien?.detail ?? [])?.length + 1}
              >
                Tarif
              </td>
            </tr>
            {billingPasien?.detail?.map((val, idx) => (
              <tr key={idx.toString()}>
                <td className="pl-1.5">{val.nama_tarif}</td>
                <td className={cn(!small && "text-xs")}>1</td>
                <td className="text-right">
                  {val.nominal?.replace("Rp", "Rp ")}
                </td>
              </tr>
            ))}

            <tr>
              <td
                className={cn("w-44 align-top", small && "w-20")}
                rowSpan={(billingPasien?.obat ?? [])?.length + 1}
              >
                Obat
              </td>
            </tr>
            {billingPasien?.obat?.map((val, idx) => (
              <tr key={idx.toString()}>
                <td className="pl-1.5">{val.nama}</td>
                <td className={cn(!small && "text-xs")}>{val.jumlah}</td>
                <td className="text-right">
                  {!!val.total
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(val.total)
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between font-semibold">
          <p>TOTAL TAGIHAN</p>
          <p>
            {!!billingPasien?.total
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(billingPasien.total)
              : ""}
          </p>
        </div>
        <div className="flex justify-between font-semibold">
          <p>PPN</p>
          <p>Rp 0,00</p>
        </div>
        <div className="flex items-start justify-between font-semibold">
          <p>TOTAL BAYAR</p>
          <p className={cn("text-lg", small && "text-sm")}>
            {!!billingPasien?.total
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(billingPasien.total)
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
});

CetakBilling.displayName = "CetakBilling";
export default CetakBilling;
