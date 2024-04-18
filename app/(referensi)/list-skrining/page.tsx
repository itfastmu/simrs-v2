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
import { TbCheck, TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Listbox, Tab, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import { Input, InputArea, LabelButton } from "@/components/form";
import { Unit } from "@/app/(referensi)/list-unit/page";
import { HiOutlineDocumentPlus } from "react-icons/hi2";

type SkriningInstrumen = {
  id: number;
  id_tipe: number;
  id_ref: number;
  pertanyaan: string;
  aktif: boolean;
  nama: string;
  bool: boolean;
  isian: boolean;
};
type SkriningTipe = Pick<SkriningInstrumen, "id" | "nama" | "aktif">;
type SkriningSkor = {
  id: number;
  id_instrumen: number;
  jawaban: string;
  skor: number;
  id_tipe: number;
  pertanyaan: string;
  aktif: boolean;
};
type SkriningGrup = {
  id: number;
  id_tipe: number;
  group: string;
  nama: string;
  aktif: boolean;
};

type UbahOthersState = {
  modal: boolean;
  data?: SkriningInstrumen | SkriningTipe | SkriningSkor | SkriningGrup;
};
type UbahOthersAction = { type: "setUbahOthers"; ubahOthers: UbahOthersState };

export default function DataFarmasi() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

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
    data?: SkriningInstrumen | SkriningTipe | SkriningSkor | SkriningGrup;
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
        judul === "Instrumen"
          ? `${APIURL}/rs/skrining/instrument/${hapus.data?.id}`
          : judul === "Tipe"
          ? `${APIURL}/rs/skrining/tipe/${hapus.data?.id}`
          : judul === "Skor"
          ? `${APIURL}/rs/skrining/skor/${hapus.data?.id}`
          : judul === "Grup"
          ? `${APIURL}/rs/skrining/group/${hapus.data?.id}`
          : "";

      const resp = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const data = await resp.json();
      if (data.status !== "Deleted") throw new Error(data.message);
      hapusDispatch({
        type: "setHapus",
        hapus: { modal: false, data: hapus.data },
      });
      loadData();
      toast.success(data?.message, { position: "top-center" });
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

  const [listInstrumen, setListInstrumen] = useState<SkriningInstrumen[]>([]);
  const loadInstrumen = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/skrining/instrument`);
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
      setListInstrumen(json?.data);
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

  const [listTipe, setListTipe] = useState<SkriningTipe[]>([]);
  const loadTipe = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/skrining/tipe`);
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

  const [listSkor, setListSkor] = useState<SkriningSkor[]>([]);
  const loadSkor = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/skrining/skor`);
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
      setListSkor(json?.data);
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

  const [listGrup, setListGrup] = useState<SkriningGrup[]>([]);
  const loadGrup = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/skrining/group`);
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
      setListGrup(json?.data);
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
      default:
      case 0:
        loadInstrumen();
        break;
      case 1:
        loadTipe();
        break;
      case 2:
        loadSkor();
        break;
      case 3:
        loadGrup();
        break;
    }
  };

  const [menues] = useState([
    "List Instrumen",
    "List Tipe",
    "List Skor",
    "List Grup",
  ]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    switch (selectedIdx) {
      default:
      case 0:
        return "Instrumen";
      case 1:
        return "Tipe";
      case 2:
        return "Skor";
      case 3:
        return "Grup";
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
              <HiOutlineDocumentPlus
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Skrining
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
            <div className="flex items-baseline gap-1">
              <div className="flex gap-1">
                <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                  onClick={() => setTambahOthersDialog(true)}
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
                          <ThDiv>Referensi</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Tipe</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Pertanyaan</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Isian</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Pilihan Ya Tidak</ThDiv>
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
                              <p className="mx-auto h-5 w-12 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-40 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <TbCheck
                                size="1.5rem"
                                className="mx-auto text-slate-200 dark:text-slate-400"
                              />
                            </td>
                            <td>
                              <TbCheck
                                size="1.5rem"
                                className="mx-auto text-slate-200 dark:text-slate-400"
                              />
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
                          <td className="p-4 text-center" colSpan={10}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        listInstrumen?.map((data, i) => (
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
                              <p>{data.id_ref === 0 ? null : data.id_ref}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.pertanyaan}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              {data.isian ? (
                                <TbCheck
                                  size="1.5rem"
                                  className="mx-auto text-green-500"
                                />
                              ) : null}
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              {data.bool ? (
                                <TbCheck
                                  size="1.5rem"
                                  className="mx-auto text-green-500"
                                />
                              ) : null}
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-40 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                          <ThDiv>Kode</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Pertanyaan</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Jawaban</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Skor</ThDiv>
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
                              <p className="h-5 w-56 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-8 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listSkor?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.pertanyaan}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.jawaban}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.skor}</p>
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
                          <ThDiv>Grup</ThDiv>
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
                              <p className="mx-auto h-9 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-40 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listGrup?.map((data, i) => (
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
                              <p>{data.group}</p>
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

      <OthersDialog
        key={selectedIdx}
        tambahDialog={tambahOthersDialog}
        setTambahDialog={setTambahOthersDialog}
        ubah={ubahOthers}
        ubahDispatch={ubahOthersDispatch}
        loadData={loadData}
        judul={judul}
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
                      {judul === "Skor"
                        ? (hapus.data as SkriningSkor)?.jawaban +
                          " pada pertanyaan " +
                          (hapus.data as SkriningSkor)?.pertanyaan
                        : judul === "Grup"
                        ? (hapus.data as SkriningGrup)?.nama +
                          " pada " +
                          (hapus.data as SkriningGrup)?.group
                        : (hapus.data as SkriningInstrumen)?.nama}
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

type OthersDialogProps = {
  key: number;
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahOthersState;
  ubahDispatch: React.Dispatch<UbahOthersAction>;
  loadData: () => Promise<void>;
  judul: "Instrumen" | "Tipe" | "Skor" | "Grup";
};

function OthersDialog({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
  judul,
}: OthersDialogProps) {
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

  const [listTidakIya] = useState([
    { value: false, label: "Tidak" },
    { value: true, label: "Iya" },
  ]);

  const [tipeOptions, setTipeOptions] = useState<MyOptions>([]);
  const loadTipe = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/skrining/tipe`);
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
      const options = json.data.map((val: SkriningTipe) => ({
        value: val.id,
        label: val.nama,
      }));
      setTipeOptions(options);
      return options;
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return [];
      console.error(error);
      return [];
    }
  };

  const [instrumenOptions, setInstrumenOptions] = useState<MyOptions>([]);
  const loadInstrumen = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/skrining/instrument`);
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
      const options = json.data.map((val: SkriningInstrumen) => ({
        value: val.id,
        label: val.nama + " - " + val.pertanyaan,
      }));
      setInstrumenOptions(options);
      return options;
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return [];
      toast.error("Cari instrumen gagal!");
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadTipe("");
    loadInstrumen("");

    if (!ubah.data) return;
    switch (judul) {
      case "Instrumen":
        setValue("id_tipe", (ubah.data as SkriningInstrumen)?.id_tipe);
        setValue("pertanyaan", (ubah.data as SkriningInstrumen)?.pertanyaan);
        setValue("bool", (ubah.data as SkriningInstrumen)?.bool);
        setValue("isian", (ubah.data as SkriningInstrumen)?.isian);
        setValue("id_ref", (ubah.data as SkriningInstrumen)?.id_ref);
        break;
      case "Tipe":
        setValue("nama", (ubah.data as SkriningTipe)?.nama);
        break;
      case "Skor":
        setValue("id_instrumen", (ubah.data as SkriningSkor)?.id_instrumen);
        setValue("jawaban", (ubah.data as SkriningSkor)?.jawaban);
        setValue("skor", (ubah.data as SkriningSkor)?.skor);
        break;
      case "Grup":
        setValue("id_tipe", (ubah.data as SkriningGrup)?.id_tipe);
        setValue("group", (ubah.data as SkriningGrup)?.group);
        break;
    }

    return () => {
      setValue("id_tipe", NaN);
      setValue("id_instrumen", NaN);
    };
  }, [ubah, tambahDialog]);

  const InstrumenSchema = z.object({
    type: z.literal("Instrumen"),
    id_tipe: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    id_ref: z.number().or(z.nan()).optional(),
    pertanyaan: z.string().min(1, "harus diisi"),
    bool: z.boolean({ required_error: "harus diisi" }),
    isian: z.boolean({ required_error: "harus diisi" }),
  });

  const TipeSchema = z.object({
    type: z.literal("Tipe"),
    nama: z.string().min(1, "harus diisi"),
  });

  const SkorSchema = z.object({
    type: z.literal("Skor"),
    id_instrumen: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    jawaban: z.string().min(1, "harus diisi"),
    skor: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
  });

  const GrupSchema = z.object({
    type: z.literal("Grup"),
    id_tipe: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    group: z.string().min(1, "harus diisi"),
  });

  const FormSchema = z.discriminatedUnion("type", [
    InstrumenSchema,
    TipeSchema,
    SkorSchema,
    GrupSchema,
  ]);
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
      id_ref: 0,
      isian: false,
      bool: true,
    },
  });

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      const { type, ...parsedData } = data;
      if (type === "Instrumen") (parsedData as SkriningInstrumen).id_ref || 0;
      let resJson: any;
      if (ubah.modal) {
        const url =
          judul === "Instrumen"
            ? `${APIURL}/rs/skrining/instrument/${ubah.data?.id}`
            : judul === "Tipe"
            ? `${APIURL}/rs/skrining/tipe/${ubah.data?.id}`
            : judul === "Skor"
            ? `${APIURL}/rs/skrining/skor/${ubah.data?.id}`
            : judul === "Grup"
            ? `${APIURL}/rs/skrining/group/${ubah.data?.id}`
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
          judul === "Instrumen"
            ? `${APIURL}/rs/skrining/instrument`
            : judul === "Tipe"
            ? `${APIURL}/rs/skrining/tipe`
            : judul === "Skor"
            ? `${APIURL}/rs/skrining/skor`
            : judul === "Grup"
            ? `${APIURL}/rs/skrining/group`
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
      toast.success(resJson.message, { position: "top-center" });
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
                  "w-full max-w-lg transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700"
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  {judulDeskripsi}
                </Dialog.Title>
                <form
                  className={cn("mt-2 flex flex-col gap-2")}
                  onSubmit={handleSubmit(submitHandler)}
                >
                  {judul === "Instrumen" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "id_tipe" in errors &&
                            errors.id_tipe &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="id_tipe"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Tipe
                          </label>
                          {"id_tipe" in errors && errors.id_tipe ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"id_tipe" in errors && errors.id_tipe.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_tipe"
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
                              maxMenuHeight={250}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "id_ref" in errors &&
                            errors.id_ref &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="id_ref"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Referensi
                          </label>
                          <p className="pr-0.5 text-xs">bisa dikosongi</p>
                        </div>
                        <Controller
                          control={control}
                          name="id_ref"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadInstrumen}
                              defaultOptions={instrumenOptions}
                              value={instrumenOptions.find(
                                (val) => val.value === value
                              )}
                              isClearable
                              onChange={(option: MyOption | null) => {
                                onChange(option?.value);
                              }}
                              placeholder="Pilih Instrumen"
                              maxMenuHeight={250}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "pertanyaan" in errors &&
                            errors.pertanyaan &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="pertanyaan"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Pertanyaan
                          </label>
                          {"pertanyaan" in errors && errors.pertanyaan ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"pertanyaan" in errors &&
                                errors.pertanyaan.message}
                            </p>
                          ) : null}
                        </div>
                        <InputArea
                          className="-mb-2"
                          {...register("pertanyaan")}
                        />
                      </div>
                      <div className="grid grid-cols-2">
                        <div
                          className={cn(
                            "w-full",
                            "isian" in errors &&
                              errors.isian &&
                              "rounded-lg bg-red-100"
                          )}
                        >
                          <div className="flex items-baseline justify-between">
                            <label
                              htmlFor="isian"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Isian
                            </label>
                            {"isian" in errors && errors.isian ? (
                              <p className="pr-0.5 text-xs text-red-500">
                                {"isian" in errors && errors.isian.message}
                              </p>
                            ) : null}
                          </div>
                          <Controller
                            control={control}
                            name="isian"
                            render={({
                              field: { onChange, value, onBlur },
                            }) => (
                              <div className="text-xs">
                                {listTidakIya.map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"isian-" + (idx + 1)}
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
                        <div
                          className={cn(
                            "w-full",
                            "bool" in errors &&
                              errors.bool &&
                              "rounded-lg bg-red-100"
                          )}
                        >
                          <div className="flex items-baseline justify-between">
                            <label
                              htmlFor="bool"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Pilihan Ya Tidak
                            </label>
                            {"bool" in errors && errors.bool ? (
                              <p className="pr-0.5 text-xs text-red-500">
                                {"bool" in errors && errors.bool.message}
                              </p>
                            ) : null}
                          </div>
                          <Controller
                            control={control}
                            name="bool"
                            render={({
                              field: { onChange, value, onBlur },
                            }) => (
                              <div className="text-xs">
                                {listTidakIya.map((val, idx) => (
                                  <LabelButton
                                    type="radio"
                                    id={"bool-" + (idx + 1)}
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
                      <Input placeholder="Nama" {...register("nama")} />
                      {"nama" in errors && errors.nama ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {"nama" in errors && errors.nama.message}
                        </p>
                      ) : null}
                    </div>
                  ) : judul === "Skor" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "id_instrumen" in errors &&
                            errors.id_instrumen &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="id_instrumen"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Instrumen
                          </label>
                          {"id_instrumen" in errors && errors.id_instrumen ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {"id_instrumen" in errors &&
                                errors.id_instrumen.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_instrumen"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadInstrumen}
                              defaultOptions={instrumenOptions}
                              value={instrumenOptions.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) => {
                                onChange(option?.value);
                              }}
                              placeholder="Pilih Instrumen"
                              maxMenuHeight={250}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "jawaban" in errors &&
                            errors.jawaban &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="jawaban"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Jawaban
                          </label>
                          {"jawaban" in errors && errors.jawaban ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {"jawaban" in errors && errors.jawaban.message}
                            </p>
                          ) : null}
                        </div>
                        <InputArea
                          className="-mb-1.5"
                          {...register("jawaban")}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "skor" in errors &&
                            errors.skor &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="skor"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Skor
                          </label>
                          {"skor" in errors && errors.skor ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {"skor" in errors && errors.skor.message}
                            </p>
                          ) : null}
                        </div>
                        <Input
                          type="number"
                          className="w-20"
                          min={0}
                          {...register("skor", { valueAsNumber: true })}
                        />
                      </div>
                    </>
                  ) : judul === "Grup" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "id_tipe" in errors &&
                            errors.id_tipe &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="id_tipe"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Tipe
                          </label>
                          {"id_tipe" in errors && errors.id_tipe ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"id_tipe" in errors && errors.id_tipe.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_tipe"
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
                              maxMenuHeight={250}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "group" in errors &&
                            errors.group &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="group"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Group
                          </label>
                          {"group" in errors && errors.group ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {"group" in errors && errors.group.message}
                            </p>
                          ) : null}
                        </div>
                        <Input {...register("group")} />
                      </div>
                    </>
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
}
