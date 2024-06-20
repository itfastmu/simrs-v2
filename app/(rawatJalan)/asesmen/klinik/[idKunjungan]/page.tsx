"use client";

import { getAge } from "@/lib/utils";
import { APIURL } from "@/lib/connection";
import AsesmenPerawat from "../_components/asesmen-perawat";
import AsesmenDokter from "../_components/asesmen-dokter";
import { KlinikAsesmen, TData } from "../../schema";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import AsesmenPsikologi from "../_components/asesmen-psikologi";

export default function AsesmenKlinik() {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const searchParams = useSearchParams();
  const id = parseInt(searchParams.get("id")!);
  const userGroup = searchParams.get("grup")!;

  const url = new URL(`${APIURL}/rs/pasien/${id}`);

  const [data, setData] = useState<TData>();
  const fetchData = async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const json = await res.json();
    setData({
      ...json.data,
      id: id,
      klinik: searchParams.get("klinik") || "",
      kode_klinik: searchParams.get("kode_klinik") || "BED",
      dokter: searchParams.get("dokter") || "",
      kode_dokter: searchParams.get("kode") || "",
      jam_periksa: jam,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [jam] = useState(
    new Intl.DateTimeFormat("en", {
      timeStyle: "short",
      hourCycle: "h24",
    }).format(new Date())
  );

  const klinik = useMemo(
    () => ({
      isAnak: data?.kode_klinik === "ANA",
      isRehab: data?.kode_klinik === "IRM",
      isMata: data?.kode_klinik === "MTA",
      isObg: data?.kode_klinik === "OBG",
      isOrt: data?.kode_klinik === "ORT",
      isGigi: data?.kode_klinik === "GIG" || data?.kode_klinik === "END",
      isDerma: data?.kode_klinik === "KLT",
      isPsi: data?.klinik === "Klinik Psikologi",
      isJiwa: data?.klinik === "Klinik Jiwa",
      isWicara: data?.klinik === "Terapi Wicara",
    }),
    [data]
  );
  
  return data 
    ? (
    <>
      {userGroup === "Perawat Rajal" ? (
        <AsesmenPerawat data={data} klinik={klinik} />
      ) : klinik.isPsi ? (
        <AsesmenPsikologi data={data} klinik={klinik} />
      ) : (
        <AsesmenDokter data={data} klinik={klinik} />
      )}
    </>
  ) : (
    <div className="mx-auto flex h-full gap-2 overflow-auto px-4 pb-[68px] pt-1"
    >
      <div className="flex justify-center items-center w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
        <p>Memuat...</p>
      </div>
    </div>
  );
}
