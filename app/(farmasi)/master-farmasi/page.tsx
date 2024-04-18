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
import { toast } from "react-toastify";
import { GiMedicines } from "react-icons/gi";
import { TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Listbox, Tab, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import BarangDialog from "./_components/barang";
import OthersDialog from "./_components/farmasi-lain";
import { Barang, Depo, Jenis, Satuan, Sediaan, Tipe } from "../schema";

type UbahState = {
  modal: boolean;
  data?: Barang;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

type UbahOthersState = {
  modal: boolean;
  data?: Satuan | Depo | Sediaan | Tipe | Omit<Tipe, "kode">;
};
type UbahOthersAction = { type: "setUbahOthers"; ubahOthers: UbahOthersState };

export default function DataFarmasi() {
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
    data?: Barang | Satuan | Depo | Sediaan | Tipe | Omit<Tipe, "kode">;
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
        judul === "Barang"
          ? `${APIURL}/rs/farmasi/barang/${hapus.data?.id}`
          : judul === "Satuan"
          ? `${APIURL}/rs/farmasi/satuan/${hapus.data?.id}`
          : judul === "Depo"
          ? `${APIURL}/rs/farmasi/depo/${hapus.data?.id}`
          : judul === "Sediaan"
          ? `${APIURL}/rs/farmasi/sediaan/${hapus.data?.id}`
          : judul === "Tipe"
          ? `${APIURL}/rs/farmasi/tipe/${hapus.data?.id}`
          : judul === "Zat"
          ? `${APIURL}/rs/farmasi/zat/${hapus.data?.id}`
          : "";
      const hapusBarang = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const data = await hapusBarang.json();
      if (data.status !== "Deleted") throw new Error(data.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      loadData();
      toast.success(data?.message);
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

  const [listSatuan, setListSatuan] = useState<Satuan[]>([]);
  const loadSatuan = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/satuan`);
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
      setListSatuan(json?.data);
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

  const [listDepo, setListDepo] = useState<Depo[]>([]);
  const loadDepo = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/depo`);
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
      setListDepo(json?.data);
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

  const [listJenis, setListJenis] = useState<Jenis[]>([]);
  const loadJenis = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/jenis`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        tipe: filterJenis,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListJenis(json?.data);
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

  const [listSediaan, setListSediaan] = useState<Sediaan[]>([]);
  const loadSediaan = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/sediaan`);
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
      setListSediaan(json?.data);
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
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/tipe`);
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

  const [listZat, setListZat] = useState<Omit<Tipe, "kode">[]>([]);
  const loadZat = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/zat`);
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
      setListZat(json?.data);
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

  const [listBarang, setListBarang] = useState<Barang[]>([]);
  const loadBarang = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/barang`);
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
      setListBarang(json?.data);
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
        loadBarang();
        break;
      case 1:
        loadSatuan();
        break;
      case 2:
        loadDepo();
        break;
      case 3:
        loadJenis();
        break;
      case 4:
        loadSediaan();
        break;
      case 5:
        loadTipe();
        break;
      case 6:
        loadZat();
        break;
    }
  };

  const [menues] = useState([
    "List Barang",
    "List Satuan",
    "List Depo",
    "List Jenis",
    "List Sediaan",
    "List Tipe",
    "List Zat",
  ]);

  const [listFilterJenis] = useState([
    { value: "pemasukan", label: "Pemasukan" },
    { value: "pengeluaran", label: "Pengeluaran" },
    { value: "so", label: "Stok Opname" },
  ]);
  const [filterJenis, setFilterJenis] = useState<string>(
    listFilterJenis?.at(0)?.value!
  );

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    switch (selectedIdx) {
      default:
      case 0:
        return "Barang";
      case 1:
        return "Satuan";
      case 2:
        return "Depo";
      case 4:
        return "Sediaan";
      case 5:
        return "Tipe";
      case 6:
        return "Zat";
    }
  }, [selectedIdx]);

  useEffect(() => {
    loadData();
  }, [meta.page, meta.perPage, deferredCari, selectedIdx, filterJenis]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <GiMedicines
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Master Farmasi
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
            <div className="flex items-center gap-1">
              {selectedIdx !== 3 ? (
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
              ) : (
                <Listbox
                  value={filterJenis}
                  onChange={(val) => {
                    setFilterJenis(val);
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
                      {
                        listFilterJenis.find((val) => {
                          return val.value === filterJenis;
                        })?.label
                      }
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
                        {listFilterJenis.map((filter) => (
                          <div className="p-0.5" key={filter.value}>
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
                              value={filter.value}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={cn(
                                      "block truncate",
                                      selected ? "font-medium" : "font-normal"
                                    )}
                                  >
                                    {filter.label}
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
              )}
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
                        {/* <Th>
                          <ThDiv>Stok</ThDiv>
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
                            <td className="h-[53px]">
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
                            {/* <td>
                              <p className="mx-auto h-5 w-8 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td> */}
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
                          <td className="p-4 text-center" colSpan={10}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listBarang?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.satuan}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.sediaan}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.tipe}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.zat}</p>
                            </td>
                            {/* <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.stok}</p>
                            </td> */}
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
                          <ThDiv>Satuan</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Deskripsi</ThDiv>
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={4}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listSatuan?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.deskripsi}</p>
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
                          <ThDiv>Depo</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kode Unit</ThDiv>
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-36 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-14 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={4}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listDepo?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.id_unit}</p>
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
                          <ThDiv>Jenis</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tipe</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tabel</ThDiv>
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-6 w-36 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-8 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-14 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                          </tr>
                        ))
                      ) : meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={4}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listJenis?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.tipe}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.table}</p>
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
                          <ThDiv>Sediaan</ThDiv>
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={4}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listSediaan?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
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
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Id</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tipe</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kode</ThDiv>
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
                              <p className="mx-auto h-9 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-6 w-10 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={4}>
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
                              <p className="mx-auto w-12 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center text-base dark:border-gray-700">
                              <p>{data.kode}</p>
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
                          <ThDiv>Id</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Zat</ThDiv>
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
                              <p className="mx-auto h-9 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={3}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listZat?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-12 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
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

      <BarangDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadBarang={loadBarang}
      />

      <OthersDialog
        key={selectedIdx}
        tambahDialog={tambahOthersDialog}
        setTambahDialog={setTambahOthersDialog}
        ubah={ubahOthers}
        ubahDispatch={ubahOthersDispatch}
        loadData={loadData}
        judul={judul !== "Barang" ? judul : "Satuan"}
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
                    Hapus {judul}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-slate-100">
                      {hapus.data?.nama}
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
