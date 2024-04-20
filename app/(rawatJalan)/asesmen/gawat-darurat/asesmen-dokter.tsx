"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  SubmitHandler,
  FormProvider,
  useForm,
  useFormContext,
  Controller,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tab, Transition } from "@headlessui/react";
import { Input, InputArea, LabelButton } from "@/components/form";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
// import { Option } from "react-select";
import { Button } from "@/components/button";
import css from "@/assets/css/scrollbar.module.css";
import ImageMarker, { Marker } from "@/components/image-marker";
// import anatomiAnak from "@/assets/img/anak.png";
// import anatomiGigi from "@/assets/img/gigi.png";
// import anatomiMata from "@/assets/img/mata.png";
// import anatomiJantung from "@/assets/img/jantung.png";
// import anatomiObg from "@/assets/img/kandungan.png";
// import anatomiOrto from "@/assets/img/ortopedi.png";
// import anatomiParu from "@/assets/img/paru.png";
// import anatomiPD from "@/assets/img/penyakit-dalam.png";
// import anatomiRehabMedik from "@/assets/img/rehabmedik.png";
// import anatomiSaraf from "@/assets/img/saraf.png";
// import anatomiTHT from "@/assets/img/tht-kl.png";
import anatomiUmum from "@/assets/img/anatomi-umum.png";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { APIURL } from "@/lib/connection";
import { TbEdit, TbTrash } from "react-icons/tb";
import { RiAddCircleLine, RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { Tooltip } from "@/components/tooltip";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { TData } from "../schema";

const AsesmenDokSchema = z.object({
  id_kunjungan: z.string(),
  // s: z.object({
  iph: z.string().array(),
  trauma: z.boolean(),
  kasus: z.string(),
  anamnesis: z.boolean(),
  keluhan: z.string(),
  penyakit: z.string(),
  riwayat: z.string().array(),
  riwayat_keluarga: z.string().array(),
  alergi: z.string(),
  riwayat_tindakan: z.string(),
  riwayat_obat: z.string(),
  // }),
  o: z.object({
    gcs: z.number().array().length(3),
    kesadaran: z.string(),
    keadaan: z.string(),
    td: z.object({
      sistole: z.number().min(0).max(250),
      diastole: z.number().min(0).max(180),
    }),
    hr: z.number().min(0).max(300),
    temp: z.number().min(30).max(45),
    rr: z.number().min(0).max(40),
    oksigen: z.number().min(0).max(100),
    bb: z.number().min(0),
    status_lokasis: z
      .object({
        id: z.number().optional(),
        posisi: z.object({
          x: z.number(),
          y: z.number(),
        }),
        catatan: z.string().optional(),
      })
      .array()
      .optional(),
  }),
  a: z.object({
    diagnosis: z
      .object({
        diagnosis: z.string(),
        icd10: z.string(),
      })
      .array(),
  }),
  p: z.object({
    rencana_asuhan: z.string(),
  }),
  t: z.object({
    target: z.string(),
  }),
  i: z.object({
    tindakan: z
      .object({
        tindakan: z.string(),
        icd9: z.string(),
      })
      .array(),
  }),
});

type TAsesmenDok = z.infer<typeof AsesmenDokSchema>;

export default function AsesmenIGD({
  data,
  menues,
  umur,
}: {
  menues: string[];
  umur: number;
  data: TData;
}) {
  const router = useRouter();
  const [tabIdx, setTabIdx] = useState(0);

  const methods = useForm<TAsesmenDok>({
    resolver: zodResolver(AsesmenDokSchema),
    defaultValues: {
      // s: {
      iph: [],
      riwayat_keluarga: [],
      // },
      o: {
        status_lokasis: [],
      },
      a: {
        diagnosis: [],
      },
      p: {},
      t: {},
      i: {
        tindakan: [],
      },
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  const submitHandler: SubmitHandler<TAsesmenDok> = async (data, e) => {
    e?.preventDefault();
    console.log(data);
  };

  const panelDivRef = useRef<HTMLElement>(null);

  return (
    <>
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
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(submitHandler)}>
              <Tab.Panel className="focus:outline-none">
                <Subjektif setTabIdx={setTabIdx} panelDivRef={panelDivRef} />
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none" unmount={false}>
                <Objektif setTabIdx={setTabIdx} panelDivRef={panelDivRef} />
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                <Asesmen setTabIdx={setTabIdx} panelDivRef={panelDivRef} />
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                <PlanningTarget
                  setTabIdx={setTabIdx}
                  panelDivRef={panelDivRef}
                />
              </Tab.Panel>
              <Tab.Panel className="focus:outline-none">
                <Instruksi setTabIdx={setTabIdx} panelDivRef={panelDivRef} />
              </Tab.Panel>
            </form>
          </FormProvider>
        </Tab.Panels>
      </Tab.Group>
      <Tooltip.Provider delayDuration={300} disableHoverableContent>
        <Tooltip.Root>
          <Tooltip.Trigger
            onClick={() => router.back()}
            className="absolute right-3 top-[18px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AiOutlineCloseCircle
              size="1.5rem"
              className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
            />
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
    </>
  );
}

const Subjektif = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const listIPH = [
    "Cervical Collar",
    "Defibrilasi",
    "VTP",
    "Balut/Bidai",
    "NGT",
    "Obat",
    "Resusitasi",
    "Intubasi",
    "WSD",
    "Kateter Urin",
    "Infus",
    // "Tidak Ada",
  ];
  const listTrauma = [
    { label: "Trauma", value: true },
    { label: "Non Trauma", value: false },
  ];
  const listKasus = [
    "KLL tunggal",
    "KLL",
    "Jatuh dari ketinggian",
    "Luka bakar",
    "Trauma listrik",
    "Trauma zat kimia",
    "Trauma lain",
  ];
  const listAnamnesis = [
    {
      label: "Anamnesis",
      value: true,
    },
    {
      label: "Alloanamnesis",
      value: false,
    },
  ];
  const listPenyakit = [
    "DM",
    "TB Paru",
    "Asma",
    "Hipertensi",
    "Hepatitis",
    "CKD",
  ];

  const { register, control, trigger, watch } = useFormContext<TAsesmenDok>();
  const iph = watch("iph");
  const kasus = watch("kasus");

  return (
    <>
      <div className={cn("mb-2 grid gap-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Intervensi Prehospital
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="flex w-6/12 flex-col gap-2">
              <div className="flex flex-wrap justify-center gap-0.5">
                {listIPH.map((val, idx) => (
                  <LabelButton
                    className="h-fit rounded-lg"
                    type="checkbox"
                    id={"intervensi-prehospital-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register("iph")}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Transition
                show={!!iph?.find((val) => val === "Obat")}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 -translate-y-1"
              >
                <div>
                  <Input className="px-2 py-1 text-xs" placeholder="Obat..." />
                </div>
              </Transition>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Kasus
              </label>
              <div className="mb-2">
                <Controller
                  control={control}
                  name="trauma"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <div>
                      {listTrauma.map((val, idx) => (
                        <LabelButton
                          type="radio"
                          id={"trauma-" + (idx + 1)}
                          onBlur={onBlur}
                          onChange={() => onChange(val.value)}
                          checked={value === val.value}
                          key={idx}
                        >
                          {val.label}
                        </LabelButton>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap justify-center gap-0.5">
                {listKasus.map((val, idx) => (
                  <LabelButton
                    className="h-fit rounded-lg"
                    type="radio"
                    id={"kasus-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register("kasus")}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Transition
                show={kasus === "KLL"}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 -translate-y-1"
              >
                <div className="flex items-center gap-1">
                  <Input className="px-2 py-1 text-xs" />
                  <small>VS</small>
                  <Input className="px-2 py-1 text-xs" />
                </div>
              </Transition>
              <Transition
                show={kasus === "KLL tunggal" || kasus === "KLL"}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex gap-1">
                  <Input
                    className="px-2 py-1 text-xs"
                    placeholder="Tempat kejadian"
                  />
                  <Input type="datetime-local" className="px-2 py-1 text-xs" />
                </div>
              </Transition>
              <Transition
                show={!!kasus && kasus !== "KLL tunggal" && kasus !== "KLL"}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex gap-1">
                  <Input
                    className="px-2 py-1 text-xs"
                    placeholder="Jelaskan..."
                  />
                </div>
              </Transition>
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pengkajian Riwayat Penyakit
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div>
              <Controller
                control={control}
                name="anamnesis"
                render={({ field: { onChange, value, onBlur } }) => (
                  <div>
                    {listAnamnesis.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"anamnesis-" + (idx + 1)}
                        onBlur={onBlur}
                        onChange={() => onChange(val.value)}
                        checked={value === val.value}
                        key={idx}
                      >
                        {val.label}
                      </LabelButton>
                    ))}
                  </div>
                )}
              />
            </div>
            <div className="w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Keluhan Utama
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                // {...register("awal.keluhan_utama")}
              />
            </div>
            <div className="w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Sekarang
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("penyakit")}
              />
            </div>
            <div className="flex w-6/12 flex-col">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Dahulu
              </label>
              <div className="mb-2">
                {listPenyakit.map((val, idx) => (
                  <LabelButton
                    type="checkbox"
                    id={"riw-pnykt-dah-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register("riwayat")}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Input
                className="px-2 py-1 text-xs"
                placeholder="Lainnya..."
                // {...register("riwayat")}
              />
            </div>
            <div className="flex w-6/12 flex-col">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Keluarga
              </label>
              <div className="mb-2">
                {listPenyakit.map((val, idx) => (
                  <LabelButton
                    type="checkbox"
                    id={"riw-pnykt-kel-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register(`riwayat_keluarga.${idx}`)}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Input
                className="px-2 py-1 text-xs"
                placeholder="Lainnya..."
                {...register(`riwayat_keluarga.${listPenyakit.length}`)}
              />
            </div>
            <div className="w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Alergi
              </label>
              <Input className="px-2 py-1 text-xs" {...register("alergi")} />
            </div>
            <div className="w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Tindakan
              </label>
              <Input
                className="px-2 py-1 text-xs"
                {...register("riwayat_tindakan")}
              />
            </div>
            <div className="w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Obat
              </label>
              <Input
                className="px-2 py-1 text-xs"
                {...register("riwayat_obat")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          // const cek = await trigger("s");
          // cek && setTabIdx(1);
          panelDivRef.current?.scrollTo(0, 0);
          setTabIdx(1);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

const Objektif = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const [listGcs] = useState({
    e: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
    ],
    m: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
    ],
    v: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
    ],
  });
  const [listKesadaran] = useState([
    "CM (15-14)",
    "Apatis (13-12)",
    "Delirium (11-10)",
    "Somnolent (9-7)",
    "Stupor (6-4)",
    "Coma (3)",
  ]);
  const [listKeadaan] = useState(["Baik", "Sedang", "Lemah", "Buruk"]);

  const { register, trigger, control, setValue, watch } =
    useFormContext<TAsesmenDok>();

  const handleKesadaran = () => {
    const kesadaran = watch("o.gcs").reduce((acc, val) => acc + val, 0);
    switch (true) {
      case kesadaran >= 14:
        setValue("o.kesadaran", listKesadaran.at(0)!);
        break;
      case kesadaran >= 12:
        setValue("o.kesadaran", listKesadaran.at(1)!);
        break;
      case kesadaran >= 10:
        setValue("o.kesadaran", listKesadaran.at(2)!);
        break;
      case kesadaran >= 7:
        setValue("o.kesadaran", listKesadaran.at(3)!);
        break;
      case kesadaran >= 4:
        setValue("o.kesadaran", listKesadaran.at(4)!);
        break;
      case kesadaran === 3:
        setValue("o.kesadaran", listKesadaran.at(5)!);
        break;
    }
  };
  // useEffect(() => {
  //   handleKesadaran();
  // }, [watch("fisik.gcs.0"), watch("fisik.gcs.1"), watch("fisik.gcs.2")]);

  const statusLok = watch("o.status_lokasis") || [];
  const [idCatatan, setIdCatatan] = useState<number | undefined>(undefined);
  const showCatatan = useMemo(() => {
    return !!idCatatan;
  }, [idCatatan]);
  const [isEditCatatan, setIsEditCatatan] = useState<boolean>(false);
  const [catatan, setCatatan] = useState<string | undefined>(undefined);
  const addMarker = (marker: Marker) => {
    setIdCatatan(statusLok.length + 1);
    if (showCatatan) {
      let newMarkers = statusLok;
      if (statusLok?.length > 0) {
        newMarkers[statusLok.length - 1].catatan = catatan;
      }
      setValue("o.status_lokasis", [...newMarkers, marker]);
    } else {
      setValue("o.status_lokasis", [...statusLok, marker]);
    }
    setCatatan("");
  };
  const addCatatan = () => {
    let newMarkers = statusLok;
    newMarkers[idCatatan! - 1].catatan = catatan!;
    for (let mark in newMarkers) {
      if (newMarkers[mark].catatan === undefined) {
        newMarkers.splice(parseInt(mark), 1);
      }
    }
    setValue("o.status_lokasis", [...newMarkers]);
    setIdCatatan(undefined);
    setCatatan("");
  };
  const delMarker = (id: number) => {
    setValue(
      "o.status_lokasis",
      statusLok.filter((_, i) => id !== i)
    );
  };
  const editCatatan = (id: number) => {
    setIsEditCatatan(true);
    setIdCatatan(id + 1);
    setCatatan(statusLok[id].catatan);
  };

  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Fisik dan Penunjang
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-6 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div>
              <div className="grid grid-cols-5">
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    GCS
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <Controller
                      control={control}
                      name="o.gcs.0"
                      render={({ field: { onChange, value } }) => (
                        <div className="relative">
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            size="sm"
                            menuPlacement="top"
                            options={listGcs.e}
                            withSpan
                            placeholder=""
                            onChange={(val: any) => {
                              onChange(val.value);
                              handleKesadaran();
                            }}
                            value={listGcs.e.find((v) => v.value === value)}
                          />
                          <div className="absolute inset-y-0 left-1.5 top-[5px]">
                            <span className="text-[11px]/[12px]">E</span>
                          </div>
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="o.gcs.1"
                      render={({ field: { onChange, value } }) => (
                        <div className="relative">
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            size="sm"
                            menuPlacement="top"
                            options={listGcs.m}
                            withSpan
                            placeholder=""
                            onChange={(val: any) => {
                              onChange(val.value);
                              handleKesadaran();
                            }}
                            value={listGcs.m.find((v) => v.value === value)}
                          />
                          <div className="absolute inset-y-0 left-1.5 top-[5px]">
                            <span className="text-[11px]/[12px]">M</span>
                          </div>
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="o.gcs.2"
                      render={({ field: { onChange, value } }) => (
                        <div className="relative">
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            size="sm"
                            menuPlacement="top"
                            options={listGcs.v}
                            withSpan
                            placeholder=""
                            onChange={(val: any) => {
                              onChange(val.value);
                              handleKesadaran();
                            }}
                            value={listGcs.v.find((v) => v.value === value)}
                          />
                          <div className="absolute inset-y-0 left-1.5 top-[5px]">
                            <span className="text-[11px]/[12px]">V</span>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Kesadaran
                  </label>
                  <div className="mb-2">
                    {listKesadaran.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"kesadaran-" + (idx + 1)}
                        value={val}
                        key={idx}
                        className={cn("rounded-lg")}
                        {...register("o.kesadaran")}
                      >
                        {val}
                      </LabelButton>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keadaan Umum
                  </label>
                  <div className="mb-2">
                    {listKeadaan.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"keadaan_umum-" + (idx + 1)}
                        value={val}
                        key={idx}
                        {...register("o.keadaan")}
                      >
                        {val}
                      </LabelButton>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="col-span-2">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    TD
                  </label>
                  <div className="relative flex items-center justify-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        className="py-1 pl-2 pr-9 text-xs"
                        placeholder="SYS"
                        {...register("o.td.sistole", { valueAsNumber: true })}
                        onWheel={(e) => e.currentTarget.blur()}
                        onInput={(
                          e: React.FocusEvent<HTMLInputElement, Element>
                        ) => {
                          +e.target.value < 0 && setValue("o.td.diastole", 0);
                          +e.target.value > 250 &&
                            setValue("o.td.sistole", 250);
                        }}
                      />
                      <div className="absolute inset-y-0 right-2 top-[5px]">
                        <span className="text-[8px]/[10px]">mmHg</span>
                      </div>
                    </div>
                    <span>/</span>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        className="py-1 pl-2 pr-9 text-xs"
                        placeholder="DIA"
                        {...register("o.td.diastole", { valueAsNumber: true })}
                        onWheel={(e) => e.currentTarget.blur()}
                        onInput={(
                          e: React.FocusEvent<HTMLInputElement, Element>
                        ) => {
                          +e.target.value < 0 && setValue("o.td.diastole", 0);
                          +e.target.value > 180 &&
                            setValue("o.td.diastole", 180);
                        }}
                      />
                      <div className="absolute inset-y-0 right-2 top-[5px]">
                        <span className="text-[8px]/[10px]">mmHg</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    HR
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="mb-2 py-1 pl-2 pr-10 text-xs"
                      {...register("o.hr", { valueAsNumber: true })}
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("o.hr", 0);
                        +e.target.value > 300 && setValue("o.hr", 300);
                      }}
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">x/mnt</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Temp
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="mb-2 py-1 pl-2 pr-5 text-xs"
                      {...register("o.temp", { valueAsNumber: true })}
                      min={30}
                      onWheel={(e) => e.currentTarget.blur()}
                      onBlurCapture={(e) => {
                        !!e.target.value &&
                          +e.target.value < 30 &&
                          setValue("o.temp", 30);
                      }}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 45 && setValue("o.temp", 45);
                      }}
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">&deg;C</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    RR
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="mb-2 py-1 pl-2 pr-10 text-xs"
                      {...register("o.rr", { valueAsNumber: true })}
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("o.rr", 0);
                        +e.target.value > 40 && setValue("o.rr", 40);
                      }}
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">x/mnt</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    SpO<sub>2</sub>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="mb-2 py-1 pl-2 pr-4 text-xs"
                      {...register("o.oksigen", { valueAsNumber: true })}
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("o.oksigen", 0);
                        +e.target.value > 100 && setValue("o.oksigen", 100);
                      }}
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    BB
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="mb-2 py-1 pl-2 pr-5 text-xs"
                      {...register("o.bb", { valueAsNumber: true })}
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("o.bb", 0);
                      }}
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Kepala", name: "kepala" },
                { label: "Leher", name: "leher" },
                { label: "Thorak", name: "thorak" },
                { label: "Abdomen", name: "abdomen" },
                { label: "Ekstremitas", name: "ekstremitas" },
              ].map((val, idx) => (
                <div key={idx}>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    {val.label}
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    //   {...register(`${val.name}`)}
                  />
                </div>
              ))}
            </div>
            <div className="flex w-3/4 flex-col gap-2">
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Lokalis
              </label>
              <div className="grid grid-cols-2 text-base">
                <div className="overflow-hidden rounded bg-slate-100">
                  <ImageMarker
                    src={anatomiUmum}
                    markers={statusLok}
                    onAddMarker={(marker) => addMarker(marker)}
                  />
                </div>
                <div className="px-3 text-xs">
                  <p className="text-sm dark:text-neutral-50">Catatan</p>
                  <table className="mb-2 mt-2 w-full border border-gray-400 bg-slate-100">
                    <tbody>
                      {statusLok?.map((val, idx) =>
                        val.catatan !== undefined ? (
                          <tr
                            className="border-b border-b-gray-400 text-left"
                            key={idx}
                          >
                            <td className="w-10 border-r border-r-gray-400 px-2 py-1">
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => editCatatan(idx)}
                                >
                                  <TbEdit
                                    size="1rem"
                                    className="text-blue-600"
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => delMarker(idx)}
                                >
                                  <TbTrash
                                    size="1rem"
                                    className="text-amber-600"
                                  />
                                </button>
                              </div>
                            </td>
                            <td className="w-5 px-2 py-1 dark:text-neutral-50">
                              {idx + 1 + "."}
                            </td>
                            <td className="border-r border-r-gray-400 px-2 py-1 dark:text-neutral-50">
                              {val.catatan}
                            </td>
                          </tr>
                        ) : null
                      )}
                    </tbody>
                  </table>
                  <Transition
                    show={showCatatan}
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="dark:text-neutral-50">
                        Catatan untuk No. {idCatatan}
                      </span>
                      <InputArea
                        className="px-2 py-1 text-xs"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          className="px-2.5 py-1 text-xs"
                          color="cyan"
                          onClick={addCatatan}
                        >
                          Simpan
                        </Button>
                        <Button
                          className="px-2.5 py-1 text-xs"
                          color="red"
                          onClick={() => {
                            !isEditCatatan && delMarker(statusLok.length - 1);
                            setIdCatatan(undefined);
                            setCatatan("");
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          // const cek = await trigger("o");
          // cek && setTabIdx(2);
          panelDivRef.current?.scrollTo(0, 0);
          setTabIdx(2);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

const Asesmen = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const { register, trigger, setValue, watch } = useFormContext<TAsesmenDok>();

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const diagnosis = watch("a.diagnosis");
  const [diagText, setDiagText] = useState<string>("");
  const [selIcd10, setSelIcd10] = useState<MyOption | null>(null);
  const loadIcd10 = async (inputText: string): Promise<MyOptions> => {
    if (inputText.length < 2) return [];
    try {
      const url = new URL(`${APIURL}/rs/icd/10`);
      const params = {
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: any) => ({
        value: data?.id,
        label: data?.id + " - " + data?.deskripsi,
      }));
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  const addDiagnosis = () => {
    if (!diagText && !selIcd10)
      return toast.warning("Isi diagnosis terlebih dahulu!");
    const newDiag = diagnosis;
    newDiag.push({ diagnosis: diagText, icd10: selIcd10?.label! });
    setValue("a.diagnosis", [...newDiag]);
    setDiagText("");
    setSelIcd10(null);
  };
  const delDiagnosis = (id: number) => {
    setValue(
      "a.diagnosis",
      diagnosis.filter((_, i) => id !== i)
    );
  };

  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis/Masalah Medis
          </div>
          <div className="h-[calc(100%-32px)] items-center rounded-b bg-slate-200 px-2 pb-4 text-left text-xs shadow-md dark:bg-gray-800">
            <small className="text-sky-700 dark:text-sky-400">
              Catatan: Klik (+) untuk menambah item
            </small>
            <div className="flex">
              <div className="grid w-full grid-cols-2 justify-center gap-2">
                <InputArea
                  className="px-2 py-1 text-xs"
                  placeholder="Diagnosis/Masalah Medis"
                  value={diagText}
                  onChange={(e) => setDiagText(e.target.value)}
                />
                <AsyncSelectInput
                  loadOptions={loadIcd10}
                  placeholder="Pilih ICD 10"
                  value={selIcd10}
                  onChange={(option: MyOption | null) => setSelIcd10(option)}
                />
              </div>
              <button type="button" className="px-2" onClick={addDiagnosis}>
                <RiAddCircleLine
                  size="1.5rem"
                  className="text-blue-600 dark:text-blue-400"
                />
              </button>
            </div>
            <Transition
              show={diagnosis?.length !== 0}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className={cn("mt-2 overflow-hidden rounded shadow")}>
                <table className="min-w-full">
                  <thead>
                    <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                      <td className={cn("px-4 py-2")}>Diagnosis</td>
                      <td className={cn("px-4 py-2")}>ICD 10</td>
                      <td className={cn("px-4 py-2")}>*</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {diagnosis?.map((diag, idx) => (
                      <tr
                        className="bg-white hover:text-sky-600 dark:bg-slate-900"
                        key={idx}
                      >
                        <td className="whitespace-pre-wrap px-4 py-2">
                          {diag.diagnosis}
                        </td>
                        <td className="whitespace-pre-wrap px-4 py-2">
                          {diag.icd10}
                        </td>
                        <td className="text-center">
                          <RiDeleteBin5Line
                            className="inline text-amber-500 hover:cursor-pointer"
                            size="1.2rem"
                            onClick={() => delDiagnosis(idx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          // const cek = await trigger("a");
          // cek && setTabIdx(3);
          panelDivRef.current?.scrollTo(0, 0);
          setTabIdx(3);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

const PlanningTarget = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const { register, trigger } = useFormContext<TAsesmenDok>();
  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Planning & Target
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 pb-4 text-xs shadow-md dark:bg-gray-800">
            <div className="flex justify-center gap-2">
              <InputArea
                className="mb-2 px-2 py-1 text-xs"
                placeholder="Rencana Asuhan"
                {...register("p.rencana_asuhan")}
              />
              <InputArea
                className="mb-2 px-2 py-1 text-xs"
                placeholder="Target"
                {...register("t.target")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          // const cek = await trigger("p");
          // cek && setTabIdx(4);
          panelDivRef.current?.scrollTo(0, 0);
          setTabIdx(4);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

const Instruksi = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const { register, trigger, setValue, watch } = useFormContext<TAsesmenDok>();

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const tindakan = watch("i.tindakan");
  const [tindakText, setTindakText] = useState<string>("");
  const [selIcd9, setSelIcd9] = useState<MyOption | null>(null);
  const loadIcd9 = async (inputText: string): Promise<MyOptions> => {
    if (inputText.length < 2) return [];
    try {
      const url = new URL(`${APIURL}/rs/icd/9`);
      const params = {
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: any) => ({
        value: data?.id,
        label: data?.id + " - " + data?.deskripsi_panjang,
      }));
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  const addTindakan = () => {
    if (!tindakText && !selIcd9)
      return toast.warning("Isi tindakan terlebih dahulu!");
    const newDiag = tindakan;
    newDiag.push({ tindakan: tindakText, icd9: selIcd9?.label! });
    setValue("i.tindakan", [...newDiag]);
    setTindakText("");
    setSelIcd9(null);
  };
  const delTindakan = (id: number) => {
    setValue(
      "i.tindakan",
      tindakan.filter((_, i) => id !== i)
    );
  };

  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Instruksi
          </div>
          <div className="h-[calc(100%-32px)] items-center rounded-b bg-slate-200 px-2 pb-4 text-left text-xs shadow-md dark:bg-gray-800">
            <small className="text-sky-700 dark:text-sky-400">
              Catatan: Klik (+) untuk menambah item
            </small>
            <div className="flex">
              <div className="grid w-full grid-cols-2 justify-center gap-2">
                <InputArea
                  className="px-2 py-1 text-xs"
                  placeholder="Tindakan"
                  value={tindakText}
                  onChange={(e) => setTindakText(e.target.value)}
                />
                <AsyncSelectInput
                  loadOptions={loadIcd9}
                  placeholder="Pilih ICD 9"
                  value={selIcd9}
                  onChange={(option: MyOption | null) => setSelIcd9(option)}
                />
              </div>
              <button type="button" className="px-2" onClick={addTindakan}>
                <RiAddCircleLine
                  size="1.5rem"
                  className="text-blue-600 dark:text-blue-400"
                />
              </button>
            </div>
            <Transition
              show={tindakan?.length !== 0}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className={cn("mt-2 overflow-hidden rounded shadow")}>
                <table className="min-w-full">
                  <thead>
                    <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                      <td className={cn("px-4 py-2")}>Tindakan</td>
                      <td className={cn("px-4 py-2")}>ICD 9</td>
                      <td className={cn("px-4 py-2")}>*</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tindakan?.map((tindak, idx) => (
                      <tr
                        className="bg-white hover:text-sky-600 dark:bg-slate-900"
                        key={idx}
                      >
                        <td className="whitespace-pre-wrap px-4 py-2">
                          {tindak.tindakan}
                        </td>
                        <td className="whitespace-pre-wrap px-4 py-2">
                          {tindak.icd9}
                        </td>
                        <td className="text-center">
                          <RiDeleteBin5Line
                            className="inline text-amber-500 hover:cursor-pointer"
                            size="1.2rem"
                            onClick={() => delTindakan(idx)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <Button type="submit">Simpan</Button>
    </>
  );
};
