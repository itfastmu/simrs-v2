"use client";

import {
  InputSearch,
  PerPage,
  Pagination,
  Th,
  ThDiv,
} from "@/components/table";
import { APIURL } from "@/lib/connection";
import { useRouter } from "next/navigation";
import React, {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition, Listbox, Tab } from "@headlessui/react";
import { Button } from "@/components/button";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Input, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import {
  RiArrowDropDownLine,
  RiCheckLine,
  RiHotelBedLine,
} from "react-icons/ri";
import { MdOutlineBedroomParent } from "react-icons/md";

export type Kamar = {
  id: number;
  nama: string;
  id_kelas: number;
  keterangan: string;
  aktif: boolean;
  kamar_tipe: number;
  kd_bpjs: string;
  deleted: boolean;
  kelas: string;
  tipe: string;
};
export type Bed = {
  id: number;
  kamar: string;
  status_kamar: string;
};
export type Tipe = {
  id: number;
  nama: string;
  deleted: boolean;
};

type UbahState = {
  modal: boolean;
  data?: Kamar;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

type UbahOthersState = {
  modal: boolean;
  data?: Bed | Tipe;
};
type UbahOthersAction = { type: "setUbahOthers"; ubahOthers: UbahOthersState };

export default function ListAlamat() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const ubahState = {
    modal: false,
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

  const [tambahOthersDialog, setTambahOthersDialog] = useState<boolean>(false);
  const ubahOthersState = {
    modal: false,
  };
  const ubahOthersActs = (state: UbahOthersState, action: UbahOthersAction) => {
    switch (action.type) {
      case "setUbahOthers": {
        return {
          ...action.ubahOthers,
        };
      }
    }
  };
  const [ubahOthers, ubahOthersDispatch] = useReducer(
    ubahOthersActs,
    ubahOthersState
  );

  type HapusState = {
    modal: boolean;
    data?: Kamar | Bed | Tipe;
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: undefined,
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
      const url =
        judul === "Kamar"
          ? `${APIURL}/rs/kamar/${hapus.data?.id}`
          : judul === "Bed"
          ? `${APIURL}/rs/kamar/bed/${hapus.data?.id}`
          : judul === "Tipe"
          ? `${APIURL}/rs/kamar/tipe/${hapus.data?.id}`
          : "";
      const hapusAlamat = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const data = await hapusAlamat.json();
      if (data.status !== "Deleted") throw new Error(data.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      //   toast.success(data?.message, {
      //     onOpen: loadData,
      //   });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
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

  const [listKamar, setListKamar] = useState<Kamar[]>([]);
  const loadKamar = async () => {
    setIsMutating(true);
    try {
      const url = new URL(`${APIURL}/rs/kamar`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        // cari: deferredCari,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListKamar(json?.data);
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

  const [listBed, setListBed] = useState<Bed[]>([]);
  const loadBed = async () => {
    setIsMutating(true);
    try {
      const url = new URL(`${APIURL}/rs/kamar/bed`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        // cari: deferredCari,
        tanggal: new Date().toLocaleDateString("fr-CA"),
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListBed(json?.data);
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
  const [listTipe, setListTipe] = useState<Tipe[]>([]);
  const loadTipe = async () => {
    setIsMutating(true);
    try {
      const url = new URL(`${APIURL}/rs/kamar/tipe`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        tanggal: new Date().toLocaleDateString("fr-CA"),
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListTipe(json?.data);
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

  const loadData = async () => {
    switch (selectedIdx) {
      case 0:
        loadKamar();
        break;
      case 1:
        loadBed();
        break;
      case 2:
        loadTipe();
        break;
    }
  };

  const menues = ["List Kamar", "List Bed", "List Tipe"];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = (() => {
    switch (selectedIdx) {
      case 0:
      default:
        return "Kamar";
      case 1:
        return "Bed";
      case 2:
        return "Tipe";
    }
  })();

  useEffect(() => {
    loadData();
  }, [meta.page, meta.perPage, deferredCari, selectedIdx]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <RiHotelBedLine
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Kamar
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
              <Listbox
                value={selectedIdx}
                onChange={(val) => {
                  setSelectedIdx(val);
                  metaDispatch({
                    type: "setMeta",
                    setMeta: {
                      ...meta,
                      page: 1,
                    },
                  });
                }}
              >
                <div className="relative">
                  <Listbox.Button
                    className={cn(
                      "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                      "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                      "h-fit px-4 py-[7px]"
                    )}
                  >
                    {menues[selectedIdx]}
                    <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Listbox.Options className="absolute z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                      {menues.map((menu, menuIdx) => (
                        <div className="p-0.5" key={menuIdx}>
                          <Listbox.Option
                            as="button"
                            className={({ active }) =>
                              cn(
                                "relative flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm",
                                active
                                  ? "bg-slate-200 text-sky-600"
                                  : "text-gray-900 dark:text-slate-100"
                              )
                            }
                            value={menuIdx}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={cn(
                                    "block truncate",
                                    selected ? "font-medium" : "font-normal"
                                  )}
                                >
                                  {menu}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                    <RiCheckLine
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        </div>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="flex gap-1">
                <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                  onClick={() =>
                    selectedIdx === 0
                      ? setTambahDialog(true)
                      : setTambahOthersDialog(true)
                  }
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
            <Tab.Group selectedIndex={selectedIdx} onChange={setSelectedIdx}>
              <Tab.List className="hidden">
                {menues.map((menu) => (
                  <Tab className="hidden" key={menu}>
                    {menu}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Nama</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kelas</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tipe</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Keterangan</ThDiv>
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
                            <td className="h-[53px]">
                              <p className="mx-auto h-9 w-9 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <div className="flex flex-nowrap items-center justify-center gap-2  ">
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
                      ) : meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={5}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listKamar?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-9 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.kelas}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.tipe}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.keterangan}</p>
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
                                          ubahDispatch({
                                            type: "setUbah",
                                            ubah: {
                                              modal: true,
                                              data: data,
                                            },
                                          });
                                        }}
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
                                      <p>Ubah</p>
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
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Bed</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Status</ThDiv>
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
                            <td className="h-[53px]">
                              <p className="mx-auto h-9 w-9 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <div className="flex flex-nowrap items-center justify-center gap-2  ">
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
                      ) : meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={5}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listBed?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-9 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.kamar}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.status_kamar}</p>
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
                                          ubahOthersDispatch({
                                            type: "setUbahOthers",
                                            ubahOthers: {
                                              modal: true,
                                              data: data,
                                            },
                                          });
                                        }}
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
                                      <p>Ubah</p>
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
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tipe</ThDiv>
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
                            <td className="h-[53px]">
                              <p className="mx-auto h-9 w-9 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <div className="flex flex-nowrap items-center justify-center gap-2  ">
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
                      ) : meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={5}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listTipe?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-9 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
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
                                          ubahOthersDispatch({
                                            type: "setUbahOthers",
                                            ubahOthers: {
                                              modal: true,
                                              data: data,
                                            },
                                          });
                                        }}
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
                                      <p>Ubah</p>
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
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
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

      <KamarDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadKamar={loadKamar}
      />

      <OthersDialog
        key={selectedIdx}
        tambahDialog={tambahOthersDialog}
        setTambahDialog={setTambahOthersDialog}
        ubah={ubahOthers}
        ubahDispatch={ubahOthersDispatch}
        loadData={loadData}
        judul={judul === "Kamar" ? "Bed" : judul}
      />

      <Transition show={hapus.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() =>
            hapusDispatch({
              type: "setHapus",
              hapus: { modal: false, data: hapus.data },
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
                    Hapus {judul}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-slate-100">
                      {!!(hapus.data as Kamar | Tipe)?.nama
                        ? (hapus.data as Kamar | Tipe)?.nama
                        : (hapus.data as Bed)?.kamar}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Hapus {judul}
                    </Button>
                    <Button
                      color="red"
                      onClick={() =>
                        hapusDispatch({
                          type: "setHapus",
                          hapus: { modal: false, data: hapus?.data },
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

type KamarDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadKamar: () => Promise<void>;
};

const KamarDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadKamar,
}: KamarDialogProps) => {
  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : ubahDispatch({
          type: "setUbah",
          ubah: {
            modal: false,
          },
        });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [listKelas, setListKelas] = useState<MyOptions>([
    { label: "VVIP", value: 1 },
    { label: "VIP", value: 2 },
    { label: "Kelas 1", value: 3 },
  ]);

  const [tipeOptions, setTipeOptions] = useState<MyOptions>([]);
  const loadTipe = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/kamar/tipe`);
      const params = {
        page: 1,
        perPage: 50,
        // cari: deferredCari,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      const options = json.data.map((val: any) => ({
        value: parseInt(val.id),
        label: val.nama,
      }));
      setTipeOptions(options);
      return options;
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotFound") return [];
      console.error(error);
      return [];
    }
  };

  const UbahKamarSchema = z.object({
    nama: z.string({ required_error: "harus diisi" }).min(1, "harus diisi"),
    id_kelas: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    keterangan: z
      .string({ required_error: "harus diisi" })
      .min(1, "harus diisi"),
    kamar_tipe: z.number({ required_error: "harus diisi" }),
  });

  type UbahKamar = z.infer<typeof UbahKamarSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<UbahKamar>({
    resolver: zodResolver(UbahKamarSchema),
  });

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadTipe("");
  }, [ubah, tambahDialog]);

  useEffect(() => {
    if (!ubah.data) return;
    setValue("nama", ubah.data?.nama!);
    setValue("id_kelas", ubah.data?.id_kelas!);
    setValue("keterangan", ubah.data?.keterangan!);
    setValue("kamar_tipe", ubah.data?.kamar_tipe!);

    return () => {
      setValue("id_kelas", NaN);
      setValue("kamar_tipe", NaN);
    };
  }, [ubah.data]);

  const submitHandler: SubmitHandler<UbahKamar> = async (data, e) => {
    try {
      e?.preventDefault();
      let resJson: any;
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/kamar/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const post = await fetch(`${APIURL}/rs/kamar`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      ubahDispatch({ type: "setUbah", ubah: { modal: false } });
      setTambahDialog(false);
      toast.success(resJson.message);
      loadKamar();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <>
      <Transition show={ubah.modal || tambahDialog} as={Fragment}>
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
                    "h-full w-full max-w-sm transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                    css.scrollbar
                  )}
                >
                  <Dialog.Title
                    as="p"
                    className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                  >
                    {tambahDialog ? "Tambah Kamar" : "Ubah Kamar"}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit(submitHandler)}>
                    <div className="mt-2 flex flex-col gap-2">
                      <div
                        className={cn(
                          "max-w-xs",
                          errors.nama && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="nama"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Nama Kamar
                          </label>
                          {errors.nama ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.nama.message}
                            </p>
                          ) : null}
                        </div>
                        <Input id="nama" {...register("nama")} />
                      </div>

                      <div
                        className={cn(
                          "max-w-xs",
                          errors.id_kelas && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Kelas
                          </label>
                          {errors.id_kelas ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.id_kelas.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_kelas"
                          render={({ field: { onChange, value } }) => (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={listKelas}
                              value={listKelas.find(
                                (c: any) => c.value === value
                              )}
                              placeholder="Pilih Kelas"
                            />
                          )}
                        />
                      </div>

                      <div
                        className={cn(
                          "max-w-xs",
                          errors.kamar_tipe && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Tipe
                          </label>
                          {errors.kamar_tipe ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.kamar_tipe.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="kamar_tipe"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadTipe}
                              defaultOptions={tipeOptions}
                              value={tipeOptions.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) => {
                                onChange(option?.value);
                              }}
                              placeholder="Pilih Tipe"
                            />
                          )}
                        />
                      </div>

                      <div
                        className={cn(
                          "max-w-xs",
                          errors.keterangan && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="keterangan"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Keterangan
                          </label>
                          {errors.keterangan ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.keterangan.message}
                            </p>
                          ) : null}
                        </div>
                        <Input id="keterangan" {...register("keterangan")} />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button
                        type="submit"
                        color={tambahDialog ? "green100" : "cyan100"}
                      >
                        {tambahDialog ? "Tambah Kamar" : "Ubah Kamar"}
                      </Button>
                      <Button color="red" onClick={tutup}>
                        Keluar
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

type OthersDialogProps = {
  key: number;
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahOthersState;
  ubahDispatch: React.Dispatch<UbahOthersAction>;
  loadData: () => Promise<void>;
  judul: "Bed" | "Tipe";
};
const OthersDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
  judul,
}: OthersDialogProps) => {
  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : ubahDispatch({
          type: "setUbahOthers",
          ubahOthers: {
            modal: false,
          },
        });
  };

  const [judulLama, setJudulLama] = useState<string>("");
  const judulDeskripsi = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? `Ubah ${judul}` : `Tambah ${judul}`);
    return ubah.modal ? `Ubah ${judul}` : `Tambah ${judul}`;
  }, [tambahDialog, ubah.modal]);

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [kamarOptions, setKamarOptions] = useState<MyOptions>([]);
  const loadKamar = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/kamar`);
      const params = {
        page: 1,
        perPage: 50,
        // cari: deferredCari,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      const options = json.data.map((val: any) => ({
        value: parseInt(val.id),
        label: val.nama,
      }));
      setKamarOptions(options);
      return options;
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotFound") return [];
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadKamar("");
  }, [ubah, tambahDialog]);

  const BedSchema = z.object({
    type: z.literal("Bed"),
    id_kamar: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi angka",
    }),
    nama: z.string().min(1, "harus diisi"),
  });

  const TipeSchema = z.object({
    type: z.literal("Tipe"),
    nama: z.string().min(1, "harus diisi"),
  });

  const FormSchema = z.discriminatedUnion("type", [BedSchema, TipeSchema]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: judul,
    },
  });

  useEffect(() => {
    if (!ubah.data) return;
    switch (judul) {
      case "Bed":
        // setValue("nama", (ubah.data as Bed)?.);
        // setValue("id_kamar", (ubah.data as Bed)?.);
        break;
      case "Tipe":
        setValue("nama", (ubah.data as Tipe)?.nama);
        break;
    }
  }, [ubah.data]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      const { type, ...parsedData } = data;
      let resJson: any;
      if (ubah.modal) {
        const url =
          judul === "Bed"
            ? `${APIURL}/rs/kamar/bed/${ubah.data?.id}`
            : judul === "Tipe"
            ? `${APIURL}/rs/kamar/tipe/${ubah.data?.id}`
            : "";

        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const url =
          judul === "Bed"
            ? `${APIURL}/rs/kamar/bed`
            : judul === "Tipe"
            ? `${APIURL}/rs/kamar/tipe`
            : "";

        const post = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      tutup();
      toast.success(resJson.message);
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={ubah.modal || tambahDialog} as={Fragment}>
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
              <Dialog.Panel
                className={cn(
                  "w-full max-w-md transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700"
                )}
              >
                <Dialog.Title
                  as="p"
                  className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                >
                  {judulDeskripsi}
                </Dialog.Title>
                <form
                  className={cn("mt-2 flex flex-col gap-2")}
                  onSubmit={handleSubmit(submitHandler)}
                >
                  {judul === "Bed" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "id_kamar" in errors &&
                            errors.id_kamar &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Controller
                          control={control}
                          name="id_kamar"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadKamar}
                              defaultOptions={kamarOptions}
                              value={kamarOptions.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) => {
                                onChange(option?.value);
                              }}
                              placeholder="Pilih Kamar"
                            />
                          )}
                        />
                        {"id_kamar" in errors && errors.id_kamar ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"id_kamar" in errors && errors.id_kamar.message}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "w-full",
                          "nama" in errors &&
                            errors.nama &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Input placeholder="Nama Bed" {...register("nama")} />
                        {"nama" in errors && errors.nama ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"nama" in errors && errors.nama.message}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : judul === "Tipe" ? (
                    <div
                      className={cn(
                        "w-full",
                        "nama" in errors &&
                          errors.nama &&
                          "rounded-b-sm rounded-t-lg bg-red-100"
                      )}
                    >
                      <Input placeholder="Nama Tipe" {...register("nama")} />
                      {"nama" in errors && errors.nama ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {"nama" in errors && errors.nama.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      type="submit"
                      color={ubah.modal ? "cyan100" : "green100"}
                    >
                      {judulDeskripsi}
                    </Button>
                    <Button color="red" onClick={tutup}>
                      Keluar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
