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
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdOutlineMedicalInformation } from "react-icons/md";
import { TbEdit, TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { z } from "zod";
import { JenisPenunjang, Penunjang } from "../schema";

type Format = {
  id_penunjang?: number;
  hasil?: string;
} & Penunjang;

type UbahState = {
  modal: boolean;
  data?: JenisPenunjang;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function ListPenunjang() {
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

  type HapusState = {
    modal: boolean;
    data?: JenisPenunjang;
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
      const url = `${APIURL}/rs/penunjang/${hapus.data?.id}`;
      const resp = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message);
      loadPenunjang();
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

  const [listPenunjang, setListPenunjang] = useState<JenisPenunjang[]>([]);
  const loadPenunjang = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/penunjang/jenis`);
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
      setListPenunjang(json?.data);
      // metaDispatch({
      //   type: "setMeta",
      //   setMeta: {
      //     page: parseInt(json?.page.page),
      //     perPage: parseInt(json?.page.perPage),
      //     lastPage: parseInt(json?.page.lastPage),
      //     total: parseInt(json?.page.total),
      //   },
      // });
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

  const [listFormat, setListFormat] = useState<Format[]>([]);
  const loadFormat = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/penunjang/format`);
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
      setListFormat(json?.data);
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

  const menues = ["List Penunjang", "List Format"];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const judul = useMemo(() => {
    return selectedIdx === 0 ? "Penunjang" : "Format";
  }, [selectedIdx]);

  useEffect(() => {
    if (hapus.modal || ubah.modal) return;
    switch (selectedIdx) {
      case 0:
        loadPenunjang();
        break;
      case 1:
        loadPenunjang();
        loadFormat();
        break;
    }
  }, [meta.page, meta.perPage, deferredCari, selectedIdx]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <MdOutlineMedicalInformation
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Penunjang
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
              {/* <Listbox
                value={selectedIdx}
                onChange={(val) => {
                  metaDispatch({
                    type: "page",
                    page: 1,
                  });
                  setCari("");
                  setSelectedIdx(val);
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
              </Listbox> */}
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
                value={cari}
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
            {/* <Tab.Group selectedIndex={selectedIdx} onChange={setSelectedIdx}>
              <Tab.List className="hidden">
                {menues.map((menu) => (
                  <Tab className="hidden" key={menu}>
                    {menu}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="focus:outline-none"> */}
            <table className="w-full text-left text-sm font-semibold text-gray-600">
              <thead>
                <tr>
                  <Th>
                    <ThDiv>Kode</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Nama Jenis</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>*</ThDiv>
                  </Th>
                </tr>
              </thead>
              <tbody className="bg-slate-200 dark:bg-gray-700">
                {isMutating
                  ? [...Array(15)].map((_, i) => (
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
                  : // ) : meta.total === 0 ? (
                    //   <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    //     <td className="p-4 text-center" colSpan={4}>
                    //       <p>Data tidak ditemukan</p>
                    //     </td>
                    //   </tr>
                    listPenunjang?.map((data, i) => (
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
                                  <p>Ubah Penunjang</p>
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
                                  <p>Hapus Penunjang</p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {/* </Tab.Panel> */}
            {/* <Tab.Panel className="focus:outline-none">
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
                          <ThDiv>Jenis</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Hasil</ThDiv>
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
                              <p className="mx-auto h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                        listFormat?.map((data, i) => (
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
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.jenis}</p>
                            </td>
                            <td className="max-w-sm border-b border-slate-200 px-1 dark:border-gray-700">
                              <p>{data.hasil}</p>
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
                                      <p>Ubah Format</p>
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
                                      <p>Hapus Format</p>
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
            {/* </Tab.Panels>
            </Tab.Group> */}
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

      <PenunjangDialog
        key={selectedIdx}
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadPenunjang={loadPenunjang}
        loadFormat={loadFormat}
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
                      Nonaktifkan {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Nonaktifkan {judul}
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

type PenunjangDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadPenunjang: () => Promise<void>;
  loadFormat: () => Promise<void>;
};

const PenunjangDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadPenunjang,
  loadFormat,
}: PenunjangDialogProps) => {
  const tutup = () => {
    clearErrors();
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

  useEffect(() => {
    if (!ubah.data) return;
    setValue("nama", ubah.data?.nama!);
  }, [ubah.data]);

  const PenunjangSchema = z.object({
    nama: z.string().min(1, "harus diisi"),
  });

  type PenunjangSchemaType = z.infer<typeof PenunjangSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<PenunjangSchemaType>({
    resolver: zodResolver(PenunjangSchema),
  });

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<PenunjangSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      // const parsedData = data as Omit<FormSchemaType, "type"> & {
      //   type?: string;
      // };
      // delete parsedData.type;
      let resJson: any;
      if (ubah.modal) {
        const url = `${APIURL}/rs/penunjang/jenis/${ubah.data?.id}`;
        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const url = `${APIURL}/rs/penunjang/jenis`;
        const post = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      toast.success(resJson.message);
      tutup();
      loadPenunjang();
      // judul === "Format" ? loadFormat() : loadPenunjang();
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
                    {ubah.modal ? "Ubah" : "Tambah"} Penunjang
                  </Dialog.Title>
                  <form
                    className={cn("mt-2 flex flex-col gap-2")}
                    onSubmit={handleSubmit(submitHandler)}
                  >
                    <div
                      className={cn(
                        "w-full",
                        "nama" in errors &&
                          errors.nama &&
                          "rounded-b-lg rounded-t-sm bg-red-100"
                      )}
                    >
                      {"nama" in errors && errors.nama ? (
                        <p className="p-0.5 text-xs text-red-500">
                          {"nama" in errors && errors.nama.message}
                        </p>
                      ) : null}
                      <Input
                        placeholder="Nama Pemeriksaan"
                        {...register("nama")}
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button
                        type="submit"
                        color={ubah.modal ? "cyan100" : "green100"}
                      >
                        {ubah.modal ? "Ubah" : "Tambah"}
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
