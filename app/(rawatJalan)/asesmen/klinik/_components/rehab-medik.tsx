import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Transition } from "@headlessui/react";
import { Input, InputArea, LabelButton } from "@/components/form";
import { SelectInput } from "@/components/select";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  KlinikAsesmen,
  TAsesmenDok,
  TAsesmenPer,
  THasilPerawat,
} from "../../schema";
import Cookies from "js-cookie";
import ImageMarker, { Marker } from "@/components/image-marker";
import { TbEdit, TbTrash } from "react-icons/tb";
import anatomiRehabMedik from "@/assets/img/rehabmedik.png";
import { HasilSkrining } from "../../_components/skrining-perawat";
import { useSearchParams } from "next/navigation";

export const SubjektifFisio = ({
  // isMutating,
  // setIsMutating,
  setTabIdx,
  panelDivRef,
}: {
  // isMutating: boolean;
  // setIsMutating: React.Dispatch<React.SetStateAction<boolean>>;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<TAsesmenPer>();

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [listPsikologis] = useState([
    "Tenang",
    "Cemas",
    "Takut",
    "Marah",
    "Sedih",
    "Kecenderungan bunuh diri",
  ]);
  type TImunisasi = {
    value: string;
    name:
      | "imunisasi.hepatitis_b"
      | "imunisasi.bcg"
      | "imunisasi.polio"
      | "imunisasi.campak"
      | "imunisasi.dpthib";
    list: string[];
  };
  const [listImunisasi] = useState<TImunisasi[]>([
    {
      value: "Hepatitis B",
      name: "imunisasi.hepatitis_b",
      list: ["1", "2", "3", "4", "5"],
    },
    { value: "BCG", name: "imunisasi.bcg", list: ["1"] },
    {
      value: "Polio",
      name: "imunisasi.polio",
      list: ["0", "1", "2", "3", "4"],
    },
    { value: "Campak/MMR", name: "imunisasi.campak", list: ["1"] },
    {
      value: "DPT dan Hib",
      name: "imunisasi.dpthib",
      list: ["1", "2", "3", "4", "5"],
    },
  ]);
  const [listPengkajian] = useState({
    hubungan: ["Baik", "Tidak Baik"],
    tinggal: ["Orang Tua", "Suami/Istri", "Anak", "Sendiri"],
    penganiayaan: ["Ya", "Tidak"],
    ibadah: ["Membutuhkan Bantuan", "Tidak"],
    emosional: [
      { value: "Normal", label: "Normal" },
      { value: "Tidak Semangat", label: "Tidak Semangat" },
      { value: "Rasa Tertekan", label: "Rasa Tertekan" },
      { value: "Depresi", label: "Depresi" },
      { value: "Cemas", label: "Cemas" },
      { value: "Sulit Tidur", label: "Sulit Tidur" },
      { value: "Cepat Lelah", label: "Cepat Lelah" },
      { value: "Sulit Konsentrasi", label: "Sulit Konsentrasi" },
      { value: "Merasa Bersalah", label: "Merasa Bersalah" },
    ],
  });

  const [nama_obat, setNama_obat] = useState<string>("");

  const listObat = watch("anamnesis.riwayat_obat") || [];
  const addPengobatan = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!nama_obat) return toast.warning("Isi obat terlebih dahulu!");
    const newObat = watch("anamnesis.riwayat_obat") || [];
    newObat?.push(nama_obat);
    setValue("anamnesis.riwayat_obat", newObat);
    setNama_obat("");
  };
  const delPengobatan = (idx: number) => {
    setValue(
      "anamnesis.riwayat_obat",
      listObat.filter((_, i) => idx !== i)
    );
  };

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <HasilSkrining />
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Asesmen Awal Fisioterapi
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative w-6/12",
                errors?.anamnesis?.keluhan &&
                  "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                Keluhan Utama
              </label>
              {errors?.anamnesis?.keluhan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.anamnesis.keluhan.message}
                </p>
              ) : null}
              <InputArea
                className="-mb-1.5 px-2 py-1 text-xs"
                {...register("anamnesis.keluhan")}
              />
            </div>
            <div className={cn("relative w-6/12")}>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Alergi Obat & Makanan
              </label>
              <Input
                className="mb-2 px-2 py-1 text-xs"
                {...register("anamnesis.alergi")}
              />
            </div>
            <div className={cn("relative w-6/12")}>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Dahulu dan Penyerta
              </label>
              <InputArea
                className="mb-2 px-2 py-1 text-xs"
                {...register("anamnesis.penyakit")}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pengkajian Psikologis
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="mb-2 pl-0.5 text-[11px]/[12px]">
              {listPsikologis.map((val, idx) => (
                <LabelButton
                  type="radio"
                  id={"psikologis-" + (idx + 1)}
                  value={val}
                  key={idx}
                  {...register("kajian.psikologis")}
                >
                  {val}
                </LabelButton>
              ))}
            </div>
            <div className="relative w-6/12">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Masalah Perilaku
              </label>
              <Input
                className="px-2 py-1 text-xs"
                {...register("kajian.perilaku")}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pengkajian Sosial, Ekonomi, Spiritual, Kultural
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Hubungan Pasien dengan Anggota Keluarga
                </label>
                <div className="mb-2">
                  {listPengkajian.hubungan.map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"hubungan-" + (idx + 1)}
                      value={val}
                      key={idx}
                      {...register("kajian.soseksk.0")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Kegiatan Ibadah
                </label>
                <div className="mb-2">
                  {listPengkajian.ibadah.map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"ibadah-" + (idx + 1)}
                      value={val}
                      key={idx}
                      {...register("kajian.soseksk.1")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Tinggal Dengan
                </label>
                <div className="mb-2">
                  {listPengkajian.tinggal.map((val, idx) => (
                    <LabelButton
                      type="radio"
                      // className={cn(
                      //   listPengkajian.tinggal.length > 2 && "rounded-lg"
                      // )}
                      id={"tinggal-" + (idx + 1)}
                      value={val}
                      key={idx}
                      {...register("kajian.soseksk.2")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <label className="font-semibold dark:text-neutral-200">
                  Status Emosional
                </label>
                <div className="mb-2 w-6/12">
                  <Controller
                    control={control}
                    name="kajian.soseksk.3"
                    render={({ field: { onChange, value } }) => (
                      <SelectInput
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        size="sm"
                        options={listPengkajian.emosional}
                        placeholder="Pilih..."
                        inputCenter
                        onChange={(val: any) => onChange(val.value)}
                        value={listPengkajian.emosional.find(
                          (v) => v.value === value
                        )}
                        maxMenuHeight={200}
                        menuPlacement="top"
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Curiga Penganiayaan/Penelantaran
                </label>
                <div className="mb-2">
                  {listPengkajian.penganiayaan.map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"penganiayaan-" + (idx + 1)}
                      value={val}
                      key={idx}
                      {...register("kajian.soseksk.4")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <label className="font-semibold dark:text-neutral-200">
                  Keyakinan Khusus yang Dianut
                </label>
                <Input
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  {...register("kajian.soseksk.5")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek = await trigger("anamnesis");
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

export const ObjektifFisio = ({
  isUpdate,
  setTabIdx,
  panelDivRef,
}: {
  isUpdate?: boolean;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const [listKeadaan] = useState(["Baik", "Sedang", "Lemah", "Buruk"]);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<TAsesmenPer>();

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
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Fisik
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
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
            <div className="grid grid-cols-7 gap-2">
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
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("fisik.td.0", 0);
                        +e.target.value > 250 && setValue("fisik.td.0", 250);
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
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value < 0 && setValue("fisik.td.1", 0);
                        +e.target.value > 180 && setValue("fisik.td.1", 180);
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
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value < 0 && setValue("fisik.hr", 0);
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
            <div className="w-6/12">
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Pemeriksaan Lainnya
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  placeholder="(GDS, Luka, ...)"
                  {...register("fisik.tambahan")}
                />
              </div>
            </div>
            <div className="flex w-3/4 flex-col gap-2">
              <label className="text-sm font-semibold dark:text-neutral-200">
                Status Lokalis
              </label>
              <div className={cn("grid grid-cols-2 text-base")}>
                <div className="overflow-hidden rounded bg-slate-100">
                  <ImageMarker
                    src={anatomiRehabMedik}
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
                        onKeyDown={(e) => console.log(e.key)}
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
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Inspeksi
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("fisio.fisik.inspeksi")}
              />
            </div>
            <div className="grid w-3/4 grid-flow-row grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Statis
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("fisio.fisik.statis")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Dinamis
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("fisio.fisik.dinamis")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Kognitif
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("fisio.fisik.kognitif")}
                />
              </div>
            </div>
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Palpasi
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("fisio.fisik.palpasi")}
              />
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Luas Gerak Sendi
              </label>
              <Input
                className="px-2 py-1 text-xs"
                {...register("fisio.fisik.luas")}
              />
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Kekuatan Otot (MMT)
              </label>
              <div className="flex flex-col">
                <div className="flex border-b-2 border-b-gray-400">
                  <div className="grid grid-cols-3 gap-1 border-r-2 border-r-gray-400 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.0", 5);
                      }}
                      {...register("fisio.fisik.mmt.0", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.1", 5);
                      }}
                      {...register("fisio.fisik.mmt.1", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.2", 5);
                      }}
                      {...register("fisio.fisik.mmt.2", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.3", 5);
                      }}
                      {...register("fisio.fisik.mmt.3", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.4", 5);
                      }}
                      {...register("fisio.fisik.mmt.4", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.5", 5);
                      }}
                      {...register("fisio.fisik.mmt.5", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="flex">
                  <div className="grid grid-cols-3 gap-1 border-r-2 border-r-gray-400 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.6", 5);
                      }}
                      {...register("fisio.fisik.mmt.6", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.7", 5);
                      }}
                      {...register("fisio.fisik.mmt.7", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.8", 5);
                      }}
                      {...register("fisio.fisik.mmt.8", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("fisio.fisik.mmt.9", 5);
                      }}
                      {...register("fisio.fisik.mmt.9", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 &&
                          setValue("fisio.fisik.mmt.10", 5);
                      }}
                      {...register("fisio.fisik.mmt.10", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 &&
                          setValue("fisio.fisik.mmt.11", 5);
                      }}
                      {...register("fisio.fisik.mmt.11", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid w-3/4 grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Perkusi
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("fisio.fisik.perkusi")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Auskultasi
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("fisio.fisik.auskultasi")}
                />
              </div>
            </div>
            <div className="grid w-3/4 grid-flow-row grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Nyeri
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  placeholder="Lokasi Nyeri"
                  {...register("fisio.fisik.nyeri")}
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Tekan
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("fisio.fisik.tekan", 10);
                    }}
                    {...register("fisio.fisik.tekan", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Gerak
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("fisio.fisik.gerak", 10);
                    }}
                    {...register("fisio.fisik.gerak", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Diam
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("fisio.fisik.diam", 10);
                    }}
                    {...register("fisio.fisik.diam", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Antropometri
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("fisio.fisik.antropometri")}
              />
            </div>
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Pemeriksaan Khusus
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("fisio.fisik.khusus")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek = await trigger("fisik");
          cek && setTabIdx(2);
          // setTabIdx(2);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const AsesmenFisio = ({
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
  } = useFormContext<TAsesmenPer>();
  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis/Masalah Medis
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div
              className={cn(
                "relative flex w-6/12 justify-center",
                errors.keperawatan?.diagnosis &&
                  "rounded-lg bg-red-300 p-2 pt-4 dark:bg-red-500/50"
              )}
            >
              {errors.keperawatan?.diagnosis ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.keperawatan.diagnosis.message}
                </p>
              ) : null}
              <InputArea
                className="px-2 py-1 text-xs"
                placeholder="Diagnosis/Masalah Medis"
                {...register("keperawatan.diagnosis")}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis Fisioterapi
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid w-3/4 grid-cols-2 gap-2">
              <div
                className={cn(
                  "relative",
                  Array.isArray(errors.fisio?.diagnosis) &&
                    errors.fisio?.diagnosis?.at(0) &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label className="font-semibold dark:text-neutral-200">
                  Impairment
                </label>
                {Array.isArray(errors.fisio?.diagnosis) &&
                errors.fisio?.diagnosis?.at(0) ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {Array.isArray(errors.fisio?.diagnosis) &&
                      errors.fisio?.diagnosis?.at(0)?.message}
                  </p>
                ) : null}
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("fisio.diagnosis.0")}
                />
              </div>
              <div
                className={cn(
                  "relative",
                  Array.isArray(errors.fisio?.diagnosis) &&
                    errors.fisio?.diagnosis?.at(1) &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label className="font-semibold dark:text-neutral-200">
                  Functional Limitation
                </label>
                {Array.isArray(errors.fisio?.diagnosis) &&
                errors.fisio?.diagnosis?.at(1) ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {Array.isArray(errors.fisio?.diagnosis) &&
                      errors.fisio?.diagnosis?.at(1)?.message}
                  </p>
                ) : null}
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("fisio.diagnosis.1")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Disability
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("fisio.diagnosis.2")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek1 = await trigger("keperawatan.diagnosis");
          const cek2 = await trigger("fisio.diagnosis");
          if (cek1 && cek2) setTabIdx(3);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const ObjektifRehabMedik = ({
  hasilPerawat,
  klinik,
  isUpdate,
  setTabIdx,
  panelDivRef,
}: {
  hasilPerawat: THasilPerawat | undefined;
  klinik: KlinikAsesmen;
  isUpdate?: boolean;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const searchParams = useSearchParams();
  const proses = parseInt(searchParams.get("proses")!);
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
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  useEffect(() => {
    if (proses > 3 && proses < 6) {
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
        if (hasilPerawat.fisio) {
          setValue("rehabmedik.inspeksi", hasilPerawat.fisio.fisik.inspeksi);
          setValue("rehabmedik.statis", hasilPerawat.fisio.fisik.statis);
          setValue("rehabmedik.dinamis", hasilPerawat.fisio.fisik.dinamis);
          setValue("rehabmedik.kognitif", hasilPerawat.fisio.fisik.kognitif);
          setValue("rehabmedik.palpasi", hasilPerawat.fisio.fisik.palpasi);
          setValue("rehabmedik.luas", hasilPerawat.fisio.fisik.luas);
          setValue("rehabmedik.mmt", hasilPerawat.fisio.fisik.mmt);
          setValue("rehabmedik.perkusi", hasilPerawat.fisio.fisik.perkusi);
          setValue(
            "rehabmedik.auskultasi",
            hasilPerawat.fisio.fisik.auskultasi
          );
          setValue("rehabmedik.nyeri", hasilPerawat.fisio.fisik.nyeri);
          setValue("rehabmedik.tekan", hasilPerawat.fisio.fisik.tekan);
          setValue("rehabmedik.gerak", hasilPerawat.fisio.fisik.gerak);
          setValue("rehabmedik.diam", hasilPerawat.fisio.fisik.diam);
          setValue(
            "rehabmedik.antropometri",
            hasilPerawat.fisio.fisik.antropometri
          );
          setValue("rehabmedik.khusus", hasilPerawat.fisio.fisik.khusus);
        }
        if (hasilPerawat.status_lokalis) {
          setValue("status_lokalis", hasilPerawat.status_lokalis);
        }
      }
    }
    // else { setUbahFisik(true); }
  }, [hasilPerawat]);

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
                      <td className="w-14">HR</td>
                      <td className="">:</td>
                      <td className="">- x/mnt</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">TD</td>
                      <td className="">:</td>
                      <td className="">- mmHg</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">Temp</td>
                      <td className="">:</td>
                      <td className="">- &deg;C</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="w-6/12">
                <table>
                  <tbody>
                    <tr className="text-left text-xs">
                      <td className="">RR</td>
                      <td className="">:</td>
                      <td className="">{`-`} x/mnt</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">TB</td>
                      <td className="">:</td>
                      <td className="">{`-`} cm</td>
                    </tr>
                    <tr className="text-left text-xs">
                      <td className="">BB</td>
                      <td className="">:</td>
                      <td className="">{`-`} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <table>
                <tbody>
                  <tr className="text-left text-xs">
                    <td className="w-14">Lainnya</td>
                    <td className="">:</td>
                    <td className="">{`-`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Transition
              show={ubahFisik}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="p-2 text-xs">
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
                          {...register("fisik.td.0", {
                            valueAsNumber: true,
                          })}
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("fisik.td.0", 0);
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
                          onWheel={(e) => e.currentTarget.blur()}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("fisik.td.1", 0);
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
                  <div>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      HR
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="mb-2 py-1 pl-2 pr-10 text-xs"
                        {...register("fisik.hr", { valueAsNumber: true })}
                        onWheel={(e) => e.currentTarget.blur()}
                        onInput={(
                          e: React.FocusEvent<HTMLInputElement, Element>
                        ) => {
                          +e.target.value < 0 && setValue("fisik.hr", 0);
                          +e.target.value > 300 && setValue("fisik.hr", 300);
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
                  <div>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      RR
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        className="mb-2 py-1 pl-2 pr-10 text-xs"
                        {...register("fisik.rr", { valueAsNumber: true })}
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
                  <div>
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
                <div className="w-6/12">
                  <div>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Pemeriksaan Lainnya
                    </label>
                    <InputArea
                      className="px-2 py-1 text-xs"
                      placeholder="(GDS, Luka, ...)"
                      {...register("fisik.tambahan")}
                    />
                  </div>
                </div>
              </div>
            </Transition>
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
                    src={anatomiRehabMedik}
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
                        onKeyDown={(e) => console.log(e.key)}
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
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Inspeksi
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("rehabmedik.inspeksi")}
              />
            </div>
            <div className="grid w-3/4 grid-flow-row grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Statis
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.statis")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Dinamis
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.dinamis")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Kognitif
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.kognitif")}
                />
              </div>
            </div>
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Palpasi
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("rehabmedik.palpasi")}
              />
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Luas Gerak Sendi
              </label>
              <Input
                className="px-2 py-1 text-xs"
                {...register("rehabmedik.luas")}
              />
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Kekuatan Otot (MMT)
              </label>
              <div className="flex flex-col">
                <div className="flex border-b-2 border-b-gray-400">
                  <div className="grid grid-cols-3 gap-1 border-r-2 border-r-gray-400 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.0", 5);
                      }}
                      {...register("rehabmedik.mmt.0", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.1", 5);
                      }}
                      {...register("rehabmedik.mmt.1", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.2", 5);
                      }}
                      {...register("rehabmedik.mmt.2", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.3", 5);
                      }}
                      {...register("rehabmedik.mmt.3", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.4", 5);
                      }}
                      {...register("rehabmedik.mmt.4", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mb-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.5", 5);
                      }}
                      {...register("rehabmedik.mmt.5", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="flex">
                  <div className="grid grid-cols-3 gap-1 border-r-2 border-r-gray-400 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.6", 5);
                      }}
                      {...register("rehabmedik.mmt.6", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.7", 5);
                      }}
                      {...register("rehabmedik.mmt.7", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.8", 5);
                      }}
                      {...register("rehabmedik.mmt.8", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.9", 5);
                      }}
                      {...register("rehabmedik.mmt.9", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.10", 5);
                      }}
                      {...register("rehabmedik.mmt.10", {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="mt-1 px-2 py-1 text-xs"
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
                        +e.target.value > 5 && setValue("rehabmedik.mmt.11", 5);
                      }}
                      {...register("rehabmedik.mmt.11", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid w-3/4 grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Perkusi
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.perkusi")}
                />
              </div>
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Auskultasi
                </label>
                <InputArea
                  className="px-2 py-1 text-xs"
                  {...register("rehabmedik.auskultasi")}
                />
              </div>
            </div>
            <div className="grid w-3/4 grid-flow-row grid-cols-2 gap-2">
              <div>
                <label className="font-semibold dark:text-neutral-200">
                  Nyeri
                </label>
                <Input
                  className="px-2 py-1 text-xs"
                  placeholder="Lokasi Nyeri"
                  {...register("rehabmedik.nyeri")}
                />
              </div>

              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Tekan
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("rehabmedik.tekan", 10);
                    }}
                    {...register("rehabmedik.tekan", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Gerak
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("rehabmedik.gerak", 10);
                    }}
                    {...register("rehabmedik.gerak", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="font-semibold dark:text-neutral-200">
                    Nyeri Diam
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="px-2 py-1 text-xs placeholder:text-[10px]/[14px]"
                    placeholder="Numeric (0-10)"
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(
                      e: React.FocusEvent<HTMLInputElement, Element>
                    ) => {
                      +e.target.value > 10 && setValue("rehabmedik.diam", 10);
                    }}
                    {...register("rehabmedik.diam", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
            <div className="flex w-1/3 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Antropometri
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("rehabmedik.antropometri")}
              />
            </div>
            <div className="flex w-3/4 flex-col">
              <label className="font-semibold dark:text-neutral-200">
                Pemeriksaan Khusus
              </label>
              <InputArea
                className="px-2 py-1 text-xs"
                {...register("rehabmedik.khusus")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek = await trigger("fisik");
          cek && setTabIdx(2);
          // setTabIdx(2);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </Suspense>
  );
};
