"use client";

import { DataPesertaBPJS } from "@/app/(pendaftaran)/schema";
import css from "@/assets/css/scrollbar.module.css";
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
import { toast } from "react-toastify";
import {
  AsesmenPerSchema,
  KlinikAsesmen,
  TAsesmenPer,
  TData,
  TFormImunisasi,
  THasilPerawat,
  listPenDahuluKeb,
  listPenKeluargaKeb,
} from "../../schema";
import { AsesmenOBG, SubjektifOBG, listGinekologi } from "./kebidanan";
import {
  AsesmenPer,
  ObjektifPer,
  PlanningTargetPer,
  SubjektifPer,
  TindakanPer,
} from "./perawat";
import { AsesmenFisio, ObjektifFisio, SubjektifFisio } from "./rehab-medik";
import RiwayatPemeriksaan from "./riwayat/riwayat-pemeriksaan";
import {
  AsesmenWicara,
  ObjektifWicara,
  SubjektifWicara,
  TindakanWicara,
} from "./terapi-wicara";
import DataPasien from "./data-pasien";

export default function AsesmenPerawat({
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
  const searchParams = useSearchParams();
  const params = useParams();
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
      toast.error(error.message);
      console.error(error);
    }
  };
  const [hasilPerawat, setHasilPerawat] = useState<THasilPerawat>();
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
      if (error.message === "Belum dilakukan asesmen") return;
      toast.error(error.message);
      console.error(error);
    }
  };

  const menues = [
    "Subjektif",
    "Objektif",
    "Asesmen",
    "Planning & Target",
    "Tindakan",
  ];

  const [tabIdx, setTabIdx] = useState(0);

  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const methods = useForm<TAsesmenPer>({
    resolver: zodResolver(AsesmenPerSchema),
    defaultValues: {
      id_kunjungan: params.idKunjungan as string,
      kajian: {
        soseksk: ["Baik", "Tidak", "Orang Tua", "Normal", "Tidak", ""],
      },
      fisik: {
        gcs: [4, 6, 5],
        keadaan: "Baik",
      },
    },
  });

  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (!initialized.current) {
      loadInfoPeserta();
      if (proses > 3) {
        loadAsesPerawat();
      }
      if (!klinik.isObg) {
        setValue("kajian.psikologis", "Tenang");
      }
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasilPerawat) return;
    setIsUpdate(true);
    /* SUBJEKTIF */
    setValue("anamnesis.id", hasilPerawat.anamnesis.id);
    setValue("anamnesis.keluhan", hasilPerawat.anamnesis.keluhan);
    setValue("anamnesis.alergi", hasilPerawat.anamnesis.alergi);
    if (klinik.isAnak && hasilPerawat.imunisasi) {
      hasilPerawat.imunisasi?.bcg &&
        setValue(
          "imunisasi.bcg",
          listImunisasi
            .find((val) => val.name === "imunisasi.bcg")
            ?.list.slice(0, hasilPerawat.imunisasi.bcg)
        );
      hasilPerawat.imunisasi?.campak &&
        setValue(
          "imunisasi.campak",
          listImunisasi
            .find((val) => val.name === "imunisasi.campak")
            ?.list.slice(0, hasilPerawat.imunisasi.campak)
        );
      hasilPerawat.imunisasi?.polio &&
        setValue(
          "imunisasi.polio",
          listImunisasi
            .find((val) => val.name === "imunisasi.polio")
            ?.list.slice(0, hasilPerawat.imunisasi.polio)
        );
      hasilPerawat.imunisasi?.hepatitis_b &&
        setValue(
          "imunisasi.hepatitis_b",
          listImunisasi
            .find((val) => val.name === "imunisasi.hepatitis_b")
            ?.list.slice(0, hasilPerawat.imunisasi?.hepatitis_b)
        );
      hasilPerawat.imunisasi?.dpthib &&
        setValue(
          "imunisasi.dpthib",
          listImunisasi
            .find((val) => val.name === "imunisasi.dpthib")
            ?.list.slice(0, hasilPerawat.imunisasi?.dpthib)
        );
    }
    if (klinik.isObg && hasilPerawat.kebidanan) {
      setValue("kebidanan.menarche", hasilPerawat.kebidanan.menarche);
      setValue("kebidanan.lama_mens", hasilPerawat.kebidanan.lama_mens);
      setValue(
        "kebidanan.siklus_teratur",
        hasilPerawat.kebidanan.siklus_teratur
      );
      setValue("kebidanan.siklus_mens", hasilPerawat.kebidanan.siklus_mens);
      setValue(
        "kebidanan.hpht",
        !!hasilPerawat.kebidanan.hpht
          ? new Date(hasilPerawat.kebidanan.hpht).toLocaleDateString("fr-CA")
          : ""
      );
      setValue(
        "kebidanan.hpl",
        !!hasilPerawat.kebidanan.hpl
          ? new Date(hasilPerawat.kebidanan.hpl).toLocaleDateString("fr-CA")
          : ""
      );
      setValue("persalinan", hasilPerawat.persalinan || []);
      setValue("anamnesis.riwayat", hasilPerawat.anamnesis.riwayat || []);
      setLainRiwayat(
        hasilPerawat.anamnesis.riwayat?.find(
          (val) => !listPenDahuluKeb.includes(val)
        ) || ""
      );
      setValue("anamnesis.riwayat_operasi", hasilPerawat.operasi || []);
      setValue(
        "anamnesis.riwayat_keluarga",
        hasilPerawat.anamnesis.riwayat_keluarga || []
      );
      setLainRiwayatKel(
        hasilPerawat.anamnesis.riwayat_keluarga?.find(
          (val) => !listPenKeluargaKeb.includes(val)
        ) || ""
      );
      setValue(
        "kebidanan.riwayat_ginekologi",
        hasilPerawat.kebidanan.riwayat_ginekologi || []
      );
      setLainRiwayatGinekologi(
        hasilPerawat.kebidanan.riwayat_ginekologi?.find(
          (val) => !listGinekologi.includes(val)
        ) || ""
      );
      setValue(
        "kebidanan.fluor_albus",
        hasilPerawat.kebidanan.fluor_albus.map((val) => (!!val ? val : ""))
      );
      setValue("kebidanan.riwayat_kb", hasilPerawat.kebidanan.riwayat_kb || []);
      setValue("kebidanan.keluhan_kb", hasilPerawat.kebidanan.keluhan_kb || "");
    }
    if (klinik.isRehab) {
      setValue("anamnesis.penyakit", hasilPerawat.anamnesis.penyakit);
    } else {
      setValue(
        "anamnesis.riwayat_obat",
        hasilPerawat.anamnesis.riwayat_obat || []
      );
    }
    setValue("kajian.id", hasilPerawat.kajian.id);
    if (!klinik.isObg) {
      setValue("kajian.psikologis", hasilPerawat.kajian.psikologis);
      setValue("kajian.perilaku", hasilPerawat.kajian.perilaku);
    }
    setValue("kajian.soseksk", hasilPerawat.kajian.soseksk);

    /* OBJEKTIF */
    setValue("fisik.id", hasilPerawat.fisik.id);
    if (!klinik.isRehab) {
      setValue("fisik.gcs", hasilPerawat.fisik.gcs);
      setValue("fisik.saturasi", hasilPerawat.fisik.saturasi || NaN);
    }
    setValue("fisik.keadaan", hasilPerawat.fisik.keadaan);
    setValue("fisik.td", hasilPerawat.fisik.td);
    setValue("fisik.hr", hasilPerawat.fisik.hr);
    setValue("fisik.temp", hasilPerawat.fisik.temp);
    setValue("fisik.rr", hasilPerawat.fisik.rr);
    setValue("fisik.bb", hasilPerawat.fisik.bb);
    setValue("fisik.tb", hasilPerawat.fisik.tb);
    setValue("fisik.tambahan", hasilPerawat.fisik.tambahan || "");
    if (!klinik.isMata && hasilPerawat.fisik.mata) {
      setValue("fisik.mata.lama", hasilPerawat.fisik.mata.lama);
      setValue("fisik.mata.visus", hasilPerawat.fisik.mata.visus);
    }
    if (klinik.isRehab) {
      if (hasilPerawat.fisio) {
        setValue("fisio.fisik.inspeksi", hasilPerawat.fisio.fisik.inspeksi);
        setValue("fisio.fisik.statis", hasilPerawat.fisio.fisik.statis);
        setValue("fisio.fisik.dinamis", hasilPerawat.fisio.fisik.dinamis);
        setValue("fisio.fisik.kognitif", hasilPerawat.fisio.fisik.kognitif);
        setValue("fisio.fisik.palpasi", hasilPerawat.fisio.fisik.palpasi);
        setValue("fisio.fisik.luas", hasilPerawat.fisio.fisik.luas);
        setValue("fisio.fisik.mmt", hasilPerawat.fisio.fisik.mmt);
        setValue("fisio.fisik.perkusi", hasilPerawat.fisio.fisik.perkusi);
        setValue("fisio.fisik.auskultasi", hasilPerawat.fisio.fisik.auskultasi);
        setValue("fisio.fisik.nyeri", hasilPerawat.fisio.fisik.nyeri);
        setValue("fisio.fisik.tekan", hasilPerawat.fisio.fisik.tekan);
        setValue("fisio.fisik.gerak", hasilPerawat.fisio.fisik.gerak);
        setValue("fisio.fisik.diam", hasilPerawat.fisio.fisik.diam);
        setValue(
          "fisio.fisik.antropometri",
          hasilPerawat.fisio.fisik.antropometri
        );
        setValue("fisio.fisik.khusus", hasilPerawat.fisio.fisik.khusus);
      }
      if (hasilPerawat.status_lokalis) {
        setValue("status_lokalis", hasilPerawat.status_lokalis);
      }
    }

    /* LAIN */
    if (!klinik.isRehab && hasilPerawat.keperawatan) {
      setValue("keperawatan.id", hasilPerawat.keperawatan.id);
      // setValue("keperawatan.diagnosis", hasilPerawat.keperawatan.diagnosis);
      setValue(
        "keperawatan.rencana_asuhan",
        hasilPerawat.keperawatan.rencana_asuhan
      );
      setValue("keperawatan.target", hasilPerawat.keperawatan.target);
      setValue("keperawatan.tindakan", hasilPerawat.keperawatan.tindakan);
    } else if (klinik.isRehab) {
      if (hasilPerawat.keperawatan) {
        setValue(
          "keperawatan.diagnosis",
          hasilPerawat.keperawatan?.diagnosis.map((val, idx) => ({
            id_diagnosis: hasilPerawat.keperawatan?.id_diagnosis.find(
              (_, i) => i === idx
            )!,
            nama: val,
          }))
        );
        setValue(
          "keperawatan.rencana_asuhan",
          hasilPerawat.keperawatan.rencana_asuhan
        );
        setValue("keperawatan.target", hasilPerawat.keperawatan.target);
      }
      if (hasilPerawat.fisio) {
        setValue("fisio.diagnosis", [
          hasilPerawat.fisio.diagnosis.at(0) || "",
          hasilPerawat.fisio.diagnosis.at(1) || "",
          hasilPerawat.fisio.diagnosis.at(2) || "",
        ]);
        setValue("fisio.intervensi", hasilPerawat.fisio.intervensi);
      }
    } else if (klinik.isObg && hasilPerawat.kebidanan) {
      setValue("kebidanan.id", hasilPerawat.kebidanan.id);
      setValue("kebidanan.diagnosis", hasilPerawat.kebidanan.diagnosis);
      setValue("kebidanan.paritas_gpa", hasilPerawat.kebidanan.paritas_gpa);
      setValue("kebidanan.usia", hasilPerawat.kebidanan.usia);
      setValue(
        "kebidanan.rencana_asuhan",
        hasilPerawat.kebidanan.rencana_asuhan
      );
      setValue("kebidanan.target", hasilPerawat.kebidanan.target);
      setValue("kebidanan.tindakan", hasilPerawat.kebidanan.tindakan);
    }
  }, [hasilPerawat]);

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
    console.log(errors);
    if (Object.keys(errors).length > 0)
      toast.warn("Lengkapi isian terlebih dahulu!");
  }, [errors]);

  const [listImunisasi] = useState<TFormImunisasi[]>([
    {
      value: "Hepatitis B",
      name: "imunisasi.hepatitis_b",
      list: [1, 2, 3, 4, 5],
    },
    { value: "BCG", name: "imunisasi.bcg", list: [1] },
    {
      value: "Polio",
      name: "imunisasi.polio",
      list: [0, 1, 2, 3, 4],
    },
    { value: "Campak/MMR", name: "imunisasi.campak", list: [1] },
    {
      value: "DPT dan Hib",
      name: "imunisasi.dpthib",
      list: [1, 2, 3, 4, 5],
    },
  ]);

  /* KEBIDANAN */
  const [lainRiwayat, setLainRiwayat] = useState("");
  const [lainRiwayatKel, setLainRiwayatKel] = useState("");
  const [lainRiwayatGinekologi, setLainRiwayatGinekologi] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitHandler: SubmitHandler<TAsesmenPer> = async (data, e) => {
    try {
      e?.preventDefault();
      setIsLoading(true);
      if (klinik.isObg) {
        setValue(
          "anamnesis.riwayat",
          !data?.anamnesis?.riwayat
            ? [lainRiwayat]
            : [
                ...data?.anamnesis?.riwayat.filter((val) =>
                  listPenDahuluKeb.includes(val)
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
                  listPenKeluargaKeb.includes(val)
                ),
                lainRiwayatKel,
              ]
        );
        setValue(
          "kebidanan.riwayat_ginekologi",
          !data?.kebidanan?.riwayat_ginekologi
            ? [lainRiwayatGinekologi]
            : [
                ...data?.kebidanan?.riwayat_ginekologi.filter((val) =>
                  listGinekologi.includes(val)
                ),
                lainRiwayatGinekologi,
              ]
        );
      }
      console.log(data);
      const url = klinik.isObg
        ? `${APIURL}/rs/rajal/assesment/kebidanan`
        : klinik.isRehab
        ? `${APIURL}/rs/rajal/assesment/fisioterapi`
        : `${APIURL}/rs/rajal/assesment/perawat`;
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
      router.replace("/list-pasien?user=Perawat");
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
          <DataPasien
            data={data}
            dataPeserta={dataPeserta}
            hasilPerawat={hasilPerawat}
          />
          <RiwayatPemeriksaan />
        </div>
        <div className="relative flex-1 rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
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
                // isMutating && "overflow-hidden"
              )}
            >
              <Tab.Panel className="focus:outline-none">
                {klinik.isObg ? (
                  <SubjektifOBG
                    isUpdate={isUpdate}
                    lainRiwayat={lainRiwayat}
                    lainRiwayatKel={lainRiwayatKel}
                    lainRiwayatGinekologi={lainRiwayatGinekologi}
                    setLainRiwayat={setLainRiwayat}
                    setLainRiwayatKel={setLainRiwayatKel}
                    setLainRiwayatGinekologi={setLainRiwayatGinekologi}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : klinik.isRehab ? (
                  <SubjektifFisio
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : klinik.isWicara ? (
                  <SubjektifWicara
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : (
                  <SubjektifPer
                    listImunisasi={listImunisasi}
                    klinik={klinik}
                    tabIdx={tabIdx}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none" unmount={false}>
                {klinik.isRehab ? (
                  <ObjektifFisio
                    isUpdate={isUpdate}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : klinik.isWicara ? (
                  <ObjektifWicara
                    isUpdate={isUpdate}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : (
                  <ObjektifPer
                    klinik={klinik}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                {klinik.isObg ? (
                  <AsesmenOBG setTabIdx={setTabIdx} panelDivRef={panelDivRef} />
                ) : klinik.isRehab ? (
                  <AsesmenFisio
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : klinik.isWicara ? (
                  <AsesmenWicara
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                ) : (
                  <AsesmenPer
                    isUpdate={isUpdate}
                    setTabIdx={setTabIdx}
                    panelDivRef={panelDivRef}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                <PlanningTargetPer
                  klinik={klinik}
                  setTabIdx={setTabIdx}
                  panelDivRef={panelDivRef}
                />
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                {!klinik.isWicara ? (
                  <TindakanPer
                    isUpdate={isUpdate}
                    isLoading={isLoading}
                    klinik={klinik}
                  />
                ) : (
                  <TindakanWicara isUpdate={isUpdate} isLoading={isLoading} />
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
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
                              user: "Perawat",
                              klinik: qlist?.at(0) || "all",
                              dokter: qlist?.at(1) || "all",
                              mulai: qlist?.at(2) || "all",
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
