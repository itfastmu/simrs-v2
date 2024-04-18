import { KunjunganRajal } from "@/app/(pendaftaran)/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input, LabelButton } from "@/components/form";
import { APIURL } from "@/lib/connection";
import { cn, getAge } from "@/lib/utils";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TbChevronDown } from "react-icons/tb";
import { toast } from "react-toastify";
import { z } from "zod";
import { THasilSkrining } from "../schema";

export type SkriningState = {
  modal: boolean;
  data?: Pick<
    KunjunganRajal,
    | "id_kunjungan"
    | "id_pasien"
    | "nama"
    | "tanggal_lahir"
    | "id_klinik"
    | "id_proses"
  >;
};
export type SkriningAction = { type: "setSkrining"; skrining: SkriningState };

export default function SkriningPerawatDialog({
  skriningState,
  skriningDispatch,
  loadData,
}: {
  skriningState: SkriningState;
  skriningDispatch: React.Dispatch<SkriningAction>;
  loadData: () => Promise<void>;
}) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const tutup = () => {
    skriningDispatch({
      type: "setSkrining",
      skrining: { ...skriningState, modal: false },
    });
    if (watch("id_kunjungan") !== skriningState.data?.id_kunjungan) reset();
    formRef.current?.scrollTo(0, 0);
  };

  const [isMutating, setIsMutating] = useState<boolean>(false);
  type TSkrining = {
    id: number;
    id_tipe: number;
    tipe: string;
    skrining: {
      header: string | null;
      detail: {
        id: number;
        pertanyaan: string;
        isian: boolean;
        bool: boolean;
        jawaban: {
          id_instrumen: number;
          jawaban: string;
          skor: number;
        }[];
      }[];
    }[];
  }[];
  const [skrining, setSkrining] = useState<TSkrining>([]);
  const [idxSkriningNyeri, setIdxSkriningNyeri] = useState<number>(NaN);
  useEffect(() => {
    if (!skriningState.modal) return;
    const finger = async () => {
      await fetch(`${APIURL}/rs/kunjungan/finger`, {
        headers: headers,
      });
    };
    finger();

    setValue("id_kunjungan", skriningState.data?.id_kunjungan!);
    const loadSkrining = async () => {
      try {
        setIsMutating(true);
        const get = await fetch(`${APIURL}/rs/rajal/skrining`, {
          headers: headers,
        });
        let res = await get.json();
        if (res.status !== "Ok") throw new Error(res.message);
        let data = res.data as TSkrining;
        const umur = getAge(new Date(skriningState.data?.tanggal_lahir!));
        switch (true) {
          case umur <= 5:
            data = data.filter(
              (val) =>
                !val.tipe.toLowerCase().includes("dewasa") &&
                !val.tipe.toLowerCase().includes("gizi awal anak")
            );
            break;
          case umur <= 18:
            data = data.filter(
              (val) =>
                !val.tipe.toLowerCase().includes("dewasa") &&
                !val.tipe.toLowerCase().includes("gizi awal balita")
            );
            break;
          case umur > 18:
            data = data.filter(
              (val) =>
                !val.tipe.toLowerCase().includes("anak") &&
                !val.tipe.toLowerCase().includes("balita")
            );
            break;
        }
        setIdxSkriningNyeri(data.findIndex((val) => val.id_tipe === 12));
        if (skriningState.data?.id_klinik !== 2) {
          // if (skriningState.data?.id_klinik !== "ANA") {
          data = data.map((skrining) => {
            if (skrining.tipe === "Risiko Jatuh") {
              const updatedSkrining = skrining.skrining.map((val) => {
                if (val.detail) {
                  val.detail = val.detail.filter(
                    (detail) => detail.pertanyaan !== "Humpty Dumpty"
                  );
                }
                return val;
              });
              skrining.skrining = updatedSkrining;
            }
            return skrining;
          });
        }
        setSkrining(data);
        // if (watch("skrining")?.some((val) => val?.skor?.length > 0)) return;
        (data as TSkrining).forEach((val, idx) => {
          const pertanyaan: number[] = [];
          const isian: string[] = [];
          val.skrining.forEach((per) =>
            per.detail.forEach((val_per) => {
              if (val_per.isian) {
                isian.push("");
              } else {
                pertanyaan.push(val_per.id);
              }
            })
          );
          setValue(`skrining.${idx}`, {
            id_tipe: val.id_tipe,
            pertanyaan: pertanyaan,
            skor: Array.from(
              { length: pertanyaan.length },
              (_, idx) => {
                return val.tipe === "Nyeri" && idx !== 0 ? NaN : 0;
              }
              // 0
            ),
            tambahan: isian,
          });
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsMutating(false);
        formRef.current?.scrollTo(0, 0);
      }
    };
    loadSkrining();
  }, [skriningState]);

  const skeletonComponents = () => {
    return [...Array(2)].map((_, i) => (
      <div className="animate-pulse pr-1" key={i}>
        <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
          &nbsp;
        </div>
        <div className="h-screen rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
          &nbsp;
        </div>
      </div>
    ));
  };

  const SkriningSchema = z.object({
    id_kunjungan: z.string(),
    skrining: z
      .object({
        id_tipe: z.number(),
        pertanyaan: z.number().array(),
        skor: z.number().or(z.nan()).array(),
        tambahan: z.string().array(),
      })
      .array(),
  });

  type TSkriningSchema = z.infer<typeof SkriningSchema>;

  const {
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TSkriningSchema>({
    resolver: zodResolver(SkriningSchema),
    defaultValues: {
      id_kunjungan: skriningState.data?.id_kunjungan,
      skrining: [],
    },
  });

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const adaNyeri = watch(`skrining.${idxSkriningNyeri}.skor.0`) === 1;
  useEffect(() => {
    if (watch("skrining").length < 1) return;
    if (!adaNyeri)
      setValue(
        `skrining.${idxSkriningNyeri}.skor`,
        Array.from(
          { length: watch(`skrining.${idxSkriningNyeri}.pertanyaan`)?.length },
          (_, idx) => {
            return idx !== 0 ? NaN : 0;
          }
        )
      );
    setValue(`skrining.${idxSkriningNyeri}.tambahan.0`, "");
  }, [adaNyeri]);

  const submitHandler: SubmitHandler<TSkriningSchema> = async (data, e) => {
    try {
      e?.preventDefault();
      // let resJson: any;
      // if (ubah.modal) {
      //   const put = await fetch(
      //     `${APIURL}/rs/rajal/skrining/${ubah.data?.id}`,
      //     {
      //       method: "PUT",
      //       headers: headers,
      //       body: JSON.stringify(data),
      //     }
      //   );
      //   resJson = await put.json();
      //   if (resJson.status !== "Updated") throw new Error(resJson.message);
      // } else {
      const post = await fetch(`${APIURL}/rs/rajal/skrining`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resJson = await post.json();
      if (resJson.status !== "Created") throw new Error(resJson.message);
      // }
      tutup();
      toast.success("Skrining awal berhasil disimpan!");
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Transition show={skriningState.modal} as={Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={() => false}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex h-screen items-center justify-center px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex h-full w-full max-w-5xl transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Skrining Awal Rawat Jalan
                </Dialog.Title>
                {parseInt(skriningState.data?.id_proses!) > 3 ? (
                  <>
                    <HasilSkrining
                      idKunjungan={skriningState.data?.id_kunjungan}
                    />
                    <div className="mt-3 flex justify-center gap-1">
                      <Button color="red" onClick={tutup}>
                        Keluar
                      </Button>
                    </div>
                  </>
                ) : (
                  <form
                    onSubmit={handleSubmit(submitHandler)}
                    className={cn("mt-2 flex-1 overflow-y-auto", css.scrollbar)}
                    ref={formRef}
                  >
                    <div
                      className={cn(
                        "mb-2 grid grid-flow-row grid-cols-2 gap-2"
                      )}
                    >
                      {isMutating ? skeletonComponents() : null}
                      {skrining?.map((data, dataId) => (
                        <div key={data.id} className="pr-1 text-end">
                          <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
                            Skrining {data.tipe}
                          </div>
                          <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
                            <div className="mx-1.5 grid grid-cols-2 gap-2 py-2">
                              {data.skrining?.map((skrin, skrId) => (
                                <Fragment
                                  key={String(dataId) + "-" + String(skrId)}
                                >
                                  {skrin.detail.map((detail, detailId) => (
                                    <>
                                      {detail.pertanyaan !== "Psikologis" ? (
                                        <label
                                          className="py-2 font-semibold dark:text-neutral-200"
                                          htmlFor={`${detailId}-${1}`}
                                          key={detailId}
                                        >
                                          {detail.pertanyaan}
                                        </label>
                                      ) : null}

                                      {data.id_tipe !== 12 &&
                                      detail.pertanyaan !== "Cacat Tubuh" ? (
                                        <Controller
                                          control={control}
                                          name={
                                            data.id !== 11
                                              ? `skrining.${dataId}.skor.${detailId}`
                                              : /* GIZI DEWASA */
                                                /* INCREMENTED INDEX */
                                                `skrining.${dataId}.skor.${
                                                  skrId < 1
                                                    ? detailId
                                                    : data.skrining
                                                        .slice(0, skrId)
                                                        .reduce(
                                                          (acc, current) =>
                                                            acc +
                                                            current.detail
                                                              .length,
                                                          0
                                                        ) + detailId
                                                }`
                                          }
                                          render={({
                                            field: { onChange, value, onBlur },
                                          }) => (
                                            <div
                                              className={cn(
                                                "mb-2 flex flex-wrap items-center justify-center",
                                                detail.pertanyaan ===
                                                  "Psikologis" && "col-span-2",
                                                (data.id === 9 ||
                                                  data.id === 10) &&
                                                  "justify-end"
                                              )}
                                            >
                                              {detail.jawaban?.map(
                                                (jawaban, jwbId) => {
                                                  return (
                                                    <LabelButton
                                                      type="radio"
                                                      className={cn(
                                                        "h-fit",
                                                        (data.id === 9 ||
                                                          data.id === 10) &&
                                                          "whitespace-pre rounded-lg text-left",
                                                        `${skrId}`,
                                                        (data.id === 2 ||
                                                          detail.jawaban
                                                            .length > 2) &&
                                                          "rounded-lg",
                                                        // Kegiatan Ibadah
                                                        jawaban.id_instrumen ===
                                                          38 && "rounded-lg"
                                                      )}
                                                      id={`${detail.pertanyaan.replace(
                                                        /\s/g,
                                                        "_"
                                                      )}-${jwbId + 1}`}
                                                      key={jwbId}
                                                      onBlur={onBlur}
                                                      checked={
                                                        value === jawaban.skor
                                                      }
                                                      onChange={() =>
                                                        onChange(jawaban.skor)
                                                      }
                                                    >
                                                      {jawaban.jawaban}
                                                    </LabelButton>
                                                  );
                                                }
                                              )}
                                            </div>
                                          )}
                                        />
                                      ) : detail.pertanyaan === "Cacat Tubuh" ||
                                        detail.pertanyaan === "Lokasi Nyeri" ? (
                                        <div
                                          className={cn(
                                            detail.pertanyaan !==
                                              "Lokasi Nyeri" &&
                                              "flex justify-center"
                                          )}
                                        >
                                          <Input
                                            disabled={
                                              detail.pertanyaan ===
                                              "Lokasi Nyeri"
                                                ? !adaNyeri
                                                : false
                                            }
                                            className={cn(
                                              "w-fit px-2 py-1 text-xs"
                                            )}
                                            {...register(
                                              `skrining.${dataId}.tambahan.0`
                                            )}
                                          />
                                        </div>
                                      ) : (
                                        /* NYERI */
                                        <>
                                          {detail.pertanyaan === "Nyeri" ? (
                                            <Controller
                                              control={control}
                                              name={`skrining.${dataId}.skor.${detailId}`}
                                              render={({
                                                field: {
                                                  onChange,
                                                  value,
                                                  onBlur,
                                                },
                                              }) => (
                                                <div>
                                                  {["Tidak Ada", "Ada"].map(
                                                    (val, idx) => (
                                                      <LabelButton
                                                        type="radio"
                                                        id={`${detail.pertanyaan.replace(
                                                          /\s/g,
                                                          "_"
                                                        )}-${idx}`}
                                                        key={val}
                                                        onBlur={onBlur}
                                                        checked={value === idx}
                                                        onChange={() =>
                                                          onChange(idx)
                                                        }
                                                      >
                                                        {val}
                                                      </LabelButton>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                            />
                                          ) : null}
                                          {detail.pertanyaan === "NIPS" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                placeholder="0-7"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 7 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      7
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan === "FLACC" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                placeholder="0-10"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 10 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      10
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan ===
                                            "Wong Baker" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                step={2}
                                                placeholder="0-10"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value % 2 !== 0 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      +e.target.value + 1
                                                    );
                                                  +e.target.value > 10 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      10
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan ===
                                            "Numeric" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                placeholder="0-10"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 10 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      10
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan ===
                                            "Comfort" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                placeholder="8-40"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onBlurCapture={(e) => {
                                                  !!e.target.value &&
                                                    +e.target.value < 8 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      8
                                                    );
                                                }}
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 40 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      40
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan === "PAINAD" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                placeholder="0-10"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 10 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      10
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan === "CRIES" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                min={0}
                                                placeholder="0-10"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 10 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      10
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : detail.pertanyaan === "BPS" ? (
                                            <div>
                                              <Input
                                                disabled={!adaNyeri}
                                                type="number"
                                                className="w-fit px-2 py-1 text-xs"
                                                placeholder="3-12"
                                                {...register(
                                                  `skrining.${dataId}.skor.${detailId}`,
                                                  {
                                                    valueAsNumber: true,
                                                  }
                                                )}
                                                onWheel={(e) =>
                                                  e.currentTarget.blur()
                                                }
                                                onBlurCapture={(e) => {
                                                  !!e.target.value &&
                                                    +e.target.value < 3 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      3
                                                    );
                                                }}
                                                onInput={(
                                                  e: React.FocusEvent<
                                                    HTMLInputElement,
                                                    Element
                                                  >
                                                ) => {
                                                  +e.target.value > 12 &&
                                                    setValue(
                                                      `skrining.${dataId}.skor.${detailId}`,
                                                      12
                                                    );
                                                }}
                                              />
                                            </div>
                                          ) : null}
                                        </>
                                      )}
                                    </>
                                  ))}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1">
                      <Button color="cyan100" type="submit">
                        Simpan
                      </Button>
                      <Button color="red" onClick={tutup}>
                        Keluar
                      </Button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function HasilSkrining({ idKunjungan }: { idKunjungan?: string }) {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");
  const params = useParams();

  const [isMutating, setIsMutating] = useState<boolean>(true);
  const [hasilSkrining, setHasilSkrining] = useState<THasilSkrining[]>([]);
  const [adaHasil, setAdaHasil] = useState<boolean>(false);
  const loadHasilSkrining = async () => {
    try {
      setIsMutating(true);
      const url = `${APIURL}/rs/rajal/skrining/hasil/${
        (params.idKunjungan as string) || idKunjungan!
        // kunjunganTemp
      }`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      if (resp.status === 204) return;
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setAdaHasil(true);
      setHasilSkrining(json?.data);
    } catch (err) {
      const error = err as Error;
      if (
        error.message === "Data tidak ditemukan" ||
        error.message === "Belum dilakukan asesmen"
      )
        return toast.warning("Belum diasesmen perawat!");
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };
  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (!initialized.current) {
      loadHasilSkrining();
      initialized.current = true;
    }
  }, []);

  return (
    <Disclosure as="div" className="self-stretch pr-1" defaultOpen>
      <Disclosure.Button className="relative w-full select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 focus:outline-none dark:bg-sky-700">
        Hasil Skrining
        <TbChevronDown className="absolute right-2 top-1/2 size-5 -translate-y-1/2 ui-open:rotate-180 ui-open:transform" />
      </Disclosure.Button>
      <Transition
        enter="ease-out duration-300"
        enterFrom="opacity-0 -translate-y-0.5"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Disclosure.Panel
          className={cn(
            "flex h-[calc(100%-32px)] flex-col items-center justify-center rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800"
          )}
        >
          <div className="grid grid-cols-2 items-center justify-center gap-2 self-stretch">
            {isMutating ? (
              <>
                {[...Array(2)].map((_, idx) => (
                  <div
                    className="flex animate-pulse flex-col gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-gray-700"
                    key={idx.toString()}
                  >
                    <p className="h-5 w-36 self-center rounded bg-slate-200 dark:bg-slate-400"></p>
                    <p className="h-4 w-28 self-center rounded bg-slate-200 dark:bg-slate-400"></p>
                    <ul className="list-decimal self-start pl-4 text-slate-200">
                      <li className=""></li>
                      <li className=""></li>
                      <li className=""></li>
                    </ul>
                  </div>
                ))}
              </>
            ) : !adaHasil ? (
              <p className="col-span-2 self-stretch py-2 text-center align-middle font-semibold">
                Belum dilakukan Skrining Rawat Jalan
              </p>
            ) : hasilSkrining.length === 0 ? (
              <p className="col-span-2 self-stretch py-2 text-center align-middle font-semibold">
                Seluruh hasil Skrining Rawat Jalan terindikasi normal
              </p>
            ) : (
              hasilSkrining.map((val, i) => (
                <div
                  className="flex h-full flex-col gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-gray-700"
                  key={val.nama}
                >
                  <p className={cn("text-sm", !val.normal && "text-red-500")}>
                    Skrining {val.nama}
                  </p>
                  <p>{val.indikasi}</p>
                  <ul className="list-decimal self-start pl-4">
                    {val.nama_pertanyaans.map((perVal, perIdx) => (
                      <li className="my-0.5 text-left last:my-0" key={perVal}>
                        <p>{perVal}</p>
                        <p>{val.nama_skors.at(perIdx) || "Ya"}</p>
                      </li>
                    ))}
                  </ul>
                  {val.id_tipe === 12 ? (
                    <p className="text-left">Lokasi {val.tambahan.at(0)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Disclosure.Panel>
      </Transition>
    </Disclosure>
  );
}
