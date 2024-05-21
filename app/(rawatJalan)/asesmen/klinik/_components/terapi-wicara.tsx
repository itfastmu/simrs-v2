import { Button } from "@/components/button";
import { Input, InputArea, LabelButton } from "@/components/form";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { HasilSkrining } from "../../_components/skrining-perawat";
import { KlinikAsesmen, TAsesmenPer } from "../../schema";

export const SubjektifWicara = ({
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

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        <HasilSkrining />
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Asesmen Awal Terapi Wicara
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
                Riwayat Penyakit Sekarang
              </label>
              <Input
                className="mb-2 px-2 py-1 text-xs"
                {...register("anamnesis.penyakit")}
              />
            </div>
            <div className={cn("relative w-6/12")}>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Riwayat Penyakit Dahulu
              </label>
              <InputArea
                className="-mb-1.5 px-2 py-1 text-xs"
                // {...register("anamnesis.riwayat")}
              />
            </div>
            <div className={cn("relative w-6/12")}>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Diagnosis Dokter/Medis
              </label>
              <InputArea
                className="mb-2 px-2 py-1 text-xs"
                // {...register("anamnesis.riwayat")}
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

export const ObjektifWicara = ({
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

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
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
                  placeholder="(Pemeriksaan Fisik Lain, Pemeriksaan Penunjang, ...)"
                  {...register("fisik.tambahan")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Organ Wicara
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Lidah
                </label>
                <div className="mb-2">
                  {["Normal", "Deviasi Kanan", "Deviasi Kiri"].map(
                    (val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"lidah-" + (idx + 1)}
                        value={val}
                        key={idx}
                        //   {...register("kajian.soseksk.0")}
                      >
                        {val}
                      </LabelButton>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Bibir
                </label>
                <div className="mb-2 text-[11px]/[12px]">
                  {[
                    "Normal",
                    "Celah Kanan",
                    "Celah Kiri",
                    "Celah Bilateral",
                    "Asimetris Kanan",
                    "Asimetris Kiri",
                  ].map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"bibir-" + (idx + 1)}
                      value={val}
                      key={idx}
                      // {...register("kajian.soseksk.0")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Langit-langit
                </label>
                <div className="mb-2">
                  {[
                    "Normal",
                    "Celah Kanan",
                    "Celah Kiri",
                    "Celah Bilateral",
                  ].map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"langit-" + (idx + 1)}
                      value={val}
                      key={idx}
                      // {...register("kajian.soseksk.0")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
              <div>
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Gigi
                </label>
                <div className="mb-2">
                  {[
                    "Asli Lengkap",
                    "Asli Tidak Lengkap",
                    "Maloklusi",
                    "Palsu",
                  ].map((val, idx) => (
                    <LabelButton
                      type="radio"
                      id={"gigi-" + (idx + 1)}
                      value={val}
                      key={idx}
                      // {...register("kajian.soseksk.0")}
                    >
                      {val}
                    </LabelButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Pemeriksaan Khusus
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="mx-auto grid w-1/4 grid-flow-col grid-rows-2 gap-2 *:flex *:items-center *:gap-1">
              <div>
                <input
                  type="checkbox"
                  id="khusus-tadir"
                  //   {...register("kajian.soseksk.0")}
                />
                <label
                  className="cursor-pointer py-2 font-semibold dark:text-neutral-200"
                  htmlFor="khusus-tadir"
                >
                  Tes TADIR
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="khusus-tedyva"
                  //   {...register("kajian.soseksk.0")}
                />
                <label
                  className="cursor-pointer py-2 font-semibold dark:text-neutral-200"
                  htmlFor="khusus-tedyva"
                >
                  Tes TEDYVA
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="khusus-pls"
                  //   {...register("kajian.soseksk.0")}
                />
                <label
                  className="cursor-pointer py-2 font-semibold dark:text-neutral-200"
                  htmlFor="khusus-pls"
                >
                  PLS
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="khusus-lainnya"
                  //   {...register("kajian.soseksk.0")}
                />
                <label
                  className="cursor-pointer py-2 font-semibold dark:text-neutral-200"
                  htmlFor="khusus-lainnya"
                >
                  Lainnya
                </label>
              </div>
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

export const AsesmenWicara = ({
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
            Diagnosis Terapi Wicara
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
                placeholder="Diagnosis Terapi Wicara"
                // {...register("keperawatan.diagnosis.0")}
              />
            </div>
          </div>
        </div>
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Masalah Terapi Wicara
          </div>
          <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="grid w-3/4 grid-cols-2 gap-2">
              {["Bahasa", "Bicara", "Suara", "Irama Kelancaran", "Menelan"].map(
                (val) => (
                  <div
                    className={cn(
                      "relative"
                      //   Array.isArray(errors.fisio?.diagnosis) &&
                      //     errors.fisio?.diagnosis?.at(0) &&
                      //     "rounded-lg bg-red-300 p-2 pt-0 dark:bg-red-500/50"
                    )}
                    key={val}
                  >
                    <label className="font-semibold dark:text-neutral-200">
                      {val}
                    </label>
                    {/* {Array.isArray(errors.fisio?.diagnosis) &&
                    errors.fisio?.diagnosis?.at(0) ? (
                      <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                        {Array.isArray(errors.fisio?.diagnosis) &&
                          errors.fisio?.diagnosis?.at(0)?.message}
                      </p>
                    ) : null} */}
                    <InputArea
                      className="px-2 py-1 text-xs"
                      //   {...register("fisio.diagnosis.0")}
                    />
                  </div>
                )
              )}
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

export const TindakanWicara = ({
  isLoading,
  isUpdate,
}: {
  isLoading: boolean;
  isUpdate: boolean;
}) => {
  const { register, watch, setValue } = useFormContext<TAsesmenPer>();

  //   const [intervensiOptions] = useState<MyOptions>(
  //     [
  //       "SWD (Short Wave Diathermy)",
  //     ].map((val) => ({ label: val, value: val }))
  //   );
  //   const [selIntervensi, setSelIntervensi] = useState<MyOption | null>(null);
  //   const addIntervensi = () => {
  //     if (!selIntervensi) return toast.warning("Pilih terlebih dahulu!");
  //     const int = watch("fisio.intervensi") || [];
  //     int.push(selIntervensi.value as string);
  //     setValue("fisio.intervensi", [...int]);
  //     setSelIntervensi(null);
  //   };
  //   const delIntervensi = (id: number) => {
  //     setValue(
  //       "fisio.intervensi",
  //       watch("fisio.intervensi")?.filter((_, i) => id !== i)
  //     );
  //   };

  return (
    <>
      <div className={cn("mb-2 flex flex-col gap-2")}>
        {/* {!klinik.isRehab ? ( */}
        <div className="pr-1">
          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
            Catatan Tindakan Terapi Wicara
          </div>
          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
            <div className="flex justify-center">
              <InputArea
                className="mb-2 w-6/12 px-2 py-1 text-xs"
                placeholder={"Catatan Tindakan Terapi Wicara"}
                {...register("keperawatan.tindakan")}
              />
            </div>
          </div>
        </div>
        {/* ) : (
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
        )} */}
      </div>
      <Button type="submit" loading={isLoading}>
        {!isUpdate ? "Simpan" : "Simpan Perubahan"}
      </Button>
    </>
  );
};
