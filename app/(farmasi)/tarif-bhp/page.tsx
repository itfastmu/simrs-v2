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
import { AiOutlineSchedule } from "react-icons/ai";
import { TbCheck, TbEdit, TbPill, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Listbox, Menu, Tab, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Input, InputArea, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { Pegawai } from "@/app/(pegawai)/schema";
import { BsCashStack, BsListUl } from "react-icons/bs";
import { Unit } from "@/app/(referensi)/list-unit/page";
import { GiMedicalDrip } from "react-icons/gi";
import { MasterTarif } from "../../(billing)/master-tarif/page";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import { PiPillDuotone } from "react-icons/pi";
import BarangBHPDialog from "./_components/tarif-bhp-barang";

type TarifBHP = MasterTarif & {
  id_tarif: number;
  id_group: number;
  group: string;
};

type UbahState = {
  modal: boolean;
  data?: TarifBHP;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

type GroupBHP = Pick<MasterTarif, "id" | "nama" | "aktif">;
type UbahGroupState = {
  modal: boolean;
  data?: GroupBHP;
};
type UbahGroupAction = { type: "setUbah"; ubah: UbahGroupState };

export type FarmasiGroupState = {
  modal: boolean;
  data?: {
    id_group: number;
    nama_group: string;
  };
};
export type FarmasiGroupAction = {
  type: "setFarmasi";
  farmasi: FarmasiGroupState;
};

export default function TarifBHP() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();

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
      loadListTarif();
    } catch (error) {
      console.error(error);
    }
  };

  const [tambahGroupDialog, setTambahGroupDialog] = useState<boolean>(false);
  const ubahGroupState = {
    modal: false,
  };
  const ubahGroupActs = (state: UbahGroupState, action: UbahGroupAction) => {
    switch (action.type) {
      case "setUbah": {
        return {
          ...action.ubah,
        };
      }
    }
  };
  const [ubahGroup, ubahGroupDispatch] = useReducer(
    ubahGroupActs,
    ubahGroupState
  );

  const handleHapusGroup = async () => {
    try {
      const resp = await fetch(`${APIURL}/rs/tarif/group/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const data = await resp.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(data?.message);
      loadListTarif();
    } catch (error) {
      console.error(error);
    }
  };

  const farmasiGroupState = {
    modal: false,
  };
  const farmasiGroupActs = (
    state: FarmasiGroupState,
    action: FarmasiGroupAction
  ) => {
    switch (action.type) {
      case "setFarmasi": {
        return {
          ...action.farmasi,
        };
      }
    }
  };
  const [farmasiGroup, farmasiGroupDispatch] = useReducer(
    farmasiGroupActs,
    farmasiGroupState
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

  const [listGroup, setListGroup] = useState<GroupBHP[]>([]);
  const loadListGroup = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/group`);
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
      setListGroup(json?.data);
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

  const [listTarif, setListTarif] = useState<TarifBHP[]>([]);
  const loadListTarif = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/tarif/bhp`);
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
        loadListTarif();
        break;
      case 1:
        loadListGroup();
        break;
    }
  };

  const [menues] = useState(["List Tarif BHP", "List Grup BHP"]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    switch (selectedIdx) {
      case 0:
        return "Tarif";
      default:
      case 1:
        return "Grup";
    }
  }, [selectedIdx]);

  useEffect(() => {
    loadData();
    // console.log(meta);
    // console.log(filter);
  }, [meta.page, meta.perPage, deferredCari, selectedIdx]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <GiMedicalDrip
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Tarif BHP
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
                  onClick={() =>
                    selectedIdx === 0
                      ? setTambahDialog(true)
                      : setTambahGroupDialog(true)
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
                          <ThDiv>Grup BHP</ThDiv>
                        </Th>
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
                            <td className="h-[40.5px]">
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
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
                            // className="relative z-[1010] bg-white hover:z-[1020] hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.group}</p>
                            </td>
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
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.catatan}</p>
                            </td>
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                              <div className="flex items-center justify-center gap-2">
                                {/* <Menu
                                  as="div"
                                  className="relative inline-block text-left"
                                >
                                  <Menu.Button className="mx-auto rounded-lg bg-slate-100 p-1">
                                    <BsListUl
                                      size="1.25rem"
                                      className="fill-blue-500"
                                    />
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
                                    <Menu.Items
                                      className={cn(
                                        // "absolute left-0 z-[1050] mt-2 max-h-32 w-32 origin-top-left overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                                        "fixed z-[1050] mt-2 max-h-32 w-32 origin-top-left overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                                        // "-top-2 mb-2 mt-0 -translate-y-full",
                                        css.scrollbar
                                      )}
                                    >
                                      <div className="p-0.5">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              type="button"
                                              className={cn(
                                                "flex w-full items-center rounded-md p-2 text-[11px]/[12px]",
                                                active
                                                  ? "bg-slate-200 text-sky-600"
                                                  : "text-gray-900 dark:text-slate-100"
                                              )}
                                              onClick={() => {}}
                                            >
                                              Satu
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu> */}

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
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode Grup</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Grup BHP</ThDiv>
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
                            <td className="h-[44.5px]">
                              <p className="mx-auto h-7 w-8 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listGroup?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 py-2 text-center dark:border-gray-700">
                              <p className="mx-auto w-8 rounded-sm bg-slate-700 py-1 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.nama}</p>
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
                                          farmasiGroupDispatch({
                                            type: "setFarmasi",
                                            farmasi: {
                                              modal: true,
                                              data: {
                                                id_group: data.id,
                                                nama_group: data.nama,
                                              },
                                            },
                                          });
                                        }}
                                      >
                                        <PiPillDuotone
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
                                      <p>List Barang Farmasi</p>
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
                                          ubahGroupDispatch({
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
                                      <p>Ubah Grup</p>
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
                                      <p>Hapus Grup</p>
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

      <TarifDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadListTarif={loadListTarif}
      />

      <GroupDialog
        tambahDialog={tambahGroupDialog}
        setTambahDialog={setTambahGroupDialog}
        ubah={ubahGroup}
        ubahDispatch={ubahGroupDispatch}
        loadListGroup={loadListGroup}
      />

      <BarangBHPDialog
        farmasiGroup={farmasiGroup}
        farmasiGroupDispatch={farmasiGroupDispatch}
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
                    <p className="text-sm text-gray-500">
                      Hapus {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      color="red100"
                      onClick={
                        selectedIdx === 0 ? handleHapus : handleHapusGroup
                      }
                    >
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
  loadListTarif: () => Promise<void>;
};
const TarifDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadListTarif,
}: TarifDialogProps) => {
  const TarifSchema = z.object({
    id_group: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    id_tarif: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  });

  const TarifMultipleSchema = TarifSchema.array();

  type Tarif = z.infer<typeof TarifSchema>;
  type TarifMultiple = z.infer<typeof TarifMultipleSchema>;

  const [listTidakIya] = useState([
    { value: false, label: "Tidak" },
    { value: true, label: "Iya" },
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<Tarif>({
    resolver: zodResolver(TarifSchema),
  });

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

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(
      ubah.modal ? "Ubah Tarif dari Grup BHP" : "Tambah Tarif dari Grup BHP"
    );
    return ubah.modal
      ? "Ubah Tarif dari Grup BHP"
      : "Tambah Tarif dari Grup BHP";
  }, [tambahDialog, ubah.modal]);

  const [groupOptions, setGroupOptions] = useState<MyOptions>([]);
  const loadGroup = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/tarif/group`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: MasterTarif) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setGroupOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const [tarifOptions, setTarifOptions] = useState<MyOptions>([]);
  const loadTarif = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/tarif`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: MasterTarif) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setTarifOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadGroup("");
    loadTarif("");
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

  useEffect(() => {
    if (!ubah.data) return;
    setValue("id_group", ubah.data?.id_group!);
    setValue("id_tarif", ubah.data?.id_tarif!);

    return () => {
      setValue("id_group", NaN);
      setValue("id_tarif", NaN);
    };
  }, [ubah.data]);

  const submitHandler: SubmitHandler<Tarif> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/tarif/bhp/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif/bhp`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadListTarif();
      ubah.modal &&
        ubahDispatch({
          type: "setUbah",
          ubah: { modal: false },
        });
      tambahDialog && setTambahDialog(false);
      reset();
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
                      "max-w-xs",
                      errors.id_group && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Grup
                      </label>
                      {errors.id_group ? (
                        <p className="pr-0.5 text-xs text-red-500">
                          {errors.id_group.message}
                        </p>
                      ) : null}
                    </div>
                    <Controller
                      control={control}
                      name="id_group"
                      render={({ field: { onChange, value } }) => (
                        <AsyncSelectInput
                          cacheOptions
                          loadOptions={loadGroup}
                          defaultOptions={groupOptions}
                          value={groupOptions?.find(
                            (val) => val.value === value
                          )}
                          onChange={(option: MyOption | null) =>
                            onChange(option?.value)
                          }
                          placeholder="Pilih Grup"
                        />
                      )}
                    />
                  </div>

                  <div
                    className={cn(
                      "max-w-xs",
                      errors.id_tarif && "rounded-lg bg-red-100"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Tarif
                      </label>
                      {errors.id_tarif ? (
                        <p className="pr-0.5 text-xs text-red-500">
                          {errors.id_tarif.message}
                        </p>
                      ) : null}
                    </div>
                    <Controller
                      control={control}
                      name="id_tarif"
                      render={({ field: { onChange, value } }) => (
                        <AsyncSelectInput
                          cacheOptions
                          loadOptions={loadTarif}
                          defaultOptions={tarifOptions}
                          value={tarifOptions?.find(
                            (val) => val.value === value
                          )}
                          onChange={(option: MyOption | null) =>
                            onChange(option?.value)
                          }
                          placeholder="Pilih Tarif"
                        />
                      )}
                    />
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      color={
                        judul === "Tambah Tarif dari Grup BHP"
                          ? "green100"
                          : "cyan100"
                      }
                    >
                      {judul === "Tambah Tarif dari Grup BHP"
                        ? "Tambah"
                        : "Ubah"}
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

type GroupDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahGroupState;
  ubahDispatch: React.Dispatch<UbahGroupAction>;
  loadListGroup: () => Promise<void>;
};
const GroupDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadListGroup,
}: GroupDialogProps) => {
  const GroupSchema = z.object({
    nama: z.string().min(1, "harus diisi"),
  });

  type Group = z.infer<typeof GroupSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Group>({
    resolver: zodResolver(GroupSchema),
  });

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

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah Grup BHP" : "Tambah Grup BHP");
    return ubah.modal ? "Ubah Grup BHP" : "Tambah Grup BHP";
  }, [tambahDialog, ubah.modal]);

  // useEffect(() => {
  //   if (!ubah.modal && !tambahDialog) return;
  // }, [ubah, tambahDialog]);

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  useEffect(() => {
    if (!ubah.modal) return;
    setValue("nama", ubah.data?.nama!);
  }, [ubah.data]);

  const submitHandler: SubmitHandler<Group> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/tarif/group/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/tarif/group`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadListGroup();
      ubah.modal &&
        ubahDispatch({
          type: "setUbah",
          ubah: { modal: false },
        });
      tambahDialog && setTambahDialog(false);
      reset();
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
                  "w-full max-w-xl transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700"
                )}
              >
                <Dialog.Title
                  as="p"
                  className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                >
                  {judul}
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="mt-2 flex flex-col gap-2"
                >
                  <div
                    className={cn(
                      "w-full",
                      "nama" in errors &&
                        errors.nama &&
                        "rounded-b-sm rounded-t-lg bg-red-100"
                    )}
                  >
                    <Input placeholder="Grup BHP" {...register("nama")} />
                    {"nama" in errors && errors.nama ? (
                      <p className="pr-0.5 text-end text-xs text-red-500">
                        {"nama" in errors && errors.nama.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      color={
                        judul === "Tambah Grup BHP" ? "green100" : "cyan100"
                      }
                    >
                      {judul === "Tambah Grup BHP" ? "Tambah" : "Ubah"}
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
