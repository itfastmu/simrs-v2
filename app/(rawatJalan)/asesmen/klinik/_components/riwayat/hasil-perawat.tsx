"use client";

import Image from "next/image";
import FastabiqBiruLogo from "@/assets/img/fastabiq-biru.png";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { THasilPerawat } from "../../../schema";

const HasilPerawat = React.forwardRef(
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

    // const searchParams = useSearchParams();
    // const id = searchParams.get("id");
    // const [pasien, setPasien] = useState<MasterPasien>();
    // const [data, setData] = useState<AsesmenPerawat>();
    // useEffect(() => {
    //   const loadPasien = async () => {
    //     try {
    //       const url = new URL(`${APIURL}/rs/pasien/${id}`);
    //       const fetchData = await fetch(url, {
    //         method: "GET",
    //         headers: headers,
    //       });
    //       const data = await fetchData.json();
    //       // console.log(data);
    //       if (data?.status !== "Ok") throw new Error(data?.message);
    //       setPasien(data?.data);
    //     } catch (err) {
    //       const error = err as Error;
    //       console.error(error);
    //     }
    //   };
    //   loadPasien();
    // }, []);
    // const data = {
    //   anamnesis: {
    //     id: 18,
    //     id_assesment: 18,
    //     keluhan: "keluhan A",
    //     penyakit: "penyakit A",
    //     riwayat: ["riwayat A"],
    //     riwayat_keluarga: ["diabetes A", "hipertensi A"],
    //     riwayat_obat: ["obat A", "obat B"],
    //     alergi: "alergi A",
    //     user: "Zainal Muhlisin, A.Md.Kep",
    //     status: 1,
    //     created_at: "2023-11-23T07:47:35.285Z",
    //   },
    //   fisik: {
    //     gcs: [4, 6, 5],
    //     keadaan: "Baik",
    //     td: [110, 90],
    //     hr: 125,
    //     rr: 16,
    //     temp: "38",
    //     saturasi: 99,
    //     bb: "50",
    //     tb: "170",
    //     user: "Zainal Muhlisin, A.Md.Kep",
    //     status: 1,
    //     created_at: "2023-11-23T07:47:35.285Z",
    //   },
    //   imunisasi: {
    //     polio: ["0", "1", "2"],
    //     campak: ["1"],
    //     bcg: ["1"],
    //     dpthib: ["1"],
    //     hepb: ["1"],
    //   },
    //   assesmen: {
    //     psikologis: 1,
    //     perilaku: "Tidak ada",
    //     hubungan_keluarga: "baik",
    //     tinggal: "ortu",
    //     aniaya: "tidak",
    //     ibadah: "tidak",
    //     alat_bantu: "tidak",
    //     cacat: "Tidak ada",
    //     defekasi: "normal",
    //     miksi: "normal",
    //     gastrointestinal: "normal",
    //     pola_tidur: "normal",
    //     cairan: "normal",
    //     pernafasan: "normal",
    //     kardiovaskuler: "normal",
    //     berpakaian: "mandiri",
    //     makan: "mandiri",
    //     personal_hygiene: "mandiri",
    //     berpindah: "mandiri",
    //     emosional: 0,
    //     keyakinan_khusus: "Tidak ada",
    //   },
    //   keperawatan: {
    //     id: 15,
    //     id_assesment: 18,
    //     diagnosis: "diagnosis keperawatan A",
    //     rencana_asuhan: "rencana asuhan A",
    //     target: "target  A",
    //     tindakan: "tindakan keperawatan A",
    //     user: "Zainal Muhlisin, A.Md.Kep",
    //     status: 1,
    //     created_at: "2023-11-23T07:47:35.282Z",
    //   },
    // };

    return (
      <div
        className="mx-auto flex w-[813px] justify-center bg-white p-8 font-[cambria] text-black"
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
            <p className="uppercase">Asesmen Awal Keperawatan Rawat Jalan</p>
            <p className="lowercase italic">(diisi oleh perawat rawat jalan)</p>
          </div>
          <div className="w-full border-b border-black">
            <div className="my-0.5 grid grid-cols-2 px-2 text-sm">
              <div>
                <table>
                  <tbody>
                    <tr className="leading-[1.30]">
                      <td>Tanggal kunjungan</td>
                      <td className="px-1.5">:</td>
                      <td>
                        {!!data?.keperawatan?.created_at
                          ? new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "full",
                            }).format(new Date(data?.keperawatan?.created_at))
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
                        {!!data?.keperawatan?.created_at
                          ? new Intl.DateTimeFormat("id-ID", {
                              timeStyle: "long",
                            }).format(new Date(data?.keperawatan?.created_at))
                          : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="w-full border-b border-black px-2 py-0.5">
            <table>
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>Poliklinik yang dituju</td>
                  <td className="px-1.5">:</td>
                  <td>{data?.kunjungan?.nama_klinik}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full border-b border-black px-2 py-0.5">
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
          <div className="w-full border-b border-black px-2 py-0.5">
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
                {(data?.anamnesis.riwayat_obat || []).map((val, idx) => (
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
            Pengkajian Psikologi
          </p>
          <div className="w-full px-2 py-0.5 text-sm">
            <div className="flex w-full justify-evenly">
              {[
                "Tenang",
                "Cemas",
                "Takut",
                "Marah",
                "Sedih",
                "Kecenderungan bunuh diri",
              ].map((val, idx) => (
                <div className="flex items-center" key={idx}>
                  <input
                    type="checkbox"
                    className="accent-slate-800"
                    id={"hasil-psikologi-" + (idx + 1)}
                    checked={data?.kajian?.psikologis === val}
                    readOnly
                  />
                  <label
                    htmlFor={"hasil-psikologi-" + (idx + 1)}
                    className="px-1 py-0.5"
                  >
                    {val}
                  </label>
                </div>
              ))}
            </div>
            <table className="mt-1">
              <tbody className="text-sm">
                <tr className="leading-[1.30]">
                  <td>Masalah perilaku</td>
                  <td className="px-1.5">:</td>
                  <td colSpan={3} className="flex">
                    {[
                      {
                        value: "Tidak ada",
                        isChecked: data?.kajian.perilaku === "",
                      },
                      {
                        value: "Ada",
                        isChecked:
                          Boolean(data?.kajian.perilaku) &&
                          data?.kajian.perilaku !== "",
                      },
                    ].map((val, idx) => (
                      <div className="flex items-center" key={idx}>
                        <input
                          type="checkbox"
                          className="accent-slate-800"
                          id={"hasil-perilaku-" + (idx + 1)}
                          checked={val.isChecked}
                          readOnly
                        />
                        <label
                          htmlFor={"hasil-perilaku-" + (idx + 1)}
                          className={`px-1 py-0.5 pr-2`}
                        >
                          {val.value}
                        </label>
                      </div>
                    ))}
                    {Boolean(data?.kajian.perilaku) &&
                      data?.kajian.perilaku !== "" && (
                        <p className="-ml-2 self-center">
                          ,{" "}
                          <span className="underline">
                            {data?.kajian.perilaku}
                          </span>
                        </p>
                      )}
                  </td>
                </tr>
                {data?.kunjungan?.kode_klinik === "ANA" ? (
                  <tr className="leading-[1.30]">
                    <td>Data imunisasi</td>
                    <td className="px-1.5">:</td>
                    <td className="flex">
                      {[
                        {
                          label: "BCG",
                          val: data?.imunisasi?.bcg,
                          list: [1],
                        },
                        {
                          label: "Polio",
                          val: data?.imunisasi?.polio,
                          list: [0, 1, 2, 3, 4],
                        },
                        {
                          label: "DPT dan Hib",
                          val: data?.imunisasi?.dpthib,
                          list: [1, 2, 3, 4, 5],
                        },
                        {
                          label: "Campak/MMR",
                          val: data?.imunisasi?.campak,
                          list: [1],
                        },
                        {
                          label: "Hepatitis B",
                          val: data?.imunisasi?.hepatitis_b,
                          list: [1, 2, 3, 4, 5],
                        },
                      ].map((val, idx) => (
                        <div className="flex items-center" key={idx}>
                          <input
                            type="checkbox"
                            className="accent-slate-800"
                            id={"hasil-imunisasi-" + idx}
                            checked={Boolean(val.val)}
                            readOnly
                          />
                          <label
                            htmlFor={"hasil-imunisasi-" + idx}
                            className="flex px-1 py-0.5 pr-2"
                          >
                            {val.val
                              ? `${val.label} ke-${val.list.at(val.val - 1)}`
                              : `${val.label}`}
                          </label>
                        </div>
                      ))}
                    </td>
                  </tr>
                ) : null}
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
            {data?.kunjungan?.kode_klinik === "MTA" ? (
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
            ) : null}
          </div>
          <div className="grid grid-cols-3">
            <p className="select-none bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Diagnosis/Masalah Keperawatan
            </p>
            <p className="flex select-none items-center justify-center bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Rencana Asuhan
            </p>
            <p className="flex select-none items-center justify-center bg-black text-center text-sm font-bold uppercase tracking-normal text-white">
              Target
            </p>
            <div className="w-full border-r border-black py-0.5 pr-2 text-sm">
              <ul className="ml-5 min-h-[50px] list-disc whitespace-pre-wrap">
                {data?.keperawatan?.diagnosis.map((val, i) => (
                  <li key={i.toString()}>{val}</li>
                ))}
              </ul>
            </div>
            <div className="w-full border-r border-black px-2 py-0.5 text-sm">
              <p className="whitespace-pre-wrap">
                {data?.keperawatan?.rencana_asuhan}
              </p>
            </div>
            <div className="w-full border-black px-2 py-0.5 text-sm">
              <p className="whitespace-pre-wrap">{data?.keperawatan?.target}</p>
            </div>
          </div>
          <p className="select-none bg-black text-center font-bold uppercase tracking-normal text-white">
            &nbsp;
          </p>
          <div className="w-full text-sm">
            <table className="w-full border-b border-black text-center">
              <thead>
                <tr className="border-b border-black px-1.5 font-semibold">
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
                    }).format(
                      new Date(data?.keperawatan?.created_at || new Date())
                    )}
                  </td>
                  <td className="border-r border-black">
                    {data?.keperawatan?.tindakan}
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
              <p>Perawat</p>
              <p className="self-end">{data?.anamnesis.nama_user}</p>
            </div>
            <div className="w-full border-b border-black px-2 py-0.5 text-center text-sm">
              <p>Mengetahui hasil asesmen awal keperawatan rawat jalan</p>
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
HasilPerawat.displayName = "HasilPerawat";
export default HasilPerawat;
