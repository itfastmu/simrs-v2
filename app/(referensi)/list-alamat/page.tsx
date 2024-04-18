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
import { TbEdit, TbMapPinCode, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition, Listbox, Tab } from "@headlessui/react";
import { Button } from "@/components/button";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { Input, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import {
  Desa,
  Kabupaten,
  Kecamatan,
  Propinsi,
} from "@/app/(pendaftaran)/schema";

type UbahState = {
  modal: boolean;
  data?: Propinsi | Kabupaten | Kecamatan | Desa;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function ListAlamat() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const menues = [
    "List Propinsi",
    "List Kabupaten",
    "List Kecamatan",
    "List Kelurahan",
  ];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = (() => {
    switch (selectedIdx) {
      case 0:
      default:
        return { url: "provinsi", label: "Propinsi" };
      case 1:
        return { url: "kabupaten", label: "Kabupaten" };
      case 2:
        return { url: "kecamatan", label: "Kecamatan" };
      case 3:
        return { url: "desa", label: "Kelurahan" };
    }
  })();

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
    data?: Propinsi | Kabupaten | Kecamatan | Desa;
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
      const hapusAlamat = await fetch(
        `${APIURL}/rs/${judul?.url}/${hapus.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
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

  const toastErrorIdRef = useRef<number | string | undefined>();
  const loadDataAlamat = async (alamat: string) => {
    try {
      const url = new URL(`${APIURL}/rs/${alamat}`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        cari: deferredCari,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(fetchData?.page.page),
          perPage: parseInt(fetchData?.page.perPage),
          lastPage: parseInt(fetchData?.page.lastPage),
          total: parseInt(fetchData?.page.total),
        },
      });
      return fetchData;
    } catch (err) {
      const error = err as Error;
      console.error(error);
    }
  };
  const [selProp, setSelProp] = useState<number | undefined>(undefined);
  const [dataPropinsi, setdataPropinsi] = useState<Propinsi[]>([]);
  const [listProp, setListProp] = useState<MyOptions>([]);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const loadProp = async () => {
    setIsMutating(true);
    try {
      const res = await loadDataAlamat("provinsi");
      const data: Propinsi[] = res?.data;
      setListProp(data.map((val) => ({ value: val.id, label: val.nama })));
      setdataPropinsi(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal mengambil data propinsi!`);
    } finally {
      setIsMutating(false);
    }
  };

  const [selKab, setSelKab] = useState<number | undefined>(undefined);
  const [dataKab, setDataKab] = useState<Kabupaten[]>([]);
  const [listKab, setListKab] = useState<MyOptions>([]);
  const loadKab = async () => {
    if (!selProp) return;
    setIsMutating(true);
    try {
      const res = await loadDataAlamat(`kabupaten/prov/${selProp}`);
      const data: Kabupaten[] = res?.data;
      setDataKab(data);
      setListKab(data.map((val) => ({ value: val.id, label: val.nama })));
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal mengambil data kabupaten!`);
    } finally {
      setIsMutating(false);
    }
  };

  const [selKec, setSelKec] = useState<number | undefined>(undefined);
  const [dataKec, setDataKec] = useState<Kecamatan[]>([]);
  const [listKec, setListKec] = useState<MyOptions>([]);
  const loadKec = async () => {
    if (!selKab) return;
    setIsMutating(true);
    try {
      const res = await loadDataAlamat(`kecamatan/kab/${selKab}`);
      const data: Kecamatan[] = res?.data;
      setDataKec(data);
      setListKec(data.map((val) => ({ value: val.id, label: val.nama })));
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal mengambil data kecamatan!`);
    } finally {
      setIsMutating(false);
    }
  };

  const [dataKel, setDataKel] = useState<Desa[]>([]);
  const loadKel = async () => {
    if (!selKec) return;
    setIsMutating(true);
    try {
      const res = await loadDataAlamat(`desa/kec/${selKec}`);
      const data: Desa[] = res?.data;
      setDataKel(data);
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal mengambil data kabupaten!`);
    } finally {
      setIsMutating(false);
    }
  };

  const loadData = () => {
    switch (selectedIdx) {
      case 0:
        loadProp();
        break;
      case 1:
        loadKab();
        break;
      case 2:
        loadKab();
        loadKec();
        break;
      case 3:
        loadKab();
        loadKec();
        loadKel();
        break;
    }
  };

  useEffect(() => {
    if (hapus.modal || ubah.modal) return;
    loadData();
  }, [
    meta.page,
    meta.perPage,
    deferredCari,
    selProp,
    selKab,
    selKec,
    selectedIdx,
    hapus.modal,
    ubah.modal,
  ]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <TbMapPinCode
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Alamat
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
              <div className="z-30 ml-5 grid grid-cols-3 items-center justify-center gap-2 text-left">
                <SelectInput
                  size="sm"
                  options={listProp}
                  placeholder="Propinsi"
                  className={cn(selectedIdx === 0 && "hidden", "min-w-[120px]")}
                  value={listProp?.find((val) => val.value === selProp)}
                  onChange={(val: any) => {
                    setSelProp(val.value);
                    setSelKab(undefined);
                    setListKab([]);
                    setSelKec(undefined);
                    setListKec([]);
                  }}
                />
                <SelectInput
                  size="sm"
                  options={listKab}
                  placeholder="Kabupaten"
                  className={cn(selectedIdx <= 1 && "hidden", "min-w-[150px]")}
                  value={listKab?.find((val) => val.value === selKab) || null}
                  onChange={(val: any) => {
                    setSelKab(val.value);
                    setSelKec(undefined);
                    setListKec([]);
                  }}
                />
                <SelectInput
                  size="sm"
                  options={listKec}
                  placeholder="Kecamatan"
                  className={cn(selectedIdx <= 2 && "hidden", "min-w-[80px]")}
                  value={listKec?.find((val) => val.value === selKec) || null}
                  onChange={(val: any) => setSelKec(val.value)}
                />
              </div>
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
                          <ThDiv>Kode BPJS</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Aktif</ThDiv>
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
                              <p className="mx-auto h-5 w-9 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={5}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        dataPropinsi?.map((data, i) => (
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
                              <p>{data.id_bpjs}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.aktif ? "Aktif" : "Nonaktif"}</p>
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
                          <ThDiv>Kode Prop.</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Nama</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kode BPJS</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Aktif</ThDiv>
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
                              <p className="mx-auto h-5 w-7 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-64 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-14 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : dataKab?.length === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Pilih Propinsi Dahulu</p>
                          </td>
                        </tr>
                      ) : (
                        dataKab?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_propinsi}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_bpjs}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.aktif ? "Aktif" : "Nonaktif"}</p>
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
                          <ThDiv>Kode Prop.</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Nama</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kode BPJS</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Aktif</ThDiv>
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
                              <p className="mx-auto h-9 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-9 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : dataKec?.length === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Pilih Kabupaten Dahulu</p>
                          </td>
                        </tr>
                      ) : (
                        dataKec?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-24 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_kabupaten}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_bpjs}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.aktif ? "Aktif" : "Nonaktif"}</p>
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
                          <ThDiv>Kode Prop.</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Nama</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Kode BPJS</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Aktif</ThDiv>
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
                              <p className="mx-auto h-9 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-28 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : dataKel?.length === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={6}>
                            <p>Pilih Kecamatan Dahulu</p>
                          </td>
                        </tr>
                      ) : (
                        dataKel?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-32 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_kecamatan}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                              <p>{data.id_bpjs}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.aktif ? "Aktif" : "Nonaktif"}</p>
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

      <AlamatDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
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
                    Hapus {judul?.label}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-slate-100">
                      {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Hapus {judul?.label}
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

type AlamatDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => void;
  judul: {
    url: string;
    label: string;
  };
};

const AlamatDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
  judul,
}: AlamatDialogProps) => {
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

  const [listAktif] = useState([
    { value: true, label: "Iya" },
    { value: false, label: "Tidak" },
  ]);

  const UbahAlamatSchema = z.object({
    nama: z.string().min(1, "harus diisi"),
    id_bpjs: z.string().min(1, "harus diisi"),
  });

  type UbahAlamat = z.infer<typeof UbahAlamatSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UbahAlamat>({
    resolver: zodResolver(UbahAlamatSchema),
  });

  useEffect(() => {
    setValue("nama", ubah.data?.nama!);
    setValue("id_bpjs", ubah.data?.id_bpjs!);
  }, [ubah.data]);

  const submitHandler: SubmitHandler<UbahAlamat> = async (data, e) => {
    try {
      e?.preventDefault();
      const put = await fetch(`${APIURL}/rs/${judul.url}/${ubah.data?.id}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await put.json();
      if (resp.status !== "Updated") throw new Error(resp.message);
      toast.success(resp.message);
      tutup();
      loadData();
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
                    Ubah {judul.label}
                  </Dialog.Title>
                  <form
                    className="mt-2 flex flex-col gap-2"
                    onSubmit={handleSubmit(submitHandler)}
                  >
                    <div
                      className={cn(
                        "max-w-md",
                        errors.nama && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        {errors.nama ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.nama.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        placeholder={"Nama " + judul.label}
                        {...register("nama")}
                      />
                    </div>
                    <div
                      className={cn(
                        "max-w-md",
                        errors.id_bpjs && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        {errors.id_bpjs ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_bpjs.message}
                          </p>
                        ) : null}
                      </div>
                      <Input placeholder="Kode BPJS" {...register("id_bpjs")} />
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button type="submit" color="cyan100">
                        Ubah {judul.label}
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
