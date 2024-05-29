import css from "@/assets/css/scrollbar.module.css";
import { Input, InputArea, LabelButton } from "@/components/form";
import { cn, getAge } from "@/lib/utils";
import Cookies from "js-cookie";
import { TAsesmenDok, TAsesmenPsi } from "../../schema";
import React, { useEffect, useState } from "react";
import { useForm, useFormContext, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { APIURL } from "@/lib/connection";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import { Transition } from "@headlessui/react";
import { RiAddCircleLine, RiDeleteBin5Line } from "react-icons/ri";

export default function FormPsikologi({
  isUpdate,
  tanggal_lahir,
}: //   hasilPerawat,
//   statusLokSrc,
//   setTabIdx,
//   panelDivRef,
{
  isUpdate?: boolean;
  tanggal_lahir: string | undefined;
  //   hasilPerawat: THasilPerawat | undefined;
  //   statusLokSrc: StaticImageData;
  //   setTabIdx: React.Dispatch<React.SetStateAction<number>>;
  //   panelDivRef: React.RefObject<HTMLElement>;
}) {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  useEffect(() => {
    if (!tanggal_lahir) return;
    getAge(new Date(tanggal_lahir)) <= 12 && setIsAnak(true);
  }, [tanggal_lahir]);
  const [isAnak, setIsAnak] = useState<boolean>(false);

  const {
    watch,
    register,
    trigger,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<TAsesmenPsi>();

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

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
      <div className="mb-2 mt-1 select-none rounded bg-cyan-700/90 py-1 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
        Pemeriksaan Psikologi
      </div>
      <div
        className={cn(
          "mb-2 h-[calc(100%-40px)] overflow-y-auto",
          css.scrollbar
        )}
      >
        <div className={cn("mb-2 flex flex-col gap-2")}>
          {!isAnak ? (
            <div className="pr-1">
              <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                Riwayat Penyakit
              </div>
              <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                <div
                  className={cn(
                    "relative w-6/12"
                    // errors.anamnesis?.keluhan &&
                    //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keluhan Fisik
                  </label>
                  {/* {errors.anamnesis?.keluhan ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {errors.anamnesis.keluhan.message}
                    </p>
                  ) : null} */}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    {...register("penyakit.keluhan_fisik")}
                  />
                </div>
                <div
                  className={cn(
                    "relative w-6/12"
                    // errors.anamnesis?.keluhan &&
                    //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keluhan Psikologis
                  </label>
                  {/* {errors.anamnesis?.keluhan ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {errors.anamnesis.keluhan.message}
                    </p>
                  ) : null} */}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    {...register("penyakit.keluhan_psikologis")}
                  />
                </div>
                <div
                  className={cn(
                    "relative w-6/12"
                    // errors.anamnesis?.keluhan &&
                    //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Diagnosis Dokter
                  </label>
                  {/* {errors.anamnesis?.keluhan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.anamnesis.keluhan.message}
                </p>
              ) : null} */}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    {...register("penyakit.diagnosis_dokter")}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Riwayat Kesehatan
                </div>
                <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div>
                    <label className="font-semibold dark:text-neutral-200">
                      Lahir
                    </label>
                    <div className="mb-1">
                      {[
                        "a. Normal",
                        "b. Operasi",
                        "c. Berat Badan Kurang",
                        "d. Premature",
                      ].map((val, idx) => (
                        <LabelButton
                          type="radio"
                          id={"lahir-" + (idx + 1)}
                          value={val}
                          key={idx}
                          className="py-0.5 font-semibold"
                          // {...register("kajian.soseksk.0")}
                        >
                          {val}
                        </LabelButton>
                      ))}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "relative w-6/12"
                      // errors.anamnesis?.keluhan &&
                      //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                    )}
                  >
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Penyakit yang pernah/sedang diderita (Dx Dokter)
                    </label>
                    {/* {errors.anamnesis?.keluhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {errors.anamnesis.keluhan.message}
                  </p>
                ) : null} */}
                    <Input
                      className="px-2 py-1 text-xs"
                      // {...register("anamnesis.keluhan")}
                    />
                  </div>
                  <div
                    className={cn(
                      "relative w-6/12"
                      // errors.anamnesis?.keluhan &&
                      //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                    )}
                  >
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Perilaku anak yang bermasalah
                    </label>
                    {/* {errors.anamnesis?.keluhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {errors.anamnesis.keluhan.message}
                  </p>
                ) : null} */}
                    <Input
                      className="px-2 py-1 text-xs"
                      // {...register("anamnesis.keluhan")}
                    />
                  </div>
                  <div
                    className={cn(
                      "relative w-6/12"
                      // errors.anamnesis?.keluhan &&
                      //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                    )}
                  >
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Perilaku anak yang menyenangkan
                    </label>
                    {/* {errors.anamnesis?.keluhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {errors.anamnesis.keluhan.message}
                  </p>
                ) : null} */}
                    <Input
                      className="px-2 py-1 text-xs"
                      // {...register("anamnesis.keluhan")}
                    />
                  </div>
                  <div
                    className={cn(
                      "relative w-6/12"
                      // errors.anamnesis?.keluhan &&
                      //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                    )}
                  >
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Kegiatan yang disukai anak
                    </label>
                    {/* {errors.anamnesis?.keluhan ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {errors.anamnesis.keluhan.message}
                  </p>
                ) : null} */}
                    <Input
                      className="px-2 py-1 text-xs"
                      // {...register("anamnesis.keluhan")}
                    />
                  </div>
                </div>
              </div>

              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Pertanyaan
                </div>
                <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div className="grid grid-flow-col grid-rows-4 gap-5">
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        1. Sebutkan gangguan belajar yang dialami anak anda?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {[
                          "a. Kesulitan membaca (baca w dan m atau b dan d terbalik-balik)",
                          "b. Kesulitan menulis (kalimat terbalik-balik, salah tanda baca)",
                          "c. Kesulitan berhitung/matematika",
                          "d. Menunda/tidak mengerjakan pr atau tugas sekolah",
                          "e. Lainnya",
                        ].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-1-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        2. Apakah anak anda mengalami kesulitan atau
                        keterlambatan bicara dan bahasa dibanding anak
                        seusianya?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {["a. Ya", "b. Tidak", "c. Sedikit"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-2-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        3. Apakah anak sulit konsentrasi, tidak dapat diam di
                        tempat duduk, cenderung terus bergerak?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {["a. Ya", "b. Tidak", "c. Sedikit"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-3-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        4. Sebutkan gangguan perilaku yang dialami anak anda?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {[
                          "a. Berbohong atau Kabur dari rumah",
                          "b. Mencuri atau Berkelahi",
                          "c. Membolos atau Tidak disiplin di sekolah",
                          "d. Lainnya",
                        ].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-4-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        5. Apakah anak anda mempuryal perilaku Berputar-putar,
                        Menyendiri, Meryakit diri sendiri, tantrum, kontak mata
                        minim?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {["a. Ya", "b. Tidak", "c. Sedikit", "d. Lainnya"].map(
                          (val, idx) => (
                            <LabelButton
                              type="radio"
                              id={"pertanyaan-5-" + (idx + 1)}
                              value={val}
                              key={idx}
                              className="rounded-md py-0.5 font-semibold"
                              // {...register("kajian.soseksk.0")}
                            >
                              {val}
                            </LabelButton>
                          )
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        6. Sebutkan hal hal atau penyakit atau kelainan yang
                        mengkhawatirkan pada anak anda?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {/* {[
                          "a. Kesulitan membaca (baca w dan m atau b dan d terbalik-balik)",
                          "b. Kesulitan menulis (kalimat terbalik-balik, salah tanda baca)",
                          "c. Kesulitan berhitung/matematika",
                          "d. Menunda/tidak mengerjakan pr atau tugas sekolah",
                          "e. Lainnya",
                        ].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-6-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))} */}
                        <Input className="px-2 py-1 pl-3 text-xs" />
                        <label className="font-semibold dark:text-neutral-200">
                          Apakah ada anggota keluarga yang mempunyai penyakit
                          atau kelainan tersebut?
                        </label>
                        <Input className="px-2 py-1 pl-3 text-xs" />
                      </div>
                    </div>
                    <div className="text-left">
                      <label className="font-semibold dark:text-neutral-200">
                        7. Sebutkan gangguan emosi yang mengkhawatirkan pada
                        anak anda?
                      </label>
                      <div className="mb-1 flex flex-col">
                        {[
                          "a. Cemas",
                          "b. Depresi",
                          "c. Trauma",
                          "d. Lainnya",
                        ].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"pertanyaan-7-" + (idx + 1)}
                            value={val}
                            key={idx}
                            className="rounded-md py-0.5 font-semibold"
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
                  Asesmen
                </div>
                <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div className="w-full px-4 py-2">
                    <div>
                      <label className="text-sm font-semibold dark:text-neutral-200">
                        Observasi
                      </label>
                      <div className="mx-auto grid w-3/4 grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Kognitif
                          </label>
                          <Controller
                            control={control}
                            name="kognitif.memori"
                            render={({
                              field: { onChange, value, onBlur },
                            }) => (
                              <div className="mb-1">
                                {["+", "-"].map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"memori-" + (idx + 1)}
                                    checked={val === "-" ? value : !value}
                                    onChange={() => {
                                      const e = val === "-";
                                      if (!e) {
                                        setValue("kognitif.memori_ket", "");
                                      }
                                      onChange(e);
                                    }}
                                    onBlur={onBlur}
                                    key={idx}
                                    className="py-0.5 font-semibold"
                                  >
                                    {val}
                                  </LabelButton>
                                ))}
                              </div>
                            )}
                          />
                          <Input
                            className="px-2 py-1 pl-3 text-xs"
                            disabled={!watch("kognitif.memori")}
                            {...register("kognitif.memori_ket")}
                            placeholder="Keterangan Memori"
                          />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Komunikasi
                          </label>
                          <Controller
                            control={control}
                            name="kognitif.konsentrasi"
                            render={({
                              field: { onChange, value, onBlur },
                            }) => (
                              <div className="mb-1">
                                {["+", "-"].map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"konsentrasi-" + (idx + 1)}
                                    checked={val === "-" ? value : !value}
                                    onChange={() => {
                                      const e = val === "-";
                                      if (!e) {
                                        setValue(
                                          "kognitif.konsentrasi_ket",
                                          ""
                                        );
                                      }
                                      onChange(e);
                                    }}
                                    onBlur={onBlur}
                                    key={idx}
                                    className="py-0.5 font-semibold"
                                  >
                                    {val}
                                  </LabelButton>
                                ))}
                              </div>
                            )}
                          />
                          <Input
                            className="px-2 py-1 pl-3 text-xs"
                            disabled={!watch("kognitif.konsentrasi")}
                            {...register("kognitif.konsentrasi_ket")}
                            placeholder="Keterangan Konsentrasi"
                          />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Sosial
                          </label>
                          <Controller
                            control={control}
                            name="kognitif.orientasi"
                            render={({
                              field: { onChange, value, onBlur },
                            }) => (
                              <div className="mb-1">
                                {["+", "-"].map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"orientasi-" + (idx + 1)}
                                    checked={val === "-" ? value : !value}
                                    onChange={() => {
                                      const e = val === "-";
                                      if (!e) {
                                        setValue("kognitif.orientasi_ket", "");
                                      }
                                      onChange(e);
                                    }}
                                    onBlur={onBlur}
                                    key={idx}
                                    className="py-0.5 font-semibold"
                                  >
                                    {val}
                                  </LabelButton>
                                ))}
                              </div>
                            )}
                          />
                          <Input
                            className="px-2 py-1 pl-3 text-xs"
                            disabled={!watch("kognitif.orientasi")}
                            {...register("kognitif.orientasi_ket")}
                            placeholder="Keterangan Orientasi"
                          />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Emosi
                          </label>
                          <Controller
                            control={control}
                            name="kognitif.verbal"
                            render={({
                              field: { onChange, value, onBlur, name },
                            }) => (
                              <div className="mb-1">
                                {["+", "-"].map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"verbal-" + (idx + 1)}
                                    checked={val === "-" ? value : !value}
                                    onChange={() => {
                                      const e = val === "-";
                                      if (!e) {
                                        setValue("kognitif.verbal_ket", "");
                                      }
                                      onChange(e);
                                    }}
                                    onBlur={onBlur}
                                    key={idx}
                                    className="py-0.5 font-semibold"
                                  >
                                    {val}
                                  </LabelButton>
                                ))}
                              </div>
                            )}
                          />
                          <Input
                            className="px-2 py-1 pl-3 text-xs"
                            disabled={!watch("kognitif.verbal")}
                            {...register("kognitif.verbal_ket")}
                            placeholder="Keterangan Kemampuan Verbal"
                          />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Perilaku/Psikomotorik
                          </label>
                          <Controller
                            control={control}
                            name="kognitif.verbal"
                            render={({
                              field: { onChange, value, onBlur, name },
                            }) => (
                              <div className="mb-1">
                                {["+", "-"].map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"verbal-" + (idx + 1)}
                                    checked={val === "-" ? value : !value}
                                    onChange={() => {
                                      const e = val === "-";
                                      if (!e) {
                                        setValue("kognitif.verbal_ket", "");
                                      }
                                      onChange(e);
                                    }}
                                    onBlur={onBlur}
                                    key={idx}
                                    className="py-0.5 font-semibold"
                                  >
                                    {val}
                                  </LabelButton>
                                ))}
                              </div>
                            )}
                          />
                          <Input
                            className="px-2 py-1 pl-3 text-xs"
                            disabled={!watch("kognitif.verbal")}
                            {...register("kognitif.verbal_ket")}
                            placeholder="Keterangan Kemampuan Verbal"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold dark:text-neutral-200">
                        Psikotes Pendukung
                      </label>
                      <div className="flex flex-col items-center gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div className="relative" key={i}>
                              <p className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold">
                                {i + 1 + "."}
                              </p>
                              <Input className="px-2 py-1 pl-3 text-xs" />
                            </div>
                          ))}
                        </div>
                        <div
                          className={cn(
                            "relative w-3/4"
                            // errors.anamnesis?.keluhan &&
                            //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                          )}
                        >
                          <label className="py-2 font-semibold dark:text-neutral-200">
                            Hasil Tes
                          </label>
                          {/* {errors.anamnesis?.keluhan ? (
                      <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                        {errors.anamnesis.keluhan.message}
                      </p>
                    ) : null} */}
                          <InputArea
                            className="mb-2 px-2 py-1 text-xs"
                            // {...register("anamnesis.keluhan")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Diagnosis Psikologi
                </div>
                <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div className="mx-auto grid w-3/4 grid-cols-3 gap-2">
                    <div className="grid gap-1">
                      <Controller
                        control={control}
                        name={"simpton"}
                        render={({ field: { onChange, value, onBlur } }) => {
                          return (
                            <>
                              {[
                                "Disabilitas Intelektual",
                                "Gangguan Komunikasi",
                                "Gangguan Belajar",
                                "Gangguan perilaku ADHD",
                              ].map((val) => (
                                <div
                                  className="flex items-start justify-start gap-1"
                                  key={val}
                                >
                                  <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    id={"simpton-" + val}
                                    onBlur={onBlur}
                                    checked={value?.some(
                                      (some) => some === val
                                    )}
                                    onChange={() => {
                                      const updatedDetail = value
                                        ? [...value]
                                        : [];
                                      const index = updatedDetail.indexOf(val);
                                      if (index === -1) {
                                        updatedDetail.push(val);
                                      } else {
                                        updatedDetail.splice(index, 1);
                                      }
                                      onChange(updatedDetail);
                                    }}
                                  />
                                  <label
                                    className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                    htmlFor={"simpton-" + val}
                                  >
                                    {val}
                                  </label>
                                </div>
                              ))}
                            </>
                          );
                        }}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Controller
                        control={control}
                        name={"simpton"}
                        render={({ field: { onChange, value, onBlur } }) => {
                          return (
                            <>
                              {[
                                "Gangg. Perilaku Conduct Disorder",
                                "Autism Spectrum Disorder",
                                "Gangguan perilaku Menentang",
                                "Gangguan depresi",
                              ].map((val) => (
                                <div
                                  className="flex items-start justify-start gap-1"
                                  key={val}
                                >
                                  <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    id={"simpton-" + val}
                                    onBlur={onBlur}
                                    checked={value?.some(
                                      (some) => some === val
                                    )}
                                    onChange={() => {
                                      const updatedDetail = value
                                        ? [...value]
                                        : [];
                                      const index = updatedDetail.indexOf(val);
                                      if (index === -1) {
                                        updatedDetail.push(val);
                                      } else {
                                        updatedDetail.splice(index, 1);
                                      }
                                      onChange(updatedDetail);
                                    }}
                                  />
                                  <label
                                    className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                    htmlFor={"simpton-" + val}
                                  >
                                    {val}
                                  </label>
                                </div>
                              ))}
                            </>
                          );
                        }}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Controller
                        control={control}
                        name={"simpton"}
                        render={({ field: { onChange, value, onBlur } }) => {
                          return (
                            <>
                              {[
                                "Gangguan Kecemasan",
                                "Gangguan bipolar",
                                "Gangguan Trauma",
                                "Phobia",
                              ].map((val) => (
                                <div
                                  className="flex items-start justify-start gap-1"
                                  key={val}
                                >
                                  <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    id={"simpton-" + val}
                                    onBlur={onBlur}
                                    checked={value?.some(
                                      (some) => some === val
                                    )}
                                    onChange={() => {
                                      const updatedDetail = value
                                        ? [...value]
                                        : [];
                                      const index = updatedDetail.indexOf(val);
                                      if (index === -1) {
                                        updatedDetail.push(val);
                                      } else {
                                        updatedDetail.splice(index, 1);
                                      }
                                      onChange(updatedDetail);
                                    }}
                                  />
                                  <label
                                    className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                    htmlFor={"simpton-" + val}
                                  >
                                    {val}
                                  </label>
                                </div>
                              ))}
                            </>
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="mx-auto flex w-1/4 py-2">
                    <Input
                      className="px-2 py-1 pl-3 text-xs"
                      placeholder="Lainnya"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {!isAnak ? (
            <>
              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Asesmen
                </div>
                <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div className="w-full px-4 py-2">
                    <div>
                      <label className="text-sm font-semibold dark:text-neutral-200">
                        Observasi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-semibold dark:text-neutral-200">
                            Deskripsi Umum
                          </label>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Penampilan Umum
                            </label>
                            <div className="mb-2">
                              {["Terawat", "Tidak Terawat"].map((val, idx) => (
                                <LabelButton
                                  type="radio"
                                  id={"penampilan-" + (idx + 1)}
                                  value={val}
                                  key={idx}
                                  {...register("observasi.penampilan")}
                                >
                                  {val}
                                </LabelButton>
                              ))}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Sikap terhadap Pemeriksa
                            </label>
                            <div className="mb-2">
                              {["Kooperatif", "Kurang Kooperatif"].map(
                                (val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"sikap-" + (idx + 1)}
                                    value={val}
                                    key={idx}
                                    {...register("observasi.sikap")}
                                  >
                                    {val}
                                  </LabelButton>
                                )
                              )}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Afek
                            </label>
                            <div className="mb-2">
                              {["Normal", "Datar", "Depresif"].map(
                                (val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"afek-" + (idx + 1)}
                                    value={val}
                                    key={idx}
                                    {...register("observasi.afek")}
                                  >
                                    {val}
                                  </LabelButton>
                                )
                              )}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Roman Muka
                            </label>
                            <div className="mb-2">
                              {["Wajar", "Murung", "Euphoria"].map(
                                (val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"muka-" + (idx + 1)}
                                    value={val}
                                    key={idx}
                                    {...register("observasi.muka")}
                                  >
                                    {val}
                                  </LabelButton>
                                )
                              )}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Proses Pikir
                            </label>
                            <div className="mb-2">
                              {["Realistik", "Tidak Realistik"].map(
                                (val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"proses_pikir-" + (idx + 1)}
                                    value={val}
                                    key={idx}
                                    {...register("observasi.pikir")}
                                  >
                                    {val}
                                  </LabelButton>
                                )
                              )}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-semibold dark:text-neutral-200">
                              Gangguan Persepsi
                            </label>
                            <div className="mb-2">
                              {["Tidak Ada", "Halusinasi", "Delusi"].map(
                                (val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"persepsi-" + (idx + 1)}
                                    value={val}
                                    key={idx}
                                    {...register("observasi.persepsi")}
                                  >
                                    {val}
                                  </LabelButton>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold dark:text-neutral-200">
                            Fungsi Psikologi
                          </label>

                          <div className="grid text-left text-xs">
                            <label className="font-bold dark:text-neutral-200">
                              Kognitif
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="font-semibold dark:text-neutral-200">
                                  Memori
                                </label>
                                <Controller
                                  control={control}
                                  name="kognitif.memori"
                                  render={({
                                    field: { onChange, value, onBlur },
                                  }) => (
                                    <div className="mb-1">
                                      {["+", "-"].map((val, idx) => (
                                        <LabelButton
                                          type="radio"
                                          id={"memori-" + (idx + 1)}
                                          checked={val === "-" ? value : !value}
                                          onChange={() => {
                                            const e = val === "-";
                                            if (!e) {
                                              setValue(
                                                "kognitif.memori_ket",
                                                ""
                                              );
                                            }
                                            onChange(e);
                                          }}
                                          onBlur={onBlur}
                                          key={idx}
                                          className="py-0.5 font-semibold"
                                        >
                                          {val}
                                        </LabelButton>
                                      ))}
                                    </div>
                                  )}
                                />
                                <Input
                                  className="px-2 py-1 pl-3 text-xs"
                                  disabled={!watch("kognitif.memori")}
                                  {...register("kognitif.memori_ket")}
                                  placeholder="Keterangan Memori"
                                />
                              </div>
                              <div>
                                <label className="font-semibold dark:text-neutral-200">
                                  Konsentrasi
                                </label>
                                <Controller
                                  control={control}
                                  name="kognitif.konsentrasi"
                                  render={({
                                    field: { onChange, value, onBlur },
                                  }) => (
                                    <div className="mb-1">
                                      {["+", "-"].map((val, idx) => (
                                        <LabelButton
                                          type="radio"
                                          id={"konsentrasi-" + (idx + 1)}
                                          checked={val === "-" ? value : !value}
                                          onChange={() => {
                                            const e = val === "-";
                                            if (!e) {
                                              setValue(
                                                "kognitif.konsentrasi_ket",
                                                ""
                                              );
                                            }
                                            onChange(e);
                                          }}
                                          onBlur={onBlur}
                                          key={idx}
                                          className="py-0.5 font-semibold"
                                        >
                                          {val}
                                        </LabelButton>
                                      ))}
                                    </div>
                                  )}
                                />
                                <Input
                                  className="px-2 py-1 pl-3 text-xs"
                                  disabled={!watch("kognitif.konsentrasi")}
                                  {...register("kognitif.konsentrasi_ket")}
                                  placeholder="Keterangan Konsentrasi"
                                />
                              </div>
                              <div>
                                <label className="font-semibold dark:text-neutral-200">
                                  Orientasi
                                </label>
                                <Controller
                                  control={control}
                                  name="kognitif.orientasi"
                                  render={({
                                    field: { onChange, value, onBlur },
                                  }) => (
                                    <div className="mb-1">
                                      {["+", "-"].map((val, idx) => (
                                        <LabelButton
                                          type="radio"
                                          id={"orientasi-" + (idx + 1)}
                                          checked={val === "-" ? value : !value}
                                          onChange={() => {
                                            const e = val === "-";
                                            if (!e) {
                                              setValue(
                                                "kognitif.orientasi_ket",
                                                ""
                                              );
                                            }
                                            onChange(e);
                                          }}
                                          onBlur={onBlur}
                                          key={idx}
                                          className="py-0.5 font-semibold"
                                        >
                                          {val}
                                        </LabelButton>
                                      ))}
                                    </div>
                                  )}
                                />
                                <Input
                                  className="px-2 py-1 pl-3 text-xs"
                                  disabled={!watch("kognitif.orientasi")}
                                  {...register("kognitif.orientasi_ket")}
                                  placeholder="Keterangan Orientasi"
                                />
                              </div>
                              <div>
                                <label className="font-semibold dark:text-neutral-200">
                                  Kemampuan Verbal
                                </label>
                                <Controller
                                  control={control}
                                  name="kognitif.verbal"
                                  render={({
                                    field: { onChange, value, onBlur, name },
                                  }) => (
                                    <div className="mb-1">
                                      {["+", "-"].map((val, idx) => (
                                        <LabelButton
                                          type="radio"
                                          id={"verbal-" + (idx + 1)}
                                          checked={val === "-" ? value : !value}
                                          onChange={() => {
                                            const e = val === "-";
                                            if (!e) {
                                              setValue(
                                                "kognitif.verbal_ket",
                                                ""
                                              );
                                            }
                                            onChange(e);
                                          }}
                                          onBlur={onBlur}
                                          key={idx}
                                          className="py-0.5 font-semibold"
                                        >
                                          {val}
                                        </LabelButton>
                                      ))}
                                    </div>
                                  )}
                                />
                                <Input
                                  className="px-2 py-1 pl-3 text-xs"
                                  disabled={!watch("kognitif.verbal")}
                                  {...register("kognitif.verbal_ket")}
                                  placeholder="Keterangan Kemampuan Verbal"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-bold dark:text-neutral-200">
                              Emosi
                            </label>
                            <div className="mb-1">
                              {["Stabil", "Tidak Stabil"].map((val, idx) => (
                                <LabelButton
                                  type="radio"
                                  id={"emosi-" + (idx + 1)}
                                  value={val}
                                  key={idx}
                                  {...register("observasi.emosi")}
                                >
                                  {val}
                                </LabelButton>
                              ))}
                            </div>
                          </div>
                          <div className="grid text-left text-xs">
                            <label className="font-bold dark:text-neutral-200">
                              Perilaku
                            </label>
                            <div className="mb-1">
                              {[
                                "Normal",
                                "Ada Hambatan",
                                "Agresif",
                                "Menarik Diri",
                              ].map((val, idx) => (
                                <LabelButton
                                  type="radio"
                                  id={"perilaku-" + (idx + 1)}
                                  value={val}
                                  key={idx}
                                  {...register("observasi.perilaku")}
                                >
                                  {val}
                                </LabelButton>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold dark:text-neutral-200">
                        Psikotes Pendukung
                      </label>
                      <div className="flex flex-col items-center gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div className="relative" key={i}>
                              <p className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold">
                                {i + 1 + "."}
                              </p>
                              <Input className="px-2 py-1 pl-3 text-xs" />
                            </div>
                          ))}
                        </div>
                        <div
                          className={cn(
                            "relative w-3/4"
                            // errors.anamnesis?.keluhan &&
                            //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                          )}
                        >
                          <label className="py-2 font-semibold dark:text-neutral-200">
                            Hasil Tes
                          </label>
                          {/* {errors.anamnesis?.keluhan ? (
                      <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                        {errors.anamnesis.keluhan.message}
                      </p>
                    ) : null} */}
                          <InputArea
                            className="mb-2 px-2 py-1 text-xs"
                            // {...register("anamnesis.keluhan")}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold dark:text-neutral-200">
                        Simptom
                      </label>
                      <div className="mx-auto grid w-3/4 grid-cols-3 gap-2">
                        <div className="grid gap-1">
                          <Controller
                            control={control}
                            name={"simpton"}
                            render={({
                              field: { onChange, value, onBlur },
                            }) => {
                              return (
                                <>
                                  {[
                                    "Sakit kepala",
                                    "Kurang nafsu makan",
                                    "Sulit tidur",
                                    "Mudah takut",
                                    "Tegang",
                                    "Cemas",
                                    "Gemetar",
                                  ].map((val) => (
                                    <div
                                      className="flex items-start justify-start gap-1"
                                      key={val}
                                    >
                                      <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        id={"simpton-" + val}
                                        onBlur={onBlur}
                                        checked={value?.some(
                                          (some) => some === val
                                        )}
                                        onChange={() => {
                                          const updatedDetail = value
                                            ? [...value]
                                            : [];
                                          const index =
                                            updatedDetail.indexOf(val);
                                          if (index === -1) {
                                            updatedDetail.push(val);
                                          } else {
                                            updatedDetail.splice(index, 1);
                                          }
                                          onChange(updatedDetail);
                                        }}
                                      />
                                      <label
                                        className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                        htmlFor={"simpton-" + val}
                                      >
                                        {val}
                                      </label>
                                    </div>
                                  ))}
                                </>
                              );
                            }}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Controller
                            control={control}
                            name={"simpton"}
                            render={({
                              field: { onChange, value, onBlur },
                            }) => {
                              return (
                                <>
                                  {[
                                    "Gangguan perut",
                                    "Sulit konsentrasi",
                                    "Sedih",
                                    "Sulit mengambil keputusan",
                                    "Kehilangan minat",
                                    "Merasa tidak berguna",
                                    "Mudah lupa",
                                  ].map((val) => (
                                    <div
                                      className="flex items-start justify-start gap-1"
                                      key={val}
                                    >
                                      <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        id={"simpton-" + val}
                                        onBlur={onBlur}
                                        checked={value?.some(
                                          (some) => some === val
                                        )}
                                        onChange={() => {
                                          const updatedDetail = value
                                            ? [...value]
                                            : [];
                                          const index =
                                            updatedDetail.indexOf(val);
                                          if (index === -1) {
                                            updatedDetail.push(val);
                                          } else {
                                            updatedDetail.splice(index, 1);
                                          }
                                          onChange(updatedDetail);
                                        }}
                                      />
                                      <label
                                        className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                        htmlFor={"simpton-" + val}
                                      >
                                        {val}
                                      </label>
                                    </div>
                                  ))}
                                </>
                              );
                            }}
                          />
                        </div>
                        <div className="grid gap-1">
                          <Controller
                            control={control}
                            name={"simpton"}
                            render={({
                              field: { onChange, value, onBlur },
                            }) => {
                              return (
                                <>
                                  {[
                                    "Merasa bersalah",
                                    "Mudah lelah",
                                    "Putus asa",
                                    "Mudah marah",
                                    "Mudah tersinggung",
                                    "Mimpi buruk",
                                    "Tidak percaya diri",
                                  ].map((val) => (
                                    <div
                                      className="flex items-start justify-start gap-1"
                                      key={val}
                                    >
                                      <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        id={"simpton-" + val}
                                        onBlur={onBlur}
                                        checked={value?.some(
                                          (some) => some === val
                                        )}
                                        onChange={() => {
                                          const updatedDetail = value
                                            ? [...value]
                                            : [];
                                          const index =
                                            updatedDetail.indexOf(val);
                                          if (index === -1) {
                                            updatedDetail.push(val);
                                          } else {
                                            updatedDetail.splice(index, 1);
                                          }
                                          onChange(updatedDetail);
                                        }}
                                      />
                                      <label
                                        className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                        htmlFor={"simpton-" + val}
                                      >
                                        {val}
                                      </label>
                                    </div>
                                  ))}
                                </>
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Dinamika Psikologi
                </div>
                <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div className="flex justify-center">
                    <InputArea
                      className="mb-2 w-6/12 px-2 py-1 text-xs"
                      placeholder="Dinamika Psikologi"
                      // {...register("keperawatan.tindakan")}
                    />
                  </div>
                </div>
              </div>
              <div className="pr-1">
                <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                  Diagnosis Psikologi
                </div>
                <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                  <div
                    className={cn(
                      "relative w-full",
                      errors.diagnosis &&
                        "rounded-lg bg-red-300 dark:bg-red-500/50"
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
                          className="!text-xs"
                          defaultOptions={icd10Options}
                          placeholder="Pilih ICD 10"
                          value={selIcd10}
                          onChange={(option: MyOption | null) =>
                            setSelIcd10(option)
                          }
                          maxMenuHeight={200}
                        />
                      </div>
                      <button
                        type="button"
                        className="mx-2"
                        onClick={addDiagnosis}
                      >
                        <RiAddCircleLine
                          size="1.5rem"
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>
                    </div>
                  </div>
                  <Transition
                    show={diagnosis?.length !== 0}
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div
                      className={cn(
                        "mt-2 w-full overflow-hidden rounded shadow"
                      )}
                    >
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
            </>
          ) : null}
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Rencana Intervensi Psikologi
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="flex justify-center">
                <InputArea
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  placeholder="Rencana Intervensi Psikologi"
                  // {...register("keperawatan.tindakan")}
                />
              </div>
            </div>
          </div>
          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Intervensi Psikologi
            </div>
            <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="flex justify-center">
                <InputArea
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  placeholder="Intervensi Psikologi"
                  // {...register("keperawatan.tindakan")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
