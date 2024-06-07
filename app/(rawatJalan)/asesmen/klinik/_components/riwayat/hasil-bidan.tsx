"use client";

import Image from "next/image";
import FastabiqBiruLogo from "@/assets/img/fastabiq-biru.png";
import Cookies from "js-cookie";
import React, { useState } from "react";
import {
  THasilPerawat,
  listPenDahuluKeb,
  listPenKeluargaKeb,
} from "../../../schema";

const HasilBidan = React.forwardRef(
  (
    {
      // kunjungan,
      data,
      cek,
      setCek,
      previewDokter,
    }: {
      /* kunjungan: string; */ data: THasilPerawat | undefined;
      cek?: boolean;
      setCek?: React.Dispatch<React.SetStateAction<boolean>>;
      previewDokter?: boolean;
    },
    // _,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const headers = new Headers();
    const [token] = useState(Cookies.get("token"));
    headers.append("Authorization", token as string);
    headers.append("Content-Type", "application/json");

    const listGinekologi = [
      "Infertilitas",
      "Infeksi Virus",
      "PMS",
      "Cervisitis Kronis",
      "Endometriosis",
      "Myoma",
      "Polip Serviks",
      "Kanker Kandungan",
      "Operasi Kandungan",
      "Perkosaan",
      "Post Coital Bleeding",
      "Tidak ada",
    ];

    return (
      <div
        className="mx-auto flex w-[813px] justify-center bg-white p-8 font-[cambria]"
        ref={ref}
      >
        <div className="w-full border-x border-t border-black">
          <div className="flex h-24 w-full justify-center">
            <div className="flex w-[60%] items-center justify-center border-r border-black">
              <Image
                src={FastabiqBiruLogo}
                className="max-h-24 object-scale-down p-2"
                alt="Logo Fastabiq"
                quality={60}
                priority
              />
            </div>
            <div className="w-[40%] pb-2 pl-0.5 pr-0.5 pt-0.5">
              <table>
                <tbody className="text-sm">
                  <tr className="leading-4">
                    <td className="w-[58px]">No. RM</td>
                    <td className="px-1">:</td>
                    <td>{data?.kunjungan?.no_rm}</td>
                  </tr>
                  <tr className="leading-4">
                    <td className="flex">Nama</td>
                    <td className="px-1 align-baseline">:</td>
                    <td className="flex flex-wrap uppercase">
                      {data?.kunjungan?.nama}
                    </td>
                  </tr>
                  <tr className="leading-4">
                    <td className="flex w-[60px]">Tgl. Lahir</td>
                    <td className="px-1 align-baseline">:</td>
                    <td>
                      {data?.kunjungan?.tanggal_lahir
                        ? new Intl.DateTimeFormat("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(data?.kunjungan.tanggal_lahir))
                        : ""}
                    </td>
                  </tr>
                  <tr className="leading-4">
                    <td className="flex">Alamat</td>
                    <td className="px-1 align-baseline">:</td>
                    <td className="flex flex-wrap">
                      {data?.kunjungan?.alamat}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            <p className="uppercase">Asesmen Awal Kebidanan Rawat Jalan</p>
            <p className="lowercase italic">(diisi oleh bidan rawat jalan)</p>
          </div>
          <div className="w-full">
            <div className="my-0.5 grid grid-cols-2 px-2 text-sm">
              <div>
                <table>
                  <tbody>
                    <tr className="leading-[1.30]">
                      <td>Tanggal kunjungan</td>
                      <td className="px-1.5">:</td>
                      <td>
                        {data?.kebidanan?.created_at
                          ? new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "full",
                            }).format(new Date(data?.kebidanan?.created_at))
                          : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table>
                  <tbody>
                    <tr className="leading-[1.30]">
                      <td>Jam kunjungan</td>
                      <td className="px-1.5">:</td>
                      <td>
                        {data?.kebidanan?.created_at
                          ? new Intl.DateTimeFormat("id-ID", {
                              timeStyle: "long",
                            }).format(new Date(data?.kebidanan?.created_at))
                          : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Pengkajian Kebidanan
          </p>
          <div className="min-h-[50px] w-full px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td className="align-top">Keluhan utama</td>
                  <td className="px-1.5 align-top">:</td>
                  <td className="whitespace-pre-wrap underline">
                    {data?.anamnesis.keluhan}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat Menstruasi
          </p>
          <div className="w-full px-2 py-0.5 text-sm">
            <div className="mb-1 grid grid-cols-4">
              <div className="col-span-2">
                <p className="inline">
                  <span className="font-semibold">Menarche</span>
                  <span className="px-1.5">:</span>
                </p>
                <p className="inline underline">{data?.kebidanan?.menarche}</p>
              </div>
              <div className="col-span-2">
                <p className="inline">
                  <span className="font-semibold">Lama</span>
                  <span className="px-1.5">:</span>
                </p>
                <p className="inline underline">{data?.kebidanan?.lama_mens}</p>
              </div>
              <div className="flex items-center">
                <p className="inline">
                  <span className="font-semibold">Siklus</span>
                  <span className="px-1.5">:</span>
                </p>
                <p className="inline underline">
                  {data?.kebidanan?.siklus_mens}
                </p>
              </div>
              <div className="flex items-center">
                <div className="inline-flex items-center">
                  <span className="font-semibold">Teratur</span>
                  <span className="px-1.5">:</span>
                  {[
                    {
                      value: "Ya",
                      isChecked: data?.kebidanan?.siklus_teratur,
                    },
                    {
                      value: "Tidak",
                      isChecked:
                        Boolean(data?.kebidanan) &&
                        !data?.kebidanan?.siklus_teratur,
                    },
                  ].map((val, idx) => (
                    <div className="flex items-center" key={val.value}>
                      <input
                        type="checkbox"
                        className="accent-slate-800"
                        id={"hasil-teratur-" + (idx + 1)}
                        checked={val.isChecked}
                        readOnly
                      />
                      <label
                        htmlFor={"hasil-teratur-" + (idx + 1)}
                        className="px-1 py-0.5 pr-2"
                      >
                        {val.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat Kehamilan, Persalinan dan Nifas
          </p>
          <div className="w-full px-2 py-0.5 text-sm">
            <div className="mb-1 grid grid-cols-2">
              <div className="">
                <p className="inline">
                  <span className="font-semibold">HPHT</span>
                  <span className="px-1.5">:</span>
                </p>
                <p className="inline underline">
                  {!!data?.kebidanan?.hpht
                    ? new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "long",
                      }).format(new Date(data?.kebidanan?.hpht))
                    : null}
                </p>
              </div>
              <div className="">
                <p className="inline">
                  <span className="font-semibold">HPL</span>
                  <span className="px-1.5">:</span>
                </p>
                {!!data?.kebidanan?.hpl
                  ? new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                    }).format(new Date(data?.kebidanan?.hpl))
                  : null}
              </div>
              <div>
                <div className="flex gap-1.5">
                  <p className="font-semibold">
                    G{" "}
                    <span className="font-normal underline">
                      {data?.kebidanan?.paritas_gpa.at(0)}
                    </span>
                  </p>
                  <p className="font-semibold">
                    P{" "}
                    <span className="font-normal underline">
                      {data?.kebidanan?.paritas_gpa.at(1)}
                    </span>
                  </p>
                  <p className="font-semibold">
                    A{" "}
                    <span className="font-normal underline">
                      {data?.kebidanan?.paritas_gpa.at(2)}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <p className="inline">
                  <span className="font-semibold">UK</span>
                  <span className="px-1.5">:</span>
                </p>
                <p className="inline underline">{data?.kebidanan?.usia}</p>
              </div>
            </div>
            <table className="w-full border border-black text-center">
              <thead>
                <tr className="border-b border-black font-semibold leading-[1.30]">
                  <td className="border-r border-black">No</td>
                  <td className="border-r border-black">Tahun Partus</td>
                  <td className="border-r border-black">Tempat Partus</td>
                  <td className="border-r border-black">Umur Hamil</td>
                  <td className="border-r border-black">Jenis Persalinan</td>
                  <td className="border-r border-black">Penolong Persalinan</td>
                  <td className="border-r border-black">Penyulit</td>
                  <td className="border-r border-black">JK/Berat Lahir</td>
                  <td>Keadaan Anak Sekarang</td>
                </tr>
              </thead>
              <tbody>
                {data?.persalinan?.map((val, idx) => (
                  <tr className="leading-[1.30]" key={val.id}>
                    <td className="border-b border-r border-black">
                      {idx + 1}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.tahun}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.tempat}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.umur_hamil}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.jenis}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.penolong}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.penyulit}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.kelamin_bayi && val.berat_lahir
                        ? val.kelamin_bayi +
                          "/" +
                          (val.berat_lahir ? val.berat_lahir + " gram" : "")
                        : ""}
                    </td>
                    <td className="border-b border-black">{val.keadaan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat Penyakit Dahulu
          </p>
          <div className="w-full border-b border-black px-2 py-0.5">
            <div className="flex flex-wrap text-sm">
              {[
                "Asma",
                "Jantung",
                "Hipertensi",
                "DM",
                "Tiroid",
                "Epilepsi",
                "Tidak ada",
              ].map((val, idx, arr) => (
                <div className="flex items-center" key={idx}>
                  <input
                    type="checkbox"
                    className="accent-slate-800"
                    id={"hasil-penyakit_dahulu-" + (idx + 1)}
                    checked={
                      arr.length - 1 === idx
                        ? Boolean(data?.anamnesis.riwayat) &&
                          data?.anamnesis.riwayat?.length === 0
                        : (data?.anamnesis.riwayat || []).includes(val)
                    }
                    readOnly
                  />
                  <label
                    htmlFor={"hasil-penyakit_dahulu-" + (idx + 1)}
                    className="px-1 py-0.5 pr-2"
                  >
                    {val}
                  </label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="accent-slate-800"
                  id="kb-7"
                  checked={(data?.anamnesis.riwayat || []).some(
                    (val) => !listPenDahuluKeb.includes(val)
                  )}
                  readOnly
                />
                <label htmlFor="kb-7" className={`${``} px-1 py-0.5 pr-2`}>
                  Lain-lain
                </label>
              </div>
              {(data?.anamnesis.riwayat || []).some(
                (val) => !listPenDahuluKeb.includes(val)
              ) ? (
                <p className="-ml-2 self-center">
                  ,{" "}
                  <span className="underline">
                    {(data?.anamnesis.riwayat || []).find(
                      (val) => !listPenDahuluKeb.includes(val)
                    )}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <div className="w-full px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>Riwayat Operasi</td>
                  <td className="px-1.5">:</td>
                  <td className="flex">
                    {[
                      {
                        value: "Tidak ada",
                        isChecked:
                          data?.operasi === null || data?.operasi?.length === 0,
                      },
                      {
                        value: "Ada",
                        isChecked: (data?.operasi?.length || 0) > 0,
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={val.value}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-riwayat_operasi-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-riwayat_operasi-" + (idx + 1)}
                          className="px-1 py-0.5 pr-2"
                        >
                          {val.value}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full border border-black text-center text-sm">
              <thead>
                <tr className="border-b border-black font-semibold leading-[1.30]">
                  <td className="border-r border-black">No</td>
                  <td className="border-r border-black">Operasi</td>
                  <td>Tahun</td>
                </tr>
              </thead>
              <tbody>
                {data?.operasi?.map((val, idx) => (
                  <tr className="leading-[1.30]" key={val.id}>
                    <td className="border-b border-r border-black">
                      {idx + 1}
                    </td>
                    <td className="border-b border-r border-black">
                      {val.operasi}
                    </td>
                    <td className="border-b border-black">{val.tahun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat Penyakit Keluarga
          </p>
          <div className="w-full px-4 py-0.5">
            <div className="flex flex-wrap text-sm">
              {[
                "Kanker",
                "Penyakit Hati",
                "Hipertensi",
                "DM",
                "Penyakit Ginjal",
                "Penyakit Jiwa",
                "Kelainan Bawaan",
                "Hamil Kembar",
                "TBC",
                "Epilepsi",
                "Alergi",
                "Tidak ada",
              ].map((val, idx, arr) => (
                <div className="flex items-center" key={idx}>
                  <input
                    type="checkbox"
                    className="accent-slate-800"
                    id={"hasil-penyakit_keluarga-" + (idx + 1)}
                    checked={
                      arr.length - 1 === idx
                        ? Boolean(data?.anamnesis.riwayat_keluarga) &&
                          data?.anamnesis.riwayat_keluarga?.length === 0
                        : (data?.anamnesis.riwayat_keluarga || []).includes(val)
                    }
                    readOnly
                  />
                  <label
                    htmlFor={"hasil-penyakit_keluarga-" + (idx + 1)}
                    className="px-1 py-0.5 pr-2"
                  >
                    {val}
                  </label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="accent-slate-800"
                  id="kb-7"
                  checked={(data?.anamnesis.riwayat_keluarga || []).some(
                    (val) => !listPenKeluargaKeb.includes(val)
                  )}
                  readOnly
                />
                <label htmlFor="kb-7" className={`${``} px-1 py-0.5 pr-2`}>
                  Lain-lain
                </label>
                {(data?.anamnesis.riwayat_keluarga || []).some(
                  (val) => !listPenKeluargaKeb.includes(val)
                ) ? (
                  <p className="-ml-2 self-center">
                    ,{" "}
                    <span className="underline">
                      {(data?.anamnesis.riwayat_keluarga || []).find(
                        (val) => !listPenKeluargaKeb.includes(val)
                      )}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat Ginekologi
          </p>
          <div className="w-full px-4 py-0.5">
            <div className="flex flex-wrap text-sm">
              {listGinekologi.map((val, idx, arr) => (
                <div className="flex items-center" key={idx}>
                  <input
                    type="checkbox"
                    className="accent-slate-800"
                    id={"hasil-penyakit_keluarga-" + (idx + 1)}
                    checked={
                      arr.length - 1 === idx
                        ? data?.kebidanan?.riwayat_ginekologi.length === 0
                        : data?.kebidanan?.riwayat_ginekologi.includes(val)
                    }
                    readOnly
                  />
                  <label
                    htmlFor={"hasil-penyakit_keluarga-" + (idx + 1)}
                    className="px-1 py-0.5 pr-2"
                  >
                    {val}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="accent-slate-800"
                  id="ginekologi1"
                  checked={data?.kebidanan?.fluor_albus?.at(0) === "Iya"}
                  readOnly
                />
                <label htmlFor="ginekologi1" className=" px-1 py-0.5 pr-2">
                  Fluor Albus
                </label>
              </div>
              <table>
                <tbody className="flex text-sm">
                  <tr className="flex items-center">
                    <td>Gatal</td>
                    <td className="pr-1">:</td>
                    <td className="flex">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id="gatal_fa1"
                          checked={
                            data?.kebidanan?.fluor_albus?.at(1) === "Iya"
                          }
                          readOnly
                        />
                        <label
                          htmlFor="gatal_fa1"
                          className=" px-1 py-0.5 pr-2"
                        >
                          Ya
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id="gatal_fa2"
                          checked={
                            Boolean(data?.kebidanan?.fluor_albus) &&
                            data?.kebidanan?.fluor_albus?.at(1) !== "Iya"
                          }
                          readOnly
                        />
                        <label
                          htmlFor="gatal_fa2"
                          className=" px-1 py-0.5 pr-2"
                        >
                          Tidak
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr className="flex items-center">
                    <td>Berbau</td>
                    <td className="pr-1">:</td>
                    <td className="flex">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id="berbau_fa1"
                          checked={
                            data?.kebidanan?.fluor_albus?.at(2) === "Iya"
                          }
                          readOnly
                        />
                        <label
                          htmlFor="berbau_fa1"
                          className=" px-1 py-0.5 pr-2"
                        >
                          Ya
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id="berbau_fa2"
                          checked={
                            Boolean(data?.kebidanan?.fluor_albus) &&
                            data?.kebidanan?.fluor_albus?.at(2) !== "Iya"
                          }
                          readOnly
                        />
                        <label
                          htmlFor="berbau_fa2"
                          className=" px-1 py-0.5 pr-2"
                        >
                          Tidak
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr className="flex items-center">
                    <td>Lain-lain</td>
                    <td className="pr-1">:</td>
                    <td className="underline">
                      {(data?.kebidanan?.riwayat_ginekologi || []).find(
                        (val) => !listGinekologi.includes(val)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Riwayat KB
          </p>
          <div className="w-full px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>Riwayat KB</td>
                  <td className="px-1.5">:</td>
                  <td className="flex">
                    {[
                      "Suntik",
                      "IUD",
                      "Pil",
                      "Kondom",
                      "Kalender",
                      "MOW",
                      "MOP",
                      "Implant",
                      "Tidak ada",
                    ].map((val, idx, arr) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-riwayat_kb-" + (idx + 1)}
                          checked={
                            arr.length - 1 === idx
                              ? data?.kebidanan?.riwayat_kb.length === 0
                              : data?.kebidanan?.riwayat_kb.includes(val)
                          }
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-riwayat_kb-" + (idx + 1)}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr className="leading-[1.30]">
                  <td>Keluhan</td>
                  <td className="px-1.5">:</td>
                  <td className="underline">{data?.kebidanan?.keluhan_kb}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>Riwayat alergi obat & makanan</td>
                  <td className="px-1.5">:</td>
                  <td className="flex">
                    {[
                      {
                        value: "Tidak ada",
                        isChecked: data?.anamnesis.alergi === "",
                      },
                      {
                        value: "Ada",
                        isChecked:
                          Boolean(data?.anamnesis.alergi) &&
                          data?.anamnesis.alergi !== "",
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-alergi-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-alergi-" + (idx + 1)}
                          className="px-1 py-0.5 pr-2"
                        >
                          {val.value}
                        </label>
                      </div>
                    ))}
                    {Boolean(data?.anamnesis.alergi) &&
                    data?.anamnesis.alergi !== "" ? (
                      <p className="-ml-2 self-center">
                        ,{" "}
                        <span className="underline">
                          {data?.anamnesis.alergi}
                        </span>
                      </p>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>
                    Riwayat pengobatan{" "}
                    <span className="italic">
                      (termasuk obat yang dikonsumsi dalam 1 bulan terakhir)
                    </span>
                  </td>
                  <td className="px-1.5">:</td>
                  <td className="flex">
                    {[
                      {
                        value: "Tidak ada",
                        isChecked:
                          Boolean(data?.anamnesis?.riwayat_obat) &&
                          data?.anamnesis?.riwayat_obat?.length === 0,
                      },
                      {
                        value: "Ada",
                        isChecked:
                          (data?.anamnesis?.riwayat_obat?.length || 0) > 0,
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-obt-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-obt-" + (idx + 1)}
                          className="px-1 py-0.5 pr-2"
                        >
                          {val.value}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full border border-black text-center text-sm">
              <thead>
                <tr className="border-b border-black font-semibold leading-[1.30]">
                  <td className="w-10 border-r border-black">No.</td>
                  <td className="border-r border-black">Obat</td>
                </tr>
              </thead>
              <tbody>
                {(data?.anamnesis.riwayat_obat || [])?.map((val, idx) => (
                  <tr className="leading-[1.30]" key={idx}>
                    <td className="border-b border-r border-black">
                      {idx + 1}
                      {"."}
                    </td>
                    <td className="border-b border-r border-black px-2 text-start">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Pengkajian Sosial, Ekonomi, Spiritual, Kultural
          </p>
          <div className="w-full px-2 py-0.5 text-sm">
            <table>
              <tbody className="text-sm">
                {/* <tr className="leading-[1.30]">
                  <td>Status pernikahan</td>
                  <td className="px-1.5">:</td>
                  <td colSpan={3} className="flex">
                    {[
                      {
                        value: "Menikah",
                        isChecked: data?.stts_nikah === "MENIKAH",
                      },
                      {
                        value: "Belum menikah",
                        isChecked: data?.stts_nikah === "BELUM MENIKAH",
                      },
                      {
                        value: "Janda",
                        isChecked: data?.stts_nikah === "JANDA",
                      },
                      {
                        value: "Duda",
                        isChecked: data?.stts_nikah === "DUDA",
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-nikah-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-nikah-" + (idx + 1)}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val.value}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr> */}
                <tr className="leading-[1.30]">
                  <td className="w-[275px]">
                    Hubungan pasien dengan anggota keluarga
                  </td>
                  <td className="px-1.5 align-top">:</td>
                  <td colSpan={3} className="flex">
                    {["Baik", "Tidak Baik"].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-keluarga-" + (idx + 1)}
                          checked={data?.kajian.soseksk.at(0) === val}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-keluarga-" + (idx + 1)}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr className="leading-[1.30]">
                  <td>Tinggal dengan</td>
                  <td className="px-1.5 align-top">:</td>
                  <td colSpan={3} className="flex">
                    {["Orang Tua", "Suami/Istri", "Anak", "Sendiri"].map(
                      (val, idx) => (
                        <div className="flex items-center" key={idx}>
                          <input
                            type="checkbox"
                            className="accent-slate-800"
                            id={"hasil-tinggal-" + (idx + 1)}
                            checked={data?.kajian.soseksk.at(2) === val}
                            readOnly
                          />
                          <label
                            htmlFor={"hasil-tinggal-" + (idx + 1)}
                            className="flex px-1 py-0.5 pr-2"
                          >
                            {val}
                          </label>
                        </div>
                      )
                    )}
                  </td>
                </tr>
                <tr className="leading-[1.30]">
                  <td>Curiga penganiayaan/penelantaran</td>
                  <td className="px-1.5 align-top">:</td>
                  <td colSpan={3} className="flex">
                    {["Ya", "Tidak"].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-curiga-" + (idx + 1)}
                          checked={data?.kajian.soseksk.at(4) === val}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-curiga-" + (idx + 1)}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr className="leading-[1.30]">
                  <td>Kegiatan ibadah</td>
                  <td className="px-1.5 align-top">:</td>
                  <td colSpan={3} className="flex">
                    {["Tidak", "Membutuhkan Bantuan"].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-ibadah-" + (idx + 1)}
                          checked={data?.kajian.soseksk.at(1) === val}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-ibadah-" + (idx + 1)}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
                {/* <tr className="leading-[1.30]">
                  <td>Pekerjaan</td>
                  <td className="px-1.5 align-top">:</td>
                  <td className="flex">
                    <p className="mr-24">PEDAGANG</p>
                    <p>Suku</p>
                    <p className="px-1.5">:</p>
                    <p>Suku Jawa</p>
                  </td>
                </tr> */}
                <tr className="leading-[1.30]">
                  <td className="flex">Status emosional</td>
                  <td className="px-1.5 align-top">:</td>
                  <td className="flex flex-wrap justify-between">
                    {[
                      "Normal",
                      "Tidak Semangat",
                      "Rasa Tertekan",
                      "Depresi",
                      "Cemas",
                      "Sulit Tidur",
                      "Cepat Lelah",
                      "Sulit Konsentrasi",
                      "Merasa Bersalah",
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-emosional" + idx}
                          checked={data?.kajian.soseksk.at(3) === val}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-emosional" + idx}
                          className="flex px-1 py-0.5 pr-2"
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
                <tr className="leading-[1.30]">
                  <td>Adakah keyakinan khusus yang dianut</td>
                  <td className="px-1.5 align-top">:</td>
                  <td colSpan={3} className="flex">
                    {[
                      {
                        label: "Tidak",
                        isChecked: data?.kajian.soseksk.at(5) === "",
                      },
                      {
                        label: "Ya",
                        isChecked:
                          Boolean(data?.kajian.soseksk.at(5)) &&
                          data?.kajian.soseksk.at(5) !== "",
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-keyakinan_khusus-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-keyakinan_khusus-" + (idx + 1)}
                          className="px-1 py-0.5 pr-2"
                        >
                          {val.label}
                        </label>
                      </div>
                    ))}
                    {Boolean(data?.kajian.soseksk.at(5)) &&
                    data?.kajian.soseksk.at(5) !== "" ? (
                      <p className="-ml-2 self-center">
                        ,{" "}
                        <span className="underline">
                          {data?.kajian.soseksk.at(5)}
                        </span>
                      </p>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            Pemeriksaan Fisik
          </p>
          <div className="w-full px-2 py-0.5 text-sm">
            <div className="flex">
              <p className="inline">
                Kesadaran<span className="px-1.5">:</span>
              </p>
              <div className="inline-flex">
                {[
                  {
                    value: "CM (15-14)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        0) >= 14,
                  },
                  {
                    value: "Apatis (13-12)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        99) < 14,
                  },
                  {
                    value: "Delirium (11-10)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        99) < 12,
                  },
                  {
                    value: "Somnolent (9-7)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        99) < 10,
                  },
                  {
                    value: "Stupor (6-4)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        99) < 7,
                  },
                  {
                    value: "Coma (3)",
                    isChecked:
                      (data?.fisik?.gcs?.reduce((acc, val) => acc + val, 0) ||
                        99) === 3,
                  },
                ].map((val, idx) => (
                  <div className="flex items-center" key={idx}>
                    <input
                      type="checkbox"
                      className="accent-slate-800"
                      id={"hasil-kesadaran-" + (idx + 1)}
                      checked={val.isChecked}
                      readOnly
                    />
                    <label
                      htmlFor={"hasil-kesadaran-" + (idx + 1)}
                      className="px-1 py-0.5 pr-2"
                    >
                      {val.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5">
              <div className="col-span-3 flex">
                <p className="inline">
                  Keadaan umum<span className="px-1.5">:</span>
                </p>
                <div className="inline-flex">
                  {[
                    {
                      value: "Baik",
                      isChecked: data?.fisik.keadaan === "Baik",
                    },
                    {
                      value: "Sedang",
                      isChecked: data?.fisik.keadaan === "Sedang",
                    },
                    {
                      value: "Lemah",
                      isChecked: data?.fisik.keadaan === "Lemah",
                    },
                    {
                      value: "Buruk",
                      isChecked: data?.fisik.keadaan === "Buruk",
                    },
                  ].map((val, idx) => (
                    <div className="flex items-center" key={idx}>
                      <input
                        type="checkbox"
                        className="accent-slate-800"
                        id={"hasil-keadaan_umum-" + (idx + 1)}
                        checked={val.isChecked}
                        readOnly
                      />
                      <label
                        htmlFor={"hasil-keadaan_umum-" + (idx + 1)}
                        className="px-1 py-0.5 pr-2"
                      >
                        {val.value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="inline">
                  GCS<span className="px-1.5">:</span>
                </p>
                <div className="inline">
                  <span className="pr-2">
                    E <span className="underline">{data?.fisik.gcs.at(0)}</span>
                  </span>
                  <span className="pr-2">
                    M <span className="underline">{data?.fisik.gcs.at(1)}</span>
                  </span>
                  <span className="pr-2">
                    V <span className="underline">{data?.fisik.gcs.at(2)}</span>
                  </span>
                </div>
              </div>
              <div>
                <div className="inline">
                  TD<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">
                    {data?.fisik.td.at(0) || "__"}/
                    {data?.fisik.td.at(1) || "__"}
                  </span>
                  <span className="pl-0.5">mmHg</span>
                </div>
              </div>
              <div>
                <div className="inline">
                  HR<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">{data?.fisik.hr}</span>
                  <span className="pl-0.5">x/mnt</span>
                </div>
              </div>
              <div>
                <div className="inline">
                  Temp<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">{data?.fisik.temp}</span>℃
                </div>
              </div>
              <div>
                <div className="inline">
                  RR<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">{data?.fisik.rr}</span>
                  <span className="pl-0.5">x/mnt</span>
                </div>
              </div>
              <div>
                <div className="inline">
                  SpO<sub>2</sub>
                  <span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">
                    {data?.fisik.saturasi || "__"}
                  </span>
                  %
                </div>
              </div>
              <div>
                <div className="inline">
                  BB<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">{data?.fisik.bb || "__"}</span>
                  <span className="pl-0.5">kg</span>
                </div>
              </div>
              <div>
                <div className="inline">
                  TB<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">{data?.fisik.tb || "__"}</span>
                  <span className="pl-0.5">cm</span>
                </div>
              </div>
              <div>
                <div className="inline">
                  Lainnya<span className="px-1.5">:</span>
                </div>
                <div className="inline">
                  <span className="underline">
                    {/* data?.fisik.lainnya || */ "Tidak ada"}
                  </span>
                </div>
              </div>
            </div>
            {
              /* data?.kd_poli === "MTA" */ false ? (
                <div className="grid grid-cols-2">
                  <div>
                    <p>Kaca Mata Lama</p>
                    <div>
                      OD<span className="px-1.5">:</span>
                      {/* {data?.fisik.pemeriksaan_mata?.split("|")?.at(0) || "___"} */}
                    </div>
                    <div>
                      OS<span className="px-1.5">:</span>
                      {/* {data?.fisik.pemeriksaan_mata?.split("|")?.at(1) || "___"} */}
                    </div>
                  </div>
                  <div>
                    <p>Visus/Koreksi/Baca</p>
                    <div>
                      OD<span className="px-1.5">:</span>
                      {/* {data?.fisik.pemeriksaan_mata?.split("|")?.at(2) || "___"} */}
                    </div>
                    <div>
                      OS<span className="px-1.5">:</span>
                      {/* {data?.fisik.pemeriksaan_mata?.split("|")?.at(3) || "___"} */}
                    </div>
                  </div>
                </div>
              ) : null
            }
          </div>
          <div className="grid grid-cols-3">
            <p className="select-none bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Diagnosis/Masalah Kebidanan{" "}
            </p>
            <p className="flex select-none items-center justify-center bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Rencana Asuhan
            </p>
            <p className="flex select-none items-center justify-center bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Target
            </p>
            <div className="w-full border-r border-black px-2 py-0.5 text-sm">
              <div className="flex justify-between">
                <div className="flex gap-1.5">
                  <p>
                    G <span>{data?.kebidanan?.paritas_gpa.at(0)}</span>
                  </p>
                  <p>
                    P <span>{data?.kebidanan?.paritas_gpa.at(1)}</span>
                  </p>
                  <p>
                    A <span>{data?.kebidanan?.paritas_gpa.at(2)}</span>
                  </p>
                </div>
                <p className="inline">
                  UK <span>{data?.kebidanan?.usia}</span>
                </p>
              </div>
              <p className="min-h-[50px] whitespace-pre-wrap">
                {data?.kebidanan?.diagnosis}
              </p>
            </div>
            <div className="w-full border-r border-black px-2 py-0.5 text-sm">
              <p className="whitespace-pre-wrap">
                {data?.kebidanan?.rencana_asuhan}
              </p>
            </div>
            <div className="w-full border-black px-2 py-0.5 text-sm">
              <p className="whitespace-pre-wrap">{data?.kebidanan?.target}</p>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            &nbsp;
          </p>
          <div className="w-full border-b border-black text-sm">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-black font-semibold leading-[1.30]">
                  <td className="border-r border-black">Tanggal/Jam</td>
                  <td className="border-r border-black">Tindakan</td>
                  <td>Nama Perawat</td>
                </tr>
              </thead>
              <tbody>
                <tr className="px-1.5">
                  <td className="border-r border-black">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                      timeStyle: "long",
                    }).format(new Date())}
                  </td>
                  <td className="border-r border-black">
                    {data?.kebidanan?.tindakan}
                  </td>
                  <td>{data?.anamnesis.nama_user}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full border-b border-black px-2 py-0.5 text-sm">
            <p>Yang melakukan pengkajian</p>
            <table>
              <tbody>
                <tr className="leading-[1.30]">
                  <td>Tanggal</td>
                  <td className="px-1.5">:</td>
                  <td>
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                    }).format(new Date())}
                  </td>
                  <td className="pl-6">Jam</td>
                  <td className="px-1.5">:</td>
                  <td>
                    {new Intl.DateTimeFormat("id-ID", {
                      timeStyle: "long",
                    }).format(new Date())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid w-full border-b border-r border-black px-2 py-0.5 text-center text-sm">
              <p>Bidan</p>
              <p className="self-end">{data?.anamnesis.nama_user}</p>
            </div>
            <div className="w-full border-b border-black px-2 py-0.5 text-center text-sm">
              <p>Mengetahui hasil asesmen awal kebidanan rawat jalan</p>
              <p className="mb-1">DPJP</p>
              <input
                type="checkbox"
                autoFocus={previewDokter}
                checked={cek || !previewDokter}
                readOnly={!previewDokter}
                onChange={(e) => setCek && setCek(e.target.checked)}
                className="h-5 w-5 accent-slate-800"
              />
              <p>{data?.kunjungan?.dokter}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
HasilBidan.displayName = "HasilBidan";

export default HasilBidan;
