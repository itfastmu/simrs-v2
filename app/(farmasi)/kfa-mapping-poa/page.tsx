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
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import React, {
  Fragment,
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { GiMedicines } from "react-icons/gi";
import { MdMenuOpen } from "react-icons/md";
import { TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { z } from "zod";
import { Barang, BarangMapPOA, KFAPOA, TransaksiBarang } from "../schema";

type LihatState = {
  modal: boolean;
  data?: TransaksiBarang;
};
type LihatAction = { type: "setLihat"; lihat: LihatState };

export default function PenjualanObat() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<BarangMapPOA[]>([]);

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

  type HapusState = {
    modal: boolean;
    data?: BarangMapPOA;
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
  };
  const hapusActs = (state: HapusState, action: HapusAction) => {
    switch (action.type) {
      case "setHapus": {
        return {
          ...action.hapus,
        };
      }
    }
  };
  const [hapus, hapusDispatch] = useReducer(hapusActs, hapusState);
  const handleHapus = async () => {
    try {
      const resp = await fetch(
        `${APIURL}/rs/farmasi/mapping_poa/${hapus.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const data = await resp.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(data?.message);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

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
      const url = new URL(`${APIURL}/rs/farmasi/mapping_poa`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
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
  }, [meta.page, meta.perPage, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="ml-3 flex items-center gap-3">
              <div className="relative">
                <GiMedicines
                  size="1.75rem"
                  className="text-gray-500 dark:text-slate-100"
                />
              </div>
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Mapping POA
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
                    <ThDiv>Kode Barang</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Barang</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Kode POA</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>POA</ThDiv>
                  </Th>
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
                        <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-56 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <TbTrash
                            size="1.2rem"
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
                      <td className="border-b border-slate-200 py-1.5 text-center dark:border-gray-700">
                        <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.id_barang}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 py-1.5 text-center dark:border-gray-700">
                        <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.id_poa}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.nama_poa}</p>
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
                                    hapusDispatch({
                                      type: "setHapus",
                                      hapus: {
                                        modal: true,
                                        data: data,
                                      },
                                    });
                                  }}
                                >
                                  <TbTrash
                                    size="1.2rem"
                                    className="text-red-500 hover:text-red-600 active:text-red-700"
                                  />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Hapus</p>
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

      <TambahDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        loadData={loadData}
      />

      <Transition show={hapus.modal} as={Fragment}>
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
                    Hapus Mapping
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Hapus Mapping{" "}
                      <span className="font-semibold">{hapus.data?.nama}</span>{" "}
                      dengan{" "}
                      <span className="font-semibold">
                        {hapus.data?.nama_poa}
                      </span>
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
      </Transition>
    </>
  );
}

const TambahDialog = ({
  tambahDialog,
  setTambahDialog,
  loadData,
}: {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => Promise<void>;
}) => {
  const tutup = () => {
    reset();
    setTambahDialog(false);
    setObat(null);
    setPOA(null);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const MappingPOASchema = z.object({
    id_barang: z
      .string({
        required_error: "harus dipilih",
      })
      .min(1, "harus dipilih"),
    id_poa: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  });
  type MappingPOATSchema = z.infer<typeof MappingPOASchema>;

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<MappingPOATSchema>({
    resolver: zodResolver(MappingPOASchema),
  });

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
  const [metaObat, metaObatDispatch] = useReducer(metaActs, metaState);
  const [cariObat, setCariObat] = useState<string>("");
  const deferredCariObat = useDeferredValue(cariObat);
  const [isMutatingObat, setIsMutatingObat] = useState<boolean>(false);
  const [listObat, setListObat] = useState<Barang[]>();

  const loadObat = async () => {
    try {
      setIsMutatingObat(true);
      const url = new URL(`${APIURL}/rs/farmasi/barang`);
      const params = {
        page: metaObat.page,
        perPage: metaObat.perPage,
        // cari: deferredCari,
        keyword: deferredCariObat,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListObat(json?.data);
      metaObatDispatch({
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
      metaObatDispatch({
        type: "setMeta",
        setMeta: {
          ...metaObat,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutatingObat(false);
    }
  };
  const [obatDialog, setObatDialog] = useState<boolean>(false);
  const [obat, setObat] = useState<Barang | null>(null);

  useEffect(() => {
    if (obatDialog) loadObat();
  }, [metaObat.page, metaObat.perPage, deferredCariObat, obatDialog]);
  useEffect(() => {
    if (obatDialog) setTimeout(() => searchObatRef.current?.focus(), 1000);
  }, [obatDialog]);

  const searchObatRef = useRef<HTMLInputElement>(null);
  const tableDivObatRef = useRef<HTMLDivElement>(null);

  const [metaPOA, metaPOADispatch] = useReducer(metaActs, metaState);
  const [cariPOA, setCariPOA] = useState<string>("");
  const deferredCariPOA = useDeferredValue(cariPOA);
  const [isMutatingPOA, setIsMutatingPOA] = useState<boolean>(false);
  const [listPOA, setListPOA] = useState<KFAPOA[]>();

  const loadPOA = async () => {
    try {
      setIsMutatingPOA(true);
      const url = new URL(`${APIURL}/rs/kfa/poa`);
      const params = {
        page: metaPOA.page,
        perPage: metaPOA.perPage,
        keyword: deferredCariPOA,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json?.status !== "Ok") throw new Error(json.message);
      setListPOA(json?.data);
      metaPOADispatch({
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
      metaPOADispatch({
        type: "setMeta",
        setMeta: {
          ...metaPOA,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error?.message === "Data tidak ditemukan") return;
      toast.error(error?.message);
      console.error(error);
    } finally {
      setIsMutatingPOA(false);
    }
  };

  const [POADialog, setPOADialog] = useState<boolean>(false);
  const [POA, setPOA] = useState<KFAPOA | null>(null);

  useEffect(() => {
    if (POADialog) loadPOA();
  }, [metaPOA.page, metaPOA.perPage, deferredCariPOA, POADialog]);
  useEffect(() => {
    // if (POADialog) setTimeout(() => searchPOARef.current?.focus(), 3000);
  }, [POADialog]);

  const searchPOARef = useRef<HTMLInputElement>(null);
  const tableDivPOARef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<MappingPOATSchema> = async (data, e) => {
    try {
      e?.preventDefault();
      // if (lihat.modal) {
      //   const put = await fetch(`${APIURL}/rs/farmasi/penjualan/${lihat.data?.id}`, {
      //     method: "PUT",
      //     headers: headers,
      //     body: JSON.stringify(data),
      //   });
      //   const resp = await put.json();
      //   if (resp.status !== "Updated") throw new Error(resp.message);
      //   toast.success(resp.message);
      // } else {
      const post = await fetch(`${APIURL}/rs/farmasi/mapping_poa`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      // }
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={tambahDialog} as={Fragment}>
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
                  "h-full w-full max-w-3xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Tambah Mapping POA
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="mt-2 flex flex-col gap-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium dark:text-neutral-200">
                          Barang
                        </label>
                        {errors.id_barang ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_barang.message}
                          </p>
                        ) : null}
                        {watch("id_barang") ? (
                          <Button
                            className="px-1 py-0.5 text-[10px]/[14px]"
                            color="sky"
                            onClick={() => setObatDialog(true)}
                          >
                            Ubah Barang
                          </Button>
                        ) : null}
                      </div>
                      {!watch("id_barang") ? (
                        <div
                          className="relative"
                          onClick={() => {
                            return setObatDialog(true);
                          }}
                        >
                          <Input
                            className="cursor-pointer px-2 py-1 text-xs"
                            readOnly
                            placeholder="Pilih Barang"
                          />
                          <MdMenuOpen
                            size="1.25rem"
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-700 dark:text-slate-200"
                          />
                        </div>
                      ) : (
                        <div className="flex gap-0.5 text-xs text-slate-600 dark:text-slate-300">
                          <p>
                            {obat?.id +
                              " - " +
                              obat?.nama +
                              " " +
                              (obat?.kekuatan ? obat?.kekuatan + " " : "") +
                              (obat?.sediaan ? obat.sediaan : "")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium dark:text-neutral-200">
                          POA
                        </label>
                        {errors.id_poa ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_poa.message}
                          </p>
                        ) : null}
                        {watch("id_poa") ? (
                          <Button
                            className="px-1 py-0.5 text-[10px]/[14px]"
                            color="sky"
                            onClick={() => setPOADialog(true)}
                          >
                            Ubah POA
                          </Button>
                        ) : null}
                      </div>
                      {!watch("id_poa") ? (
                        <div
                          className="relative"
                          onClick={() => {
                            return setPOADialog(true);
                          }}
                        >
                          <Input
                            className="cursor-pointer px-2 py-1 text-xs"
                            readOnly
                            placeholder="Pilih POA"
                          />
                          <MdMenuOpen
                            size="1.25rem"
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-700 dark:text-slate-200"
                          />
                        </div>
                      ) : (
                        <div className="flex gap-0.5 text-xs text-slate-600 dark:text-slate-300">
                          <p>{POA?.id}</p>
                          <p>-</p>
                          <p>{POA?.nama}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex gap-1">
                    <Button type="submit" color="green100">
                      Tambah
                    </Button>
                    <Button
                      className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                      color="red"
                      onClick={tutup}
                    >
                      Keluar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={obatDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setObatDialog(false);
              setCariObat("");
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
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      List Barang
                    </Dialog.Title>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-baseline gap-1">
                        <InputSearch
                          ref={searchObatRef}
                          onChange={(e) => {
                            metaObatDispatch({
                              type: "page",
                              page: 1,
                            });
                            setCariObat(e.target.value);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <PerPage
                          value={metaObat.perPage}
                          onChange={(e) =>
                            metaObatDispatch({
                              type: "setMeta",
                              setMeta: {
                                ...metaObat,
                                page: 1,
                                perPage: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div
                      ref={tableDivObatRef}
                      className={cn(
                        "h-[calc(100vh-236px)]",
                        css.scrollbar,
                        isMutatingObat ? "overflow-hidden" : "overflow-y-auto"
                      )}
                    >
                      <table className="w-full text-left text-sm font-semibold text-gray-600">
                        <thead>
                          <tr>
                            <Th>
                              <ThDiv>*</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Kode</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Barang</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Satuan</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Sediaan</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Tipe</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Zat</ThDiv>
                            </Th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-200 dark:bg-gray-700">
                          {isMutatingObat ? (
                            [...Array(15)].map((_, i) => (
                              <tr
                                className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={i}
                              >
                                <td className="h-[49px] text-center">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 opacity-30"
                                  />
                                </td>
                                <td>
                                  <p className="mx-auto h-9 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-12 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </tr>
                            ))
                          ) : metaObat.total === 0 ? (
                            <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                              <td className="p-4 text-center" colSpan={10}>
                                <p>Data tidak ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            listObat?.map((data, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  "cursor-pointer",
                                  "*:select-none *:border-b *:border-slate-200 *:dark:border-gray-700",
                                  obat?.id === data.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                onClick={() => {
                                  if (obat?.id === data.id) {
                                    setObat(null);
                                    setValue("id_barang", "");
                                  } else {
                                    setObat(data);
                                  }
                                }}
                                onDoubleClick={() => {
                                  setCariObat("");
                                  setObat(data);
                                  setValue("id_barang", data.id);
                                  setObatDialog(false);
                                }}
                                key={i}
                              >
                                <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={obat?.id === data.id}
                                    onChange={() => {
                                      obat?.id === data.id
                                        ? setObat(null)
                                        : setObat(data);
                                    }}
                                  />
                                </td>
                                <td className="p-2">
                                  <p className="mx-auto w-20 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                    {data.id}
                                  </p>
                                </td>
                                <td>
                                  <p>{data.nama}</p>
                                </td>
                                <td className="text-center">
                                  <p>{data.satuan}</p>
                                </td>
                                <td className="text-center">
                                  <p>{data.sediaan}</p>
                                </td>
                                <td className="text-center">
                                  <p>{data.tipe}</p>
                                </td>
                                <td className="text-center">
                                  <p>{data.zat}</p>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="relative">
                      <p className="absolute -top-2 left-0 text-[10px]/[14px]">
                        Catatan: Bisa dipilih dengan dobel klik
                      </p>
                      <Pagination
                        meta={metaObat}
                        mutating={isMutatingObat}
                        setPage={(pageVal: number) => {
                          metaObatDispatch({ type: "page", page: pageVal });
                          tableDivObatRef.current?.scrollTo(0, 0);
                        }}
                      />
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        className="py-1"
                        color="green"
                        onClick={() => {
                          setObatDialog(false);
                          setCariObat("");
                          if (!!obat?.id) setValue("id_barang", obat.id);
                        }}
                      >
                        Simpan
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setObatDialog(false);
                          setCariObat("");
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition show={POADialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setPOADialog(false);
              setCariPOA("");
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
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      List POA
                    </Dialog.Title>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-baseline gap-1">
                        <InputSearch
                          ref={searchPOARef}
                          onChange={(e) => {
                            metaPOADispatch({
                              type: "page",
                              page: 1,
                            });
                            setCariPOA(e.target.value);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <PerPage
                          value={metaPOA.perPage}
                          onChange={(e) =>
                            metaPOADispatch({
                              type: "setMeta",
                              setMeta: {
                                ...metaPOA,
                                page: 1,
                                perPage: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div
                      ref={tableDivPOARef}
                      className={cn(
                        "h-[calc(100vh-236px)]",
                        css.scrollbar,
                        isMutatingPOA ? "overflow-hidden" : "overflow-y-auto"
                      )}
                    >
                      <table className="w-full text-left text-sm font-semibold text-gray-600">
                        <thead>
                          <tr>
                            <Th>
                              <ThDiv>*</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Kode</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>POA - Produk Obat Aktual</ThDiv>
                            </Th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-200 dark:bg-gray-700">
                          {isMutatingPOA ? (
                            [...Array(15)].map((_, i) => (
                              <tr
                                className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={i}
                              >
                                <td className="h-[40.5px] text-center">
                                  <input
                                    type="checkbox"
                                    className="size-4 opacity-30"
                                  />
                                </td>
                                <td>
                                  <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="h-5 w-72 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </tr>
                            ))
                          ) : metaPOA.total === 0 ? (
                            <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                              <td className="p-4 text-center" colSpan={10}>
                                <p>Data tidak ditemukan</p>
                              </td>
                            </tr>
                          ) : (
                            listPOA?.map((data, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  "cursor-pointer",
                                  "*:select-none *:border-b *:border-slate-200 *:dark:border-gray-700",
                                  POA?.id === data.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                onClick={() => {
                                  if (POA?.id === data.id) {
                                    setPOA(null);
                                    setValue("id_poa", NaN);
                                  } else {
                                    setPOA(data);
                                  }
                                }}
                                onDoubleClick={() => {
                                  setCariPOA("");
                                  setPOA(data);
                                  setValue("id_poa", data.id);
                                  setPOADialog(false);
                                }}
                                key={i}
                              >
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="size-4"
                                    checked={POA?.id === data.id}
                                    onChange={() => {
                                      POA?.id === data.id
                                        ? setPOA(null)
                                        : setPOA(data);
                                    }}
                                  />
                                </td>
                                <td className="p-2">
                                  <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                    {data.id}
                                  </p>
                                </td>
                                <td>
                                  <p>{data.nama}</p>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="relative">
                      <p className="absolute -top-2 left-0 text-[10px]/[14px]">
                        Catatan: Bisa dipilih dengan dobel klik
                      </p>
                      <Pagination
                        meta={metaPOA}
                        mutating={isMutatingPOA}
                        setPage={(pageVal: number) => {
                          metaPOADispatch({ type: "page", page: pageVal });
                          tableDivPOARef.current?.scrollTo(0, 0);
                        }}
                      />
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        className="py-1"
                        color="green"
                        onClick={() => {
                          setPOADialog(false);
                          setCariPOA("");
                          if (!!POA?.id) setValue("id_poa", POA.id);
                        }}
                      >
                        Simpan
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setPOADialog(false);
                          setCariPOA("");
                        }}
                      >
                        Batal
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
  );
};
