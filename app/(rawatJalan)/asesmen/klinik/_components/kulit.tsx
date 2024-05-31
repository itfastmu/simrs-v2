import { Button } from "@/components/button";
import { Input, InputArea, LabelButton } from "@/components/form";
import ImageMarker, { Marker } from "@/components/image-marker";
import { SelectInput } from "@/components/select";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import { StaticImageData } from "next/image";
import { useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TbEdit, TbTrash } from "react-icons/tb";
import { TAsesmenDok, THasilPerawat } from "../../schema";

export const ObjektifDerma = ({
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
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Lokalis
              </label>
              <div className={cn("grid grid-cols-2 text-base")}>
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
            <div className="mb-2 flex w-3/4 flex-col">
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Kulit
              </label>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Inspeksi
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.inspeksi")}
                />
              </div>
              <div className="grid grid-flow-row grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Lokasi
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.statis")}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    UKK
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.dinamis")}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Konfigurasi
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.kognitif")}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Lainnya
                  </label>
                  <Input
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.kognitif")}
                  />
                </div>
              </div>
            </div>
            <div className="flex w-3/4 flex-col">
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Kelamin
              </label>
              <div className="flex flex-col gap-1">
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Inspeksi
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.inspeksi")}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Inspekulo
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.inspeksi")}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Palpasi
                  </label>
                  <InputArea
                    className="px-2 py-1 text-xs"
                    {...register("rehabmedik.inspeksi")}
                  />
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
          setTabIdx(2);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </Suspense>
  );
};
