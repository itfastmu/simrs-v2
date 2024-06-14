import { Barang, KFAPOA, OptionBarang } from "@/app/(farmasi)/schema";
import { ICD9 } from "@/app/(referensi)/list-icd/page";
import { Button } from "@/components/button";
import { Input, InputArea, LabelButton } from "@/components/form";
import ImageMarker, { Marker } from "@/components/image-marker";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import { StaticImageData } from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Fragment,
  Suspense,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaFileMedical } from "react-icons/fa6";
import { GiPestleMortar } from "react-icons/gi";
import {
  RiAddCircleLine,
  RiBodyScanFill,
  RiCheckLine,
  RiDeleteBin5Line,
  RiFlaskFill,
} from "react-icons/ri";
import { TbEdit, TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { HasilSkrining } from "../../_components/skrining-perawat";
import {
  KlinikAsesmen,
  RacikAction,
  RacikState,
  TAsesmenDok,
  THasilDokter,
  THasilPerawat,
  listPenyakit,
} from "../../schema";
import {
  PermintLabDialog,
  PermintRadDialog,
  tempPermintaan,
} from "./permintaan-penunjang";
import { RacikanDialog, ResepDokter } from "./resep-dokter";

export const SubjektifDr = ({
  lainRiwayat,
  lainRiwayatKel,
  setLainRiwayat,
  setLainRiwayatKel,
  klinik,
  setTabIdx,
  panelDivRef,
}: {
  lainRiwayat: string;
  lainRiwayatKel: string;
  setLainRiwayat: React.Dispatch<React.SetStateAction<string>>;
  setLainRiwayatKel: React.Dispatch<React.SetStateAction<string>>;
  klinik: KlinikAsesmen;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();
  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <HasilSkrining />
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Anamnesis
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative w-6/12",
                errors.anamnesis?.keluhan &&
                  "rounded-lg bg-red-300 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                Keluhan Utama
              </label>
              {errors.anamnesis?.keluhan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.anamnesis.keluhan.message}
                </p>
              ) : null}
              <InputArea
                className="-mb-1.5 px-2 py-1 text-xs"
                {...register("anamnesis.keluhan")}
              />
            </div>
            {/* BUKAN ORT */}
            {!klinik.isOrt ? (
              <>
                <div className="w-6/12">
                  <label className="font-semibold dark:text-neutral-200">
                    Riwayat Penyakit Sekarang
                  </label>
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    {...register("anamnesis.penyakit")}
                  />
                </div>
                <div className="flex w-6/12 flex-col">
                  <label className="font-semibold dark:text-neutral-200">
                    Riwayat Penyakit Dahulu
                  </label>
                  <div className="mb-2">
                    {listPenyakit.map((val, idx) => (
                      <LabelButton
                        type="checkbox"
                        id={"riw-pnykt-dah-" + (idx + 1)}
                        value={val}
                        key={idx}
                        {...register("anamnesis.riwayat")}
                      >
                        {val}
                      </LabelButton>
                    ))}
                  </div>
                  <Input
                    className="px-2 py-1 text-xs"
                    placeholder="Lainnya..."
                    value={lainRiwayat}
                    onChange={(e) => setLainRiwayat(e.target.value)}
                    /* COBA INPUT JADI ARRAY INDEX TERAKHIR */
                    // value={
                    //   watch("anamnesis.riwayat")[
                    //     watch("anamnesis.riwayat").length - 1
                    //   ] || ""
                    // }
                    // onChange={(e) => {
                    //   const newArray = [...watch("anamnesis.riwayat")];
                    //   newArray[newArray.length - 1] = e.target.value;

                    //   // Check if the last element is non-empty before pushing a new one
                    //   if (e.target.value.trim() !== "") {
                    //     newArray.push("");
                    //   }

                    //   setValue("anamnesis.riwayat", newArray);
                    // }}
                  />
                </div>
                <div className="w-6/12">
                  <label className="font-semibold dark:text-neutral-200">
                    Riwayat Penyakit Keluarga
                  </label>
                  <div className="mb-2">
                    {listPenyakit.map((val, idx) => (
                      <LabelButton
                        type="checkbox"
                        id={"riw-pnykt-kel-" + (idx + 1)}
                        value={val}
                        key={idx}
                        {...register("anamnesis.riwayat_keluarga")}
                      >
                        {val}
                      </LabelButton>
                    ))}
                  </div>
                  <Input
                    className="px-2 py-1 text-xs"
                    placeholder="Lainnya..."
                    value={lainRiwayatKel}
                    onChange={(e) => setLainRiwayatKel(e.target.value)}
                  />
                </div>
                {klinik.isJiwa ? (
                  <div className="w-6/12">
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Riwayat Penggunaan obat-obatan dan NAPZA
                    </label>
                    <InputArea
                      className="px-2 py-1 text-xs"
                    {...register("jiwa.napza")}
                    />
                  </div>
                ) : null}
                <div className="w-6/12">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Riwayat Alergi
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register("anamnesis.alergi")}
                  />
                </div>
                {klinik.isAnak ? (
                  <div className="w-6/12">
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Keterangan Imunisasi
                    </label>
                    <InputArea
                      className="px-2 py-1 text-xs"
                      {...register("anamnesis.imunisasi")}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                {/* ORT */}
                <div className="w-6/12">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Mekanisme Injury
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    {...register("orto.injury")}
                  />
                </div>
                <div className="w-6/12">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Waktu Kejadian
                  </label>
                  <Input
                    type="date"
                    className="px-2 py-1 text-xs"
                    {...register("orto.waktu")}
                  />
                </div>
                <div className="w-6/12">
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Riwayat Penanganan Sebelumnya
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    {...register("orto.penanganan")}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek = await trigger("anamnesis");
          console.log(cek);
          // console.log(errors);

          cek && setTabIdx(1);
          // setTabIdx(1);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const ObjektifDr = ({
  hasilPerawat,
  isUpdate,
  klinik,
  statusLokSrc,
  setTabIdx,
  panelDivRef,
}: {
  hasilPerawat: THasilPerawat | undefined;
  isUpdate?: boolean;
  klinik: KlinikAsesmen;
  statusLokSrc: StaticImageData;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const searchParams = useSearchParams();
  const proses = parseInt(searchParams.get("proses")!);
  useEffect(() => {
    if (proses > 3) {
      if (hasilPerawat) {
        setValue("fisik.gcs", hasilPerawat.fisik.gcs);
        setValue("fisik.keadaan", hasilPerawat.fisik.keadaan);
        setValue("fisik.td", hasilPerawat.fisik.td);
        setValue("fisik.hr", hasilPerawat.fisik.hr);
        setValue("fisik.temp", hasilPerawat.fisik.temp);
        setValue("fisik.rr", hasilPerawat.fisik.rr);
        setValue("fisik.saturasi", hasilPerawat.fisik.saturasi || NaN);
        setValue("fisik.bb", hasilPerawat.fisik.bb);
        setValue("fisik.tb", hasilPerawat.fisik.tb);
        setValue("fisik.tambahan", hasilPerawat.fisik.tambahan || "");
      }
    } else {
      unregister("fisik");
    }
    // else { setUbahFisik(true); }
  }, [hasilPerawat]);
  const [ubahFisik, setUbahFisik] = useState<boolean>(false);

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

  const {
    register,
    unregister,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<TAsesmenDok>();

  const [kesadaran, setKesadaran] = useState("");
  const handleKesadaran = () => {
    const gcs = watch("fisik.gcs")?.reduce((acc, val) => acc + val, 0);
    if (!gcs) return;
    switch (true) {
      case gcs >= 14:
        setKesadaran(listKesadaran.at(0)!);
        break;
      case gcs >= 12:
        setKesadaran(listKesadaran.at(1)!);
        break;
      case gcs >= 10:
        setKesadaran(listKesadaran.at(2)!);
        break;
      case gcs >= 7:
        setKesadaran(listKesadaran.at(3)!);
        break;
      case gcs >= 4:
        setKesadaran(listKesadaran.at(4)!);
        break;
      case gcs === 3:
        setKesadaran(listKesadaran.at(5)!);
        break;
    }
  };
  useEffect(() => {
    handleKesadaran();
  }, [watch("fisik.gcs.0"), watch("fisik.gcs.1"), watch("fisik.gcs.2")]);

  const [listPemeriksaanGeneral] = useState<
    {
      label: string;
      name:
        | "orto.kepala"
        | "orto.leher"
        | "orto.thorak"
        | "orto.abdomen"
        | "orto.ekstremitas";
    }[]
  >([
    { label: "Kepala", name: "orto.kepala" },
    { label: "Leher", name: "orto.leher" },
    { label: "Thorak", name: "orto.thorak" },
    { label: "Abdomen", name: "orto.abdomen" },
    { label: "Ekstremitas", name: "orto.ekstremitas" },
  ]);

  const statusLok = watch("status_lokalis") || [];
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
      setValue("status_lokalis", [...newMarkers, marker]);
    } else {
      setValue("status_lokalis", [...statusLok, marker]);
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
    setValue("status_lokalis", [...newMarkers]);
    setIdCatatan(undefined);
    setCatatan("");
  };
  const delMarker = (id: number) => {
    if (isUpdate) {
      if (watch("status_lokalis")?.find((_, i) => i === id)?.id) {
        setValue("deleted.status_lokalis", [
          ...(watch("deleted.status_lokalis") || []),
          watch("status_lokalis")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    setValue(
      "status_lokalis",
      statusLok.filter((_, i) => id !== i)
    );
  };
  const editCatatan = (id: number) => {
    setIsEditCatatan(true);
    setIdCatatan(id + 1);
    setCatatan(statusLok[id].catatan);
  };

  return (
    <Suspense>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Fisik dan Penunjang
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative m-2 flex w-3/4 flex-wrap rounded-md border border-gray-300 bg-slate-100 px-3 py-3 dark:bg-gray-700",
                ubahFisik && "hidden"
              )}
            >
              <Button
                color="slatesky"
                className="absolute right-1 top-1 py-1 text-xs"
                onClick={() => setUbahFisik(true)}
              >
                Ubah
              </Button>
              <div className={cn("w-6/12")}>
                <table>
                  <tbody>
                    <tr className="text-left text-xs">
                      <td className={`w-32`}>Keadaan Umum</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.keadaan")}</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">TD</td>
                      <td className="">:</td>
                      <td className="">
                        {watch("fisik.td")?.every((val) => val !== 0 || !!val)
                          ? (watch("fisik.td.0") || "-") +
                            "/" +
                            (watch("fisik.td.1") || "-")
                          : "-"}{" "}
                        mmHg
                      </td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">Temp</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.temp")} &deg;C</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">Kesadaran</td>
                      <td className="">:</td>
                      <td className="">{kesadaran || "-"}</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">GCS</td>
                      <td className="">:</td>
                      <td className="">
                        <span className="text-sky-800 dark:text-sky-300">
                          E
                        </span>{" "}
                        = {watch("fisik.gcs.0") || "-"},
                        <span className="text-sky-800 dark:text-sky-300">
                          {" "}
                          M
                        </span>{" "}
                        = {watch("fisik.gcs.1") || "-"},
                        <span className="text-sky-800 dark:text-sky-300">
                          {" "}
                          V
                        </span>{" "}
                        = {watch("fisik.gcs.2") || "-"}
                      </td>
                    </tr>
                    {klinik.isMata ? (
                      <>
                        <tr className="text-left text-xs">
                          <td className="">Kaca Mata Lama</td>
                          <td className="">:</td>
                          <td className="">
                            OD {hasilPerawat?.fisik?.mata?.lama?.at(0) || "-"}
                          </td>
                        </tr>
                        <tr className="text-left text-xs">
                          <td colSpan={2}>&nbsp;</td>
                          <td className="">
                            OS {hasilPerawat?.fisik?.mata?.lama?.at(1) || "-"}
                          </td>
                        </tr>
                      </>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="w-6/12">
                <table>
                  <tbody>
                    <tr className="text-left text-xs">
                      <td className="">HR</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.hr") || "-"} x/mnt</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">RR</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.rr") || "-"} x/mnt</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">SpO2</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.saturasi") || "-"} %</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">TB</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.tb") || "-"} cm</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">BB</td>
                      <td className="">:</td>
                      <td className="">{watch("fisik.bb") || "-"} kg</td>
                    </tr>
                    {klinik.isMata ? (
                      <>
                        <tr className="text-left text-xs">
                          <td className="">Visus</td>
                          <td className="">:</td>
                          <td className="">
                            OD {hasilPerawat?.fisik?.mata?.visus?.at(0) || "-"}
                          </td>
                        </tr>
                        <tr className="text-left text-xs">
                          <td colSpan={2}>&nbsp;</td>
                          <td className="">
                            OS {hasilPerawat?.fisik?.mata?.visus?.at(1) || "-"}
                          </td>
                        </tr>
                      </>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <table>
                <tbody>
                  <tr className="text-left text-xs">
                    <td className={cn("flex", "w-32")}>Lainnya</td>
                    <td className={`align-baseline`}>:</td>
                    <td className="">{watch("fisik.tambahan") || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {ubahFisik ? (
              <Transition
                show={true}
                appear
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="p-2 text-xs">
                  <div className="mb-1 grid grid-cols-5">
                    <div
                      className={cn(
                        errors?.fisik?.gcs &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        GCS
                      </label>
                      {errors?.fisik?.gcs ? (
                        <p className="absolute right-1 top-0 text-[10px]/[14px] text-red-900 dark:text-red-200">
                          harus diisi
                        </p>
                      ) : null}
                      <div className="grid grid-cols-3 gap-1">
                        <Controller
                          control={control}
                          name="fisik.gcs.0"
                          render={({ field: { onChange, value } }) => (
                            <div className="relative">
                              <SelectInput
                                noOptionsMessage={(e) => "Tidak ada pilihan"}
                                size="sm"
                                menuPlacement="top"
                                options={listGcs.e}
                                withSpan
                                placeholder=""
                                onChange={(val: any) => onChange(val.value)}
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
                          name="fisik.gcs.1"
                          render={({ field: { onChange, value } }) => (
                            <div className="relative">
                              <SelectInput
                                noOptionsMessage={(e) => "Tidak ada pilihan"}
                                size="sm"
                                menuPlacement="top"
                                options={listGcs.m}
                                withSpan
                                placeholder=""
                                onChange={(val: any) => onChange(val.value)}
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
                          name="fisik.gcs.2"
                          render={({ field: { onChange, value } }) => (
                            <div className="relative">
                              <SelectInput
                                noOptionsMessage={(e) => "Tidak ada pilihan"}
                                size="sm"
                                menuPlacement="top"
                                options={listGcs.v}
                                withSpan
                                placeholder=""
                                onChange={(val: any) => onChange(val.value)}
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
                            checked={val === kesadaran}
                            onChange={() => setKesadaran(val)}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "col-span-2",
                        errors?.fisik?.keadaan &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        Keadaan Umum
                      </label>
                      {errors?.fisik?.keadaan ? (
                        <p className="absolute right-1 top-0 text-[10px]/[14px] text-red-900 dark:text-red-200">
                          {errors.fisik.keadaan.message}
                        </p>
                      ) : null}
                      <div className="mb-2">
                        {listKeadaan.map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"keadaan-" + (idx + 1)}
                            value={val}
                            key={idx}
                            {...register("fisik.keadaan")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    <div
                      className={cn(
                        "col-span-2",
                        errors?.fisik?.td &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        TD
                      </label>
                      {errors?.fisik?.td ? (
                        <p className="absolute right-1 top-0 text-[10px]/[14px] text-red-900 dark:text-red-200">
                          harus diisi
                        </p>
                      ) : null}
                      <div className="relative flex items-center justify-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            className="py-1 pl-2 pr-9 text-xs"
                            placeholder="SYS"
                            {...register("fisik.td.0", {
                              valueAsNumber: true,
                            })}
                            min={50}
                            step={5}
                            onWheel={(e) => e.currentTarget.blur()}
                            onInput={(
                              e: React.FocusEvent<HTMLInputElement, Element>
                            ) => {
                              +e.target.value > 250 &&
                                setValue("fisik.td.0", 250);
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
                            {...register("fisik.td.1", {
                              valueAsNumber: true,
                            })}
                            min={10}
                            step={5}
                            onWheel={(e) => e.currentTarget.blur()}
                            onInput={(
                              e: React.FocusEvent<HTMLInputElement, Element>
                            ) => {
                              +e.target.value > 180 &&
                                setValue("fisik.td.1", 180);
                            }}
                          />
                          <div className="absolute inset-y-0 right-2 top-[5px]">
                            <span className="text-[8px]/[10px]">mmHg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors?.fisik?.hr &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        HR
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-10 text-xs"
                          {...register("fisik.hr", { valueAsNumber: true })}
                          min={20}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value > 300 && setValue("fisik.hr", 300);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">x/mnt</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors?.fisik?.temp &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        Temp
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-5 text-xs"
                          {...register("fisik.temp", { valueAsNumber: true })}
                          min={30}
                          step={"Any"}
                          onWheel={(e) => e.currentTarget.blur()}
                          onBlurCapture={(e) => {
                            !!e.target.value &&
                              +e.target.value < 30 &&
                              setValue("fisik.temp", 30);
                          }}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value > 45 && setValue("fisik.temp", 45);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">&deg;C</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors?.fisik?.rr &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        RR
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-10 text-xs"
                          {...register("fisik.rr", { valueAsNumber: true })}
                          min={10}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("fisik.rr", 0);
                            +e.target.value > 40 && setValue("fisik.rr", 40);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">x/mnt</span>
                        </div>
                      </div>
                    </div>
                    <div
                    /* className={cn(
                  errors?.fisik?.saturasi &&
                    "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                )} */
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        SpO<sub>2</sub>
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-4 text-xs"
                          {...register("fisik.saturasi", {
                            valueAsNumber: true,
                          })}
                          min={50}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value > 100 &&
                              setValue("fisik.saturasi", 100);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">%</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors?.fisik?.bb &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        BB
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-5 text-xs"
                          {...register("fisik.bb", { valueAsNumber: true })}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("fisik.bb", 0);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">kg</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors?.fisik?.tb &&
                          "relative rounded-lg bg-red-300 dark:bg-red-500/50"
                      )}
                    >
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        TB
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          className="mb-2 py-1 pl-2 pr-6 text-xs"
                          {...register("fisik.tb", { valueAsNumber: true })}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("fisik.tb", 0);
                          }}
                        />
                        <div className="absolute inset-y-0 right-2 top-[5px]">
                          <span className="text-[11px]/[12px]">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <div>
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        Pemeriksaan Lainnya
                      </label>
                      <InputArea
                        className="mb-2 px-2 py-1 text-xs"
                        placeholder="(Pemeriksaan Fisik Lain, Pemeriksaan Penunjang, ...)"
                        {...register("fisik.tambahan")}
                      />
                    </div>
                    {klinik.isMata ? (
                      <div className="grid w-full grid-cols-2 gap-2">
                        <div className={cn("relative")}>
                          <label className="py-2 font-semibold dark:text-neutral-200">
                            Kacamata Lama
                          </label>
                          <div className="flex flex-col gap-1">
                            <div className="relative">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                OD
                              </div>
                              <Input
                                className="px-2 py-1 pl-8 text-xs"
                                {...register("fisik.mata.lama.0")}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                OS
                              </div>
                              <Input
                                className="px-2 py-1 pl-8 text-xs"
                                {...register("fisik.mata.lama.1")}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={cn("relative")}>
                          <label className="py-2 font-semibold dark:text-neutral-200">
                            Visus/Koreksi/Baca
                          </label>
                          <div className="flex flex-col gap-1">
                            <div className="relative">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                OD
                              </div>
                              <Input
                                className="px-2 py-1 pl-8 text-xs"
                                {...register("fisik.mata.visus.0")}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                OS
                              </div>
                              <Input
                                className="px-2 py-1 pl-8 text-xs"
                                {...register("fisik.mata.visus.1")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Transition>
            ) : null}
            {klinik.isOrt ? (
              <div className="grid grid-cols-3 gap-3">
                {listPemeriksaanGeneral.map((val, idx) => (
                  <div key={idx}>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      {val.label}
                    </label>
                    <InputArea
                      className="px-2 py-1 text-xs"
                      {...register(val.name)}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex w-3/4 flex-col gap-2">
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Lokalis
              </label>
              <div
                className={cn(
                  klinik.isGigi
                    ? "flex flex-col gap-2 text-base"
                    : "grid grid-cols-2 text-base"
                )}
              >
                <div className="overflow-hidden rounded bg-slate-100">
                  <ImageMarker
                    className="cursor-copy"
                    src={statusLokSrc}
                    markers={statusLok}
                    onAddMarker={(marker) => addMarker(marker)}
                  />
                </div>
                <div className="px-3 text-xs">
                  <p className="text-sm dark:text-neutral-50">Catatan</p>
                  <table className="mb-2 mt-2 w-full border border-gray-400 bg-slate-100 dark:bg-gray-700">
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
            {klinik.isMata ? (
              <div className="flex w-3/4">
                <div className="grid basis-full grid-cols-3 gap-2">
                  <div className={cn("relative")}>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Funduskopi
                    </label>
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OD
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.funduskopi.0")}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OS
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.funduskopi.1")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={cn("relative")}>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Tonometri
                    </label>
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OD
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.tonometri.0")}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OS
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.tonometri.1")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={cn("relative")}>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Anel/Sistem Lakrimal
                    </label>
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OD
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.anel.0")}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          OS
                        </div>
                        <Input
                          className="px-2 py-1 pl-8 text-xs"
                          {...register("mata.anel.1")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          // const cek = await trigger("o");
          // cek && setTabIdx(2);
          setTabIdx(2);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </Suspense>
  );
};

export const AsesmenDr = ({
  tabIdx,
  setTabIdx,
  panelDivRef,
  isUpdate,
}: {
  tabIdx: number;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
  isUpdate: boolean;
}) => {
  const {
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const diagnosis = watch("diagnosis") || [];
  const [diagText, setDiagText] = useState<string>("");
  const [icd10Options, setIcd10Options] = useState<MyOptions>([]);
  const [selIcd10, setSelIcd10] = useState<MyOption | null>(null);
  const loadIcd10 = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/icd/10`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: any) => ({
        value: data?.id,
        label: data?.id + " - " + data?.deskripsi,
      }));
      setIcd10Options(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  useEffect(() => {
    loadIcd10("");
  }, []);
  const addDiagnosis = () => {
    if (!diagText && !selIcd10)
      return toast.warning("Isi diagnosis terlebih dahulu!");
    const newDiag = diagnosis;
    newDiag.push({
      diagnosis: diagText,
      icd10: selIcd10
        ? { id: selIcd10?.value as string, nama: selIcd10?.label! }
        : undefined,
      primer: diagnosis.length === 0,
    });
    setValue("diagnosis", [...newDiag]);
    setDiagText("");
    setSelIcd10(null);
    trigger("diagnosis");
  };
  const primerDiagnosis = (id: number) => {
    diagnosis.forEach((_, index) => {
      diagnosis[index].primer = false;
    });
    diagnosis[id].primer = true;
    setValue("diagnosis", [...diagnosis]);
  };
  const delDiagnosis = (id: number) => {
    if (isUpdate) {
      if (watch("diagnosis")?.find((_, i) => i === id)?.id) {
        setValue("deleted.diagnosis", [
          ...(watch("deleted.diagnosis") || []),
          watch("diagnosis")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    if (diagnosis.length > 1 && diagnosis[id].primer) {
      diagnosis[id - 1].primer = true;
    }
    setValue(
      "diagnosis",
      diagnosis?.filter((_, i) => id !== i)
    );
    trigger("diagnosis");
  };

  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis/Masalah Medis
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center rounded-b bg-slate-200 p-2 pb-4 text-left text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative w-full",
                errors.diagnosis && "rounded-lg bg-red-300 dark:bg-red-500/50"
              )}
            >
              <small className="text-sky-700 dark:text-sky-400">
                Catatan: Klik (+) untuk menambah item
              </small>
              {errors.diagnosis ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  harus diisi
                </p>
              ) : null}
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
                    defaultOptions={icd10Options}
                    placeholder="Pilih ICD 10"
                    value={selIcd10}
                    onChange={(option: MyOption | null) => setSelIcd10(option)}
                    maxMenuHeight={200}
                  />
                </div>
                <button type="button" className="mx-2" onClick={addDiagnosis}>
                  <RiAddCircleLine
                    size="1.5rem"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </button>
              </div>
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
              <div className={cn("mt-2 w-full overflow-hidden rounded shadow")}>
                <table className="min-w-full">
                  <thead>
                    <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                      <td className={cn("px-4 py-2")}>Diagnosis</td>
                      <td className={cn("px-4 py-2")}>ICD 10</td>
                      <td className={cn("px-4 py-2")}>Primer</td>
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
                          {diag?.icd10?.nama}
                        </td>
                        <td className="whitespace-pre-wrap px-4 py-2">
                          <input
                            type="checkbox"
                            checked={diag.primer}
                            onChange={() => primerDiagnosis(idx)}
                            className="accent-slate-500"
                          />
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
          const cek = await trigger("diagnosis");
          if (cek) {
            setTabIdx(3);
            panelDivRef.current?.scrollTo(0, 0);
          }
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const PlanningTargetDr = ({
  setTabIdx,
  panelDivRef,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();
  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Planning & Target
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 pb-4 text-xs shadow-md dark:bg-gray-800">
            <div className="flex justify-center gap-2">
              <div
                className={cn(
                  "relative w-full",
                  errors.asuhan &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label htmlFor="rencana_asuhan">Rencana Asuhan</label>
                {errors.asuhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    harus diisi
                  </p>
                ) : null}
                <InputArea
                  className="-mb-1 px-2 py-1 text-xs"
                  id="rencana_asuhan"
                  rows={3}
                  placeholder="(Tuliskan pokok rencana asuhan yang akan diberikan. Misal: Pengobatan rawat jalan, rawat inap, tindakan, dsb.)"
                  {...register("asuhan")}
                />
              </div>
              <div
                className={cn(
                  "relative w-full",
                  errors.target &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label htmlFor="target">Target</label>
                {errors.target ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    harus diisi
                  </p>
                ) : null}
                <InputArea
                  className="-mb-1 px-2 py-1 text-xs"
                  id="target"
                  rows={3}
                  placeholder="(Tuliskan target objektif dari rencana asuhan. Misal: TD Sistolik < 140mmHg, atau sesak berkurang, atau GDS < 200mg/dL)"
                  {...register("target")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek1 = await trigger("asuhan");
          const cek2 = await trigger("target");
          if (cek1 && cek2) {
            setTabIdx(4);
            panelDivRef.current?.scrollTo(0, 0);
          }
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const InstruksiDr = ({
  hasilDokter,
  klinik,
  isLoading,
  isUpdate,
}: {
  hasilDokter?: THasilDokter;
  klinik: KlinikAsesmen;
  isLoading: boolean;
  isUpdate: boolean;
}) => {
  const urlParams = useSearchParams();
  const {
    trigger,
    setValue,
    watch,
    register,
    control,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const tindakan = watch("tindakan") || [];
  const [tindakText, setTindakText] = useState<string>("");
  const [icd9Options, setIcd9Options] = useState<MyOptions>([]);
  const [selIcd9, setSelIcd9] = useState<MyOption | null>(null);
  const loadIcd9 = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/icd/9`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: ICD9) => ({
        value: data?.id,
        label: data?.id + " - " + data?.deskripsi_panjang,
      }));
      setIcd9Options(options);
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
    newDiag.push({
      tindakan: tindakText,
      icd9: selIcd9
        ? { id: selIcd9?.value as string, nama: selIcd9?.label! }
        : undefined,
    });
    setValue("tindakan", [...newDiag]);
    setTindakText("");
    setSelIcd9(null);
    trigger("tindakan");
  };
  const delTindakan = (id: number) => {
    if (isUpdate) {
      if (watch("tindakan")?.find((_, i) => i === id)?.id) {
        setValue("deleted.tindakan", [
          ...(watch("deleted.tindakan") || []),
          watch("tindakan")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    setValue(
      "tindakan",
      tindakan.filter((_, i) => id !== i)
    );
    trigger("tindakan");
  };

  const laborat = watch("laborat");
  const [permintLabDialog, setPermintLabDialog] = useState<boolean>(false);
  const [ajukanLab, setAjukanLab] = useState<boolean>(false);
  const [listPermintaanLab, setListPermintaanLab] = useState<tempPermintaan[]>(
    []
  );

  const radiologi = watch("radiologi");
  const [permintRadDialog, setPermintRadDialog] = useState<boolean>(false);
  const [ajukanRad, setAjukanRad] = useState<boolean>(false);
  const [listPermintaanRad, setListPermintaanRad] = useState<tempPermintaan[]>(
    []
  );

  const [POAOptions, setPOAOptions] = useState<OptionBarang[]>([]);
  const loadPOA = async (inputText: string): Promise<OptionBarang[]> => {
    try {
      const url = new URL(`${APIURL}/rs/kfa/poa`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: KFAPOA) => ({
        value: data.id,
        label: data.nama,
        sediaan: data.nama_indo,
        numerator: data.numerator,
      }));
      setPOAOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    loadIcd9("");
    loadPOA("");
  }, []);

  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (initialized.current) return;
    if (!hasilDokter) return;
    if (hasilDokter.radiologi) {
      hasilDokter.radiologi.detail.map((val, idx) => {
        setListPermintaanRad((prev) => [
          ...prev,
          { id: val, nama: hasilDokter.radiologi?.nama_detail[idx]! },
        ]);
      });
    }
    if (hasilDokter.laborat) {
      hasilDokter.laborat.detail.map((val, idx) => {
        setListPermintaanLab((prev) => [
          ...prev,
          { id: val, nama: hasilDokter.laborat?.nama_detail[idx]! },
        ]);
      });
    }
    initialized.current = true;
  }, [hasilDokter]);

  const nonracik = watch("nonracik") || [];
  const [resepNonRacik, setResepNonRacik] = useState<boolean>(false);

  const racikan = watch("racikan") || [];
  const [resepRacik, setResepRacik] = useState<boolean>(false);

  const racikState = {
    modal: false,
  };
  const racikActs = (state: RacikState, action: RacikAction) => {
    switch (action.type) {
      case "setRacik": {
        return {
          ...action.racik,
        };
      }
    }
  };
  const [racik, racikDispatch] = useReducer(racikActs, racikState);

  const [listPrognosisORT] = useState([
    { label: "Malunion", number: 1 },
    { label: "Infection", number: 2 },
    { label: "Compartment Syndrome", number: 3 },
    { label: "Non Union", number: 4 },
    { label: "Contracture", number: 5 },
  ]);

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Instruksi
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col gap-2 rounded-b bg-slate-200 p-2 pb-4 text-left text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative w-full",
                errors.tindakan && "rounded-lg bg-red-300 dark:bg-red-500/50"
              )}
            >
              <small className="text-sky-700 dark:text-sky-400">
                Catatan: Klik (+) untuk menambah item
              </small>
              {errors.tindakan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  harus diisi
                </p>
              ) : null}
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
                    defaultOptions={icd9Options}
                    placeholder="Pilih ICD 9"
                    value={selIcd9}
                    onChange={(option: MyOption | null) => setSelIcd9(option)}
                    maxMenuHeight={200}
                  />
                </div>
                <button type="button" className="mx-2" onClick={addTindakan}>
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
                <div
                  className={cn("mt-2 w-full overflow-hidden rounded shadow")}
                >
                  <table className="min-w-full">
                    <thead>
                      <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                        <td className={cn("px-4 py-2")}>Tindakan</td>
                        <td className={cn("px-4 py-2")}>ICD 9</td>
                        <td className={cn("px-4 py-2 text-center")}>*</td>
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
                            {tindak?.icd9?.nama}
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
            <div className="grid grid-cols-2 justify-center gap-2">
              <div className="flex flex-col gap-2">
                <Button
                  className="items-center justify-center gap-2 py-1.5 text-xs"
                  color={permintLabDialog ? "sky" : "sky700"}
                  onClick={() => setPermintLabDialog(true)}
                >
                  <span>
                    <RiFlaskFill size="1rem" />
                  </span>
                  <span>Permintaan Pemeriksaan Laboratorium</span>
                  {laborat ? (
                    <span>
                      <RiCheckLine size="1rem" />
                    </span>
                  ) : null}
                </Button>
                <Transition
                  show={!!laborat?.detail && laborat?.detail?.length > 0}
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="flex flex-col rounded bg-slate-100 p-2 dark:bg-gray-900">
                    <p>
                      List Permintaan Pemeriksaan Laboratorium{" "}
                      {ajukanLab ? "(Terajukan)" : ""}
                    </p>
                    <ul className="list-disc pl-5">
                      {listPermintaanLab.map((val) => (
                        <li key={val.nama}>{val.nama}</li>
                      ))}
                    </ul>
                  </div>
                </Transition>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="items-center justify-center gap-2 py-1.5 text-xs"
                  color={permintRadDialog ? "sky" : "sky700"}
                  onClick={() => setPermintRadDialog(true)}
                >
                  <span>
                    <RiBodyScanFill size="1rem" />
                  </span>
                  <span>Permintaan Pemeriksaan Radiologi</span>
                  {radiologi ? (
                    <span>
                      <RiCheckLine size="1rem" />
                    </span>
                  ) : null}
                </Button>
                <Transition
                  show={!!radiologi?.detail && radiologi?.detail?.length > 0}
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="flex flex-col rounded bg-slate-100 p-2 dark:bg-gray-900">
                    <p>List Permintaan Pemeriksaan Radiologi</p>
                    <ul className="list-disc pl-5">
                      {listPermintaanRad.map((val) => (
                        <li key={val.nama}>{val.nama}</li>
                      ))}
                    </ul>
                  </div>
                </Transition>
              </div>
            </div>
            <div className="grid grid-cols-2 justify-center gap-2">
              <Button
                className="items-center justify-center gap-2 py-1.5 text-xs"
                color={resepNonRacik ? "sky" : "sky700"}
                onClick={() => setResepNonRacik(!resepNonRacik)}
                disabled={ Number(urlParams?.get('proses')) > 5 }
              >
                <span>
                  <FaFileMedical size="1rem" />
                </span>
                <span>Resep Obat Non Racikan</span>
                {nonracik.length > 0 ? (
                  <span>
                    <RiCheckLine size="1rem" />
                  </span>
                ) : null}
              </Button>
              <Button
                className="items-center justify-center gap-2 py-1.5 text-xs"
                color={resepRacik ? "sky" : "sky700"}
                onClick={() => setResepRacik(!resepRacik)}
                disabled={ Number(urlParams?.get('proses')) > 5 }
              >
                <span>
                  <GiPestleMortar size="1rem" />
                </span>
                <span>Resep Obat Racikan</span>
                {racikan.length > 0 ? (
                  <span>
                    <RiCheckLine size="1rem" />
                  </span>
                ) : null}
              </Button>
            </div>
            <ResepDokter
              isUpdate={isUpdate}
              resepNonRacik={resepNonRacik}
              resepRacik={resepRacik}
              POAOptions={POAOptions}
              loadPOA={loadPOA}
              racikDispatch={racikDispatch}
              proses={urlParams?.get('proses')}
            />
          </div>
        </div>
        {klinik.isOrt ? (
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Prognosis
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 pb-4 text-xs shadow-md dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex h-8 gap-2">
                  <div className="flex items-center justify-start gap-1.5">
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer accent-sky-700 hover:accent-sky-600"
                      id="prognosis_baik"
                      checked={watch("orto.prognosis.0") === "Baik"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("orto.prognosis.0", "Baik");
                        } else {
                          setValue("orto.prognosis.0", "");
                        }
                      }}
                    />
                    <label htmlFor="prognosis_baik" className="cursor-pointer">
                      Baik
                    </label>
                  </div>
                </div>
                {listPrognosisORT.map((val) => (
                  <div
                    className="flex h-8 gap-2"
                    key={
                      "prognosis_" + val.label.replace(" ", "_").toLowerCase()
                    }
                  >
                    <div className="flex items-center justify-start gap-1.5">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-sky-700 hover:accent-sky-600"
                        id={
                          "prognosis_" +
                          val.label.replace(" ", "_").toLowerCase()
                        }
                        checked={
                          !!watch(`orto.prognosis.${val.number}`) &&
                          watch(`orto.prognosis.${val.number}`) !== ""
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue(`orto.prognosis.${val.number}`, "Mild");
                          } else {
                            setValue(`orto.prognosis.${val.number}`, "");
                          }
                        }}
                      />
                      <label
                        htmlFor={
                          "prognosis_" +
                          val.label.replace(" ", "_").toLowerCase()
                        }
                        className="cursor-pointer"
                      >
                        {val.label}
                      </label>
                    </div>
                    <div>
                      {["Mild", "Moderate", "Severe"].map((jwbnVal, idx) => (
                        <LabelButton
                          type="checkbox"
                          id={
                            val.label.replace(" ", "_").toLowerCase() +
                            (idx + 1)
                          }
                          value={jwbnVal}
                          disabled={
                            watch(`orto.prognosis.${val.number}`) === ""
                          }
                          checked={
                            watch(`orto.prognosis.${val.number}`) !== "" &&
                            watch(`orto.prognosis.${val.number}`) === jwbnVal
                          }
                          onChange={() =>
                            setValue(`orto.prognosis.${val.number}`, jwbnVal)
                          }
                          key={
                            val.label.replace(" ", "_").toLowerCase() +
                            (idx + 1)
                          }
                        >
                          {jwbnVal}
                        </LabelButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : klinik.isRehab ? (
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Evaluasi
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="flex justify-center">
                <InputArea
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  placeholder="Evaluasi"
                  {...register("rehabmedik.evaluasi")}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <PermintLabDialog
        isUpdate={isUpdate}
        terajukan={ajukanLab}
        setTerajukan={setAjukanLab}
        permintDialog={permintLabDialog}
        setPermintDialog={setPermintLabDialog}
        listPermintaan={listPermintaanLab}
        setListPermintaan={setListPermintaanLab}
      />
      <PermintRadDialog
        isUpdate={isUpdate}
        terajukan={ajukanRad}
        setTerajukan={setAjukanRad}
        permintDialog={permintRadDialog}
        setPermintDialog={setPermintRadDialog}
        listPermintaan={listPermintaanRad}
        setListPermintaan={setListPermintaanRad}
      />

      <RacikanDialog
        isUpdate={isUpdate}
        racik={racik}
        racikDispatch={racikDispatch}
        POAOptions={POAOptions}
        loadPOA={loadPOA}
      />
    </>
  );
};
