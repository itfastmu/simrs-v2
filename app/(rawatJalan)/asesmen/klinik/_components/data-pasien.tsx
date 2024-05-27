"use client";

import React, { useMemo } from "react";
import { Transition } from "@headlessui/react";
import { getAgeAll } from "@/lib/utils";
import { useParams } from "next/navigation";
import { TData, THasilDokter, THasilPerawat } from "../../schema";
import { DataPesertaBPJS } from "@/app/(pendaftaran)/schema";

export default function DataPasien({
  data,
  dataPeserta,
  hasilDokter,
  hasilPerawat,
}: {
  data: TData | undefined;
  dataPeserta: DataPesertaBPJS | undefined;
  hasilDokter?: THasilDokter | undefined;
  hasilPerawat: THasilPerawat | undefined;
}) {
  const params = useParams();
  const hasil = useMemo(() => {
    if (!hasilDokter) return hasilDokter;
    return hasilPerawat;
  }, [hasilDokter, hasilPerawat]);

  return (
    <div className="h-fit rounded-md bg-white p-2 shadow-md dark:bg-slate-700">
      <table className="w-full text-left text-xs font-semibold text-gray-600 dark:text-neutral-200">
        <tbody>
          <tr>
            <td colSpan={3}>
              <p className="text-center text-base text-red-500">
                {dataPeserta?.informasi.prolanisPRB}
              </p>
            </td>
          </tr>
          <tr className="*:align-baseline">
            <td className="w-20">No. RM</td>
            <td className="px-1">:</td>
            <td>{data?.id ? String(data?.id).padStart(6, "0") : ""}</td>
          </tr>
          <tr className="*:align-baseline">
            <td>Nama</td>
            <td className="px-1">:</td>
            <td>{data?.nama ?? ""}</td>
          </tr>
          <tr className="*:align-baseline">
            <td>Tgl. Lahir</td>
            <td className="px-1">:</td>
            <td>
              {data?.tanggal_lahir
                ? new Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(data?.tanggal_lahir))
                : ""}
            </td>
          </tr>
          <tr className="*:align-baseline">
            <td>Usia</td>
            <td className="px-1">:</td>
            <td>{data?.tanggal_lahir ? getAgeAll(data?.tanggal_lahir) : ""}</td>
          </tr>
          {!!hasil ? (
            <tr className="*:align-baseline">
              <td>Usia Rawat</td>
              <td className="px-1">:</td>
              <td>
                {data?.tanggal_lahir && hasil?.anamnesis.created_at
                  ? getAgeAll(
                      data?.tanggal_lahir,
                      new Date(hasil?.anamnesis.created_at)
                    )
                  : ""}
              </td>
            </tr>
          ) : null}
          <tr className="*:align-baseline">
            <td>No. Rawat</td>
            <td className="px-1">:</td>
            <td>{params.idKunjungan === "igd" ? "" : params.idKunjungan}</td>
          </tr>
          <tr className="*:align-baseline">
            <td>Tanggal</td>
            <td className="px-1">:</td>
            <td>
              {hasil?.anamnesis.created_at
                ? new Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(hasil?.anamnesis.created_at))
                : new Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date())}
            </td>
          </tr>
          <tr className="*:align-baseline">
            <td>Jam</td>
            <td className="px-1">:</td>
            <td>
              {hasil?.anamnesis.created_at
                ? new Intl.DateTimeFormat("en", {
                    timeStyle: "short",
                    hourCycle: "h24",
                  }).format(new Date(hasil?.anamnesis.created_at))
                : data?.jam_periksa}
            </td>
          </tr>
          <tr className="*:align-baseline">
            <td>Poliklinik</td>
            <td className="px-1">:</td>
            <td>{data?.klinik}</td>
          </tr>
          <tr className="*:align-baseline">
            <td>Dokter</td>
            <td className="px-1">:</td>
            <td>{data?.dokter}</td>
          </tr>
        </tbody>
        <Transition
          show={!!dataPeserta}
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <tbody>
            <tr className="*:align-baseline">
              <td>Status</td>
              <td className="px-1">:</td>
              <td>{dataPeserta?.statusPeserta.keterangan}</td>
            </tr>
            <tr className="*:align-baseline">
              <td>Hak Kelas</td>
              <td className="w-min px-1">:</td>
              <td>{dataPeserta?.hakKelas.keterangan}</td>
            </tr>
            <tr className="*:align-baseline">
              <td>Jenis Peserta</td>
              <td className="px-1">:</td>
              <td>{dataPeserta?.jenisPeserta.keterangan}</td>
            </tr>
          </tbody>
        </Transition>
      </table>
    </div>
  );
}
