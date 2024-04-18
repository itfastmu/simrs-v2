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
import { AiOutlineEye } from "react-icons/ai";
import { GiMedicines } from "react-icons/gi";
import { MdMenuOpen } from "react-icons/md";
import { TbEdit, TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { Barang, KFABZASchema, KFABZASchemaType, KFABZA } from "../schema";
import LihatDialog from "./_components/lihat";

type UbahState = {
  modal: boolean;
  data?: KFABZA;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export type LihatState = {
  modal: boolean;
  data?: KFABZA;
};
export type LihatAction = { type: "setLihat"; lihat: LihatState };

export default function MasterKFA() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<KFABZA[]>([]);

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

  //   type HapusState = {
  //     modal: boolean;
  //     data?: BarangMapPOA;
  //   };
  //   type HapusAction = { type: "setHapus"; hapus: HapusState };
  //   const hapusState = {
  //     modal: false,
  //   };
  //   const hapusActs = (state: HapusState, action: HapusAction) => {
  //     switch (action.type) {
  //       case "setHapus": {
  //         return {
  //           ...action.hapus,
  //         };
  //       }
  //     }
  //   };
  //   const [hapus, hapusDispatch] = useReducer(hapusActs, hapusState);
  //   const handleHapus = async () => {
  //     try {
  //       const resp = await fetch(
  //         `${APIURL}/rs/farmasi/mapping_poa/${hapus.data?.id}`,
  //         {
  //           method: "DELETE",
  //           headers: headers,
  //         }
  //       );
  //       const data = await resp.json();
  //       hapusDispatch({ type: "setHapus", hapus: { modal: false } });
  //       toast.success(data?.message);
  //       loadData();
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

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
      const url = new URL(`${APIURL}/rs/kfa/bza`);
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
                Master KFA - Kamus Farmasi & Alkes
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
                    <ThDiv>Kode</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>BZA - Bahan Zat Aktif</ThDiv>
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
                        <p className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                                    lihatDispatch({
                                      type: "setLihat",
                                      lihat: {
                                        modal: true,
                                        data: data,
                                      },
                                    });
                                  }}
                                >
                                  <AiOutlineEye
                                    size="1.5rem"
                                    className="text-sky-600 hover:text-sky-700 active:text-sky-800"
                                  />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Lihat</p>
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

      <BZADialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
      />

      <LihatDialog lihat={lihat} lihatDispatch={lihatDispatch} />

      {/* <Transition show={hapus.modal} as={Fragment}>
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
      </Transition> */}
    </>
  );
}

type BZADialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
};

const BZADialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
}: BZADialogProps) => {
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
    if (!ubah.modal && !tambahDialog) return;
    if (!ubah.data) return;
    setValue("id", ubah.data?.id!);
    setValue("nama", ubah.data?.nama!);
  }, [ubah, tambahDialog]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<KFABZASchemaType>({
    resolver: zodResolver(KFABZASchema),
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<KFABZASchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      let resJson: any;
      if (ubah.modal) {
        const url = `${APIURL}/rs/kfa/bza/${ubah.data?.id}`;
        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const url = `${APIURL}/rs/kfa/bza`;
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
                    {ubah.modal ? "Ubah" : "Tambah"} BZA
                  </Dialog.Title>
                  <form
                    className={cn("mt-2 flex flex-col gap-2")}
                    onSubmit={handleSubmit(submitHandler)}
                  >
                    <div className="flex gap-2">
                      <div
                        className={cn(
                          "basis-36",
                          "id" in errors &&
                            errors.id &&
                            "rounded-b-lg rounded-t-sm bg-red-100"
                        )}
                      >
                        {"id" in errors && errors.id ? (
                          <p className="p-0.5 text-xs text-red-500">
                            {"id" in errors && errors.id.message}
                          </p>
                        ) : null}
                        <Input
                          type="number"
                          disabled={!tambahDialog}
                          placeholder="Kode"
                          {...register("id")}
                        />
                      </div>
                      <div
                        className={cn(
                          "flex-1",
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
                          placeholder="Nama Bahan Zat Aktif"
                          {...register("nama")}
                        />
                      </div>
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
