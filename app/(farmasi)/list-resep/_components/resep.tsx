import FastabiqLogo from "@/assets/img/fastabiq-logo.png";
import { APIURL } from "@/lib/connection";
import React, {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { ArrayElementType, cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { Input, LabelButton } from "@/components/form";
import { Barang, ObatResep } from "../../schema";
import { ResepAction, ValidResepState } from "../page";
import Image from "next/image";
import { IoPrint } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";

type ResepDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  resep: ValidResepState;
  resepDispatch: React.Dispatch<ResepAction>;
  loadData: () => Promise<void>;
};

export default function ResepDialog({
  tambahDialog,
  setTambahDialog,
  resep,
  resepDispatch,
  loadData,
}: ResepDialogProps) {
  const tutup = () => {
    setStatus(0);
    reset();
    loadData();
    tambahDialog
      ? setTambahDialog(false)
      : resepDispatch({
          type: "setResep",
          resep: {
            modal: false,
          },
        });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [status, setStatus] = useState<number>(0);
  useEffect(() => {
    setValue("type", status === 0 ? 0 : 1);
  }, [status]);

  const [resepPasien, setResepPasien] = useState<ObatResep>();
  useEffect(() => {
    if (!resep.modal) return;
    if (resep.data?.status === "Etiket telah dibuat") {
      // unregister("detail");
      loadEtiket();
      setStatus(1);
      setValue("telaah", {
        identitas: true,
        obat: true,
        dosis: true,
        rute: true,
        waktu: true,
        jumlah: true,
      });
    }
    if (resep.data?.status === "Semua obat tervalidasi") {
      // unregister("detail");
      loadEtiket();
      setStatus(2);
    }
    setValue("id_kunjungan", resep.data?.id_kunjungan!);

    const loadResep = async () => {
      try {
        const url = `${APIURL}/rs/farmasi/resep/${resep.data?.id_kunjungan}`;
        const resp = await fetch(url, { method: "GET", headers: headers });
        const json = await resp.json();
        if (json.status !== "Ok") throw new Error(json.message);
        // console.log(json);
        const data: ObatResep = json?.data;
        setResepPasien(data);
        if (resep.data?.status === "Resep divalidasi") {
          data.nonracik.forEach((val) => {
            setValue("detail", [
              ...watch("detail"),
              { id_resep: val.id_resep, aturan: "" },
            ]);
          });
          data.racik.forEach((val) => {
            setValue("detail", [
              ...watch("detail"),
              { id_resep: val.id_resep, aturan: "" },
            ]);
          });
        }
      } catch (err) {
        const error = err as Error;
        toast.error(error.message);
        console.error(error);
      }
    };
    loadResep();
  }, [resep]);

  type Etiket = {
    nama_pasien: string;
    id_resep: number;
    id_kunjungan: string;
    id_poa: number;
    tanggal_lahir: string;
    no_rm: string;
    kekuatan: string;
    satuan: string;
    sediaan: string;
    jumlah: number;
    waktu: string;
    rute: string;
    id: number;
    nama: string;
    aturan: string;
  };
  const [etiketPasien, setEtiketPasien] = useState<Etiket[]>([]);
  const loadEtiket = async () => {
    try {
      const url = `${APIURL}/rs/farmasi/etiket/${resep.data?.id_kunjungan}`;
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      const data = json?.data;
      setEtiketPasien(data);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const EtiketResepSchema = z.object({
    type: z.literal(0),
    id_kunjungan: z.string(),
    detail: z
      .object({
        id_resep: z.number(),
        aturan: z.string(),
      })
      .array(),
  });
  const TelaahObatSchema = z.object({
    type: z.literal(1),
    id_kunjungan: z.string(),
    telaah: z.object({
      identitas: z.boolean(),
      obat: z.boolean(),
      jumlah: z.boolean(),
      dosis: z.boolean(),
      rute: z.boolean(),
      waktu: z.boolean(),
    }),
  });

  const FormSchema = z.discriminatedUnion("type", [
    EtiketResepSchema,
    TelaahObatSchema,
  ]);

  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    handleSubmit,
    setValue,
    unregister,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: status === 0 ? 0 : 1,
      detail: [],
    },
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      const { type, ...parsedData } = data;
      const url =
        type === 0
          ? `${APIURL}/rs/farmasi/etiket`
          : `${APIURL}/rs/farmasi/telaah_obat`;
      const post = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(parsedData),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      if (status === 0) {
        toast.success("Etiket tersimpan");
        setStatus(1);
        loadEtiket();
        setValue("telaah", {
          identitas: true,
          obat: true,
          dosis: true,
          rute: true,
          waktu: true,
          jumlah: true,
        });
      } else {
        toast.success("Seluruh obat berhasil tervalidasi");
        setStatus(3);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  type EtiketCetakState = {
    modal: boolean;
    data?: Etiket;
  };
  type EtiketCetakAction = {
    type: "setEtiket";
    etiket: EtiketCetakState;
  };

  const etiketCetakState = {
    modal: false,
  };
  const etiketCetakActs = (
    state: EtiketCetakState,
    action: EtiketCetakAction
  ) => {
    switch (action.type) {
      case "setEtiket": {
        return {
          ...action.etiket,
        };
      }
    }
  };
  const [edit, setEdit] = useState<boolean>(false);
  const [etiketCetak, etiketCetakDispatch] = useReducer(
    etiketCetakActs,
    etiketCetakState
  );

  const cetakEtiketRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    await onBeforeGetContentResolve.current;
  }, [etiketCetak]);

  const reactToPrintContent = useCallback(() => {
    return cetakEtiketRef.current;
  }, [cetakEtiketRef.current]);

  const handlePrintEtiket = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Etiket Pasien",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  return (
    <Transition show={resep.modal || tambahDialog} as={Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={tutup}>
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
          <div className="flex h-screen items-center justify-end overflow-hidden text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 translate-x-5 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "h-full w-full transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  resep.data?.status === "Semua obat tervalidasi"
                    ? "max-w-5xl"
                    : "max-w-7xl",
                  css.scrollbar
                )}
              >
                <form
                  className="flex flex-col"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <div className="mb-4 flex justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                    <p>{resep.data?.no_rm}</p>
                    <p>{resep.data?.nama}</p>
                    <p>{resep.data?.id_kunjungan}</p>
                  </div>
                  <div
                    className={cn(
                      // status === 1
                      //   ? "grid grid-cols-3 gap-4"
                      // :
                      "flex justify-center gap-4"
                    )}
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      <p className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                        Resep Dokter
                      </p>
                      <div className="flex flex-col">
                        <p className="text-center text-sm">Resep Non Racikan</p>
                        <div
                          className={cn(
                            "w-full overflow-hidden rounded shadow"
                          )}
                        >
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                <td className="px-4 py-2">Nama Obat</td>
                                <td className="px-4 py-2">Sediaan</td>
                                <td className="px-4 py-2">Dosis</td>
                                <td className="px-4 py-2">Rute</td>
                                <td className="px-4 py-2">Waktu</td>
                                <td className="px-4 py-2">Jumlah</td>
                                <td className="px-4 py-2">Aturan Pakai</td>
                                <Transition
                                  appear
                                  show={status > 0}
                                  as={Fragment}
                                  enter="ease-out duration-300"
                                  enterFrom="opacity-0 -translate-y-1"
                                  enterTo="opacity-100"
                                  leave="ease-in duration-150"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <td className="px-4 py-2 text-center">*</td>
                                </Transition>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {resepPasien?.nonracik?.map((nonracik, idx) => (
                                <tr
                                  className={cn(
                                    "bg-white hover:text-sky-600 dark:bg-slate-900"
                                    // "divide-x divide-gray-300 dark:divide-gray-800"
                                  )}
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {nonracik.nama_obat}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {nonracik.sediaan}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {nonracik.kekuatan}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {nonracik.rute}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {nonracik.waktu.filter(Boolean).join(" ")}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                    {nonracik.jumlah}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                    <Transition
                                      appear
                                      show={status === 0}
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
                                          className="px-1.5 py-1 text-xs font-normal"
                                          value={
                                            (watch("detail") || []).find(
                                              (val) =>
                                                val.id_resep ===
                                                nonracik.id_resep
                                            )?.aturan || ""
                                          }
                                          onChange={(e) => {
                                            const detailAturan = (
                                              watch("detail") || []
                                            ).map((val) => {
                                              if (
                                                val.id_resep ===
                                                nonracik.id_resep
                                              ) {
                                                return {
                                                  ...val,
                                                  aturan: e.target.value,
                                                };
                                              }
                                              return val;
                                            });
                                            setValue("detail", detailAturan);
                                          }}
                                        />
                                      </div>
                                    </Transition>
                                    <Transition
                                      appear
                                      show={status > 0}
                                      as={Fragment}
                                      enter="ease-out duration-300"
                                      enterFrom="opacity-0 -translate-y-1"
                                      enterTo="opacity-100"
                                      leave="ease-in duration-150"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <td className="px-4 py-2">
                                        {
                                          etiketPasien.find(
                                            (val) =>
                                              val.id_resep === nonracik.id_resep
                                          )?.aturan
                                        }
                                      </td>
                                    </Transition>
                                  </td>
                                  <Transition
                                    appear
                                    show={status > 0}
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 -translate-y-1"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-150"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <td className="px-4 py-2 text-center">
                                      <button type="button">
                                        <IoPrint
                                          size="1.5rem"
                                          className={cn("text-cyan-600")}
                                          onClick={() => {
                                            etiketCetakDispatch({
                                              type: "setEtiket",
                                              etiket: {
                                                modal: false,
                                                data: etiketPasien.find(
                                                  (val) =>
                                                    val.id_resep ===
                                                    nonracik.id_resep
                                                ),
                                              },
                                            });
                                            handlePrintEtiket();
                                          }}
                                        />
                                      </button>
                                    </td>
                                  </Transition>
                                </tr>
                              ))}
                              {resepPasien?.nonracik.length === 0 ? (
                                <tr>
                                  <td colSpan={8}>
                                    <p className="px-4 py-2 text-center">
                                      Tidak ada obat non racik
                                    </p>
                                  </td>
                                </tr>
                              ) : null}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-center text-sm">Resep Racikan</p>
                        <div
                          className={cn(
                            "w-full overflow-x-auto rounded shadow",
                            css.scrollbar
                          )}
                        >
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                <td className="px-2 py-1" rowSpan={2}>
                                  Racikan
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Metode
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Rute
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Waktu
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Bungkus
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Tipe
                                </td>
                                <td
                                  className="px-2 py-1 text-center"
                                  colSpan={5}
                                >
                                  Detail
                                </td>
                                <td className="px-2 py-1" rowSpan={2}>
                                  Aturan Pakai
                                </td>
                                <Transition
                                  appear
                                  show={status > 0}
                                  as={Fragment}
                                  enter="ease-out duration-300"
                                  enterFrom="opacity-0 -translate-y-1"
                                  enterTo="opacity-100"
                                  leave="ease-in duration-150"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <td
                                    className="px-2 py-1 text-center"
                                    rowSpan={2}
                                  >
                                    *
                                  </td>
                                </Transition>
                              </tr>
                              <tr className="border-t border-slate-50 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-800">
                                <td className="border-x border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                  No.
                                </td>
                                <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                  Obat
                                </td>
                                <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                  Sediaan
                                </td>
                                <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                  Dosis/bungkus
                                </td>
                                <td className="px-2 py-0.5">Jumlah</td>
                              </tr>
                            </thead>
                            <tbody>
                              {resepPasien?.racik?.map((racik, idx) => (
                                <>
                                  <tr
                                    className={cn(
                                      "bg-white hover:text-sky-600 dark:bg-slate-900",
                                      "align-top"
                                    )}
                                    key={idx}
                                  >
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.nama_racik}
                                    </td>
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.metode}
                                    </td>
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.rute}
                                    </td>
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.waktu.filter(Boolean).join(" ")}
                                    </td>
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "text-center",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.jumlah}
                                    </td>
                                    <td
                                      className={cn(
                                        "whitespace-pre-wrap px-2 py-1.5",
                                        "text-center",
                                        "border-b border-gray-200 dark:border-gray-700"
                                      )}
                                      rowSpan={(racik.detail?.length ?? 0) + 1}
                                    >
                                      {racik.tipe === "dtd" ? "DTD" : "Non-DTD"}
                                    </td>
                                  </tr>
                                  {racik.detail?.map((detail, detailIdx) => (
                                    <tr
                                      className={cn(
                                        "bg-white hover:text-sky-600 dark:bg-slate-900"
                                      )}
                                      key={detailIdx}
                                    >
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-4 py-2",
                                          "text-left",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        {detailIdx + 1}
                                        {"."}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-4 py-2",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        {detail.nama}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-4 py-2",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        {detail.sediaan}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-4 py-2",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        {detail.dosis}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-4 py-2",
                                          "text-center",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        {detail.jumlah}
                                      </td>
                                      {detailIdx === 0 ? (
                                        <>
                                          <Transition
                                            appear
                                            show={status === 0}
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-150"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                          >
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-2 py-1.5",
                                                "align-top",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                              rowSpan={
                                                (racik.detail?.length ?? 0) + 1
                                              }
                                            >
                                              <Input
                                                className="px-1.5 py-1 text-xs font-normal"
                                                value={
                                                  (watch("detail") || []).find(
                                                    (val) =>
                                                      val.id_resep ===
                                                      racik.id_resep
                                                  )?.aturan || ""
                                                }
                                                onChange={(e) => {
                                                  const detailAturan = (
                                                    watch("detail") || []
                                                  ).map((val) => {
                                                    if (
                                                      val.id_resep ===
                                                      racik.id_resep
                                                    ) {
                                                      return {
                                                        ...val,
                                                        aturan: e.target.value,
                                                      };
                                                    }
                                                    return val;
                                                  });
                                                  setValue(
                                                    "detail",
                                                    detailAturan
                                                  );
                                                }}
                                              />
                                            </td>
                                          </Transition>
                                          <Transition
                                            appear
                                            show={status > 0}
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-150"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                          >
                                            <td
                                              className="px-4 py-2"
                                              rowSpan={
                                                (racik.detail?.length ?? 0) + 1
                                              }
                                            >
                                              {
                                                etiketPasien.find(
                                                  (val) =>
                                                    val.id_resep ===
                                                    racik.id_resep
                                                )?.aturan
                                              }
                                            </td>
                                          </Transition>
                                          <Transition
                                            appear
                                            show={status > 0}
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-150"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                          >
                                            <td className="px-4 py-2 text-center">
                                              <button type="button">
                                                <IoPrint
                                                  size="1.5rem"
                                                  className={cn(
                                                    "text-cyan-600"
                                                  )}
                                                  onClick={() => {
                                                    etiketCetakDispatch({
                                                      type: "setEtiket",
                                                      etiket: {
                                                        modal: false,
                                                        data: etiketPasien.find(
                                                          (val) =>
                                                            val.id_resep ===
                                                            racik.id_resep
                                                        ),
                                                      },
                                                    });
                                                    handlePrintEtiket();
                                                  }}
                                                />
                                              </button>
                                            </td>
                                          </Transition>
                                        </>
                                      ) : null}
                                    </tr>
                                  ))}
                                </>
                              ))}
                              {resepPasien?.racik.length === 0 ? (
                                <tr>
                                  <td colSpan={12}>
                                    <p className="px-4 py-2 text-center">
                                      Tidak ada racikan
                                    </p>
                                  </td>
                                </tr>
                              ) : null}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <Transition
                      show={status === 1}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="flex flex-col gap-2">
                        <p className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                          Validasi Telaah Obat
                        </p>
                        <table className="mt-5 text-[10px]/[12px]">
                          <thead>
                            <tr className="divide-x divide-slate-50 border border-slate-200 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-700">
                              <td className="w-28 py-1"></td>
                              <td className="w-20 py-1 text-center">Sesuai</td>
                              <td className="w-20 py-1 text-center">
                                Tidak Sesuai
                              </td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 border border-t-0 border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                            {(
                              [
                                {
                                  label: "Identitas",
                                  name: "identitas",
                                },
                                { label: "Obat", name: "obat" },
                                { label: "Jumlah", name: "jumlah" },
                                { label: "Dosis", name: "dosis" },
                                { label: "Rute", name: "rute" },
                                { label: "Waktu", name: "waktu" },
                              ] as {
                                label: string;
                                name:
                                  | "identitas"
                                  | "obat"
                                  | "jumlah"
                                  | "dosis"
                                  | "rute"
                                  | "waktu";
                              }[]
                            )?.map((telaah, idx) => (
                              <tr
                                className="divide-x divide-gray-300 bg-white hover:text-sky-600 dark:divide-gray-800 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-3 py-1">
                                  {telaah.label}
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${telaah.name}`) === true
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${telaah.name}`, true)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${telaah.name}`) === false
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${telaah.name}`, false)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Transition>
                  </div>

                  <div className="mt-4 flex justify-end gap-1">
                    {status < 2 ? (
                      <Button
                        type="submit"
                        color="green100"
                        // color={status === 2 ? "blue100" : "green100"}
                      >
                        {status === 0
                          ? "Simpan Etiket"
                          : status === 1
                          ? "Simpan Validasi Obat"
                          : "Ubah Etiket"}
                      </Button>
                    ) : null}
                    <Button color="red" onClick={tutup}>
                      Keluar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <div className="hidden">
          <div
            className="m-2.5 w-[414px] border border-black font-[Arial]"
            ref={cetakEtiketRef}
          >
            <div className="flex items-center justify-evenly border-b border-black">
              <Image
                src={FastabiqLogo}
                className="size-16 object-scale-down"
                alt="Logo Fastabiq"
                quality={60}
                priority
              />
              <div className="flex flex-col items-center">
                <p className="text-xs">RSU Fastabiq Sehat PKU Muhammadiyah</p>
                <p className="text-xs">
                  Jl. Pati - Tayu Km. 03, Tambaharjo, Kec. Pati,
                </p>
                <p className="text-xs">(0295) 4199008, Fax (0295) 4101177</p>
              </div>
            </div>
            <div className="flex flex-col items-center border-b border-black px-1 text-xs">
              <p className="uppercase">Instalasi Farmasi</p>
              <p>
                No. {etiketCetak.data?.id_kunjungan} Tgl.{" "}
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                }).format(new Date())}
              </p>
              <div className="flex self-start">
                <p className="w-11">No. RM</p>
                <p className="px-0.5">:</p>
                <p>{etiketCetak.data?.no_rm}</p>
              </div>
              <div className="flex self-start">
                <p className="w-11">Nama</p>
                <p className="px-0.5">:</p>
                <p>{etiketCetak.data?.nama_pasien}</p>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-0.5 border-b border-black p-1 text-xs">
              <div className="flex justify-between">
                <p>
                  {etiketCetak.data?.nama} {etiketCetak.data?.kekuatan}
                </p>
                <p>
                  {etiketCetak.data?.jumlah} {etiketCetak.data?.sediaan}
                </p>
              </div>
              <p className="text-center">{etiketCetak.data?.aturan}</p>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
