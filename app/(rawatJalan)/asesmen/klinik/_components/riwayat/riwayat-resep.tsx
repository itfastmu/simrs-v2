import { ObatResep, Resep } from "@/app/(farmasi)/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import React, {
  Fragment,
  Suspense,
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import { IoCloseCircleOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { TAsesmenDok } from "../../../schema";

export default function RiwayatResep({
  riwResepDialog,
  setRiwResepDialog,
}: {
  riwResepDialog: boolean;
  setRiwResepDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const grup = searchParams.get("grup");

  type DetailObatState = {
    modal: boolean;
    data?: Resep & { detail: ObatResep };
  };
  type DetailObatAction = { type: "setDetail"; detail: DetailObatState };

  const detailObatState = {
    modal: false,
  };
  const detailObatActs = (state: DetailObatState, action: DetailObatAction) => {
    switch (action.type) {
      case "setDetail": {
        return {
          ...action.detail,
        };
      }
    }
  };
  const [detailObat, detailObatDispatch] = useReducer(
    detailObatActs,
    detailObatState
  );

  const metaState: Meta = {
    page: 1,
    perPage: 25,
    lastPage: NaN,
    total: NaN,
  };
  const metaActs = (state: Meta, action: MetaAction): Meta => {
    switch (action.type) {
      case "page": {
        return {
          ...state,
          page: action.page,
        };
      }
      case "perPage": {
        return {
          ...state,
          perPage: action.perPage,
        };
      }
      case "lastPage": {
        return {
          ...state,
          lastPage: action.lastPage,
        };
      }
      case "total": {
        return {
          ...state,
          total: action.total,
        };
      }
      case "setMeta": {
        return {
          ...state,
          ...action.setMeta,
        };
      }
    }
  };
  const [meta, metaDispatch] = useReducer(metaActs, metaState);
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [listRiwayatResep, setListRiwayatResep] =
    useState<(Resep & { detail: ObatResep })[]>();
  const loadRiwayatResep = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/resep`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        id_pasien: id,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListRiwayatResep(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page.page),
          perPage: parseInt(json?.page.perPage),
          lastPage: parseInt(json?.page.lastPage),
          total: parseInt(json?.page.total),
        },
      });
    } catch (err) {
      const error = err as Error;
      metaDispatch({
        type: "setMeta",
        setMeta: {
          ...meta,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };
  useEffect(() => {
    if (!riwResepDialog) return;
    loadRiwayatResep();
  }, [meta.page, meta.perPage, deferredCari, riwResepDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);
  const { setValue } = useFormContext<TAsesmenDok>();
  const salinResep = () => {
    if (
      detailObat.data?.detail.nonracik &&
      detailObat.data?.detail.nonracik?.length > 0
    ) {
      setValue(
        "nonracik",
        detailObat.data?.detail.nonracik.map((val) => ({
          id_poa: val.id_poa,
          nama_obat: val.nama_obat,
          sediaan: val.sediaan ?? "",
          dosis: parseInt(val.kekuatan!),
          rute: val.rute,
          waktu: val.waktu,
          jumlah: val.jumlah,
        }))
      );
    }
    if (
      detailObat.data?.detail.racik &&
      detailObat.data?.detail.racik?.length > 0
    ) {
      setValue(
        "racikan",
        detailObat.data?.detail.racik?.map((val) => ({
          nama: val.nama_racik,
          metode: val.metode,
          jumlah: val.jumlah,
          rute: val.rute,
          waktu: val.waktu,
          tipe: val.tipe,
          detail:
            val.detail?.map((detailVal) => ({
              id: detailVal.id,
              nama_obat: detailVal.nama,
              dosis: detailVal.dosis,
              jumlah: detailVal.jumlah,
              id_poa: detailVal.id_poa,
            })) || [],
        }))
      );
    }
    toast.success("Resep berhasil disalin!");
    detailObatDispatch({
      type: "setDetail",
      detail: {
        ...detailObat.data,
        modal: false,
      },
    });
  };
  const salinResepNonRacikan = () => {
    setValue(
      "nonracik",
      detailObat.data?.detail.nonracik.map((val) => ({
        id_poa: val.id_poa,
        nama_obat: val.nama_obat,
        sediaan: val.sediaan ?? "",
        dosis: parseInt(val.kekuatan!),
        rute: val.rute,
        waktu: val.waktu,
        jumlah: val.jumlah,
      }))
    );
    toast.success("Resep berhasil disalin!");
    detailObatDispatch({
      type: "setDetail",
      detail: {
        ...detailObat.data,
        modal: false,
      },
    });
  };
  const salinResepRacikan = () => {
    setValue(
      "racikan",
      detailObat.data?.detail.racik?.map((val) => ({
        nama: val.nama_racik,
        metode: val.metode,
        jumlah: val.jumlah,
        rute: val.rute,
        waktu: val.waktu,
        tipe: val.tipe,
        detail:
          val.detail?.map((detailVal) => ({
            id: detailVal.id,
            nama_obat: detailVal.nama,
            dosis: detailVal.dosis,
            jumlah: detailVal.jumlah,
            id_poa: detailVal.id_poa,
          })) || [],
      }))
    );
    toast.success("Resep berhasil disalin!");
    detailObatDispatch({
      type: "setDetail",
      detail: {
        ...detailObat.data,
        modal: false,
      },
    });
  };
  return (
    <Suspense>
      <Transition show={riwResepDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() => setRiwResepDialog(false)}
        >
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
                <Dialog.Panel className="h-full w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <div className="relative">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      Riwayat Resep Obat
                    </Dialog.Title>
                    <Tooltip.Provider
                      delayDuration={300}
                      disableHoverableContent
                    >
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            onClick={() => setRiwResepDialog(false)}
                            className="absolute right-3 top-0 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IoCloseCircleOutline
                              size="1.5rem"
                              className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
                            />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side="left"
                          sideOffset={0}
                          className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                        >
                          <p>Keluar</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <PerPage
                        value={meta.perPage}
                        onChange={(e) =>
                          metaDispatch({
                            type: "setMeta",
                            setMeta: {
                              ...meta,
                              page: 1,
                              perPage: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <InputSearch
                        onChange={(e) => {
                          metaDispatch({
                            type: "page",
                            page: 1,
                          });
                          setCari(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    ref={tableDivRef}
                    className={cn(
                      "h-[calc(100vh-236px)]",
                      css.scrollbar,
                      isMutating ? "overflow-hidden" : "overflow-y-auto"
                    )}
                  >
                    <table className="w-full text-left text-sm font-semibold text-gray-600">
                      <thead>
                        <tr>
                          <Th>
                            <ThDiv>No. Kunjungan</ThDiv>
                          </Th>
                          {/* <Th>
                            <ThDiv>No. R.M.</ThDiv>
                          </Th>
                          <Th>
                            <ThDiv>Nama Pasien</ThDiv>
                          </Th> */}
                          <Th>
                            <ThDiv>Tanggal</ThDiv>
                          </Th>
                          <Th>
                            <ThDiv>Dokter</ThDiv>
                          </Th>
                          {/* <Th>
                            <ThDiv>Cara Bayar</ThDiv>
                          </Th> */}
                          <Th>
                            <ThDiv>*</ThDiv>
                          </Th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-200 dark:bg-gray-700">
                        {isMutating ? (
                          [...Array(15)].map((_, i) => (
                            <tr
                              className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                              key={i}
                            >
                              <td className="h-[48px]">
                                <p className="mx-auto h-[32px] w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                              </td>
                              <td>
                                <p className="mx-auto h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                              </td>
                              <td>
                                <div className="grid gap-1">
                                  <p className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-400"></p>
                                  <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-nowrap items-center justify-center gap-2  ">
                                  {/* <TbEdit
                                    size="1.5rem"
                                    className="text-slate-200 dark:text-slate-400"
                                  />
                                  <TbTrash
                                    size="1.5rem"
                                    className="text-slate-200 dark:text-slate-400"
                                  /> */}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : meta.total === 0 ? (
                          <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                            <td className="p-4 text-center" colSpan={10}>
                              <p>Data tidak ditemukan</p>
                            </td>
                          </tr>
                        ) : (
                          listRiwayatResep?.map((data, i) => (
                            <tr
                              className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                              key={i}
                            >
                              <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                                <p className="mx-auto w-32 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                                  {data.id_kunjungan}
                                </p>
                              </td>
                              <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                <p>
                                  {new Intl.DateTimeFormat("id-ID", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }).format(new Date(data.tanggal))}
                                </p>
                              </td>
                              <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                                <p className="text-teal-700 dark:text-teal-200">
                                  {data.dokter}
                                </p>
                                <p className="font-light">{data.klinik}</p>
                              </td>
                              <td className="border-b border-slate-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-2">
                                  <Tooltip.Provider
                                    delayDuration={300}
                                    disableHoverableContent
                                  >
                                    <Tooltip.Root>
                                      <Tooltip.Trigger asChild>
                                        <button
                                          type="button"
                                          className="focus:outline-none"
                                          onClick={() => {
                                            detailObatDispatch({
                                              type: "setDetail",
                                              detail: {
                                                modal: true,
                                                data: data,
                                              },
                                            });
                                          }}
                                        >
                                          <IoDocumentTextOutline
                                            size="1.5rem"
                                            className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                          />
                                        </button>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content
                                        side="left"
                                        sideOffset={0}
                                        className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                      >
                                        <p>Detail</p>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    meta={meta}
                    mutating={isMutating}
                    setPage={(pageVal: number) => {
                      metaDispatch({ type: "page", page: pageVal });
                      tableDivRef.current?.scrollTo(0, 0);
                    }}
                  />
                  {/* <div className="mt-2 flex gap-1">
                    <Button
                      className="py-1"
                      color="green"
                      onClick={() => {
                        setRiwResepDialog(false);
                        setCari("");
                      }}
                    >
                      Tambah
                    </Button>
                    <Button
                      className="py-1"
                      color="red"
                      onClick={() => {
                        setRiwResepDialog(false);
                        setCari("");
                      }}
                    >
                      Batal
                    </Button>
                  </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
          <Transition show={detailObat.modal} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1005]"
              onClose={() =>
                detailObatDispatch({
                  type: "setDetail",
                  detail: { ...detailObat, modal: false },
                })
              }
            >
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
                <div className="flex min-h-full items-center justify-center px-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-50"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                      <div className="relative flex items-center justify-center border-b border-b-slate-200 pb-1">
                        <Dialog.Title
                          as="p"
                          className="font-medium leading-6 text-slate-500 dark:text-slate-100"
                        >
                          Detail Resep Obat
                        </Dialog.Title>
                        {grup === "Dokter" || grup === "Dewa" ? (
                          <Button
                            className="absolute right-0 top-0 px-2 py-0.5 text-xs"
                            color="sky"
                            disabled={
                              !detailObat.data?.detail.nonracik ||
                              !detailObat.data?.detail.racik
                            }
                            onClick={salinResep}
                          >
                            Salin Semua
                          </Button>
                        ) : null}
                      </div>
                      <div className="my-2 flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="relative">
                            <p className="text-center text-sm">
                              Resep Non Racikan
                            </p>
                            {grup === "Dokter" || grup === "Dewa" ? (
                              <Button
                                className="absolute right-0 top-0 px-2 py-0.5 text-xs"
                                color="sky"
                                disabled={!detailObat.data?.detail.nonracik}
                                onClick={salinResepNonRacikan}
                              >
                                Salin
                              </Button>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "w-full overflow-hidden rounded shadow"
                            )}
                          >
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                  <td className="px-4 py-2">Nama Obat</td>
                                  <td className="px-4 py-2">Satuan</td>
                                  <td className="px-4 py-2">Dosis</td>
                                  <td className="px-4 py-2">Rute</td>
                                  <td className="px-4 py-2">Waktu</td>
                                  <td className="px-4 py-2">Jumlah</td>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {detailObat.data?.detail?.nonracik?.map(
                                  (non, idx) => (
                                    <tr
                                      className={cn(
                                        "bg-white hover:text-sky-600 dark:bg-slate-900"
                                        // "divide-x divide-gray-300 dark:divide-gray-800"
                                      )}
                                      key={idx}
                                    >
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.nama_obat}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.sediaan}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.kekuatan}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.rute}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.waktu.filter(Boolean).join(" ")}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                        {non.jumlah}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="relative">
                            <p className="text-center text-sm">Resep Racikan</p>
                            {grup === "Dokter" || grup === "Dewa" ? (
                              <Button
                                className="absolute right-0 top-0 px-2 py-0.5 text-xs"
                                color="sky"
                                disabled={!detailObat.data?.detail.racik}
                                onClick={salinResepRacikan}
                              >
                                Salin
                              </Button>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "w-full overflow-hidden rounded shadow"
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
                                </tr>
                                <tr className="border-t border-slate-50 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-800">
                                  <td className="border-x border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    No.
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Obat
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Satuan
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Dosis/bungkus
                                  </td>
                                  <td className="px-2 py-0.5">Jumlah</td>
                                </tr>
                              </thead>
                              <tbody>
                                {detailObat.data?.detail?.racik?.map(
                                  (racik, idx) => (
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
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.nama_racik}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.metode}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.rute}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.waktu
                                            .filter(Boolean)
                                            .join(" ")}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "text-center",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.jumlah}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "text-center",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.tipe === "dtd"
                                            ? "DTD"
                                            : "Non-DTD"}
                                        </td>
                                      </tr>
                                      {racik.detail?.map(
                                        (detail, detailIdx) => (
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
                                          </tr>
                                        )
                                      )}
                                    </>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            color="red"
                            onClick={() =>
                              detailObatDispatch({
                                type: "setDetail",
                                detail: { ...detailObat, modal: false },
                              })
                            }
                          >
                            Keluar
                          </Button>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </Dialog>
      </Transition>
    </Suspense>
  );
}
