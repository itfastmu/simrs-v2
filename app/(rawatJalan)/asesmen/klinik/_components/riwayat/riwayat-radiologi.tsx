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
  useCallback,
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import {
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoPrint,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { TAsesmenDok } from "../../../schema";
import { DetailPemeriksaanRad, Permintaan } from "@/app/(penunjang)/schema";
import { useReactToPrint } from "react-to-print";
import { FaCheck } from "react-icons/fa6";
import {
  PemeriksaanRadAction,
  PemeriksaanRadState,
} from "@/app/(penunjang)/(radiologi)/pemeriksaan-radiologi/page";
import CetakHasilRadiologi from "@/app/(penunjang)/(radiologi)/_components/cetak-hasil-radiologi";

export default function RiwayatRadiologi({
  id_pasien,
  riwRadDialog,
  setRiwRadDialog,
}: {
  id_pasien: number;
  riwRadDialog: boolean;
  setRiwRadDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  type DetailRadState = {
    modal: boolean;
    data?: Permintaan;
  };
  type DetailRadAction = { type: "setDetail"; detail: DetailRadState };

  const detailRadState = {
    modal: false,
  };
  const detailRadActs = (state: DetailRadState, action: DetailRadAction) => {
    switch (action.type) {
      case "setDetail": {
        return {
          ...action.detail,
        };
      }
    }
  };
  const [detailRad, detailRadDispatch] = useReducer(
    detailRadActs,
    detailRadState
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
  const [listRiwayatRad, setListRiwayatRad] = useState<Permintaan[]>();
  const loadDetailRad = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/penunjang/permintaan/rad`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        id_pasien: id_pasien || "",
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListRiwayatRad(json?.data);
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
    if (!riwRadDialog) return;
    loadDetailRad();
  }, [meta.page, meta.perPage, deferredCari, riwRadDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const [detailPem, setDetailPem] = useState<DetailPemeriksaanRad[]>([]);
  const loadDetail = async () => {
    try {
      const url = `${APIURL}/rs/penunjang/permintaan/${detailRad.data?.id}/detail`;
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      const data: DetailPemeriksaanRad[] = json?.data;
      setDetailPem(data);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!detailRad.modal) return;
    loadDetail();
    // loadHasil();
  }, [detailRad]);

  const pemeriksaanRadState = {
    modal: false,
  };
  const pemeriksaanRadActs = (
    state: PemeriksaanRadState,
    action: PemeriksaanRadAction
  ) => {
    switch (action.type) {
      case "setPemeriksaan": {
        return {
          ...action.pemeriksaan,
        };
      }
    }
  };
  const [edit, setEdit] = useState<boolean>(false);
  const [pemeriksaanRad, pemeriksaanRadDispatch] = useReducer(
    pemeriksaanRadActs,
    pemeriksaanRadState
  );
  const cetakHasilRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    await onBeforeGetContentResolve.current;
  }, [pemeriksaanRad]);

  const reactToPrintContent = useCallback(() => {
    return cetakHasilRef.current;
  }, [cetakHasilRef.current]);

  const handlePrintHasil = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Hasil Pemeriksaan Radiologi",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });
  return (
    <Suspense>
      <Transition show={riwRadDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() => setRiwRadDialog(false)}
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
                      Riwayat Pemeriksaan Radiologi
                    </Dialog.Title>
                    <Tooltip.Provider
                      delayDuration={300}
                      disableHoverableContent
                    >
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            onClick={() => setRiwRadDialog(false)}
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
                          listRiwayatRad?.map((data, i) => (
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
                                  {data.nama_dokter || data.perujuk_luar || ""}
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
                                          className="relative focus:outline-none"
                                          onClick={() => {
                                            detailRadDispatch({
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
                                          {data.status > 1 ? (
                                            <FaCheck
                                              className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                              aria-hidden="true"
                                            />
                                          ) : null}
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
                        setRiwRariwRadDialog(false);
                        setCari("");
                      }}
                    >
                      Tambah
                    </Button>
                    <Button
                      className="py-1"
                      color="red"
                      onClick={() => {
                        setRiwRariwRadDialog(false);
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

          <Transition show={detailRad.modal} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1005]"
              onClose={() =>
                detailRadDispatch({
                  type: "setDetail",
                  detail: { ...detailRad, modal: false },
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
                          Detail Pemeriksaan Radiologi{" "}
                          {detailRad.data?.tanggal
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "long",
                              }).format(new Date(detailRad.data.tanggal))
                            : null}{" "}
                        </Dialog.Title>
                      </div>
                      <div className="my-2 flex flex-col gap-2">
                        <div
                          className={cn(
                            "mb-3 w-full overflow-hidden rounded shadow"
                          )}
                        >
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                <td className="px-4 py-2">Pemeriksaan</td>
                                <td className="px-4 py-2 text-center">*</td>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {detailPem?.map((detail, idx) => (
                                <tr
                                  className={cn(
                                    "bg-white hover:text-sky-600 dark:bg-slate-900"
                                    // "divide-x divide-gray-300 dark:divide-gray-800"
                                  )}
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {detail.nama}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* <Tooltip.Provider
                                        delayDuration={300}
                                        disableHoverableContent
                                      >
                                        <Tooltip.Root>
                                          <Tooltip.Trigger asChild>
                                            <button
                                              type="button"
                                              className="relative focus:outline-none"
                                              onClick={() => {
                                                pemeriksaanRadDispatch({
                                                  type: "setPemeriksaan",
                                                  pemeriksaan: {
                                                    modal: true,
                                                    data: detail,
                                                  },
                                                });
                                              }}
                                            >
                                              <IoDocumentTextOutline
                                                size="1.5rem"
                                                className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                              />
                                              {detail?.hasil !== null ? (
                                                <FaCheck
                                                  className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                                  aria-hidden="true"
                                                />
                                              ) : null}
                                            </button>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="left"
                                            sideOffset={0}
                                            className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                          >
                                            <p>Hasil</p>
                                          </Tooltip.Content>
                                        </Tooltip.Root>
                                      </Tooltip.Provider> */}

                                      <Tooltip.Provider
                                        delayDuration={300}
                                        disableHoverableContent
                                      >
                                        <Tooltip.Root>
                                          <Tooltip.Trigger
                                            className="focus:outline-none disabled:opacity-50"
                                            disabled={detail.hasil === null}
                                            onClick={() => {
                                              pemeriksaanRadDispatch({
                                                type: "setPemeriksaan",
                                                pemeriksaan: {
                                                  modal: false,
                                                  data: detail,
                                                },
                                              });
                                              handlePrintHasil();
                                            }}
                                          >
                                            <IoPrint
                                              size="1.5rem"
                                              className={cn("text-cyan-600")}
                                              // className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800 hover:text-red-500"
                                            />
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="left"
                                            sideOffset={0}
                                            className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                          >
                                            <p>Print</p>
                                          </Tooltip.Content>
                                        </Tooltip.Root>
                                      </Tooltip.Provider>

                                      {/* <Tooltip.Provider
                                        delayDuration={300}
                                        disableHoverableContent
                                      >
                                        <Tooltip.Root>
                                          <Tooltip.Trigger
                                            className="focus:outline-none"
                                            onClick={() => {
                                              hapusDispatch({
                                                type: "setHapus",
                                                hapus: {
                                                  modal: true,
                                                  data: {
                                                    id: detail.id,
                                                    nama: detailRad.data?.nama!,
                                                    nama_pemeriksaan:
                                                      detail.nama,
                                                    tanggal: new Date(
                                                      detailRad.data?.tanggal!
                                                    ),
                                                  },
                                                },
                                              });
                                            }}
                                          >
                                            <TbTrash
                                              size="1.5rem"
                                              className="text-red-500 hover:text-red-600 active:text-red-700"
                                            />
                                          </Tooltip.Trigger>
                                          <Tooltip.Content
                                            side="left"
                                            sideOffset={0}
                                            className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                          >
                                            <p>Hapus</p>
                                          </Tooltip.Content>
                                        </Tooltip.Root>
                                      </Tooltip.Provider> */}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            color="red"
                            onClick={() =>
                              detailRadDispatch({
                                type: "setDetail",
                                detail: { ...detailRad, modal: false },
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

              <div className="hidden">
                <CetakHasilRadiologi
                  ref={cetakHasilRef}
                  data={{
                    pemeriksaan: pemeriksaanRad.data,
                    permintaan: detailRad.data,
                  }}
                />
              </div>
            </Dialog>
          </Transition>
        </Dialog>
      </Transition>
    </Suspense>
  );
}
