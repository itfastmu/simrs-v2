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
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Listbox, Tab, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { Input, InputArea } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import { FaBookMedical } from "react-icons/fa6";
import { MyOption, MyOptions, SelectInput } from "@/components/select";

export type ICD10 = {
  id: string;
  deskripsi: string;
  status: string;
  aktif: boolean;
};

export type ICD9 = {
  id: string;
  deskripsi_panjang: string;
  deskripsi_pendek: string;
  aktif: boolean;
};

type UbahState = {
  modal: boolean;
  data?: ICD10 | ICD9;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function Unit() {
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
    data?: ICD10 | ICD9;
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
      const hapusUnit = await fetch(`${APIURL}/rs/unit/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const json = await hapusUnit.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message, {
        onOpen: loadData,
      });
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

  const [listICD10, setListICD10] = useState<ICD10[]>([]);
  const loadICD10 = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/icd/10`);
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
      setListICD10(json?.data);
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

  const [listICD9, setListICD9] = useState<ICD9[]>([]);
  const loadICD9 = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/icd/9`);
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
      setListICD9(json?.data);
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
        loadICD10();
        break;
      case 1:
        loadICD9();
        break;
    }
  };

  const [menues] = useState(["List ICD-10", "List ICD-9"]);

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    switch (selectedIdx) {
      default:
      case 0:
        return "ICD-10";
      case 1:
        return "ICD-9";
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
              <FaBookMedical
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List ICD
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
                          <ThDiv>Kode ICD-10</ThDiv>
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
                              <p className="mx-auto h-9 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-80 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listICD10?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
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
                          <ThDiv>Kode ICD-9</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Deskripsi Panjang</ThDiv>
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
                              <p className="mx-auto h-9 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-80 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listICD9?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.deskripsi_panjang}</p>
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

      <ICDDialog
        key={selectedIdx}
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
                    Hapus {judul}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {judul === "ICD-10"
                        ? "Hapus " +
                          hapus.data?.id +
                          " - " +
                          (hapus.data as ICD10)?.deskripsi
                        : "Hapus " +
                          hapus.data?.id +
                          " - " +
                          (hapus.data as ICD9)?.deskripsi_panjang}
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

type ICDDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => Promise<void>;
  judul: "ICD-10" | "ICD-9";
};

const ICDDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
  judul,
}: ICDDialogProps) => {
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
  const judulDeskripsi = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah " + judul : "Tambah " + judul);
    return ubah.modal ? "Ubah " + judul : "Tambah " + judul;
  }, [tambahDialog, ubah.modal]);

  const [statusOptions] = useState<MyOptions>(
    ["Tidak Menular", "Menular"].map((val) => ({ label: val, value: val }))
  );

  const ICD10Schema = z.object({
    type: z.literal("ICD-10"),
    id: z.string().min(1, "harus diisi"),
    deskripsi: z.string().min(1, "harus diisi"),
    status: z.string({ required_error: "harus dipilih" }),
  });

  const ICD9Schema = z.object({
    type: z.literal("ICD-9"),
    id: z.string().min(1, "harus diisi"),
    deskripsi_panjang: z.string().min(1, "harus diisi"),
    deskripsi_pendek: z.string().min(1, "harus diisi"),
  });

  const FormSchema = z.discriminatedUnion("type", [ICD10Schema, ICD9Schema]);
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
    if (!ubah.modal) return;
    switch (judul) {
      case "ICD-10":
        setValue("id", (ubah.data as ICD10)?.id);
        setValue("deskripsi", (ubah.data as ICD10)?.deskripsi);
        setValue("status", (ubah.data as ICD10)?.status);
        break;
      case "ICD-9":
        setValue("id", (ubah.data as ICD9)?.id);
        setValue("deskripsi_panjang", (ubah.data as ICD9)?.deskripsi_panjang);
        setValue("deskripsi_pendek", (ubah.data as ICD9)?.deskripsi_pendek);
        break;
    }

    return () => {
      setValue("status", "");
    };
  }, [tambahDialog, ubah.modal]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      const { type, ...parsedData } = data;
      e?.preventDefault();
      if (ubah.modal) {
        const url =
          judul === "ICD-10"
            ? `${APIURL}/rs/icd/10/${ubah.data?.id}`
            : judul === "ICD-9"
            ? `${APIURL}/rs/icd/9/${ubah.data?.id}`
            : "";
        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
        loadData();
      } else {
        const url =
          judul === "ICD-10"
            ? `${APIURL}/rs/icd/10`
            : judul === "ICD-9"
            ? `${APIURL}/rs/icd/9`
            : "";
        const post = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
        loadData();
      }
      tutup();
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
                    "h-full w-full max-w-md transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                    css.scrollbar
                  )}
                >
                  <Dialog.Title
                    as="p"
                    className="font-medium leading-6 text-gray-900"
                  >
                    {judulDeskripsi}
                  </Dialog.Title>
                  <form
                    className="mt-2 flex flex-col gap-2"
                    onSubmit={handleSubmit(submitHandler)}
                  >
                    {judul === "ICD-10" ? (
                      <>
                        <div
                          className={cn(
                            "w-full",
                            "id" in errors &&
                              errors.id &&
                              "rounded-b-sm rounded-t-lg bg-red-100"
                          )}
                        >
                          <Input
                            placeholder="Kode ICD-10"
                            {...register("id")}
                          />
                          {"id" in errors && errors.id ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"id" in errors && errors.id.message}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "w-full",
                            "deskripsi" in errors &&
                              errors.deskripsi &&
                              "rounded-b-sm rounded-t-lg bg-red-100"
                          )}
                        >
                          <InputArea
                            placeholder="Deskripsi"
                            className="-mb-1"
                            {...register("deskripsi")}
                          />
                          {"deskripsi" in errors && errors.deskripsi ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"deskripsi" in errors &&
                                errors.deskripsi.message}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "w-full",
                            "status" in errors &&
                              errors.status &&
                              "rounded-lg bg-red-100"
                          )}
                        >
                          <Controller
                            control={control}
                            name="status"
                            render={({ field: { onChange, value } }) => (
                              <SelectInput
                                options={statusOptions}
                                value={statusOptions.find(
                                  (val) => val.value === value
                                )}
                                onChange={(option) => {
                                  onChange((option as MyOption | null)?.value);
                                }}
                                placeholder="Pilih Status"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            )}
                          />
                          {"status" in errors && errors.status ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"status" in errors && errors.status.message}
                            </p>
                          ) : null}
                        </div>
                      </>
                    ) : judul === "ICD-9" ? (
                      <>
                        <div
                          className={cn(
                            "w-full",
                            "id" in errors &&
                              errors.id &&
                              "rounded-b-sm rounded-t-lg bg-red-100"
                          )}
                        >
                          <Input placeholder="Kode ICD-9" {...register("id")} />
                          {"id" in errors && errors.id ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"id" in errors && errors.id.message}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "w-full",
                            "deskripsi_panjang" in errors &&
                              errors.deskripsi_panjang &&
                              "rounded-b-sm rounded-t-lg bg-red-100"
                          )}
                        >
                          <InputArea
                            placeholder="Deskripsi Panjang"
                            className="-mb-1"
                            {...register("deskripsi_panjang")}
                          />
                          {"deskripsi_panjang" in errors &&
                          errors.deskripsi_panjang ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"deskripsi_panjang" in errors &&
                                errors.deskripsi_panjang.message}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "w-full",
                            "deskripsi_pendek" in errors &&
                              errors.deskripsi_pendek &&
                              "rounded-b-sm rounded-t-lg bg-red-100"
                          )}
                        >
                          <InputArea
                            placeholder="Deskripsi Pendek"
                            className="-mb-1"
                            {...register("deskripsi_pendek")}
                          />
                          {"deskripsi_pendek" in errors &&
                          errors.deskripsi_pendek ? (
                            <p className="pr-0.5 text-end text-xs text-red-500">
                              {"deskripsi_pendek" in errors &&
                                errors.deskripsi_pendek.message}
                            </p>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                    <div className="mt-2 flex gap-1">
                      <Button
                        type="submit"
                        color={tambahDialog ? "green100" : "cyan100"}
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
    </>
  );
};
