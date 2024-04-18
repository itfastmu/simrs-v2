"use client";

import {
  InputSearch,
  PerPage,
  Pagination,
  Th,
  ThDiv,
} from "@/components/table";
import { APIURL } from "@/lib/connection";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { TbCheck, TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Input, InputArea, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { Profesi } from "@/app/(pegawai)/schema";
import { BsCashStack } from "react-icons/bs";
import { Unit } from "@/app/(referensi)/list-unit/page";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  JasaMedis,
  JasaMedisSchema,
  JasaMedisTSchema,
  PersenCaraBayarSchema,
  PersenCaraBayarTSchema,
  PersenKelasSchema,
  PersenKelasTSchema,
  Tarif,
  TarifCaraBayar,
  TarifKelas,
  TarifSchema,
} from "../schema";
import { FaFileMedical } from "react-icons/fa6";
import { CaraBayar } from "@/app/(referensi)/list-carabayar/page";

export type MasterTarif = {
  id: number;
  nama: string;
  bhp_farmasi: boolean;
  catatan: string;
  bhp: string;
  aktif: boolean;
  // unit: Omit<Unit, "aktif">[];
  unit: string[];
};

type UbahState = {
  modal: boolean;
  data?: MasterTarif;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };
type JasaMedisAction =
  | { type: "tutup" }
  | { type: "setJasaMedis"; jasaMedis: UbahState };

