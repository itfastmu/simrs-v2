import { Fragment, useEffect, useState } from "react";
import { RiAddCircleLine, RiDeleteBin5Line } from "react-icons/ri";
import { useFormContext, Controller } from "react-hook-form";
import { Transition } from "@headlessui/react";
import { Input, InputArea, LabelButton } from "@/components/form";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { KlinikAsesmen, TAsesmenPer, TFormImunisasi } from "../../schema";
import { useParams } from "next/navigation";
import { HasilSkrining } from "../../_components/skrining-perawat";

export const SubjektifPer = ({
  listImunisasi,
  klinik,
  // isMutating,
  // setIsMutating,
  tabIdx,
  setTabIdx,
  panelDivRef,
}: {
  listImunisasi: TFormImunisasi[];
  klinik: KlinikAsesmen;
  // isMutating: boolean;
  // setIsMutating: React.Dispatch<React.SetStateAction<boolean>>;
  tabIdx: number;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<TAsesmenPer>();

  const [listPsikologis] = useState([
    "Tenang",
    "Cemas",
    "Takut",
    "Marah",
    "Sedih",
    "Kecenderungan bunuh diri",
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
  const addPengobatan = () => {
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
  useEffect(() => {
    if (tabIdx === 0) return;
    if (!!nama_obat) addPengobatan();
  }, [tabIdx]);

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <HasilSkrining />
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Asesmen Awal Keperawatan
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
                Riwayat Pengobatan{" "}
                <span className="text-[11px]/[12px] italic">
                  (Termasuk obat yang dikonsumsi dalam 1 bulan terakhir)
                </span>
              </label>
              <small className="flex text-sky-700 dark:text-sky-400">
                Note : Klik{" "}
                <span className="px-0.5 text-blue-600 dark:text-sky-400">
                  (+)
                </span>{" "}
                untuk menambah item
              </small>
              <div className="flex items-center justify-center gap-2">
                <Input
                  placeholder="Obat"
                  className="px-2 py-1 text-xs"
                  value={nama_obat}
                  onChange={(e) => setNama_obat(e.target.value)}
                />
                <button type="button" onClick={addPengobatan}>
                  <RiAddCircleLine
                    size="1.25rem"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </button>
              </div>
              <Transition
                show={listObat?.length !== 0}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="mt-2 overflow-hidden rounded shadow">
                  <table className="min-w-full">
                    <thead>
                      <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                        <td className="px-4 py-2">Obat</td>
                        <td>*</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {listObat?.map((obat, idx) => (
                        <tr
                          className="bg-white hover:text-sky-600 dark:bg-slate-900"
                          key={idx}
                        >
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {obat}
                          </td>
                          <td className="text-center">
                            <RiDeleteBin5Line
                              className="inline text-red-500 hover:cursor-pointer"
                              size="1.2rem"
                              onClick={() => delPengobatan(idx)}
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
        {klinik.isAnak ? (
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Data Imunisasi
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-2">
                {listImunisasi.map((imun, idx) => (
                  <div className="flex items-center" key={idx}>
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      {imun.value}
                    </label>
                    <div className="mt-1 inline-flex pl-1.5">
                      {imun.list.map((val: any, listId) => (
                        <LabelButton
                          type="checkbox"
                          id={imun.value + (listId + 1)}
                          value={val}
                          className="text-[10px]"
                          key={listId}
                          checked={watch(imun.name)?.some(
                            (valWatch) => val === valWatch
                          )}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              if (
                                watch(imun.name)?.some(
                                  (valWatch) => val === valWatch
                                )
                              ) {
                                return setValue(
                                  imun.name,
                                  listId < 1
                                    ? (watch(imun.name) || [])?.length > 1
                                      ? imun.list.slice(0, 1)
                                      : []
                                    : imun.list.slice(0, listId + 1)
                                );
                              }
                            }
                            let penambahan = imun.list[0] === 0 ? 1 : 0;
                            setValue(
                              imun.name,
                              imun.list.slice(0, +e.target.value + penambahan)
                            );
                          }}
                          // })}
                        >
                          {val}
                        </LabelButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
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

export const ObjektifPer = ({
  setTabIdx,
  panelDivRef,
  klinik,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
  klinik: KlinikAsesmen;
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

  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext<TAsesmenPer>();

  const [kesadaran, setKesadaran] = useState("");
  const handleKesadaran = () => {
    const gcs = (watch("fisik.gcs") || [])?.reduce((acc, val) => acc + val, 0);
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

  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Fisik
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
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
                      min={10}
                      step={5}
                      onWheel={(e) => e.currentTarget.blur()}
                      onInput={(
                        e: React.FocusEvent<HTMLInputElement, Element>
                      ) => {
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
                      +e.target.value > 100 && setValue("fisik.saturasi", 100);
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

export const AsesmenPer = ({
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
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Diagnosis/Masalah Keperawatan
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
                placeholder="Diagnosis/Masalah Keperawatan"
                {...register("keperawatan.diagnosis")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek = await trigger("keperawatan.diagnosis");
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

export const PlanningTargetPer = ({
  setTabIdx,
  panelDivRef,
  klinik,
}: {
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
  klinik: KlinikAsesmen;
}) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<TAsesmenPer>();
  return (
    <>
      <div className={cn("mb-2")}>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Planning & Target
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="flex justify-center gap-2">
              <div
                className={cn(
                  "relative w-full",
                  (errors?.keperawatan?.rencana_asuhan ||
                    errors?.kebidanan?.rencana_asuhan) &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label htmlFor="rencana_asuhan">Rencana Asuhan</label>
                {errors?.keperawatan?.rencana_asuhan ||
                errors?.kebidanan?.rencana_asuhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    harus diisi
                  </p>
                ) : null}
                <InputArea
                  className="-mb-1 px-2 py-1 text-xs"
                  id="rencana_asuhan"
                  {...register(
                    !klinik.isObg
                      ? "keperawatan.rencana_asuhan"
                      : "kebidanan.rencana_asuhan"
                  )}
                />
              </div>
              <div
                className={cn(
                  "relative w-full",
                  (errors?.keperawatan?.target || errors?.kebidanan?.target) &&
                    "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                )}
              >
                <label htmlFor="target">Target</label>
                {errors?.keperawatan?.target || errors?.kebidanan?.target ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    harus diisi
                  </p>
                ) : null}
                <InputArea
                  className="-mb-1 px-2 py-1 text-xs"
                  id="target"
                  {...register(
                    !klinik.isObg ? "keperawatan.target" : "kebidanan.target"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          if (!klinik.isObg) {
            const cek1 = await trigger("keperawatan.rencana_asuhan");
            const cek2 = await trigger("keperawatan.target");
            if (cek1 && cek2) {
              setTabIdx(4);
              panelDivRef.current?.scrollTo(0, 0);
            }
          } else {
            const cek1 = await trigger("kebidanan.rencana_asuhan");
            const cek2 = await trigger("kebidanan.target");
            if (cek1 && cek2) {
              setTabIdx(4);
              panelDivRef.current?.scrollTo(0, 0);
            }
          }
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const TindakanPer = ({
  isLoading,
  isUpdate,
  klinik,
}: {
  isLoading: boolean;
  isUpdate: boolean;
  klinik: KlinikAsesmen;
}) => {
  const { register, watch, setValue } = useFormContext<TAsesmenPer>();

  const [intervensiOptions] = useState<MyOptions>(
    [
      "SWD (Short Wave Diathermy)",
      "MWD (Micro Wave Diathermy)",
      "TENS",
      "Ultrasound",
      "Infrared",
      "Nebulizer",
      "Laser",
      "Chess Therapy",
      "Breathing Exercise",
      "Bridging Exercise",
      "Ergo Cycle",
      "Kegel Exercise",
      "Latihan Koordinasi",
      "Latihan Batuk Efektif",
      "Latihan Fungsional",
      "Massage Exercise",
      "Mckenzie Exercise",
      "Mirror Exercise",
      "Myofascial Release",
      "Parallel Bar",
      "Positioning",
      "Pulley Exercise",
      "ROM Exercise",
      "Stretching Exercise",
      "Wallbar Exercise",
      "William Flexion Exercise",
      "Electrical Stimulation",
    ].map((val) => ({ label: val, value: val }))
  );
  const [selIntervensi, setSelIntervensi] = useState<MyOption | null>(null);
  const addIntervensi = () => {
    if (!selIntervensi) return toast.warning("Pilih terlebih dahulu!");
    const int = watch("fisio.intervensi") || [];
    int.push(selIntervensi.value as string);
    setValue("fisio.intervensi", [...int]);
    setSelIntervensi(null);
  };
  const delIntervensi = (id: number) => {
    setValue(
      "fisio.intervensi",
      watch("fisio.intervensi")?.filter((_, i) => id !== i)
    );
  };

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        {!klinik.isRehab ? (
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              {!klinik.isObg
                ? "Catatan Tindakan Keperawatan"
                : "Catatan Tindakan Kebidanan"}
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="flex justify-center">
                <InputArea
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  placeholder={
                    !klinik.isObg
                      ? "Catatan Tindakan Keperawatan"
                      : "Catatan Tindakan Kebidanan"
                  }
                  {...register(
                    !klinik.isObg
                      ? "keperawatan.tindakan"
                      : "kebidanan.tindakan"
                  )}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Rencana Intervensi
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className={cn("relative w-full")}>
                <small className="text-start text-sky-700 dark:text-sky-400">
                  Catatan: Klik (+) untuk menambah item
                </small>
                <div className="flex justify-center">
                  <SelectInput
                    size="sm"
                    options={intervensiOptions}
                    className="w-60"
                    placeholder="Pilih Rencana Intervensi"
                    value={selIntervensi}
                    onChange={(option) =>
                      setSelIntervensi(option as MyOption | null)
                    }
                    menuPosition="fixed"
                    maxMenuHeight={150}
                  />
                  <button
                    type="button"
                    className="mx-2"
                    onClick={addIntervensi}
                  >
                    <RiAddCircleLine
                      size="1.5rem"
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>
                </div>
              </div>
              <Transition
                show={(watch("fisio.intervensi") || []).length !== 0}
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
                        <td className={cn("px-4 py-2")}>Rencana Intervensi</td>
                        <td className={cn("px-4 py-2 text-center")}>*</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {watch("fisio.intervensi")?.map((int, idx) => (
                        <tr
                          className="bg-white hover:text-sky-600 dark:bg-slate-900"
                          key={int + idx}
                        >
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {int}
                          </td>
                          <td className="text-center">
                            <RiDeleteBin5Line
                              className="inline text-amber-500 hover:cursor-pointer"
                              size="1.2rem"
                              onClick={() => delIntervensi(idx)}
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
        )}
      </div>
      <Button type="submit" loading={isLoading}>
        {!isUpdate ? "Simpan" : "Simpan Perubahan"}
      </Button>
    </>
  );
};
