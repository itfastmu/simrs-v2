"use client";

import { APIURL } from "@/lib/connection";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { getAgeThn } from "@/lib/utils";
import React, {
  useEffect,
  useMemo,
  useReducer,
  useState,
  Fragment,
  useDeferredValue,
  useRef,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { HiOutlineDocumentText } from "react-icons/hi";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { Input, InputArea } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { TbEdit, TbTrash } from "react-icons/tb";
import Cookies from "js-cookie";
import {
  SKDPSch,
  SKDPSchema,
  KunjunganRajal,
} from "@/app/(pendaftaran)/schema";
import FormSKDPDialog from "./_components/skdp";
// import { Klinik } from "@/app/(referensi)/list-klinik/page";
// import { JadwalDokter } from "../jadwal-dokter/page";
// import { Pegawai } from "@/app/(pegawai)/schema";
// import CetakSKDP from "./_components/cetak-skdp";
// import { useReactToPrint } from "react-to-print";

export type SKDP = {
  id: number;
  id_dokter: string;
  alasan: string;
  rtl: string;
  status: number;
} & Omit<
  KunjunganRajal,
  "mulai" | "selesai" | "id_asuransi" | "id_pegawai" | "antrian"
>;

type UbahState = {
  modal: boolean;
  data?: (SKDP | KunjunganRajal) & { ubah: boolean };
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function SKDP() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [tanggal, setTanggal] = useState<Date>(new Date());
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<SKDP[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const ubahState = {
    modal: false,
    data: undefined,
  };
  const ubahActs = (state: UbahState, action: UbahAction) => {
    switch (action.type) {
      case "setUbah": {
        return {
          ...action.ubah,
        };
      }
    }
  };
  const [ubah, ubahDispatch] = useReducer(ubahActs, ubahState);

  type HapusState = {
    modal: boolean;
    data?: {
      id?: number;
      nama?: string;
    };
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: {
      id: undefined,
      nama: undefined,
    },
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
      const resp = await fetch(`${APIURL}/rs/skdp${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const json = await resp.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message);
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
      const url = new URL(`${APIURL}/rs/kontrol`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
        tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: signal,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
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
            <div className="flex items-center">
              <HiOutlineDocumentText
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List SKDP
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
                value={tanggal.toLocaleDateString("fr-CA")}
                className="w-fit p-2 text-xs shadow-none"
                onChange={(e) => {
                  setTanggal(new Date(e.target.value));
                }}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <Button
                className="h-fit px-5 py-[7px]"
                color="slatesky"
                onClick={() => setTambahDialog(true)}
              >
                Tambah
              </Button>
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
                    <ThDiv>No. R.M.</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Nama</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tgl. Lahir</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Dokter</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tgl. Kontrol</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Alasan</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>RTL</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>*</ThDiv>
                  </Th>
                </tr>
              </thead>
              <tbody className="bg-slate-200 dark:bg-gray-700">
                {isMutating ? (
                  /* IF DATA FETCHING */
                  [...Array(15)].map((_, i) => (
                    <tr
                      className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                      key={i.toString()}
                    >
                      <td className="h-[56.5px]">
                        <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <TbEdit
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <TbTrash
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : /* IF DATA KOSONG */
                meta.total === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={7}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  /* IF DATA ADA */
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i.toString()}
                    >
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                        <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.no_rm}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <span>
                          {new Intl.DateTimeFormat("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(data.tanggal_lahir))}
                        </span>
                        <span className="font-light">
                          {" (" + getAgeThn(new Date(data.tanggal_lahir)) + ")"}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.dokter}
                        </p>
                        <p>{data.klinik}</p>
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
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.alasan}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.rtl}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() =>
                                    ubahDispatch({
                                      type: "setUbah",
                                      ubah: {
                                        modal: true,
                                        data: { ...data, ubah: true },
                                      },
                                    })
                                  }
                                >
                                  <TbEdit
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
                                <p>Ubah Periksa</p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() =>
                                    hapusDispatch({
                                      type: "setHapus",
                                      hapus: {
                                        modal: true,
                                        data: {
                                          id: data.id_pasien,
                                          nama: data.nama,
                                        },
                                      },
                                    })
                                  }
                                >
                                  <TbTrash
                                    size="1.5rem"
                                    className="text-red-500 hover:text-red-600 active:text-red-700"
                                  />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Hapus Periksa</p>
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

      <FormSKDPDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
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
            leave="ease-in duration-50"
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
                    className="font-medium leading-6 text-gray-900"
                  >
                    Hapus SKDP pasien {hapus.data?.nama}?
                  </Dialog.Title>
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
