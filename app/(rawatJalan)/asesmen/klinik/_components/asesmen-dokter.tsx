"use client";

import { DataPesertaBPJS } from "@/app/(pendaftaran)/schema";
import css from "@/assets/css/scrollbar.module.css";
import anatomiAnak from "@/assets/img/anak.png";
import anatomiUmum from "@/assets/img/anatomi-umum.png";
import anatomiGigi from "@/assets/img/gigi.png";
import anatomiJantung from "@/assets/img/jantung.png";
import anatomiObg from "@/assets/img/kandungan.png";
import anatomiMata from "@/assets/img/mata.png";
import anatomiOrto from "@/assets/img/ortopedi.png";
import anatomiParu from "@/assets/img/paru.png";
import anatomiPD from "@/assets/img/penyakit-dalam.png";
import anatomiSaraf from "@/assets/img/saraf.png";
import anatomiTHT from "@/assets/img/tht-kl.png";
import { Button, LinkButton } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn, getAgeAll } from "@/lib/utils";
import { Dialog, Tab, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiCheckFill } from "react-icons/ri";
import { toast } from "react-toastify";
import {
  AsesmenDokSchema,
  KlinikAsesmen,
  TAsesmenDok,
  TData,
  THasilDokter,
  THasilPerawat,
  listPenyakit,
} from "../../schema";
import {
  AsesmenDr,
  InstruksiDr,
  ObjektifDr,
  PlanningTargetDr,
  SubjektifDr,
} from "./dokter";
import { AsesmenJiwa, ObjektifJiwa } from "./jiwa";
import { ObjektifDerma } from "./kulit";
import { ObjektifRehabMedik } from "./rehab-medik";
import HasilBidan from "./riwayat/hasil-bidan";
import HasilPerawat from "./riwayat/hasil-perawat";
import RiwayatPemeriksaan from "./riwayat/riwayat-pemeriksaan";
import AsesmenPsikologi from "./psikologi";