export default function MasterTarif() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [listTarif, setListTarif] = useState<MasterTarif[]>([]);

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
      const resp = await fetch(`${APIURL}/rs/tarif/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const data = await resp.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(data?.message);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const jasaMedisState = {
    modal: false,
  };
  const jasaMedisActs = (state: UbahState, action: JasaMedisAction) => {
    switch (action.type) {
      case "tutup": {
        return {
          modal: false,
        };
      }
      case "setJasaMedis": {
        return {
          ...action.jasaMedis,
        };
      }
    }
  };
  const [jasaMedis, jasaMedisDispatch] = useReducer(
    jasaMedisActs,
    jasaMedisState
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
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const [listTarifCaraBayar, setListTarifCaraBayar] = useState<
    TarifCaraBayar[]
  >([]);
  const loadTarifCaraBayar = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/asuransi`);
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
      // console.log(json);
      setListTarifCaraBayar(json?.data);
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

  const [listTarifKelas, setListTarifKelas] = useState<TarifKelas[]>([]);
  const loadTarifKelas = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/kelas`);
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
      // console.log(json);
      setListTarifKelas(json?.data);
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

  const loadTarif = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif`);
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
      // console.log(json);
      setListTarif(json?.data);
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
        loadTarif();
        break;
      case 1:
        loadTarifCaraBayar();
        break;
      case 2:
        loadTarifKelas();
        break;
    }
  };

  const [persenCaraBayarDialog, setPersenCaraBayarDialog] =
    useState<boolean>(false);
  const [persenKelasDialog, setPersenKelasDialog] = useState<boolean>(false);
  const [menues] = useState([
    {
      label: "Persentase Tarif Cara Bayar",
      onClick: () => setPersenCaraBayarDialog(true),
    },
    {
      label: "Persentase Tarif Kelas",
      onClick: () => setPersenKelasDialog(true),
    },
  ]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    switch (selectedIdx) {
      case 0:
      default:
        return "Tarif";
      case 1:
        return "Tarif Cara Bayar";
    }
  }, [selectedIdx]);

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
              <BsCashStack
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Master Tarif
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between pb-3">
            <div className="flex gap-2">
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
              <Menu as={Fragment}>
                <div className="relative">
                  <Menu.Button
                    className={cn(
                      "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                      "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                      "h-fit px-4 py-[7px]"
                    )}
                  >
                    Persentase Tarif
                    <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute z-30 mt-1 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                      {menues.map((val) => (
                        <div className="p-0.5" key={val.label}>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={cn(
                                  // "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                                  "relative flex w-full items-center rounded-md p-2 text-sm",
                                  active
                                    ? "bg-slate-200 text-sky-600"
                                    : "text-gray-900 dark:text-slate-100"
                                )}
                                onClick={val.onClick}
                              >
                                {val.label}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      ))}
                    </Menu.Items>
                  </Transition>
                </div>
              </Menu>
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
                    <ThDiv>Nama Tarif</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>BHP</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Farmasi</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Unit</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Catatan</ThDiv>
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
                      <td className="h-[52.5px]">
                        <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <TbCheck
                          size="1.5rem"
                          className="mx-auto text-slate-200 dark:text-slate-400"
                        />
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                        <p className="mx-auto h-5 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-28 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                  listTarif?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.bhp.replace("Rp", "Rp ")}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        {data.bhp_farmasi ? (
                          <TbCheck
                            size="1.5rem"
                            className="mx-auto text-green-500"
                          />
                        ) : null}
                      </td>
                      <td className="border-b border-slate-200 py-1.5 text-center dark:border-gray-700">
                        {data.unit.map((val) => (
                          <p key={val}>{val}</p>
                        ))}
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.catatan}</p>
                      </td>
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
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
                                    jasaMedisDispatch({
                                      type: "setJasaMedis",
                                      jasaMedis: {
                                        modal: true,
                                        data: data,
                                      },
                                    });
                                  }}
                                >
                                  <FaFileMedical
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
                                <p>Jasa Medis</p>
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
                                <p>Ubah Tarif</p>
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
                                        data: {
                                          id: data.id,
                                          nama: data.nama,
                                        },
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
                                <p>Hapus Tarif</p>
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
            {/* <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Cara Bayar</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Persentase</ThDiv>
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
                            <td className="h-[40.5px]">
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <div className="flex flex-nowrap items-center justify-center gap-2  ">
                                <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listTarifCaraBayar?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.asuransi}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>
                                {data.persentase}
                                {"%"}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
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
                                          return false;
                                          // ubahDispatch({
                                          //   type: "setUbah",
                                          //   ubah: {
                                          //     modal: true,
                                          //     data: data,
                                          //   },
                                          // });
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
                                          return false;
                                          // hapusDispatch({
                                          //   type: "setHapus",
                                          //   hapus: {
                                          //     modal: true,
                                          //     data: {
                                          //       id: data.id,
                                          //       nama: data.nama,
                                          //     },
                                          //   },
                                          // });
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
                          <ThDiv>Kelas</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Persentase</ThDiv>
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
                            <td className="h-[40.5px]">
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listTarifKelas?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.kelas}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>
                                {data.persentase}
                                {"%"}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
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
                                          return false;
                                          // ubahDispatch({
                                          //   type: "setUbah",
                                          //   ubah: {
                                          //     modal: true,
                                          //     data: data,
                                          //   },
                                          // });
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
                                          return false;
                                          // hapusDispatch({
                                          //   type: "setHapus",
                                          //   hapus: {
                                          //     modal: true,
                                          //     data: {
                                          //       id: data.id,
                                          //       nama: data.nama,
                                          //     },
                                          //   },
                                          // });
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
                </Tab.Panel> */}
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

      <TarifDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadData={loadData}
      />

      <JasaMedisDialog
        show={jasaMedis.modal}
        tarif={jasaMedis.data}
        jasaMedisDispatch={jasaMedisDispatch}
      />

      <PersenCaraBayarDialog
        dialog={persenCaraBayarDialog}
        setDialog={setPersenCaraBayarDialog}
      />

      <PersenKelasDialog
        dialog={persenKelasDialog}
        setDialog={setPersenKelasDialog}
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
      </Transition>
    </>
  );
}

type TarifDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => Promise<void>;
};
const TarifDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
}: TarifDialogProps) => {
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

  const [listTidakIya] = useState([
    { value: false, label: "Tidak" },
    { value: true, label: "Iya" },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<Tarif>({
    resolver: zodResolver(TarifSchema),
    defaultValues: {
      bhp_farmasi: false,
    },
  });

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah Tarif" : "Tambah Tarif");
    return ubah.modal ? "Ubah Tarif" : "Tambah Tarif";
  }, [tambahDialog, ubah.modal]);

  const [listUnit] = useState<string[]>([
    "Rawat Jalan",
    "Rawat Inap",
    "Laboratorium",
    "Radiologi",
  ]);
  // const [listUnit, setListUnit] = useState<MyOptions>([]);
  // const getUnit = async () => {
  //   try {
  //     const res = await fetch(`${APIURL}/rs/unit`, {
  //       method: "GET",
  //       headers: headers,
  //     });
  //     const json = await res.json();
  //     setListUnit(
  //       json?.data?.map((data: Unit) => {
  //         const option: MyOption = {
  //           value: data.id,
  //           label: data.nama,
  //         };
  //         return option;
  //       }) || []
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    // getUnit();

    if (!ubah.data) return;
    console.log(ubah.data);
    setValue("nama", ubah.data?.nama!);
    setValue(
      "bhp",
      parseInt(ubah.data?.bhp.replace("Rp", "").replace(".", "")!)
    );
    setValue("catatan", ubah.data?.catatan!);
    // setValue("unit", ubah.data?.unit!);
    setValue("bhp_farmasi", ubah.data?.bhp_farmasi!);

    return () => {
      setValue("unit", []);
    };
  }, [ubah, tambahDialog]);

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<Tarif> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/tarif/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData();
      tutup();
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
                  {judul}
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="mt-2 flex flex-col gap-2"
                >
                  <div
                    className={cn(
                      "grid max-w-xs",
                      errors.nama && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="nama"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Nama Tarif
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
                      "grid max-w-xs",
                      errors.bhp && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="bhp"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        BHP
                      </label>
                      {errors.bhp ? (
                        <p className="pr-0.5 text-xs text-red-500">
                          {errors.bhp.message}
                        </p>
                      ) : null}
                    </div>
                    <Input
                      id="bhp"
                      type="number"
                      min={0}
                      {...register("bhp", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div
                    className={cn(
                      "max-w-xs",
                      errors.unit && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Unit
                      </label>
                      <p className="pr-0.5 text-xs">bisa dikosongi</p>
                    </div>
                    <Controller
                      control={control}
                      name="unit"
                      render={({ field: { onChange, value } }) => {
                        const options = listUnit?.map((val) => ({
                          value: val,
                          label: val,
                        }));
                        return (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={options}
                            value={options.find((c: any) => c.value === value)}
                            menuPosition="fixed"
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? document.body
                                : null
                            }
                            maxMenuHeight={150}
                            placeholder="Pilih Pemeriksaan Penunjang"
                          />
                        );
                        // const options: MyOptions = value?.map((val) => ({
                        //   value: val.id,
                        //   label: val.nama,
                        // }));

                        // return (
                        //   <SelectInput
                        //     isMulti
                        //     noOptionsMessage={(e) => "Tidak ada pilihan"}
                        //     onChange={
                        //       (opts) => {
                        //         const val = opts as MyOptions;
                        //         const value: Tarif["unit"] = val.map(
                        //           (unit) => ({
                        //             id: parseInt(unit.value as string),
                        //             nama: unit.label,
                        //           })
                        //         );
                        //         onChange(value);
                        //       }
                        //       /* (opts) => {
                        //         const val = opts as (MyOption | string)[];
                        //         const value = val.map((unit) => {
                        //           if (typeof unit === "string") {
                        //             return unit;
                        //           } else if (
                        //             typeof unit === "object" &&
                        //             unit !== null &&
                        //             "label" in unit
                        //           ) {
                        //             return unit.label;
                        //           } else {
                        //             return String(unit);
                        //           }
                        //         });
                        //         onChange(value);
                        //       } */
                        //     }
                        //     options={listUnit}
                        //     value={options}
                        //     placeholder="Pilih Unit"
                        //   />
                        // );
                      }}
                    />
                  </div>

                  <div
                    className={cn(
                      "grid max-w-xs",
                      errors.catatan && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="catatan"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Catatan
                      </label>
                      {errors.catatan ? (
                        <p className="pr-0.5 text-xs text-red-500">
                          {errors.catatan.message}
                        </p>
                      ) : null}
                    </div>
                    <InputArea id="catatan" {...register("catatan")} />
                  </div>

                  <div
                    className={cn(
                      "grid max-w-xs",
                      errors.bhp_farmasi && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="bhp_farmasi"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Farmasi
                      </label>
                      {errors.bhp_farmasi ? (
                        <p className="pr-0.5 text-xs text-red-500">
                          {errors.bhp_farmasi.message}
                        </p>
                      ) : null}
                    </div>
                    <Controller
                      control={control}
                      name="bhp_farmasi"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <div className="text-sm">
                          {listTidakIya.map((val, idx) => (
                            <LabelButton
                              type="radio"
                              id={"bhp_farmasi-" + (idx + 1)}
                              onBlur={onBlur}
                              onChange={() => onChange(val.value)}
                              checked={value === val.value}
                              key={idx}
                            >
                              {val.label}
                            </LabelButton>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      color={judul === "Tambah Tarif" ? "green100" : "cyan100"}
                    >
                      {judul}
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
      </Dialog>
    </Transition>
  );
};

const JasaMedisDialog = ({
  show,
  tarif,
  jasaMedisDispatch,
}: {
  show: boolean;
  tarif: MasterTarif | undefined;
  jasaMedisDispatch: React.Dispatch<JasaMedisAction>;
}) => {
  const tutup = () => {
    jasaMedisDispatch({ type: "tutup" });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [listTarif, setListTarif] = useState<JasaMedis[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);

  type UbahJasaMedisState = {
    modal: boolean;
    data?: JasaMedis;
  };
  type UbahJasaMedisAction = { type: "setUbah"; ubah: UbahJasaMedisState };
  const ubahState = {
    modal: false,
  };
  const ubahActs = (state: UbahJasaMedisState, action: UbahJasaMedisAction) => {
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
      const resp = await fetch(`${APIURL}/rs/tarif/medis/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
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
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/medis`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari,
        id: tarif?.id,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      setListTarif(json?.data);
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
    if (!show) return;
    loadData();
  }, [meta.page, meta.perPage, deferredCari, show]);
  const tableDivRef = useRef<HTMLDivElement>(null);

  const tutupJasaMedisDialog = () => {
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
  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(
      ubah.modal ? "Ubah Tarif Jasa Medis" : "Tambah Tarif Jasa Medis"
    );
    return ubah.modal ? "Ubah Tarif Jasa Medis" : "Tambah Tarif Jasa Medis";
  }, [tambahDialog, ubah.modal]);

  const [profesiOptions, setProfesiOptions] = useState<MyOptions>([]);
  const loadProfesi = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/profesi`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: Profesi) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setProfesiOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    setValue("id_tarif", tarif?.id!);
  }, [tarif]);

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadProfesi("");
    setValue("id_tarif", tarif?.id!);

    if (!ubah.data) return;
    setValue("id_profesi", ubah.data?.id_profesi!);
    setValue(
      "nominal",
      parseInt(ubah.data?.nominal.replace("Rp", "").replace(".", "")!)
    );

    return () => {
      setValue("id_profesi", NaN);
    };
  }, [ubah, tambahDialog]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<JasaMedisTSchema>({
    resolver: zodResolver(JasaMedisSchema),
    defaultValues: {
      id_tarif: tarif?.id,
    },
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<JasaMedisTSchema> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/tarif/medis/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif/medis`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData();
      tutupJasaMedisDialog();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={show} as={Fragment}>
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
                  "h-full w-full max-w-3xl transform rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <div className="flex items-center border-b border-b-slate-200 pb-1">
                  <FaFileMedical
                    size="1.25rem"
                    className="mx-3 text-gray-500 dark:text-slate-100"
                  />
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-slate-500 dark:text-slate-100"
                  >
                    List Tarif Jasa Medis {tarif?.nama}
                  </Dialog.Title>
                </div>
                <div className="mt-2 flex items-center justify-between pb-3">
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
                          <ThDiv>Petugas</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Nominal Tarif</ThDiv>
                        </Th>
                        {/* <Th>
                          <ThDiv>Aktif</ThDiv>
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
                              <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-2 text-center" colSpan={4}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listTarif?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nominal.replace("Rp", "Rp ")}</p>
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
                                              data: {
                                                id: data.id,
                                                nama: data.nama,
                                              },
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
                </div>
                <Pagination
                  meta={meta}
                  mutating={isMutating}
                  setPage={(pageVal: number) => {
                    metaDispatch({ type: "page", page: pageVal });
                    tableDivRef.current?.scrollTo(0, 0);
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={ubah.modal || tambahDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={tutupJasaMedisDialog}
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
                  <Dialog.Panel
                    className={cn(
                      "w-full max-w-lg transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                      css.scrollbar
                    )}
                  >
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      {judul}
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit(submitHandler)}
                      className="mt-2 flex flex-col gap-2"
                    >
                      <div
                        className={cn(
                          errors.id_profesi && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Profesi Petugas
                          </label>
                          {errors.id_profesi ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.id_profesi.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_profesi"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadProfesi}
                              defaultOptions={profesiOptions}
                              value={profesiOptions?.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) =>
                                onChange(option?.value)
                              }
                              onMenuOpen={() => loadProfesi("")}
                              placeholder="Pilih Profesi Petugas"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              maxMenuHeight={250}
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "grid",
                          errors.nominal && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="nominal"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Nominal Tarif
                          </label>
                          {errors.nominal ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.nominal.message}
                            </p>
                          ) : null}
                        </div>
                        <Input
                          id="nominal"
                          type="number"
                          min={0}
                          {...register("nominal", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="mt-4 flex gap-1">
                        <Button
                          type="submit"
                          color={
                            judul === "Tambah Tarif Jasa Medis"
                              ? "green100"
                              : "cyan100"
                          }
                        >
                          {judul}
                        </Button>
                        <Button
                          className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                          color="red"
                          onClick={tutupJasaMedisDialog}
                        >
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

        <Transition show={hapus.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
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
                      Hapus Tarif Jasa Medis
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus tarif {hapus.data?.nama} pada {tarif?.nama}
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
      </Dialog>
    </Transition>
  );
};

const PersenCaraBayarDialog = ({
  dialog,
  setDialog,
}: {
  dialog: boolean;
  setDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const tutup = () => {
    setDialog(false);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<TarifCaraBayar[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const ubahState = {
    modal: false,
  };
  type UbahCaraBayarState = {
    modal: boolean;
    data?: TarifCaraBayar;
  };
  type UbahCaraBayarAction = { type: "setUbah"; ubah: UbahCaraBayarState };
  const ubahActs = (state: UbahCaraBayarState, action: UbahCaraBayarAction) => {
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
    data?: TarifCaraBayar;
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
      const resp = await fetch(
        `${APIURL}/rs/tarif/asuransi/${hapus.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const data = await resp.json();
      if (data.status !== "Deleted") throw new Error(data.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(data?.message);
      loadData();
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
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/asuransi`);
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
    if (dialog) loadData();
  }, [meta.page, meta.perPage, deferredCari, dialog]);
  const tableDivRef = useRef<HTMLDivElement>(null);

  const tutupFormDialog = () => {
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
  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(
      ubah.modal
        ? "Ubah Persentase Tarif Cara Bayar"
        : "Tambah Persentase Tarif Cara Bayar"
    );
    return ubah.modal
      ? "Ubah Persentase Tarif Cara Bayar"
      : "Tambah Persentase Tarif Cara Bayar";
  }, [tambahDialog, ubah.modal]);

  const [caraBayarOptions, setCaraBayarOptions] = useState<MyOptions>([]);
  const loadCaraBayar = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/asuransi`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: CaraBayar) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setCaraBayarOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadCaraBayar("");

    if (!ubah.data) return;
    setValue("id_asuransi", ubah.data?.id_asuransi!);
    setValue("persentase", ubah.data?.persentase!);

    return () => {
      setValue("id_asuransi", NaN);
    };
  }, [ubah, tambahDialog]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<PersenCaraBayarTSchema>({
    resolver: zodResolver(PersenCaraBayarSchema),
    defaultValues: {},
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<PersenCaraBayarTSchema> = async (
    data,
    e
  ) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(
          `${APIURL}/rs/tarif/asuransi/${ubah.data?.id}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(data),
          }
        );
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif/asuransi`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData();
      tutupFormDialog();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={dialog} as={Fragment}>
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
                <div className="flex items-center border-b border-b-slate-200 pb-1">
                  {/* <FaUserGear
                    size="1.25rem"
                    className="mx-3 text-gray-500 dark:text-slate-100"
                  /> */}
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-slate-500 dark:text-slate-100"
                  >
                    Persentase Tarif Cara Bayar
                  </Dialog.Title>
                </div>
                <div className="mt-2 flex items-center justify-between pb-3">
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
                          <ThDiv>Cara Bayar</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Persentase</ThDiv>
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
                            <td className="h-[40.5px]">
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <div className="flex flex-nowrap items-center justify-center gap-2  ">
                                <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                <p className="h-6 w-6 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.asuransi}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>
                                {data.persentase}
                                {"%"}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
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
                </div>
                <Pagination
                  meta={meta}
                  mutating={isMutating}
                  setPage={(pageVal: number) => {
                    metaDispatch({ type: "page", page: pageVal });
                    tableDivRef.current?.scrollTo(0, 0);
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={tambahDialog || ubah.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={tutupFormDialog}
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
                  <Dialog.Panel
                    className={cn(
                      "w-full max-w-lg transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                      css.scrollbar
                    )}
                  >
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      {judul}
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit(submitHandler)}
                      className="mt-2 flex flex-col gap-2"
                    >
                      <div
                        className={cn(
                          errors.id_asuransi && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Cara Bayar
                          </label>
                          {errors.id_asuransi ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.id_asuransi.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_asuransi"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadCaraBayar}
                              defaultOptions={caraBayarOptions}
                              value={caraBayarOptions?.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) =>
                                onChange(option?.value)
                              }
                              placeholder="Pilih Cara Bayar"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              maxMenuHeight={250}
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "grid",
                          errors.persentase && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="persentase"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Persentase Tarif
                          </label>
                          {errors.persentase ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.persentase.message}
                            </p>
                          ) : null}
                        </div>
                        <div className="relative flex w-24">
                          <Input
                            id="persentase"
                            className="w-24 pr-7"
                            type="number"
                            min={0}
                            step={0.5}
                            {...register("persentase", {
                              valueAsNumber: true,
                            })}
                            onInput={(
                              e: React.FocusEvent<HTMLInputElement, Element>
                            ) => {
                              +e.target.value > 100 &&
                                setValue("persentase", 100);
                            }}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            %
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-1">
                        <Button
                          type="submit"
                          color={
                            judul === "Tambah Persentase Tarif Cara Bayar"
                              ? "green100"
                              : "cyan100"
                          }
                        >
                          {judul}
                        </Button>
                        <Button
                          className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                          color="red"
                          onClick={tutupFormDialog}
                        >
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

        <Transition show={hapus.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1020]"
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
                      className="font-medium leading-6 text-gray-900"
                    >
                      Hapus Persentase Tarif Cara Bayar
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus persentase tarif {hapus.data?.asuransi}
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
      </Dialog>
    </Transition>
  );
};

const PersenKelasDialog = ({
  dialog,
  setDialog,
}: {
  dialog: boolean;
  setDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const tutup = () => {
    setDialog(false);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<TarifKelas[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const ubahState = {
    modal: false,
  };
  type UbahCaraBayarState = {
    modal: boolean;
    data?: TarifKelas;
  };
  type UbahCaraBayarAction = { type: "setUbah"; ubah: UbahCaraBayarState };
  const ubahActs = (state: UbahCaraBayarState, action: UbahCaraBayarAction) => {
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
    data?: TarifKelas;
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
      const resp = await fetch(
        `${APIURL}/rs/tarif/asuransi/${hapus.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const data = await resp.json();
      if (data.status !== "Deleted") throw new Error(data.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(data?.message);
      loadData();
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
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/kelas`);
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
    if (dialog) loadData();
  }, [meta.page, meta.perPage, deferredCari, dialog]);
  const tableDivRef = useRef<HTMLDivElement>(null);

  const tutupFormDialog = () => {
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
  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(
      ubah.modal
        ? "Ubah Persentase Tarif Cara Bayar"
        : "Tambah Persentase Tarif Cara Bayar"
    );
    return ubah.modal
      ? "Ubah Persentase Tarif Cara Bayar"
      : "Tambah Persentase Tarif Cara Bayar";
  }, [tambahDialog, ubah.modal]);

  type Kelas = {
    id: number;
    nama: string;
    aktif: boolean;
  };
  const [kelasOptions, setKelasOptions] = useState<MyOptions>([]);
  const loadKelas = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/kelas`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: Kelas) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setKelasOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadKelas("");

    if (!ubah.data) return;
    setValue("id_kelas", ubah.data?.id_kelas!);
    setValue("persentase", ubah.data?.persentase!);

    return () => {
      setValue("id_kelas", NaN);
    };
  }, [ubah, tambahDialog]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<PersenKelasTSchema>({
    resolver: zodResolver(PersenKelasSchema),
    defaultValues: {},
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<PersenKelasTSchema> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/tarif/kelas/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif/kelas`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData();
      tutupFormDialog();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={dialog} as={Fragment}>
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
                <div className="flex items-center border-b border-b-slate-200 pb-1">
                  {/* <FaUserGear
                    size="1.25rem"
                    className="mx-3 text-gray-500 dark:text-slate-100"
                  /> */}
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-slate-500 dark:text-slate-100"
                  >
                    Persentase Tarif Kelas
                  </Dialog.Title>
                </div>
                <div className="mt-2 flex items-center justify-between pb-3">
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
                          <ThDiv>Kelas</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Persentase</ThDiv>
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
                            <td className="h-[40.5px]">
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.kelas}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>
                                {data.persentase}
                                {"%"}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
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
                </div>
                <Pagination
                  meta={meta}
                  mutating={isMutating}
                  setPage={(pageVal: number) => {
                    metaDispatch({ type: "page", page: pageVal });
                    tableDivRef.current?.scrollTo(0, 0);
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={tambahDialog || ubah.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={tutupFormDialog}
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
                  <Dialog.Panel
                    className={cn(
                      "w-full max-w-lg transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                      css.scrollbar
                    )}
                  >
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      {judul}
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit(submitHandler)}
                      className="mt-2 flex flex-col gap-2"
                    >
                      <div
                        className={cn(
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
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadKelas}
                              defaultOptions={kelasOptions}
                              value={kelasOptions?.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) =>
                                onChange(option?.value)
                              }
                              placeholder="Pilih Kelas"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              maxMenuHeight={250}
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "grid",
                          errors.persentase && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="persentase"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Persentase Tarif
                          </label>
                          {errors.persentase ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.persentase.message}
                            </p>
                          ) : null}
                        </div>
                        <div className="relative flex w-24">
                          <Input
                            id="persentase"
                            className="w-24 pr-7"
                            type="number"
                            min={0}
                            step={0.5}
                            {...register("persentase", {
                              valueAsNumber: true,
                            })}
                            onInput={(
                              e: React.FocusEvent<HTMLInputElement, Element>
                            ) => {
                              +e.target.value > 100 &&
                                setValue("persentase", 100);
                            }}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            %
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-1">
                        <Button
                          type="submit"
                          color={
                            judul === "Tambah Persentase Tarif Kelas"
                              ? "green100"
                              : "cyan100"
                          }
                        >
                          {judul}
                        </Button>
                        <Button
                          className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                          color="red"
                          onClick={tutupFormDialog}
                        >
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

        <Transition show={hapus.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1020]"
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
                      className="font-medium leading-6 text-gray-900"
                    >
                      Hapus Persentase Tarif Kelas
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus persentase tarif {hapus.data?.kelas}
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
      </Dialog>
    </Transition>
  );
};
