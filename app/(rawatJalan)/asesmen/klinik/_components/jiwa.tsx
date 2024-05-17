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

export const ObjektifJiwa = ({
  hasilPerawat,
  isUpdate,
  statusLokSrc,
  setTabIdx,
  panelDivRef,
}: {
  hasilPerawat: THasilPerawat | undefined;
  isUpdate?: boolean;
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

  const [listStatusMental] = useState<
    {
      judul: string;
      register:
        | "jiwa.kesan"
        | "jiwa.kesadaran"
        | "jiwa.sikap"
        | "jiwa.pembicaraan"
        | "jiwa.orientasi"
        | "jiwa.mood"
        | "jiwa.bentuk_pikir"
        | "jiwa.isi_pikir"
        | "jiwa.progresi_pikir"
        | "jiwa.persepsi"
        | "jiwa.hub_jiwa"
        | "jiwa.perhatian"
        | "jiwa.insight";
    }[]
  >([
    {
      judul: "Kesan Umum",
      register: "jiwa.kesan",
    },
    {
      judul: "Kesadaran",
      register: "jiwa.kesadaran",
    },
    {
      judul: "Sikap Tingkah Laku",
      register: "jiwa.sikap",
    },
    {
      judul: "Pembicaraan",
      register: "jiwa.pembicaraan",
    },
    {
      judul: "Orientasi",
      register: "jiwa.orientasi",
    },
    {
      judul: "Afek/Mood",
      register: "jiwa.mood",
    },
    {
      judul: "Bentuk Pikir",
      register: "jiwa.bentuk_pikir",
    },
    {
      judul: "Isi Pikir",
      register: "jiwa.isi_pikir",
    },
    {
      judul: "Progresi Pikir",
      register: "jiwa.progresi_pikir",
    },
    {
      judul: "Persepsi",
      register: "jiwa.persepsi",
    },
    {
      judul: "Hubungan Jiwa",
      register: "jiwa.hub_jiwa",
    },
    {
      judul: "Perhatian",
      register: "jiwa.perhatian",
    },
    {
      judul: "Insight",
      register: "jiwa.insight",
    },
  ]);

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
                    <div>
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
                  </div>
                </div>
              </Transition>
            ) : null}
            <div className="mb-2 flex w-3/4 flex-col gap-2">
              <label className="-mb-1 text-sm font-semibold dark:text-neutral-200">
                Status Mental
              </label>
              {listStatusMental.map((val) => (
                <div key={val.judul} className="text-left">
                  <label className="font-semibold dark:text-neutral-200">
                    {val.judul}
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register(val.register)}
                  />
                </div>
              ))}
            </div>
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

export const AsesmenJiwa = ({
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
    register,
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
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis Multiaksial
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="flex w-3/4 flex-col gap-2">
              {["I", "II", "III", "IV", "V"].map((val, idx) => (
                <div
                  className={cn(
                    "relative text-left",
                    Array.isArray(errors.jiwa?.diagnosis_multiaksial) &&
                      errors.jiwa?.diagnosis_multiaksial?.at(idx) &&
                      "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                  )}
                  key={idx}
                >
                  <label className="font-semibold dark:text-neutral-200">
                    Axis {val}
                  </label>
                  {Array.isArray(errors.jiwa?.diagnosis_multiaksial) &&
                  errors.jiwa?.diagnosis_multiaksial?.at(idx) ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {Array.isArray(errors.jiwa?.diagnosis_multiaksial) &&
                        errors.jiwa?.diagnosis_multiaksial?.at(idx)?.message}
                    </p>
                  ) : null}
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register(`jiwa.diagnosis_multiaksial.${idx}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
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