export default function AsesmenDokter({
  data,
  klinik,
}: {
  data: TData | undefined;
  klinik: KlinikAsesmen;
}) {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const qlist = searchParams.get("qlist")?.split("-");
  const id = searchParams.get("id");
  const proses = parseInt(searchParams.get("proses")!);

  const [dataPeserta, setDataPeserta] = useState<DataPesertaBPJS>();
  const loadInfoPeserta = async () => {
    try {
      const urlPeserta = new URL(`${APIURL}/rs/pasien/bpjs`);
      const paramsPeserta = {
        id_pasien: id,
      };
      urlPeserta.search = new URLSearchParams(paramsPeserta as any).toString();
      const resPeserta = await fetch(urlPeserta, {
        method: "GET",
        headers: headers,
      });
      const fetchDataPeserta = await resPeserta.json();
      setDataPeserta(fetchDataPeserta?.data as DataPesertaBPJS);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };

  const menues = [
    "Subjektif",
    "Objektif",
    "Asesmen",
    "Planning & Target",
    "Instruksi",
  ];

  type Indexable = {
    [key: string]: any;
  };
  const imgSrc: Indexable = {
    ANA: anatomiAnak, // ANAK
    BED: anatomiUmum, // BEDAH
    U0025: anatomiPD, // DIVA
    GIG: anatomiGigi, // GIGI
    END: anatomiGigi, // GIGI KONSERVASI
    JAN: anatomiJantung, // JANTUNG
    MTA: anatomiMata, // MATA
    MCU: anatomiPD, // MCU
    PAR: anatomiParu, // PARU
    OBG: anatomiObg, // OBG
    ORT: anatomiOrto, // ORTHO
    INT: anatomiPD, // PENYAKIT DALAM
    IRM: anatomiUmum, // REHAB MEDIK
    KLT: anatomiUmum, // DERMA
    SAR: anatomiSaraf, // SARAF
    THT: anatomiTHT, // THT
  };
  const anatomiImg = imgSrc[data?.kode_klinik || "BED"];

  const [tabIdx, setTabIdx] = useState(0);

  const methods = useForm<TAsesmenDok>({
    resolver: zodResolver(AsesmenDokSchema),
    defaultValues: {
      id_kunjungan: params.idKunjungan as string,
      anamnesis: {
        riwayat: [],
        riwayat_keluarga: [],
      },
    },
  });

  const [hasilPerawat, setHasilPerawat] = useState<THasilPerawat>();
  const [cek, setCek] = useState<boolean>(false);
  const [viewHasilPerawat, setViewHasilPerawat] = useState<boolean>(false);
  const loadAsesPerawat = async () => {
    try {
      const url = klinik.isRehab
        ? `${APIURL}/rs/rajal/assesment/fisioterapi/${
            params.idKunjungan as string
          }`
        : klinik.isObg
        ? `${APIURL}/rs/rajal/assesment/kebidanan/${
            params.idKunjungan as string
          }`
        : `${APIURL}/rs/rajal/assesment/perawat/${
            params.idKunjungan as string
          }`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilPerawat(json?.data);
      console.log(json);
    } catch (err) {
      const error = err as Error;
      if (
        error.message === "Data tidak ditemukan" ||
        error.message === "Belum dilakukan asesmen"
      )
        return toast.warning("Belum diasesmen perawat!");
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!hasilPerawat || klinik.isRehab || klinik.isPsi) return;
    setViewHasilPerawat(true);
    setValue("anamnesis.keluhan", hasilPerawat.anamnesis.keluhan);
    setValue("anamnesis.alergi", hasilPerawat.anamnesis.alergi);
  }, [hasilPerawat]);

  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [hasilDokter, setHasilDokter] = useState<THasilDokter>();
  const loadAsesDokter = async () => {
    const mta = "2024012320002";
    const rhb = "2024012320003";
    const ort = "2024012320004";
    try {
      const url = `${APIURL}/rs/rajal/assesment/dokter/${
        params.idKunjungan as string
      }`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilDokter(json?.data);
      console.log(json);
    } catch (err) {
      const error = err as Error;
      if (
        error.message === "Data tidak ditemukan" ||
        error.message === "Belum dilakukan asesmen"
      )
        return toast.warning("Belum diasesmen dokter!");
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!hasilDokter) return;
    if (klinik.isPsi) {
      return;
    }
    setIsUpdate(true);
    setValue("anamnesis.id", hasilDokter.anamnesis.id);
    setValue("anamnesis.keluhan", hasilDokter.anamnesis.keluhan);
    setValue("anamnesis.penyakit", hasilDokter.anamnesis.penyakit || "");
    setValue("anamnesis.riwayat", hasilDokter.anamnesis.riwayat || []);
    setLainRiwayat(
      hasilDokter.anamnesis.riwayat?.find(
        (val) => !listPenyakit.includes(val)
      ) || ""
    );
    setValue(
      "anamnesis.riwayat_keluarga",
      hasilDokter.anamnesis.riwayat_keluarga || []
    );
    setLainRiwayatKel(
      hasilDokter.anamnesis.riwayat_keluarga?.find(
        (val) => !listPenyakit.includes(val)
      ) || ""
    );
    setValue("anamnesis.alergi", hasilDokter.anamnesis.alergi);

    if (hasilDokter.fisik) {
      setValue("fisik.id", hasilDokter.fisik.id);
      if (!klinik.isRehab) {
        setValue("fisik.gcs", hasilDokter.fisik.gcs);
        setValue("fisik.saturasi", hasilDokter.fisik.saturasi || NaN);
      }
      setValue("fisik.keadaan", hasilDokter.fisik.keadaan);
      setValue("fisik.td", hasilDokter.fisik.td);
      setValue("fisik.hr", hasilDokter.fisik.hr);
      setValue("fisik.temp", hasilDokter.fisik.temp);
      setValue("fisik.rr", hasilDokter.fisik.rr);
      setValue("fisik.bb", hasilDokter.fisik.bb);
      setValue("fisik.tb", hasilDokter.fisik.tb);
      setValue("fisik.tambahan", hasilDokter.fisik.tambahan || "");
      if (!klinik.isMata && hasilDokter.fisik.mata) {
        setValue("fisik.mata.lama", hasilDokter.fisik.mata.lama);
        setValue("fisik.mata.visus", hasilDokter.fisik.mata.visus);
      }
      if (klinik.isRehab) {
        // if (hasilDokter.fisio) {
        //   setValue("fisio.fisik.inspeksi", hasilDokter.fisio.fisik.inspeksi);
        //   setValue("fisio.fisik.statis", hasilDokter.fisio.fisik.statis);
        //   setValue("fisio.fisik.dinamis", hasilDokter.fisio.fisik.dinamis);
        //   setValue("fisio.fisik.kognitif", hasilDokter.fisio.fisik.kognitif);
        //   setValue("fisio.fisik.palpasi", hasilDokter.fisio.fisik.palpasi);
        //   setValue("fisio.fisik.luas", hasilDokter.fisio.fisik.luas);
        //   setValue("fisio.fisik.mmt", hasilDokter.fisio.fisik.mmt);
        //   setValue("fisio.fisik.perkusi", hasilDokter.fisio.fisik.perkusi);
        //   setValue(
        //     "fisio.fisik.auskultasi",
        //     hasilDokter.fisio.fisik.auskultasi
        //   );
        //   setValue("fisio.fisik.nyeri", hasilDokter.fisio.fisik.nyeri);
        //   setValue("fisio.fisik.tekan", hasilDokter.fisio.fisik.tekan);
        //   setValue("fisio.fisik.gerak", hasilDokter.fisio.fisik.gerak);
        //   setValue("fisio.fisik.diam", hasilDokter.fisio.fisik.diam);
        //   setValue(
        //     "fisio.fisik.antropometri",
        //     hasilDokter.fisio.fisik.antropometri
        //   );
        //   setValue("fisio.fisik.khusus", hasilDokter.fisio.fisik.khusus);
        // }
      }
    }
    if (hasilDokter.status_lokalis) {
      setValue("status_lokalis", hasilDokter.status_lokalis);
    }

    setValue("diagnosis", hasilDokter.diagnosis);
    setValue("asuhantarget.id", hasilDokter.asuhantarget.id);
    setValue("asuhan", hasilDokter.asuhantarget.asuhan);
    setValue("target", hasilDokter.asuhantarget.target);
    setValue("tindakan", hasilDokter.tindakan);
    if (hasilDokter.radiologi) {
      setValue("radiologi", hasilDokter.radiologi);
    }
    if (hasilDokter.laborat) {
      setValue("laborat", hasilDokter.laborat);
    }
    if (hasilDokter.nonracik && hasilDokter.nonracik?.length > 0) {
      setValue(
        "nonracik",
        hasilDokter.nonracik.map((val) => ({
          id: val.id_resep,
          id_poa: val.id_poa,
          nama_obat: val.nama_obat,
          sediaan: val.sediaan,
          dosis: parseInt(val.kekuatan),
          rute: val.rute,
          waktu: val.waktu,
          jumlah: val.jumlah,
          id_detail: val.id_detail,
        }))
      );
    }
    if (hasilDokter.racik && hasilDokter.racik?.length > 0) {
      setValue(
        "racikan",
        hasilDokter.racik.map((val) => ({
          id: val.id_resep,
          nama: val.nama_racik,
          metode: val.metode,
          jumlah: val.jumlah,
          rute: val.rute,
          waktu: val.waktu,
          tipe: val.tipe,
          detail:
            val.detail?.map((detailVal) => ({
              id: detailVal.id,
              nama_obat: detailVal.nama,
              dosis: detailVal.dosis,
              jumlah: detailVal.jumlah,
              id_poa: detailVal.id_poa,
            })) || [],
        }))
      );
    }

    if (klinik.isOrt && hasilDokter.orto) {
      setValue("orto.id", hasilDokter.orto.id);
      setValue("orto.injury", hasilDokter.orto.injury);
      setValue("orto.waktu", hasilDokter.orto.waktu);
      setValue("orto.penanganan", hasilDokter.orto.penanganan);
      setValue("orto.kepala", hasilDokter.orto.kepala);
      setValue("orto.leher", hasilDokter.orto.leher);
      setValue("orto.thorak", hasilDokter.orto.thorak);
      setValue("orto.abdomen", hasilDokter.orto.abdomen);
      setValue("orto.ekstremitas", hasilDokter.orto.ekstremitas);
      setValue("orto.prognosis", hasilDokter.orto.prognosis);
    }

    if (klinik.isMata && hasilDokter.mata) {
      setValue("mata.id", hasilDokter.mata.id);
      setValue("mata.funduskopi", hasilDokter.mata.funduskopi);
      setValue("mata.anel", hasilDokter.mata.anel);
      setValue("mata.tonometri", hasilDokter.mata.tonometri);
    }

    if (klinik.isRehab && hasilDokter.rehabmedik) {
      setValue("rehabmedik.id", hasilDokter.rehabmedik.id);
      setValue("rehabmedik.inspeksi", hasilDokter.rehabmedik.inspeksi);
      setValue("rehabmedik.statis", hasilDokter.rehabmedik.statis);
      setValue("rehabmedik.dinamis", hasilDokter.rehabmedik.dinamis);
      setValue("rehabmedik.kognitif", hasilDokter.rehabmedik.kognitif);
      setValue("rehabmedik.palpasi", hasilDokter.rehabmedik.palpasi);
      setValue("rehabmedik.luas", hasilDokter.rehabmedik.luas);
      setValue("rehabmedik.mmt", hasilDokter.rehabmedik.mmt);
      setValue("rehabmedik.perkusi", hasilDokter.rehabmedik.perkusi);
      setValue("rehabmedik.auskultasi", hasilDokter.rehabmedik.auskultasi);
      setValue("rehabmedik.nyeri", hasilDokter.rehabmedik.nyeri);
      setValue("rehabmedik.tekan", hasilDokter.rehabmedik.tekan);
      setValue("rehabmedik.gerak", hasilDokter.rehabmedik.gerak);
      setValue("rehabmedik.diam", hasilDokter.rehabmedik.diam);
      setValue("rehabmedik.antropometri", hasilDokter.rehabmedik.antropometri);
      setValue("rehabmedik.khusus", hasilDokter.rehabmedik.khusus);
      setValue("rehabmedik.evaluasi", hasilDokter.rehabmedik.evaluasi);
    }
  }, [hasilDokter]);

  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (!initialized.current && !klinik.isPsi) {
      loadInfoPeserta();
      if (proses < 5) {
        loadAsesPerawat();
      } else if (proses > 4) {
        loadAsesDokter();
      } else if (proses < 4) {
        toast.warning("Belum diasesmen perawat!");
      }

      if (proses < 4) {
        if (klinik.isOrt)
          setValue("orto.prognosis", [...Array.from({ length: 6 }, () => "")]);
        if (klinik.isRehab) setValue("fisik.keadaan", "Baik");
      }
      initialized.current = true;
    }
  }, []);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (Object.keys(errors).length > 0)
      toast.warn("Lengkapi isian terlebih dahulu!");
    console.log(errors);
  }, [errors]);

  /* LAIN */
  /* TIDAK ORTO */
  const [lainRiwayat, setLainRiwayat] = useState("");
  const [lainRiwayatKel, setLainRiwayatKel] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitHandler: SubmitHandler<TAsesmenDok> = async (data, e) => {
    try {
      e?.preventDefault();
      setIsLoading(true);
      if (!klinik.isOrt) {
        setValue(
          "anamnesis.riwayat",
          !data?.anamnesis?.riwayat
            ? [lainRiwayat]
            : [
                ...data?.anamnesis?.riwayat.filter((val) =>
                  listPenyakit.includes(val)
                ),
                lainRiwayat,
              ]
        );
        setValue(
          "anamnesis.riwayat_keluarga",
          !data?.anamnesis?.riwayat_keluarga
            ? [lainRiwayatKel]
            : [
                ...data?.anamnesis?.riwayat_keluarga.filter((val) =>
                  listPenyakit.includes(val)
                ),
                lainRiwayatKel,
              ]
        );
      }
      console.log(data);
      const url = `${APIURL}/rs/rajal/assesment/dokter`;
      const resp = await fetch(
        !isUpdate ? url : url + "/" + data?.id_kunjungan,
        {
          method: !isUpdate ? "POST" : "PUT",
          headers: headers,
          body: JSON.stringify(data),
        }
      );
      const json = await resp.json();
      if (json.status !== "Created" && json.status !== "Updated")
        throw new Error(json.message);
      toast.success("Asesmen berhasil disimpan!");
      router.replace(`/list-pasien?user=Dokter&id=${id?.replaceAll(".", "_")}`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const panelDivRef = useRef<HTMLElement>(null);

  const [tutupAsesmen, setTutupAsesmen] = useState<boolean>(false);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="mx-auto flex h-full gap-2 overflow-auto px-4 pb-[68px] pt-1"
      >
        <div className="flex basis-1/4 flex-col gap-2">
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
                  <td>
                    {data?.tanggal_lahir ? getAgeAll(data?.tanggal_lahir) : ""}
                  </td>
                </tr>
                {!!hasilDokter ? (
                  <tr className="*:align-baseline">
                    <td>Usia Rawat</td>
                    <td className="px-1">:</td>
                    <td>
                      {data?.tanggal_lahir && hasilDokter?.anamnesis.created_at
                        ? getAgeAll(
                            data?.tanggal_lahir,
                            new Date(hasilDokter?.anamnesis.created_at)
                          )
                        : ""}
                    </td>
                  </tr>
                ) : null}
                <tr className="*:align-baseline">
                  <td>No. Rawat</td>
                  <td className="px-1">:</td>
                  <td>
                    {params.idKunjungan === "igd" ? "" : params.idKunjungan}
                  </td>
                </tr>
                <tr className="*:align-baseline">
                  <td>Tanggal</td>
                  <td className="px-1">:</td>
                  <td>
                    {hasilDokter?.anamnesis.created_at
                      ? new Intl.DateTimeFormat("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(new Date(hasilDokter?.anamnesis.created_at))
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
                    {hasilDokter?.anamnesis.created_at
                      ? new Intl.DateTimeFormat("en", {
                          timeStyle: "short",
                          hourCycle: "h24",
                        }).format(new Date(hasilDokter?.anamnesis.created_at))
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
                as={Fragment}
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
          <RiwayatPemeriksaan />
        </div>
        <div className="relative flex-1 rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          {!klinik.isPsi ? (
            <Tab.Group
              selectedIndex={tabIdx}
              onChange={(index) => {
                setTabIdx(index);
                panelDivRef.current?.scrollTo(0, 0);
              }}
            >
              <Tab.List className="mr-8 flex space-x-0.5 rounded-md bg-gray-900/20 p-0.5 dark:bg-slate-600">
                {menues.map((menu) => (
                  <Tab
                    className={cn(
                      "w-full rounded py-1.5 text-sm leading-5 text-gray-700 focus:outline-none ui-selected:bg-white ui-selected:shadow ui-not-selected:hover:bg-white/[0.12] dark:text-slate-50 ui-selected:dark:bg-slate-800 ui-not-selected:dark:hover:bg-slate-700"
                    )}
                    key={menu}
                  >
                    {menu}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels
                ref={panelDivRef}
                className={cn(
                  "my-2 h-[calc(100%-40px)] overflow-y-auto",
                  css.scrollbar
                )}
              >
                <Tab.Panel className="focus:outline-none" unmount={false}>
                  <SubjektifDr
                    lainRiwayat={lainRiwayat}
                    lainRiwayatKel={lainRiwayatKel}
                    setLainRiwayat={setLainRiwayat}
                    setLainRiwayatKel={setLainRiwayatKel}
                    klinik={klinik}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none" unmount={false}>
                  {klinik.isRehab ? (
                    <ObjektifRehabMedik
                      hasilPerawat={hasilPerawat}
                      isUpdate={isUpdate}
                      klinik={klinik}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                    />
                  ) : klinik.isDerma ? (
                    <ObjektifDerma
                      hasilPerawat={hasilPerawat}
                      isUpdate={isUpdate}
                      statusLokSrc={anatomiImg}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                    />
                  ) : klinik.isJiwa ? (
                    <ObjektifJiwa
                      hasilPerawat={hasilPerawat}
                      isUpdate={isUpdate}
                      statusLokSrc={anatomiImg}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                    />
                  ) : (
                    <ObjektifDr
                      hasilPerawat={hasilPerawat}
                      isUpdate={isUpdate}
                      klinik={klinik}
                      statusLokSrc={anatomiImg}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                    />
                  )}
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  {klinik.isJiwa ? (
                    <AsesmenJiwa
                      tabIdx={tabIdx}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                      isUpdate={isUpdate}
                    />
                  ) : (
                    <AsesmenDr
                      tabIdx={tabIdx}
                      setTabIdx={setTabIdx}
                      panelDivRef={panelDivRef}
                      isUpdate={isUpdate}
                    />
                  )}
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <PlanningTargetDr
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none" unmount={false}>
                  <InstruksiDr
                    hasilDokter={hasilDokter}
                    klinik={klinik}
                    isLoading={isLoading}
                    isUpdate={isUpdate}
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          ) : (
            <AsesmenPsikologi />
          )}
          <Tooltip.Provider delayDuration={300} disableHoverableContent>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => setTutupAsesmen(true)}
                  className="absolute right-3 top-[18px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IoCloseCircleOutline
                    size="1.5rem"
                    className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
                  />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="left"
                sideOffset={0}
                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
              >
                <p>Keluar</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>

          <Transition show={viewHasilPerawat} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1001]"
              onClose={() => false}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex h-screen items-center justify-center px-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-50"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="flex h-full w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                      <Dialog.Title
                        as="p"
                        className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                      >
                        {!klinik.isObg ? "Asesmen Perawat" : "Asesmen Bidan"}
                      </Dialog.Title>
                      <div
                        className={cn(
                          "mt-2 flex-1 overflow-y-auto",
                          css.scrollbar
                        )}
                      >
                        {!klinik.isObg ? (
                          <HasilPerawat
                            data={hasilPerawat}
                            cek={cek}
                            setCek={setCek}
                            previewDokter
                          />
                        ) : (
                          <HasilBidan
                            data={hasilPerawat}
                            cek={cek}
                            setCek={setCek}
                            previewDokter
                          />
                        )}
                        <div className="flex justify-center gap-1">
                          <Button
                            disabled={!cek}
                            color="green"
                            className="items-center gap-1"
                            onClick={() => setViewHasilPerawat(false)}
                          >
                            <span>
                              <RiCheckFill size="1rem" />
                            </span>
                            <span>Saya telah mengkaji asesmen awal</span>
                          </Button>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          {/* <PermintLabDialog
            kunjungan={params.idKunjungan as string}
            permintLab={permintLab}
            permintLabDispatch={permintLabDispatch}
          />

          <PermintRadDialog
            kunjungan={params.idKunjungan as string}
            permintRad={permintRad}
            permintRadDispatch={permintRadDispatch}
          /> */}
          <Transition show={tutupAsesmen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1001]"
              onClose={() => setTutupAsesmen(false)}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-50"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                      <Dialog.Title
                        as="p"
                        className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                      >
                        Tutup Asesmen
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Asesmen belum disimpan, apakah Anda yakin untuk
                          menutup asesmen tanpa disimpan?
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end gap-1">
                        <Link
                          href={{
                            pathname: "/list-pasien",
                            query: {
                              user: "Dokter",
                              id: id?.replaceAll(".", "_"),
                            },
                          }}
                          onClick={() => setTutupAsesmen(false)}
                          passHref
                          legacyBehavior
                        >
                          <LinkButton color="red100">Tutup</LinkButton>
                        </Link>
                        <Button
                          color="red"
                          onClick={() => setTutupAsesmen(false)}
                        >
                          Batal
                        </Button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </form>
    </FormProvider>
  );
}
