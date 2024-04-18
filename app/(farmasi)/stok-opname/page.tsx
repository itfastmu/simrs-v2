"use client";

import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input } from "@/components/form";
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
import Cookies from "js-cookie";
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { AiOutlineEye } from "react-icons/ai";
import { FaBoxOpen, FaCheck } from "react-icons/fa6";
import { MdOutlineFactCheck } from "react-icons/md";
import { toast } from "react-toastify";
import { SOHead } from "../schema";
import StokOpnameDialog from "./_components/insert_so";
import { Dialog, Transition } from "@headlessui/react";

export type LihatState = {
  modal: boolean;
  data?: SOHead;
};
export type LihatAction = { type: "setLihat"; lihat: LihatState };

export default function StokObatOpname() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [tanggal, setTanggal] = useState<Date | string>("");
  const memoizedTanggal = useMemo(
    () => (tanggal instanceof Date ? tanggal?.toLocaleDateString("fr-CA") : ""),
    [tanggal]
  );
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<SOHead[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const lihatState = {
    modal: false,
  };
  const lihatActs = (state: LihatState, action: LihatAction) => {
    switch (action.type) {
      case "setLihat": {
        return {
          ...action.lihat,
        };
      }
    }
  };
  const [lihat, lihatDispatch] = useReducer(lihatActs, lihatState);

  type ValidasiState = {
    modal: boolean;
    data?: SOHead;
  };
  type ValidasiAction = ValidasiState;
  const validasiState = {
    modal: false,
  };
  const validasiActs = (state: ValidasiState, action: ValidasiAction) => {
    return {
      ...action,
    };
  };
  const [validasi, validasiDispatch] = useReducer(validasiActs, validasiState);

  type DataValidasi = {
    id: string;
    before: number | null;
    after: number | null;
    selisih: number | null;
    id_dtransaksi: number | null;
    nama: string;
    merk: string;
    id_poa: number;
    jumlah: number;
    status: number;
  };
  const [dataValidasi, setDataValidasi] = useState<DataValidasi[]>();
  const loadValidasi = async () => {
    try {
      const url = new URL(
        `${APIURL}/rs/farmasi/stock_opname/validasi/${validasi.data?.id}`
      );
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setDataValidasi(json.data);
    } catch (error) {
      toast.error("Validasi tidak ditemukan");
      validasiDispatch({ modal: false });
      setDataValidasi([]);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!validasi.modal) return;
    loadValidasi();
  }, [validasi]);

  type ValidasiObatState = {
    modal: boolean;
    data?: {
      id?: number;
      nama?: string;
      jumlah?: number;
    };
  };
  type ValidasiObatAction = ValidasiObatState;
  const validasiObatState = {
    modal: false,
    data: {
      id: undefined,
      nama: undefined,
      jumlah: undefined,
    },
  };
  const validasiObatActs = (
    state: ValidasiObatState,
    action: ValidasiObatAction
  ) => {
    return {
      ...action,
    };
  };
  const [validasiObat, validasiObatDispatch] = useReducer(
    validasiObatActs,
    validasiObatState
  );
  const validasiObatHandler = async (i: number) => {
    try {
      const url = new URL(`${APIURL}/rs/farmasi/stock_opname/validasi/${i}`);
      const resp = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ jumlah: validasiObat.data?.jumlah! }),
      });
      const json = await resp.json();
      if (json.status !== "Updated") throw new Error(json.message);
      toast.success(json.message);
      loadValidasi();
      validasiObatDispatch({
        modal: false,
        data: validasiObat.data,
      });
    } catch (error) {
      toast.error("Validasi tidak berhasil");
      console.error(error);
    }
  };

  // type HapusState = {
  //   modal: boolean;
  //   data?: {
  //     id?: number;
  //     nama?: string;
  //   };
  // };
  // type HapusAction = { type: "setHapus"; hapus: HapusState };
  // const hapusState = {
  //   modal: false,
  //   data: {
  //     id: undefined,
  //     nama: undefined,
  //   },
  // };
  // const hapusActs = (state: HapusState, action: HapusAction) => {
  //   switch (action.type) {
  //     case "setHapus": {
  //       return {
  //         ...action.hapus,
  //       };
  //     }
  //   }
  // };
  // const [hapus, hapusDispatch] = useReducer(hapusActs, hapusState);
  // const handleHapus = async () => {
  //   try {
  //     const resp = await fetch(`${APIURL}/rs/tarif/${hapus.data?.id}`, {
  //       method: "DELETE",
  //       headers: headers,
  //     });
  //     const data = await resp.json();
  //     hapusDispatch({ type: "setHapus", hapus: { modal: false } });
  //     toast.success(data?.message, {
  //       onOpen: loadData,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const loadData = async (signal?: AbortSignal) => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/stock_opname`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        // tanggal: tanggal?.toLocaleDateString("fr-CA") || null,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: signal,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      setDataList(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page.page),
          perPage: parseInt(json?.page.perPage),
          lastPage: parseInt(json?.page.lastPage),
          total: parseInt(json?.page.total),
        },
      });
      setIsMutating(false);
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
      if (error.name === "AbortError") return;
      if (error.message === "Data tidak ditemukan") return setIsMutating(false);
      toast.error(error.message);
      console.error(error);
      setIsMutating(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [meta.page, meta.perPage, tanggal, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="ml-3 flex items-center gap-3">
              <div className="relative">
                {/* <GiMedicines
                  size="1.75rem"
                  className="text-gray-500 dark:text-slate-100"
                /> */}
                <FaBoxOpen
                  size="1.75rem"
                  className="text-gray-500 dark:text-slate-100"
                />
              </div>
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Stok Opname
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between pb-3">
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
              <Input
                type="date"
                value={memoizedTanggal}
                className="w-fit p-2 text-xs shadow-none"
                onChange={(e) => {
                  setTanggal(e.target.value ? new Date(e.target.value) : "");
                }}
              />
            </div>
            <div className="flex items-baseline gap-1">
              <div className="flex gap-1">
                <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                  onClick={() => setTambahDialog(true)}
                >
                  Tambah
                </Button>
              </div>
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
                    <ThDiv>Tanggal</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Keterangan</ThDiv>
                  </Th>
                  {/* <Th>
                    <ThDiv>Tanggal Catat</ThDiv>
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
                      <td className="h-[36.5px]">
                        <p className="mx-auto h-6 w-40 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-28 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      {/* <td>
                        <p className="mx-auto h-4 w-56 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td> */}
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <AiOutlineEye
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <MdOutlineFactCheck
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : meta.total === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={6}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 py-1.5 dark:border-gray-700">
                        <p className="mx-auto w-40 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.tanggal
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "long",
                              }).format(new Date(data.tanggal))
                            : null}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.keterangan}</p>
                      </td>
                      {/* <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p className="text-xs">
                          {data.created_at
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "long",
                                timeStyle: "short",
                              }).format(new Date(data.created_at))
                            : null}
                        </p>
                      </td> */}
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                className="focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                  lihatDispatch({
                                    type: "setLihat",
                                    lihat: {
                                      modal: true,
                                      data: data,
                                    },
                                  });
                                }}
                              >
                                <AiOutlineEye
                                  size="1.5rem"
                                  className="text-sky-600 hover:text-sky-700 active:text-sky-800"
                                />
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Lihat</p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>

                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                // disabled={
                                //   data.status === "dibuka" ||
                                //   data.status === "ditutup"
                                // }
                                className="relative focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                  validasiDispatch({
                                    modal: true,
                                    data: data,
                                  });
                                }}
                              >
                                <MdOutlineFactCheck
                                  size="1.5rem"
                                  className="text-green-500 hover:text-green-600 active:text-green-700"
                                />
                                {data.status === "ditutup" ? (
                                  <FaCheck
                                    className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                    aria-hidden="true"
                                  />
                                ) : null}
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Validasi</p>
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
        </div>
      </main>

      <StokOpnameDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        lihat={lihat}
        lihatDispatch={lihatDispatch}
        loadData={loadData}
      />

      <Transition show={validasi.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1010]"
          onClose={() => {
            setDataValidasi(undefined);
            validasiDispatch({ modal: false });
          }}
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

          <div className={cn("fixed inset-0 overflow-y-auto", css.scrollbar)}>
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-50"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-gray-900"
                  >
                    Validasi Stok Opname {validasi.data?.keterangan}
                  </Dialog.Title>
                  <div className={cn("mt-2 flex flex-col gap-2")}>
                    <div className="flex flex-col gap-2">
                      <div className="relative flex justify-center border-b border-slate-200">
                        <p className="text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                          List Obat
                        </p>
                      </div>
                      <div
                        className={cn("w-full overflow-hidden rounded shadow")}
                      >
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                              <td className="px-4 py-2">Kode</td>
                              <td className="px-4 py-2">Nama</td>
                              <td className="px-4 py-2">Sebelum</td>
                              <td className="px-4 py-2">Setelah</td>
                              <td className="px-4 py-2">Selisih</td>
                              <td className="px-4 py-2">Jumlah</td>
                              <td className="px-4 py-2 text-center">*</td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dataValidasi?.map((val, idx) => (
                              <tr
                                className={cn(
                                  "bg-white hover:text-sky-600 dark:bg-slate-900"
                                  //, "divide-x divide-gray-300 dark:divide-gray-800"
                                )}
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {val.id_poa}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {val.nama}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {val.before}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {val.after}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {val.selisih}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <Input
                                    type="number"
                                    className="w-20 py-1 text-xs font-normal"
                                    value={
                                      dataValidasi?.find((_, i) => idx === i)
                                        ?.jumlah || ""
                                    }
                                    onChange={(e) => {
                                      const det = (dataValidasi || []).map(
                                        (val, i) => {
                                          if (idx === i) {
                                            return {
                                              ...val,
                                              jumlah: parseInt(e.target.value),
                                            };
                                          }
                                          return val;
                                        }
                                      );
                                      setDataValidasi(det);
                                    }}
                                  />
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <Button
                                    color="green"
                                    className="px-1.5 py-1 text-[10px]/[14px]"
                                    onClick={(e) => {
                                      validasiObatDispatch({
                                        modal: true,
                                        data: {
                                          id: parseInt(val.id),
                                          nama: val.nama,
                                          jumlah: val.jumlah,
                                        },
                                      });
                                    }}
                                  >
                                    Validasi
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1">
                      {/* <Button color="green100">Validasi</Button> */}
                      <Button
                        color="red"
                        onClick={() => {
                          setDataValidasi(undefined);
                          validasiDispatch({ modal: false });
                        }}
                      >
                        Keluar
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>

          <Transition show={validasiObat.modal} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1010]"
              onClose={() =>
                validasiObatDispatch({
                  modal: false,
                  data: validasiObat.data,
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
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-50"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                      <Dialog.Title
                        as="p"
                        className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                      >
                        Validasi Barang
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Validasi {validasiObat.data?.nama}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end gap-1">
                        <Button
                          color="green100"
                          onClick={() =>
                            validasiObatHandler(validasiObat.data?.id!)
                          }
                        >
                          Validasi
                        </Button>
                        <Button
                          color="red"
                          onClick={() =>
                            validasiObatDispatch({
                              modal: false,
                              data: validasiObat.data,
                            })
                          }
                        >
                          Tidak
                        </Button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </Dialog>
      </Transition>

      {/* <Transition show={hapus.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() =>
            hapusDispatch({
              type: "setHapus",
              hapus: {
                modal: false,
                data: hapus.data,
              },
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-50"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                  >
                    Hapus Tarif
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Hapus {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Hapus
                    </Button>
                    <Button
                      color="red"
                      onClick={() =>
                        hapusDispatch({
                          type: "setHapus",
                          hapus: {
                            modal: false,
                            data: hapus.data,
                          },
                        })
                      }
                    >
                      Tidak
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition> */}
    </>
  );
}
