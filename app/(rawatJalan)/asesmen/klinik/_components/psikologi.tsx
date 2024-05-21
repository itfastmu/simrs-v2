import css from "@/assets/css/scrollbar.module.css";
import { Input, InputArea, LabelButton } from "@/components/form";
import { cn, getAge } from "@/lib/utils";
import Cookies from "js-cookie";
import { useFormContext } from "react-hook-form";
import { TAsesmenDok } from "../../schema";
import { useEffect, useState } from "react";

export default function AsesmenPsikologi({
  tanggal_lahir,
}: //   hasilPerawat,
//   isUpdate,
//   statusLokSrc,
//   setTabIdx,
//   panelDivRef,
{
  tanggal_lahir: string | undefined;
  //   hasilPerawat: THasilPerawat | undefined;
  //   isUpdate?: boolean;
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
    register,
    trigger,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

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
                    "relative w-6/12",
                    errors.anamnesis?.keluhan &&
                      "rounded-lg bg-red-300 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keluhan Fisik
                  </label>
                  {errors.anamnesis?.keluhan ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {errors.anamnesis.keluhan.message}
                    </p>
                  ) : null}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    // {...register("anamnesis.keluhan")}
                  />
                </div>
                <div
                  className={cn(
                    "relative w-6/12",
                    errors.anamnesis?.keluhan &&
                      "rounded-lg bg-red-300 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keluhan Psikologis
                  </label>
                  {errors.anamnesis?.keluhan ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {errors.anamnesis.keluhan.message}
                    </p>
                  ) : null}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
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
                    Diagnosis Dokter
                  </label>
                  {/* {errors.anamnesis?.keluhan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.anamnesis.keluhan.message}
                </p>
              ) : null} */}
                  <InputArea
                    className="-mb-1.5 px-2 py-1 text-xs"
                    // {...register("anamnesis.keluhan")}
                  />
                </div>
              </div>
            </div>
          ) : (
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
                        id={"orientasi-" + (idx + 1)}
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
          )}

          <div className="pr-1">
            <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
              Asesmen
            </div>
            <div className="flex h-[calc(100%-32px)] flex-col items-center justify-center gap-2 rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
              <div className="w-full px-4 py-2">
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
                            // {...register("kajian.soseksk.0")}
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
                        {["Kooperatif", "Kurang Kooperatif"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"sikap-" + (idx + 1)}
                            value={val}
                            key={idx}
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="grid text-left text-xs">
                      <label className="font-semibold dark:text-neutral-200">
                        Afek
                      </label>
                      <div className="mb-2">
                        {["Normal", "Datar", "Depresif"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"afek-" + (idx + 1)}
                            value={val}
                            key={idx}
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="grid text-left text-xs">
                      <label className="font-semibold dark:text-neutral-200">
                        Roman Muka
                      </label>
                      <div className="mb-2">
                        {["Wajar", "Murung", "Euphoria"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"muka-" + (idx + 1)}
                            value={val}
                            key={idx}
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                    <div className="grid text-left text-xs">
                      <label className="font-semibold dark:text-neutral-200">
                        Proses Pikir
                      </label>
                      <div className="mb-2">
                        {["Realistik", "Tidak Realistik"].map((val, idx) => (
                          <LabelButton
                            type="radio"
                            id={"proses_pikir-" + (idx + 1)}
                            value={val}
                            key={idx}
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
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
                              // {...register("kajian.soseksk.0")}
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
                          <div className="mb-1">
                            {["+", "-"].map((val, idx) => (
                              <LabelButton
                                type="radio"
                                id={"memori-" + (idx + 1)}
                                value={val}
                                key={idx}
                                className="py-0.5 font-semibold"
                                // {...register("kajian.soseksk.0")}
                              >
                                {val}
                              </LabelButton>
                            ))}
                          </div>
                          <Input className="px-2 py-1 pl-3 text-xs" />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Konsentrasi
                          </label>
                          <div className="mb-1">
                            {["+", "-"].map((val, idx) => (
                              <LabelButton
                                type="radio"
                                id={"konsentrasi-" + (idx + 1)}
                                value={val}
                                key={idx}
                                className="py-0.5 font-semibold"
                                // {...register("kajian.soseksk.0")}
                              >
                                {val}
                              </LabelButton>
                            ))}
                          </div>
                          <Input className="px-2 py-1 pl-3 text-xs" />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Orientasi
                          </label>
                          <div className="mb-1">
                            {["+", "-"].map((val, idx) => (
                              <LabelButton
                                type="radio"
                                id={"orientasi-" + (idx + 1)}
                                value={val}
                                key={idx}
                                className="py-0.5 font-semibold"
                                // {...register("kajian.soseksk.0")}
                              >
                                {val}
                              </LabelButton>
                            ))}
                          </div>
                          <Input className="px-2 py-1 pl-3 text-xs" />
                        </div>
                        <div>
                          <label className="font-semibold dark:text-neutral-200">
                            Kemampuan Verbal
                          </label>
                          <div className="mb-1">
                            {["+", "-"].map((val, idx) => (
                              <LabelButton
                                type="radio"
                                id={"verbal-" + (idx + 1)}
                                value={val}
                                key={idx}
                                className="py-0.5 font-semibold"
                                // {...register("kajian.soseksk.0")}
                              >
                                {val}
                              </LabelButton>
                            ))}
                          </div>
                          <Input className="px-2 py-1 pl-3 text-xs" />
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
                            // {...register("kajian.soseksk.0")}
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
                            // {...register("kajian.soseksk.0")}
                          >
                            {val}
                          </LabelButton>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

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
                      "relative w-3/4",
                      errors.anamnesis?.keluhan &&
                        "rounded-lg bg-red-300 dark:bg-red-500/50"
                    )}
                  >
                    <label className="py-2 font-semibold dark:text-neutral-200">
                      Hasil Tes
                    </label>
                    {errors.anamnesis?.keluhan ? (
                      <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                        {errors.anamnesis.keluhan.message}
                      </p>
                    ) : null}
                    <InputArea
                      className="mb-2 px-2 py-1 text-xs"
                      // {...register("anamnesis.keluhan")}
                    />
                  </div>
                </div>

                <label className="text-sm font-semibold dark:text-neutral-200">
                  Simptom
                </label>
                <div className="mx-auto grid w-3/4 grid-cols-3 gap-2">
                  <div className="grid gap-1">
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
                          // onBlur={onBlur}
                          // checked={value?.some((some) => some === val.id)}
                          // onChange={() => {
                          //   const updatedDetail = value ? [...value] : [];
                          //   const index = updatedDetail.indexOf(val.id);
                          //   if (index === -1) {
                          //     updatedDetail.push(val.id);
                          //   } else {
                          //     updatedDetail.splice(index, 1);
                          //   }
                          //   onChange(updatedDetail);
                          // }}
                        />
                        <label
                          className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                          htmlFor={"simpton-" + val}
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-1">
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
                          // onBlur={onBlur}
                          // checked={value?.some((some) => some === val.id)}
                          // onChange={() => {
                          //   const updatedDetail = value ? [...value] : [];
                          //   const index = updatedDetail.indexOf(val.id);
                          //   if (index === -1) {
                          //     updatedDetail.push(val.id);
                          //   } else {
                          //     updatedDetail.splice(index, 1);
                          //   }
                          //   onChange(updatedDetail);
                          // }}
                        />
                        <label
                          className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                          htmlFor={"simpton-" + val}
                        >
                          {val}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-1">
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
                          // onBlur={onBlur}
                          // checked={value?.some((some) => some === val.id)}
                          // onChange={() => {
                          //   const updatedDetail = value ? [...value] : [];
                          //   const index = updatedDetail.indexOf(val.id);
                          //   if (index === -1) {
                          //     updatedDetail.push(val.id);
                          //   } else {
                          //     updatedDetail.splice(index, 1);
                          //   }
                          //   onChange(updatedDetail);
                          // }}
                        />
                        <label
                          className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                          htmlFor={"simpton-" + val}
                        >
                          {val}
                        </label>
                      </div>
                    ))}
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
              <div className="flex justify-center">
                <InputArea
                  className="mb-2 w-6/12 px-2 py-1 text-xs"
                  placeholder="Diagnosis Psikologi"
                  // {...register("keperawatan.tindakan")}
                />
              </div>
            </div>
          </div>
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
