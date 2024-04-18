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
import { BiClinic } from "react-icons/bi";
import { TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { SelectInput } from "@/components/select";
import { Input, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";

export type Klinik = {
  id: number;
  nama: string;
  aktif: boolean;
};

type UbahState = {
  modal: boolean;
  data?: Klinik;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function Klinik() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<Klinik[]>([]);

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
    data?: Klinik;
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
      const hapusKlinik = await fetch(`${APIURL}/rs/klinik/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const data = await hapusKlinik.json();
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
      const url = new URL(`${APIURL}/rs/klinik`);
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
    loadData();
  }, [meta.page, meta.perPage, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <BiClinic
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Klinik
              </p>
            </div>
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
                    <ThDiv>Kode</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Klinik</ThDiv>
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
                  dataList?.map((data, i) => (
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
                                <p>Ubah Klinik</p>
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
                                <p>Hapus Klinik</p>
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

      <KlinikDialog
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
                    Hapus Klinik
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Nonaktifkan {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Nonaktifkan Klinik
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

type KlinikDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => Promise<void>;
};

const KlinikDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
}: KlinikDialogProps) => {
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

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah Klinik" : "Tambah Klinik");
    return ubah.modal ? "Ubah Klinik" : "Tambah Klinik";
  }, [tambahDialog, ubah.modal]);

  const KlinikSchema = z.object({
    // id: z.number(),
    nama: z.string().min(1, "harus diisi"),
    // aktif: z.boolean(),
  });

  type Klinik = z.infer<typeof KlinikSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<Klinik>({
    resolver: zodResolver(KlinikSchema),
    // defaultValues: {
    //   aktif: true,
    // },
  });

  useEffect(() => {
    // setValue("id", ubah.data?.id!);
    setValue("nama", ubah.data?.nama!);
    // setValue("aktif", ubah.data?.aktif!);
  }, [ubah.data]);

  const submitHandler: SubmitHandler<Klinik> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/klinik/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/klinik`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
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
                    className="font-medium leading-6 text-gray-900"
                  >
                    {judul}
                  </Dialog.Title>
                  <form className="mt-2" onSubmit={handleSubmit(submitHandler)}>
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
                      <Input placeholder="Nama Klinik" {...register("nama")} />
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button
                        type="submit"
                        color={
                          judul === "Tambah Klinik" ? "green100" : "cyan100"
                        }
                      >
                        {judul}
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
