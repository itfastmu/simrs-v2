import { Fragment, useEffect, useState } from "react";
import { RiAddCircleLine, RiDeleteBin5Line } from "react-icons/ri";
import { useFormContext, Controller } from "react-hook-form";
import { Transition } from "@headlessui/react";
import { Input, InputArea, LabelButton } from "@/components/form";
import {
  CreatableSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { listGender } from "@/app/(pendaftaran)/schema";
import {
  TAsesmenPer,
  listPenDahuluKeb,
  listPenKeluargaKeb,
} from "../../schema";
import { HasilSkrining } from "../../_components/skrining-perawat";

export const listGinekologi = [
  "Infertilitas",
  "Infeksi Virus",
  "PMS",
  "Cervisitis Kronis",
  "Endometriosis",
  "Myoma",
  "Kista",
  "Polip Serviks",
  "Kanker Kandungan",
  "Operasi Kandungan",
  "Perkosaan",
  "Post Coital Bleeding",
];

export const SubjektifOBG = ({
  isUpdate,
  lainRiwayat,
  lainRiwayatKel,
  lainRiwayatGinekologi,
  setLainRiwayat,
  setLainRiwayatKel,
  setLainRiwayatGinekologi,
  setTabIdx,
  panelDivRef,
}: {
  isUpdate?: boolean;
  lainRiwayat: string;
  lainRiwayatKel: string;
  lainRiwayatGinekologi: string;
  setLainRiwayat: React.Dispatch<React.SetStateAction<string>>;
  setLainRiwayatKel: React.Dispatch<React.SetStateAction<string>>;
  setLainRiwayatGinekologi: React.Dispatch<React.SetStateAction<string>>;
  setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  panelDivRef: React.RefObject<HTMLElement>;
}) => {
  useEffect(() => {
    !watch("anamnesis.riwayat") && setValue("anamnesis.riwayat", []);
    !watch("anamnesis.riwayat_keluarga") &&
      setValue("anamnesis.riwayat_keluarga", []);
    !watch("kebidanan.riwayat_ginekologi") &&
      setValue("kebidanan.riwayat_ginekologi", []);
    !watch("kebidanan.riwayat_kb") && setValue("kebidanan.riwayat_kb", []);
  }, []);

  const [listPengkajian] = useState({
    hubungan: ["Baik", "Tidak Baik"],
    tinggal: ["Orang Tua", "Suami/Istri", "Anak", "Sendiri"],
    penganiayaan: ["Ya", "Tidak"],
    ibadah: ["Membutuhkan Bantuan", "Tidak"],
    emosional: [
      "Normal",
      "Tidak Semangat",
      "Rasa Tertekan",
      "Depresi",
      "Cemas",
      "Sulit Tidur",
      "Cepat Lelah",
      "Sulit Konsentrasi",
      "Merasa Bersalah",
    ].map((val) => ({ label: val, value: val })) as MyOptions,
  });

  const [listTidakIya] = useState([
    { value: true, label: "Iya" },
    { value: false, label: "Tidak" },
  ]);

  const prediksiHandler = (val: string, param: "hpht" | "hpl") => {
    const parseDate = (dateString: string): Date => new Date(dateString);
    const formatDate = (date: Date): string => date.toLocaleDateString("fr-CA");

    if (param === "hpht") {
      const value = parseDate(val);
      const otherValue = new Date(value.getTime() + 280 * 24 * 60 * 60 * 1000);
      const hphtDay = Math.ceil(
        (Date.now() - value.getTime()) / (1000 * 3600 * 24)
      );
      const usia = `${Math.floor(hphtDay / 7)} minggu ${hphtDay % 7} hari`;
      setValue("kebidanan.hpht", formatDate(value));
      setValue("kebidanan.hpl", formatDate(otherValue));
      setValue("kebidanan.usia", usia);
    } else {
      const value = parseDate(val);
      const otherValue = new Date(value.getTime() - 280 * 24 * 60 * 60 * 1000);
      const hphtDay = Math.ceil(
        (Date.now() - otherValue.getTime()) / (1000 * 3600 * 24)
      );
      const usia = `${Math.floor(hphtDay / 7)} minggu ${hphtDay % 7} hari`;
      setValue("kebidanan.hpl", formatDate(value));
      setValue("kebidanan.hpht", formatDate(otherValue));
      setValue("kebidanan.usia", usia);
    }
  };

  const [tahunPartus, setTahunPartus] = useState<number>(NaN);
  const [tempatPartus, setTempatPartus] = useState<string>("");
  const [umurHamil, setUmurHamil] = useState<string>("");
  const [jenisPersalinan, setJenisPersalinan] = useState<string>("");
  const [penolongPersalinan, setPenolongPersalinan] = useState<string>("");
  const [penyulitPersalinan, setPenyulitPersalinan] = useState<string>("");
  const [beratLahir, setBeratLahir] = useState<number>(NaN);
  const [jenisKelamin, setJenisKelamin] = useState<string>("");
  const [keadaanAnak, setKeadaanAnak] = useState<string>("");

  const [tempatPartusOptions] = useState<MyOptions>(
    [
      "RS",
      "Klinik",
      "Puskesmas",
      "Bidan Praktek Mandiri",
      "Rumah",
      "Dukun",
      "Lain-lain",
    ].map((val) => ({ label: val, value: val }))
  );
  const [umurHamilOptions] = useState<MyOptions>(
    ["Aterm", "Preterm", "Postterm", "Postdate", "Serotinus", "Prematur"].map(
      (val) => ({ label: val, value: val })
    )
  );
  const [jenisPersalinanOptions] = useState<MyOptions>(
    ["Spontan", "SC", "Vacum", "Curet"].map((val) => ({
      label: val,
      value: val,
    }))
  );
  const [penolongPersalinanOptions] = useState<MyOptions>(
    ["Bidan", "Dokter Sp.OG", "Dukun"].map((val) => ({
      label: val,
      value: val,
    }))
  );
  const [penyulitPersalinanOptions] = useState<MyOptions>(
    [
      "Gagal Induksi",
      "Letak Sungsang",
      "KPD",
      "PEB",
      "Abortus Spontan",
      "Abortus Incomplit",
      "Plasenta Previa",
    ].map((val) => ({
      label: val,
      value: val,
    }))
  );
  const [keadaanAnakOptions] = useState<MyOptions>(
    ["Sehat", "Meninggal"].map((val) => ({
      label: val,
      value: val,
    }))
  );

  const addPersalinan = () => {
    if (!tahunPartus || !tempatPartus)
      return toast.warning("Persalinan tidak lengkap!");
    const newPersalinan = watch("persalinan") || [];
    newPersalinan?.push({
      tahun: tahunPartus,
      tempat: tempatPartus,
      umur_hamil: umurHamil,
      jenis: jenisPersalinan,
      penolong: penolongPersalinan,
      penyulit: penyulitPersalinan,
      berat_lahir: beratLahir,
      kelamin_bayi: jenisKelamin,
      keadaan: keadaanAnak,
    });
    setValue("persalinan", [...newPersalinan]);
    setTahunPartus(NaN);
    setTempatPartus("");
    setUmurHamil("");
    setJenisPersalinan("");
    setPenolongPersalinan("");
    setPenyulitPersalinan("");
    setBeratLahir(NaN);
    setJenisKelamin("");
    setKeadaanAnak("");
  };

  const delPersalinan = (id: number) => {
    if (isUpdate) {
      if (watch("persalinan")?.find((_, i) => i === id)?.id) {
        setValue("deleted.persalinan", [
          ...(watch("deleted.persalinan") || []),
          watch("persalinan")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    setValue(
      "persalinan",
      watch("persalinan")?.filter((_, i) => id !== i) || []
    );
  };

  const [listGinekologi] = useState([
    "Infertilitas",
    "Infeksi Virus",
    "PMS",
    "Cervisitis Kronis",
    "Endometriosis",
    "Myoma",
    "Kista",
    "Polip Serviks",
    "Kanker Kandungan",
    "Operasi Kandungan",
    "Perkosaan",
    "Post Coital Bleeding",
  ]);

  const [listKB] = useState([
    "Suntik",
    "IUD",
    "Pil",
    "Kondom",
    "Kalender",
    "MOW",
    "MOP",
    "Implant",
  ]);

  const [operasiText, setOperasiText] = useState<string>("");
  const [tahunOperasi, setTahunOperasi] = useState<number>(NaN);
  const addOperasi = () => {
    if (!operasiText || !tahunOperasi)
      return toast.warning("Operasi tidak lengkap!");
    const newOperasi = watch("anamnesis.riwayat_operasi") || [];
    newOperasi?.push({
      operasi: operasiText,
      tahun: tahunOperasi,
    });
    setValue("anamnesis.riwayat_operasi", [...newOperasi]);
    setOperasiText("");
    setTahunOperasi(NaN);
  };

  const delOperasi = (id: number) => {
    setValue(
      "anamnesis.riwayat_operasi",
      watch("anamnesis.riwayat_operasi")?.filter((_, i) => id !== i) || []
    );
  };

  const [nama_obat, setNama_obat] = useState<string>("");

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
      watch("anamnesis.riwayat_obat")?.filter((_, i) => idx !== i)
    );
  };

  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<TAsesmenPer>();

  return (
    <>
      <div className="mb-2 flex flex-col gap-2">
        <HasilSkrining />
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pengkajian Kebidanan
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
                <p className="absolute right-1 top-0 text-red-900">
                  {errors.anamnesis.keluhan.message}
                </p>
              ) : null}
              <InputArea
                className="-mb-1.5 px-2 py-1 text-xs"
                {...register("anamnesis.keluhan")}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Riwayat Menstruasi
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "relative",
                  errors?.kebidanan?.menarche && "rounded-lg bg-red-300"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Menarche
                </label>
                {errors?.kebidanan?.menarche ? (
                  <p className="absolute right-1 top-0 text-red-900">
                    {errors.kebidanan.menarche.message}
                  </p>
                ) : null}
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("kebidanan.menarche")}
                />
              </div>
              <div
                className={cn(
                  "relative",
                  errors?.kebidanan?.lama_mens && "rounded-lg bg-red-300"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Lama Menstruasi
                </label>
                {errors?.kebidanan?.lama_mens ? (
                  <p className="absolute right-1 top-0 text-red-900">
                    {errors.kebidanan.lama_mens.message}
                  </p>
                ) : null}
                <Input
                  className="px-2 py-1 text-xs"
                  {...register("kebidanan.lama_mens")}
                />
              </div>
            </div>
            <div className="flex">
              <div
                className={cn(
                  "relative",
                  (errors?.kebidanan?.siklus_teratur ||
                    errors?.kebidanan?.siklus_mens) &&
                    "rounded-lg bg-red-300"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Siklus
                </label>
                <div className="flex gap-1">
                  <div className="relative flex items-center gap-2">
                    {errors?.kebidanan?.siklus_teratur ? (
                      <p className="absolute -top-4 left-1 text-red-900">
                        {errors.kebidanan.siklus_teratur.message}
                      </p>
                    ) : null}
                    <label className="font-semibold dark:text-neutral-200">
                      Teratur
                    </label>
                    <Controller
                      control={control}
                      name="kebidanan.siklus_teratur"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <div className="inline-flex">
                          {listTidakIya.map((val, idx) => (
                            <LabelButton
                              type="radio"
                              id={"siklus_teratur-" + (idx + 1)}
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
                  <div className="relative flex items-center">
                    {errors?.kebidanan?.siklus_mens ? (
                      <p className="absolute -top-4 right-1 text-red-900">
                        {errors.kebidanan.siklus_mens.message}
                      </p>
                    ) : null}
                    <Input
                      className="px-2 py-1 text-xs"
                      {...register("kebidanan.siklus_mens")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Riwayat Kehamilan, Persalinan, dan Nifas
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "relative",
                  errors?.kebidanan?.hpht && "rounded-lg bg-red-300"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  HPHT
                </label>
                {errors?.kebidanan?.hpht ? (
                  <p className="absolute right-1 top-0 text-red-900">
                    {errors.kebidanan.hpht.message}
                  </p>
                ) : null}
                <Input
                  type="date"
                  className="px-2 py-1 text-xs"
                  {...register("kebidanan.hpht")}
                  onChange={(e) => prediksiHandler(e.target.value, "hpht")}
                />
              </div>
              <div
                className={cn(
                  "relative",
                  errors?.kebidanan?.hpl && "rounded-lg bg-red-300"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  HPL
                </label>
                {errors?.kebidanan?.hpl ? (
                  <p className="absolute right-1 top-0 text-red-900">
                    {errors.kebidanan.hpl.message}
                  </p>
                ) : null}
                <Input
                  type="date"
                  className="px-2 py-1 text-xs"
                  {...register("kebidanan.hpl")}
                  onChange={(e) => prediksiHandler(e.target.value, "hpl")}
                />
              </div>
            </div>
            <div className="flex flex-col self-stretch rounded bg-slate-100 p-2 text-left dark:bg-gray-700">
              {/* <label className="py-0.5 text-center font-semibold dark:text-neutral-200">
              Riwayat Persalinan
            </label> */}
              <div className="mb-2 flex flex-shrink flex-col gap-1">
                <div className="flex flex-shrink gap-1">
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    min={1899}
                    max={new Date().getFullYear()}
                    className="flex-shrink basis-44 px-2 py-1 text-xs"
                    value={tahunPartus}
                    onChange={(e) => setTahunPartus(parseInt(e.target.value))}
                    placeholder="Tahun Partus"
                  />
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={tempatPartusOptions}
                    className="flex-shrink basis-44"
                    placeholder="Tempat Partus"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      tempatPartusOptions.find(
                        (val) => val.value === tempatPartus
                      ) || ""
                    }
                    onChange={(option) =>
                      setTempatPartus(
                        (option as MyOption | null)?.value as string
                      )
                    }
                  />
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={umurHamilOptions}
                    className="flex-shrink basis-44"
                    placeholder="Umur Hamil"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      umurHamilOptions.find((val) => val.value === umurHamil) ||
                      ""
                    }
                    onChange={(option) =>
                      setUmurHamil((option as MyOption | null)?.value as string)
                    }
                  />
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={jenisPersalinanOptions}
                    className="flex-shrink basis-44"
                    placeholder="Jenis Persalinan"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      jenisPersalinanOptions.find(
                        (val) => val.value === jenisPersalinan
                      ) || ""
                    }
                    onChange={(option) =>
                      setJenisPersalinan(
                        (option as MyOption | null)?.value as string
                      )
                    }
                  />
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={penolongPersalinanOptions}
                    className="flex-shrink basis-44"
                    placeholder="Penolong Persalinan"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      penolongPersalinanOptions.find(
                        (val) => val.value === penolongPersalinan
                      ) || ""
                    }
                    onChange={(option) =>
                      setPenolongPersalinan(
                        (option as MyOption | null)?.value as string
                      )
                    }
                  />
                </div>
                <div className="flex flex-shrink gap-1">
                  <CreatableSelectInput
                    isClearable
                    formatCreateLabel={(val) => 'Buat "' + val + '"'}
                    onCreateOption={(val) => {
                      setPenyulitPersalinan(val);
                    }}
                    options={penyulitPersalinanOptions}
                    size="sm"
                    className="flex-shrink basis-44 text-xs"
                    placeholder="Penyulit"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      penyulitPersalinan !== "" &&
                      !penyulitPersalinanOptions.some(
                        (val) => val.value === penyulitPersalinan
                      )
                        ? {
                            label: penyulitPersalinan,
                            value: penyulitPersalinan,
                          }
                        : penyulitPersalinanOptions.find(
                            (val) => val.value === penyulitPersalinan
                          )
                    }
                    onChange={(option) =>
                      setPenyulitPersalinan(
                        ((option as MyOption | null)?.value as string) || ""
                      )
                    }
                  />
                  <div className="relative">
                    <Input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}
                      min={0}
                      className="flex-shrink basis-44 px-2 py-1 pr-10 text-xs"
                      value={beratLahir}
                      onChange={(e) => setBeratLahir(parseInt(e.target.value))}
                      placeholder="Berat Lahir"
                    />
                    <div className="absolute inset-y-0 right-2 top-[5px]">
                      <span className="text-[11px]/[12px]">gram</span>
                    </div>
                  </div>
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={listGender.map((val) => ({
                      label: val,
                      value: val === "Perempuan" ? "P" : "L",
                    }))}
                    className="flex-shrink basis-44"
                    placeholder="Jenis Kelamin"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      listGender
                        .map((val) => ({
                          label: val,
                          value: val === "Perempuan" ? "P" : "L",
                        }))
                        .find((val) => val.value === jenisKelamin) || ""
                    }
                    onChange={(option) =>
                      setJenisKelamin(
                        (option as MyOption | null)?.value as string
                      )
                    }
                  />
                  <SelectInput
                    isClearable
                    noOptionsMessage={(e) => "Tidak ada pilihan"}
                    size="sm"
                    options={keadaanAnakOptions}
                    className="flex-shrink basis-44"
                    placeholder="Keadaan Anak"
                    menuPosition="fixed"
                    maxMenuHeight={150}
                    value={
                      keadaanAnakOptions.find(
                        (val) => val.value === keadaanAnak
                      ) || ""
                    }
                    onChange={(option) =>
                      setKeadaanAnak(
                        (option as MyOption | null)?.value as string
                      )
                    }
                  />
                  <button
                    type="button"
                    className="mx-2"
                    onClick={addPersalinan}
                  >
                    <RiAddCircleLine
                      size="1.2rem"
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>
                </div>
              </div>
              <Transition
                show={(watch("persalinan") || []).length > 0}
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
                      <tr className="divide-x divide-slate-50 bg-slate-300">
                        <td className={cn("px-4 py-2")}>Tahun</td>
                        <td className={cn("px-4 py-2")}>Tempat</td>
                        <td className={cn("px-4 py-2")}>Umur Hamil</td>
                        <td className={cn("px-4 py-2")}>Jenis Persalinan</td>
                        <td className={cn("px-4 py-2")}>Penolong</td>
                        <td className={cn("px-4 py-2")}>Penyulit Persalinan</td>
                        <td className={cn("px-4 py-2")}>JK/Berat Lahir</td>
                        <td className={cn("px-4 py-2")}>Keadaan</td>
                        <td className={cn("px-4 py-2 text-center")}>*</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {watch("persalinan")?.map((val, idx) => (
                        <tr
                          className="bg-white hover:text-sky-600 dark:bg-slate-900"
                          key={idx}
                        >
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.tahun}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.tempat}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.umur_hamil}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.jenis}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.penolong}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.penyulit}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.kelamin_bayi && val.berat_lahir
                              ? val.kelamin_bayi +
                                "/" +
                                (val.berat_lahir
                                  ? val.berat_lahir + " gram"
                                  : "")
                              : ""}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.keadaan}
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center gap-1">
                              <RiDeleteBin5Line
                                className="inline text-amber-500 hover:cursor-pointer"
                                size="1.2rem"
                                onClick={() => delPersalinan(idx)}
                              />
                            </div>
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
            Riwayat Penyakit
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="relative">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Dahulu
              </label>
              <div className="mb-2 pl-0.5 text-xs">
                {listPenDahuluKeb.map((val, idx) => (
                  <LabelButton
                    type="checkbox"
                    id={"penyakit_dahulu_keb-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register("anamnesis.riwayat")}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Input
                className="w-80 px-2 py-1 text-xs"
                placeholder="Lainnya..."
                value={lainRiwayat}
                onChange={(e) => setLainRiwayat(e.target.value)}
              />
            </div>
            <div className="flex flex-col rounded p-2 pt-0 text-left">
              <label className="py-0.5 text-center font-semibold dark:text-neutral-200">
                Riwayat Operasi
              </label>
              <div className="mb-2 flex flex-shrink flex-col gap-1">
                <div className="flex flex-shrink gap-1">
                  <Input
                    className="flex-shrink basis-44 px-2 py-1 text-xs"
                    value={operasiText}
                    onChange={(e) => setOperasiText(e.target.value)}
                    placeholder="Operasi"
                  />
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    min={1899}
                    max={new Date().getFullYear()}
                    className="flex-shrink basis-44 px-2 py-1 text-xs"
                    value={tahunOperasi}
                    onChange={(e) => setTahunOperasi(parseInt(e.target.value))}
                    placeholder="Tahun Operasi"
                  />
                  <button type="button" className="mx-2" onClick={addOperasi}>
                    <RiAddCircleLine
                      size="1.2rem"
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>
                </div>
              </div>
              <Transition
                show={(watch("anamnesis.riwayat_operasi") || []).length > 0}
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
                      <tr className="divide-x divide-slate-50 bg-slate-300">
                        <td className={cn("px-4 py-2")}>Operasi</td>
                        <td className={cn("px-4 py-2")}>Tahun</td>
                        <td className={cn("px-4 py-2 text-center")}>*</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {watch("anamnesis.riwayat_operasi")?.map((val, idx) => (
                        <tr
                          className="bg-white hover:text-sky-600 dark:bg-slate-900"
                          key={idx}
                        >
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.operasi}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {val.tahun}
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center gap-1">
                              <RiDeleteBin5Line
                                className="inline text-amber-500 hover:cursor-pointer"
                                size="1.2rem"
                                onClick={() => delOperasi(idx)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Transition>
            </div>
            <div className="relative">
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Keluarga
              </label>
              <div className="mb-2 pl-0.5 text-xs">
                {listPenKeluargaKeb.map((val, idx) => (
                  <LabelButton
                    type="checkbox"
                    id={"penyakit_keluarga_keb-" + (idx + 1)}
                    value={val}
                    key={idx}
                    {...register("anamnesis.riwayat_keluarga")}
                  >
                    {val}
                  </LabelButton>
                ))}
              </div>
              <Input
                className="w-80 px-2 py-1 text-xs"
                placeholder="Lainnya..."
                value={lainRiwayatKel}
                onChange={(e) => setLainRiwayatKel(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Riwayat Ginekologi
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="mb-2 w-3/4 pl-0.5 text-xs">
              {listGinekologi.map((val, idx) => (
                <LabelButton
                  type="checkbox"
                  className="rounded-lg"
                  id={"ginekologi-" + (idx + 1)}
                  value={val}
                  key={idx}
                  {...register("kebidanan.riwayat_ginekologi")}
                >
                  {val}
                </LabelButton>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold dark:text-neutral-200">
                Fluor Albus
              </label>
              <Controller
                control={control}
                name="kebidanan.fluor_albus.0"
                render={({ field: { onChange, value, onBlur } }) => (
                  <div className="inline-flex">
                    {listTidakIya.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"fluor_albus-" + (idx + 1)}
                        onBlur={onBlur}
                        onChange={() => {
                          if (val.label === "Tidak") {
                            setValue("kebidanan.fluor_albus.1", "");
                            setValue("kebidanan.fluor_albus.2", "");
                          }
                          onChange(val.label);
                        }}
                        checked={value === val.label}
                        key={idx}
                      >
                        {val.label}
                      </LabelButton>
                    ))}
                  </div>
                )}
              />
              <label className="font-semibold dark:text-neutral-200">
                Gatal
              </label>
              <Controller
                control={control}
                name="kebidanan.fluor_albus.1"
                render={({ field: { onChange, value, onBlur } }) => (
                  <div className="inline-flex">
                    {listTidakIya.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        disabled={watch("kebidanan.fluor_albus.0") !== "Iya"}
                        id={"fluor_albus_gatal-" + (idx + 1)}
                        onBlur={onBlur}
                        onChange={() => onChange(val.label)}
                        checked={value === val.label}
                        key={idx}
                      >
                        {val.label}
                      </LabelButton>
                    ))}
                  </div>
                )}
              />
              <label className="font-semibold dark:text-neutral-200">
                Berbau
              </label>
              <Controller
                control={control}
                name="kebidanan.fluor_albus.2"
                render={({ field: { onChange, value, onBlur } }) => (
                  <div className="inline-flex">
                    {listTidakIya.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        disabled={watch("kebidanan.fluor_albus.0") !== "Iya"}
                        id={"fluor_albus_berbau-" + (idx + 1)}
                        onBlur={onBlur}
                        onChange={() => onChange(val.label)}
                        checked={value === val.label}
                        key={idx}
                      >
                        {val.label}
                      </LabelButton>
                    ))}
                  </div>
                )}
              />
            </div>
            <Input
              className="w-80 px-2 py-1 text-xs"
              placeholder="Lainnya..."
              value={lainRiwayatGinekologi}
              onChange={(e) => setLainRiwayatGinekologi(e.target.value)}
            />
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Riwayat KB
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="pl-0.5 text-xs">
              {listKB.map((val, idx) => (
                <LabelButton
                  type="checkbox"
                  id={"kb-" + (idx + 1)}
                  value={val}
                  key={idx}
                  {...register("kebidanan.riwayat_kb")}
                >
                  {val}
                </LabelButton>
              ))}
            </div>
            <Transition
              show={watch("kebidanan.riwayat_kb")?.length > 0}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div>
                <Input
                  className="w-80 px-2 py-1 text-xs"
                  placeholder="Keluhan KB"
                  {...register("kebidanan.keluhan_kb")}
                />
              </div>
            </Transition>
            <div className={cn("relative w-6/12 justify-self-center")}>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Alergi Obat & Makanan
              </label>
              <Input
                className="mb-2 px-2 py-1 text-xs"
                {...register("anamnesis.alergi")}
              />
            </div>
            <div className={cn("relative w-6/12 justify-self-center")}>
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
                show={watch("anamnesis.riwayat_obat")?.length !== 0}
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
                      {watch("anamnesis.riwayat_obat")?.map((obat, idx) => (
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
          const cek1 = await trigger("anamnesis");
          const cek2 =
            (await trigger("kebidanan.menarche")) &&
            (await trigger("kebidanan.lama_mens")) &&
            (await trigger("kebidanan.siklus_teratur")) &&
            (await trigger("kebidanan.siklus_mens"));
          if (cek1 && cek2) setTabIdx(1);
          // setTabIdx(1);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};

export const AsesmenOBG = ({
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
            Diagnosis/Masalah Kebidanan
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="flex gap-2">
              <div
                className={cn(
                  "flex gap-2",
                  errors.kebidanan?.paritas_gpa &&
                    "relative rounded-lg bg-red-300 p-0.5 pt-4 dark:bg-red-500/50"
                )}
              >
                {errors.kebidanan?.paritas_gpa ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    harus diisi
                  </p>
                ) : null}
                <div className="relative">
                  <div className="absolute inset-y-0 left-2 top-[5px]">
                    <span className="text-[11px]/[12px]">G</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 py-1 pl-6 pr-2 text-xs"
                    {...register("kebidanan.paritas_gpa.0", {
                      valueAsNumber: true,
                    })}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-2 top-[5px]">
                    <span className="text-[11px]/[12px]">P</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 py-1 pl-6 pr-2 text-xs"
                    {...register("kebidanan.paritas_gpa.1", {
                      valueAsNumber: true,
                    })}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-2 top-[5px]">
                    <span className="text-[11px]/[12px]">A</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 py-1 pl-6 pr-2 text-xs"
                    {...register("kebidanan.paritas_gpa.2", {
                      valueAsNumber: true,
                    })}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className="font-semibold dark:text-neutral-200">
                  UK
                </label>
                <Input
                  className="w-48 px-2 py-1 text-xs"
                  {...register("kebidanan.usia")}
                />
              </div>
            </div>
            <div
              className={cn(
                "relative flex w-6/12 justify-center",
                errors.kebidanan?.diagnosis &&
                  "rounded-lg bg-red-300 p-2 pt-4 dark:bg-red-500/50"
              )}
            >
              {errors.kebidanan?.diagnosis ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.kebidanan.diagnosis.message}
                </p>
              ) : null}
              <InputArea
                className="px-2 py-1 text-xs"
                placeholder="Diagnosis/Masalah Kebidanan"
                {...register("kebidanan.diagnosis")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={async () => {
          const cek1 = await trigger("kebidanan.diagnosis");
          const cek2 = await trigger("kebidanan.paritas_gpa");
          if (cek1 && cek2) {
            setTabIdx(3);
          }
          //   setTabIdx(3);
          panelDivRef.current?.scrollTo(0, 0);
        }}
      >
        Selanjutnya
      </Button>
    </>
  );
};
