"use client";

import { FormPenunjangSchema } from "@/app/(rawatJalan)/asesmen/klinik/_components/permintaan-penunjang";
import RiwayatRadiologi from "@/app/(rawatJalan)/asesmen/klinik/_components/riwayat/riwayat-radiologi";
import { asuransi } from "@/app/(rawatJalan)/asesmen/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input, InputArea } from "@/components/form";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn, getAgeThn } from "@/lib/utils";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import { IoDocumentTextOutline, IoPrint } from "react-icons/io5";
import { MdMenuOpen } from "react-icons/md";
import { RiBodyScanFill } from "react-icons/ri";
import { TbEdit, TbTrash } from "react-icons/tb";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  DetailPemeriksaanRad,
  DetailPemeriksaanSchema,
  KunjunganPenunjang,
  Penunjang,
  Permintaan,
  TDetailPemeriksaan,
} from "../../schema";
import CetakHasilRadiologi from "../_components/cetak-hasil-radiologi";
import { Format } from "../master-radiologi/page";

type DetailRadState = {
  modal: boolean;
  data?: Permintaan;
};
type DetailRadAction = { type: "setDetail"; detail: DetailRadState };

export type PemeriksaanRadState = {
  modal: boolean;
  data?: DetailPemeriksaanRad;
};
export type PemeriksaanRadAction = {
  type: "setPemeriksaan";
  pemeriksaan: PemeriksaanRadState;
};

export default function ListRadiologi() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [tanggal, setTanggal] = useState<Date | string>(new Date());
  const memoizedTanggal = useMemo(
    () => (tanggal instanceof Date ? tanggal?.toLocaleDateString("fr-CA") : ""),
    [tanggal]
  );
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const detailRadState = {
    modal: false,
  };
  const detailRadActs = (state: DetailRadState, action: DetailRadAction) => {
    switch (action.type) {
      case "setDetail": {
        return {
          ...action.detail,
        };
      }
    }
  };
  const [detailRad, detailRadDispatch] = useReducer(
    detailRadActs,
    detailRadState
  );

  type HapusState = {
    modal: boolean;
    data?: Permintaan;
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
        `${APIURL}/rs/penunjang/permintaan/${hapus.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const json = await resp.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message);
      loadRadiologi();
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

  const [listRadiologi, setListRadiologi] = useState<Permintaan[]>([]);
  const loadRadiologi = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/penunjang/permintaan/rad`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        tanggal: memoizedTanggal,
        // cari: deferredCari,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      setListRadiologi(json?.data);
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
    loadRadiologi();
    // if (hapus.modal || ubah.modal) return;
  }, [meta.page, meta.perPage, memoizedTanggal, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <RiBodyScanFill
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Pemeriksaan Radiologi
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
              <Input
                type="date"
                value={memoizedTanggal}
                className="w-fit p-2 text-xs shadow-none"
                onChange={(e) => {
                  console.log(e.target.value);
                  setTanggal(e.target.value ? new Date(e.target.value) : "");
                }}
              />
            </div>
            <div className="flex items-baseline gap-1">
              <div className="flex gap-1">
                {/* <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                  onClick={() => setPermintaanDialog(true)}
                >
                  Permintaan Pemeriksaan
                </Button> */}
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
            <table className="w-full text-left text-sm font-semibold text-gray-600">
              <thead>
                <tr>
                  <Th>
                    <ThDiv>No. Rawat</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Nama Pasien</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tanggal</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Dokter Perujuk</ThDiv>
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
                        <p className="mx-auto h-9 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
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
                  listRadiologi?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="mx-auto w-36 rounded-sm bg-slate-700 py-2 text-center font-medium tracking-wider text-slate-100">
                          {data.id_kunjungan}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>
                          {data.tanggal
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "long",
                              }).format(new Date(data.tanggal))
                            : null}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.nama_dokter || data.perujuk_luar || ""}
                        </p>
                        <p className="font-light">{data?.klinik}</p>
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
                                  className="relative focus:outline-none"
                                  onClick={() => {
                                    detailRadDispatch({
                                      type: "setDetail",
                                      detail: {
                                        modal: true,
                                        data: data,
                                      },
                                    });
                                  }}
                                >
                                  <IoDocumentTextOutline
                                    size="1.5rem"
                                    className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                  />
                                  {data.status > 1 ? (
                                    <FaCheck
                                      className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Detail</p>
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
        </div>
      </main>

      <PermintRadDialog
        permintRad={tambahDialog}
        setPermintRad={setTambahDialog}
        loadData={loadRadiologi}
      />

      <DetailRadDialog
        detailRad={detailRad}
        detailRadDispatch={detailRadDispatch}
        loadData={loadRadiologi}
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
                    Hapus Permintaan Pemeriksaan Radiologi
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Hapus atas nama {hapus.data?.nama} pada tanggal{" "}
                      {hapus.data?.tanggal
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "long",
                          }).format(new Date(hapus.data?.tanggal))
                        : ""}
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

const PermintRadDialog = ({
  permintRad,
  setPermintRad,
  loadData,
}: {
  permintRad: boolean;
  setPermintRad: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => Promise<void>;
}) => {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();

  const [tindakansRad, setTindakansRad] = useState<Penunjang[]>([]);
  const [cariRad, setCariRad] = useState<string>("");
  const deferredCariRad = useDeferredValue(cariRad);

  useEffect(() => {
    if (!permintRad) return;
    const getTindakansRad = async () => {
      try {
        const url = new URL(`${APIURL}/rs/radiologi`);
        const params = {
          keyword: deferredCariRad,
        };
        url.search = new URLSearchParams(params as any).toString();
        const resp = await fetch(url, { method: "GET", headers: headers });
        const json = await resp.json();
        setTindakansRad(json.data);
      } catch (err) {
        const error = err as Error;
        if (error.message === "Data tidak ditemukan") return;
        toast.error(error.message);
        console.error(error);
      }
    };
    getTindakansRad();
  }, [permintRad, deferredCariRad]);

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
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [listKunjungan, setListKunjungan] = useState<KunjunganPenunjang[]>();
  const [kunjungan, setKunjungan] = useState<KunjunganPenunjang | null>(null);

  const loadKunjungan = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/kunjungan/radiologi`);
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
      setListKunjungan(json?.data);
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
      if (
        error.message === "Data tidak ditemukan" ||
        error.name === "AbortError"
      )
        return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };
  const [kunjunganDialog, setKunjunganDialog] = useState<boolean>(false);

  useEffect(() => {
    loadKunjungan();
  }, [meta.page, meta.perPage, deferredCari, kunjunganDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const PerujukSchema = z.object({
    id_kunjungan: z
      .string({
        required_error: "harus dipilih",
      })
      .min(1, "harus diisi"),
    perujuk_luar: z.string().min(1, "harus diisi"),
  });

  const TambahPermintaanSchema = FormPenunjangSchema.merge(PerujukSchema);
  type TambahPermintaan = z.infer<typeof TambahPermintaanSchema>;

  const {
    handleSubmit,
    setValue,
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TambahPermintaan>({
    resolver: zodResolver(TambahPermintaanSchema),
    defaultValues: {
      cito: false,
      detail: [],
    },
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const submitHandler: SubmitHandler<TambahPermintaan> = async (data, e) => {
    try {
      e?.preventDefault();
      const resp = await fetch(`${APIURL}/rs/penunjang/permintaan/rad`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const json = await resp.json();
      if (json.status !== "Created") throw new Error(json.message);
      toast.success(json.message);
      setPermintRad(false);
      reset();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={permintRad} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1001]"
        onClose={() => {
          setPermintRad(false);
          reset();
        }}
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
                  "relative flex h-full w-full max-w-3xl transform flex-col rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Permintaan Radiologi
                </Dialog.Title>
                <form
                  className="flex h-fit flex-1 flex-col overflow-y-auto text-xs"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <div className="grid grid-cols-2 gap-2 py-2">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold dark:text-neutral-200">
                            Kunjungan
                          </label>
                          {errors.id_kunjungan ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.id_kunjungan.message}
                            </p>
                          ) : null}
                          {watch("id_kunjungan") ? (
                            <Button
                              className="py-1 text-xs"
                              color="sky"
                              onClick={() => setKunjunganDialog(true)}
                            >
                              Ubah Kunjungan
                            </Button>
                          ) : null}
                        </div>
                        {!watch("id_kunjungan") ? (
                          <div
                            className="relative"
                            onClick={() => {
                              return setKunjunganDialog(true);
                            }}
                          >
                            <Input
                              className="cursor-pointer px-2 py-1 text-xs"
                              readOnly
                              placeholder="Pilih Kunjungan"
                            />
                            <MdMenuOpen
                              size="1.25rem"
                              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-700 dark:text-slate-200"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 text-slate-600 dark:text-slate-300">
                            <p className="text-xs">{kunjungan?.id_kunjungan}</p>
                            <p className="text-xs">
                              {kunjungan?.no_rm + " " + kunjungan?.nama + " "}
                              {kunjungan?.tanggal_lahir
                                ? "(" +
                                  getAgeThn(new Date(kunjungan.tanggal_lahir)) +
                                  ")"
                                : ""}
                            </p>
                            {/* <p className="text-xs">
                            {kunjungan?.tanggal_lahir ? (
                              <>
                                <span>
                                  {new Intl.DateTimeFormat("id-ID", {
                                    dateStyle: "long",
                                  }).format(new Date(kunjungan?.tanggal_lahir))}
                                </span>
                                <span className="font-light">
                                  {" (" +
                                    getAgeThn(
                                      new Date(kunjungan?.tanggal_lahir)
                                    ) +
                                    ")"}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </p>
                          <p className="text-xs">{kunjungan?.}</p> */}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex h-fit items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-gray-900 shadow-md transition-all duration-150 ease-linear hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
                          "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
                          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
                          "cursor-pointer"
                        )}
                        onClick={() => setValue("cito", !watch("cito"))}
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 cursor-pointer"
                          checked={watch("cito")}
                          onChange={(e) => setValue("cito", e.target.checked)}
                        />
                        <label className="cursor-pointer select-none font-semibold">
                          Cito
                        </label>
                      </div>
                    </div>
                    <div
                      className={cn(
                        errors.perujuk_luar && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Dokter Perujuk
                        </label>
                        {errors.perujuk_luar ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.perujuk_luar.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        className="px-2 py-1 text-xs"
                        {...register("perujuk_luar")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    <div
                      className={cn(
                        errors.diagnosis && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Diagnosis Klinis
                        </label>
                        {errors.diagnosis ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.diagnosis.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="px-2 py-1 text-xs"
                        {...register("diagnosis")}
                      />
                    </div>
                    <div
                      className={cn(
                        errors.informasi && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Informasi Tambahan
                        </label>
                        {errors.informasi ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.informasi.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="px-2 py-1 text-xs"
                        {...register("informasi")}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex flex-1 flex-col gap-2 overflow-y-auto rounded bg-slate-100 p-2 pt-0 dark:bg-gray-700",
                      css.scrollbar
                    )}
                  >
                    <div className="sticky top-0 flex items-center justify-between bg-slate-100 pt-2 dark:bg-gray-700">
                      <p className="font-semibold">List Tindakan</p>
                      {errors?.detail ? (
                        <small className="absolute -bottom-2 w-full bg-slate-100 text-red-500 dark:bg-gray-700">
                          Pilih salah satu
                        </small>
                      ) : null}
                      <InputSearch
                        className="w-fit py-1 pr-2 text-xs"
                        value={cariRad}
                        onChange={(e) => setCariRad(e.target.value)}
                      />
                    </div>
                    {tindakansRad ? (
                      <div className="grid h-fit grid-cols-2 justify-end gap-2 py-1">
                        <Controller
                          control={control}
                          name={"detail"}
                          render={({ field: { onChange, value, onBlur } }) => {
                            return (
                              <>
                                {tindakansRad?.map((val, idx) => (
                                  <div
                                    className="flex items-start justify-start gap-1"
                                    key={idx}
                                  >
                                    <input
                                      type="checkbox"
                                      className="cursor-pointer"
                                      id={"lab-" + val.id}
                                      onBlur={onBlur}
                                      checked={value?.some(
                                        (some) => some === val.id
                                      )}
                                      onChange={() => {
                                        const updatedDetail = value
                                          ? [...value]
                                          : [];
                                        const index = updatedDetail.indexOf(
                                          val.id
                                        );
                                        if (index === -1) {
                                          updatedDetail.push(val.id);
                                        } else {
                                          updatedDetail.splice(index, 1);
                                        }
                                        onChange(updatedDetail);
                                      }}
                                    />
                                    <label
                                      className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                      htmlFor={"lab-" + val.id}
                                    >
                                      {val.nama}
                                    </label>
                                  </div>
                                ))}
                              </>
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <small className="text-center">
                        Data tidak ditemukan
                      </small>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button type="submit" color="cyan100">
                      Simpan
                    </Button>
                    <Button
                      color="red"
                      onClick={() => {
                        setPermintRad(false);
                        reset();
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={kunjunganDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setKunjunganDialog(false);
              setCari("");
            }}
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
                  <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      Pilih Kunjungan
                    </Dialog.Title>
                    <div className="flex items-center justify-between py-1.5">
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
                      <div className="flex items-center gap-1">
                        <Transition
                          show={meta.total > 0 && deferredCari !== ""}
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 -translate-y-1"
                          enterTo="opacity-100"
                          leave="ease-in duration-150"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <div>
                            <Button
                              className="mt-1 py-1 text-xs"
                              color="sky"
                              onClick={() =>
                                router.push("/kunjungan-radiologi")
                              }
                            >
                              Tambah Kunjungan
                            </Button>
                          </div>
                        </Transition>
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
                              <ThDiv>*</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>No. Rawat</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>No. R.M.</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Nama Pasien</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Tanggal</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Cara Bayar</ThDiv>
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
                                <td className="h-[48.5px]">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 opacity-30"
                                  />
                                </td>
                                <td>
                                  <p className="mx-auto h-[32px] w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>

                                <td>
                                  <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </tr>
                            ))
                          ) : meta.total === 0 ? (
                            <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                              <td className="p-4 text-center" colSpan={10}>
                                <p>Data tidak ditemukan</p>
                                <Button
                                  className="mt-1 py-1 text-xs"
                                  color="sky"
                                  onClick={() =>
                                    router.push("/kunjungan-radiologi")
                                  }
                                >
                                  Tambah Kunjungan
                                </Button>
                              </td>
                            </tr>
                          ) : (
                            listKunjungan?.map((data, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  "cursor-pointer",
                                  kunjungan?.id_kunjungan ===
                                    data.id_kunjungan &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                onClick={() => {
                                  if (
                                    kunjungan?.id_kunjungan ===
                                    data.id_kunjungan
                                  ) {
                                    setKunjungan(null);
                                    setValue("id_kunjungan", "");
                                  } else {
                                    setKunjungan(data);
                                  }
                                }}
                                key={i}
                              >
                                <td className="border-b border-slate-200 pt-4 text-center align-top dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={
                                      kunjungan?.id_kunjungan ===
                                      data.id_kunjungan
                                    }
                                    onChange={() =>
                                      kunjungan?.id_kunjungan ===
                                      data.id_kunjungan
                                        ? setKunjungan(null)
                                        : setKunjungan(data)
                                    }
                                  />
                                </td>
                                <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                                  <p className="mx-auto w-32 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                                    {data.id_kunjungan}
                                  </p>
                                </td>
                                <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                                  <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                                    {data.no_rm}
                                  </p>
                                </td>
                                <td className="border-b border-slate-200 dark:border-gray-700">
                                  <p>{data.nama}</p>
                                </td>
                                <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                  {/* <p>
                          {new Intl.DateTimeFormat("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(data.tanggal))}
                        </p> */}
                                </td>
                                <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                  <p
                                    className={cn(
                                      "text-center font-bold uppercase",
                                      asuransi[data.id_asuransi]?.cn
                                    )}
                                  >
                                    {asuransi[data.id_asuransi]?.nama}
                                  </p>
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
                    <div className="mt-2 flex gap-1">
                      <Button
                        className="py-1"
                        color="green"
                        onClick={() => {
                          setKunjunganDialog(false);
                          setCari("");
                          if (!!kunjungan?.id_kunjungan)
                            setValue("id_kunjungan", kunjungan?.id_kunjungan);
                        }}
                      >
                        Simpan
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setKunjunganDialog(false);
                          setCari("");
                        }}
                      >
                        Batal
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

const DetailRadDialog = ({
  detailRad,
  detailRadDispatch,
  loadData,
}: {
  detailRad: DetailRadState;
  detailRadDispatch: React.Dispatch<DetailRadAction>;
  loadData: () => Promise<void>;
}) => {
  const tutup = () => {
    reset();
    detailRadDispatch({
      type: "setDetail",
      detail: {
        ...detailRad,
        modal: false,
      },
    });
    setTimeout(() => {
      setDetailPem([]);
    }, 200);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");
  const [grupId] = useState(parseInt(Cookies.get("grupId")!));

  const [detailPem, setDetailPem] = useState<DetailPemeriksaanRad[]>([]);
  const loadDetail = async () => {
    try {
      const url = `${APIURL}/rs/penunjang/permintaan/${detailRad.data?.id}/detail`;
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      const data: DetailPemeriksaanRad[] = json?.data;
      setDetailPem(data);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!detailRad.modal) return;
    loadDetail();
    // loadHasil();
  }, [detailRad]);

  const pemeriksaanRadState = {
    modal: false,
  };
  const pemeriksaanRadActs = (
    state: PemeriksaanRadState,
    action: PemeriksaanRadAction
  ) => {
    switch (action.type) {
      case "setPemeriksaan": {
        return {
          ...action.pemeriksaan,
        };
      }
    }
  };
  const [edit, setEdit] = useState<boolean>(false);
  const [pemeriksaanRad, pemeriksaanRadDispatch] = useReducer(
    pemeriksaanRadActs,
    pemeriksaanRadState
  );
  useEffect(() => {
    if (!pemeriksaanRad.data?.id) return;
    setValue("id_dpermintaan", pemeriksaanRad.data.id);
    if (pemeriksaanRad.data?.hasil === null) {
      return setEdit(false);
    }
    setEdit(true);
    setValue("hasil", pemeriksaanRad.data.hasil);
    setValue("keterangan", pemeriksaanRad.data.keterangan);
  }, [pemeriksaanRad]);
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
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [listTemplate, setListTemplate] = useState<Format[]>();
  const [template, setTemplate] = useState<Format | null>(null);

  const loadTemplate = async () => {
    try {
      setIsMutating(true);
      // const url = new URL(
      //   `${APIURL}/rs/penunjang/format/${pemeriksaanRad.data?.id_penunjang}`
      // );
      const url = new URL(`${APIURL}/rs/radiologi/format`);
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
      setListTemplate(json?.data);
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
  const [templateDialog, setTemplateDialog] = useState<boolean>(false);

  useEffect(() => {
    loadTemplate();
  }, [meta.page, meta.perPage, deferredCari, templateDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const cetakHasilRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    await onBeforeGetContentResolve.current;
  }, [pemeriksaanRad]);

  const reactToPrintContent = useCallback(() => {
    return cetakHasilRef.current;
  }, [cetakHasilRef.current]);

  const handlePrintHasil = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Hasil Pemeriksaan Radiologi",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  type HapusState = {
    modal: boolean;
    data?: {
      id: number;
      nama: string;
      nama_pemeriksaan: string;
      tanggal: Date;
    };
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
        `${APIURL}/rs/penunjang/permintaan/${hapus.data?.id}/detail`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const json = await resp.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message);
      loadDetail();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  type HapusHasilState = {
    modal: boolean;
    data?: {
      id: number;
      nama: string;
      nama_pemeriksaan: string;
      tanggal: Date;
    };
  };
  type HapusHasilAction = {
    type: "setHapusHasil";
    hapusHasil: HapusHasilState;
  };
  const hapusHasilState = {
    modal: false,
    data: undefined,
  };
  const hapusHasilActs = (state: HapusHasilState, action: HapusHasilAction) => {
    switch (action.type) {
      case "setHapusHasil": {
        return {
          ...action.hapusHasil,
        };
      }
    }
  };
  const [hapusHasil, hapusHasilDispatch] = useReducer(
    hapusHasilActs,
    hapusHasilState
  );
  const handleHapusHasil = async () => {
    try {
      const resp = await fetch(
        `${APIURL}/rs/penunjang/hasil/${hapusHasil.data?.id}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const json = await resp.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusHasilDispatch({
        type: "setHapusHasil",
        hapusHasil: { modal: false },
      });
      pemeriksaanRadDispatch({
        type: "setPemeriksaan",
        pemeriksaan: {
          modal: false,
          data: pemeriksaanRad.data,
        },
      });
      toast.success(json?.message);
      loadDetail();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TDetailPemeriksaan>({
    resolver: zodResolver(DetailPemeriksaanSchema),
    defaultValues: {},
  });

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<TDetailPemeriksaan> = async (data, e) => {
    try {
      e?.preventDefault();
      let respJson;
      if (edit) {
        const { id_dpermintaan, ...parsedData } = data;
        const put = await fetch(
          `${APIURL}/rs/penunjang/hasil/${id_dpermintaan}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(parsedData),
          }
        );
        respJson = await put.json();
        if (respJson.status !== "Updated") throw new Error(respJson.message);
      } else {
        const post = await fetch(`${APIURL}/rs/penunjang/hasil`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        respJson = await post.json();
        if (respJson.status !== "Created") throw new Error(respJson.message);
      }
      toast.success(respJson.message);
      pemeriksaanRadDispatch({
        type: "setPemeriksaan",
        pemeriksaan: {
          modal: false,
          data: pemeriksaanRad.data,
        },
      });
      loadData();
      loadDetail();
      setEdit(false);
      setTemplate(null);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const [riwLabDialog, setRiwLabDialog] = useState<boolean>(false);
  const [riwRadDialog, setRiwRadDialog] = useState<boolean>(false);

  const [menues] = useState([
    { label: "Riwayat Diagnosis", onClick: () => false },
    { label: "Riwayat Tindakan", onClick: () => false },
    // {
    //   label: "Riwayat Pemeriksaan Laboratorium",
    //   onClick: () => setRiwLabDialog(true),
    // },
    {
      label: "Riwayat Pemeriksaan Radiologi",
      onClick: () => setRiwRadDialog(true),
    },
    // { label: "Riwayat Resep Obat", onClick: () => setRiwResepDialog(true) },
    // { label: "I-Care", onClick: () => setIcareDialog(true) },
  ]);

  return (
    <Transition show={detailRad.modal} as={Fragment}>
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
                {/* <form
                  className="flex flex-col"
                  onSubmit={handleSubmit(submitHandler)}
                > */}
                <div className="mb-4 flex justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                  <p>{detailRad.data?.no_rm}</p>
                  <p>{detailRad.data?.nama}</p>
                  <p>{detailRad.data?.id_kunjungan}</p>
                </div>
                <div className="relative mb-3 grid grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <p className="w-fit border-b border-slate-200 text-sm dark:border-slate-300 dark:text-slate-100">
                      Diagnosis Klinis
                    </p>
                    <p className="text-xs">{detailRad.data?.diagnosis}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="w-fit border-b border-slate-200 text-sm dark:border-slate-300 dark:text-slate-100">
                      Informasi Tambahan
                    </p>
                    <p className="text-xs">{detailRad.data?.informasi}</p>
                  </div>
                  <Menu as={Fragment}>
                    <div className="">
                      <Menu.Button
                        as={Fragment}
                        // className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <Button
                          color="slatesky"
                          className="absolute -top-3 right-0.5 py-1.5 text-xs"
                        >
                          Riwayat
                        </Button>
                        {/* <ImMenu3
                          size="1.3rem"
                          className="text-slate-800 active:text-slate-700"
                        /> */}
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
                          // className="absolute right-0 z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700"
                          className="fixed right-0 top-16 z-30 mt-6 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700"
                        >
                          {menues.map((val) => (
                            <div className="p-0.5" key={val.label}>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    type="button"
                                    className={cn(
                                      // "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                                      "relative block w-full truncate rounded-md p-2 text-left text-xs",
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
                <div
                  className={cn("mb-3 w-full overflow-hidden rounded shadow")}
                >
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                        <td className="px-4 py-2">Pemeriksaan</td>
                        <td className="px-4 py-2 text-center">*</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {detailPem?.map((detail, idx) => (
                        <tr
                          className={cn(
                            "bg-white hover:text-sky-600 dark:bg-slate-900"
                            // "divide-x divide-gray-300 dark:divide-gray-800"
                          )}
                          key={idx}
                        >
                          <td className="whitespace-pre-wrap px-4 py-2">
                            {detail.nama}
                          </td>
                          <td className="whitespace-pre-wrap px-4 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <button
                                      type="button"
                                      className="relative focus:outline-none"
                                      onClick={() => {
                                        pemeriksaanRadDispatch({
                                          type: "setPemeriksaan",
                                          pemeriksaan: {
                                            modal: true,
                                            data: detail,
                                          },
                                        });
                                      }}
                                    >
                                      <IoDocumentTextOutline
                                        size="1.5rem"
                                        className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                      />
                                      {detail?.hasil !== null ? (
                                        <FaCheck
                                          className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                          aria-hidden="true"
                                        />
                                      ) : null}
                                    </button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={0}
                                    className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                  >
                                    <p>Hasil</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              </Tooltip.Provider>

                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    className="focus:outline-none disabled:opacity-50"
                                    disabled={detail.hasil === null}
                                    onClick={() => {
                                      pemeriksaanRadDispatch({
                                        type: "setPemeriksaan",
                                        pemeriksaan: {
                                          modal: false,
                                          data: detail,
                                        },
                                      });
                                      handlePrintHasil();
                                    }}
                                  >
                                    <IoPrint
                                      size="1.5rem"
                                      className={cn("text-cyan-600")}
                                      // className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800 hover:text-red-500"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={0}
                                    className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                  >
                                    <p>Print</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              </Tooltip.Provider>

                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    className="focus:outline-none"
                                    onClick={() => {
                                      hapusDispatch({
                                        type: "setHapus",
                                        hapus: {
                                          modal: true,
                                          data: {
                                            id: detail.id,
                                            nama: detailRad.data?.nama!,
                                            nama_pemeriksaan: detail.nama,
                                            tanggal: new Date(
                                              detailRad.data?.tanggal!
                                            ),
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    <TbTrash
                                      size="1.5rem"
                                      className="text-red-500 hover:text-red-600 active:text-red-700"
                                    />
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
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-1">
                  {/* <Button color="cyan100">Simpan</Button> */}
                  <Button color="red" onClick={tutup}>
                    Tutup
                  </Button>
                </div>
                {/* </form> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={pemeriksaanRad.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1005]"
            onClose={() => {
              pemeriksaanRadDispatch({
                type: "setPemeriksaan",
                pemeriksaan: {
                  modal: false,
                  data: pemeriksaanRad.data,
                },
              });
              reset();
            }}
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
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="font-medium leading-6 text-gray-900"
                    >
                      Hasil Pemeriksaan Radiologi
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(submitHandler)}>
                      <div
                        className={cn(
                          "relative mt-2 flex flex-col",
                          errors.hasil && "rounded-lg bg-red-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm" htmlFor="hasil">
                            {pemeriksaanRad.data?.nama}
                          </label>
                          <div className="flex items-center gap-2 py-1 pr-0.5">
                            <p className="text-xs text-red-500">
                              {errors?.hasil?.message}
                            </p>
                            <Button
                              disabled={grupId === 8}
                              className="py-1 text-[10px]/[14px]"
                              color="slatesky"
                              onClick={() => setTemplateDialog(true)}
                            >
                              Template
                            </Button>
                          </div>
                        </div>
                        <InputArea
                          disabled={grupId === 8}
                          id="hasil"
                          placeholder="Hasil"
                          className="text-sm"
                          {...register("hasil")}
                          rows={8}
                        />
                      </div>
                      <div className="mt-1 flex flex-col">
                        <label htmlFor="keterangan" className="text-sm">
                          Keterangan
                        </label>
                        <Input
                          disabled={grupId === 8}
                          {...register("keterangan")}
                          id="keterangan"
                          className="text-sm"
                        />
                      </div>
                      <div className="mt-4 flex justify-end gap-1">
                        <Button
                          disabled={grupId === 8}
                          color={edit ? "cyan100" : "green100"}
                          type="submit"
                        >
                          {edit ? "Ubah" : "Simpan"}
                        </Button>
                        <Button
                          disabled={
                            pemeriksaanRad.data?.hasil === null || grupId === 8
                          }
                          color="red100"
                          onClick={() => {
                            hapusHasilDispatch({
                              type: "setHapusHasil",
                              hapusHasil: {
                                modal: true,
                                data: {
                                  id: pemeriksaanRad.data?.id!,
                                  nama: detailRad.data?.nama!,
                                  nama_pemeriksaan: pemeriksaanRad.data?.nama!,
                                  tanggal: new Date(detailRad.data?.tanggal!),
                                },
                              },
                            });
                          }}
                        >
                          Hapus
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            pemeriksaanRadDispatch({
                              type: "setPemeriksaan",
                              pemeriksaan: {
                                modal: false,
                              },
                            });
                            reset();
                          }}
                        >
                          Keluar
                        </Button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
            <Transition show={templateDialog} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-[1010]"
                onClose={() => {
                  setTemplateDialog(false);
                  setCari("");
                  setTemplate(null);
                }}
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
                      <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                        <Dialog.Title
                          as="p"
                          className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                        >
                          Pilih Template
                        </Dialog.Title>
                        <div className="flex items-center justify-between py-1.5">
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
                                  <ThDiv>*</ThDiv>
                                </Th>
                                <Th>
                                  <ThDiv>Pemeriksaan</ThDiv>
                                </Th>
                                <Th>
                                  <ThDiv>Hasil</ThDiv>
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
                                    <td className="h-[49px] text-center">
                                      <input
                                        type="checkbox"
                                        className="h-5 w-5 opacity-30"
                                      />
                                    </td>
                                    <td>
                                      <p className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                                    </td>
                                    <td>
                                      <p className="h-5 max-w-sm rounded bg-slate-200 dark:bg-slate-400"></p>
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
                                listTemplate?.map((data, i) => (
                                  <tr
                                    className={cn(
                                      "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                      "cursor-pointer",
                                      template?.id === data.id &&
                                        "bg-slate-100 dark:bg-gray-900"
                                    )}
                                    onClick={() =>
                                      template?.id === data.id
                                        ? setTemplate(null)
                                        : setTemplate(data)
                                    }
                                    key={i}
                                  >
                                    <td className="border-b border-slate-200 pt-4 text-center align-top dark:border-gray-700">
                                      <input
                                        type="checkbox"
                                        className="h-5 w-5"
                                        checked={template?.id === data.id}
                                        onChange={() =>
                                          template?.id === data.id
                                            ? setTemplate(null)
                                            : setTemplate(data)
                                        }
                                      />
                                    </td>
                                    <td className="border-b border-slate-200 p-2 pt-4 align-top dark:border-gray-700">
                                      <p>{data.nama}</p>
                                    </td>
                                    <td className="max-w-sm whitespace-pre-wrap border-b border-slate-200 px-1 dark:border-gray-700">
                                      <p>{data.hasil}</p>
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
                        <div className="mt-2 flex gap-1">
                          <Button
                            className="py-1"
                            color="green"
                            onClick={() => {
                              setTemplateDialog(false);
                              setCari("");
                              if (!!template?.hasil)
                                setValue("hasil", template?.hasil);
                            }}
                          >
                            Simpan
                          </Button>
                          <Button
                            className="py-1"
                            color="red"
                            onClick={() => {
                              setTemplateDialog(false);
                              setCari("");
                              setTemplate(null);
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>

            <Transition show={hapusHasil.modal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-[1005]"
                onClose={() =>
                  hapusHasilDispatch({
                    type: "setHapusHasil",
                    hapusHasil: {
                      modal: false,
                      data: hapusHasil.data,
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
                          Hapus Hasil Pemeriksaan Radiologi
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Hapus hasil pemeriksaan{" "}
                            {hapusHasil.data?.nama_pemeriksaan} atas nama{" "}
                            {hapusHasil.data?.nama} pada tanggal{" "}
                            {hapusHasil.data?.tanggal
                              ? new Intl.DateTimeFormat("id-ID", {
                                  dateStyle: "long",
                                }).format(new Date(hapusHasil.data?.tanggal))
                              : ""}
                          </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-1">
                          <Button color="red100" onClick={handleHapusHasil}>
                            Hapus
                          </Button>
                          <Button
                            color="red"
                            onClick={() =>
                              hapusHasilDispatch({
                                type: "setHapusHasil",
                                hapusHasil: {
                                  modal: false,
                                  data: hapusHasil.data,
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

        <Transition show={hapus.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1005]"
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
                      Hapus Pemeriksaan Radiologi
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus pemeriksaan {hapus.data?.nama_pemeriksaan} atas
                        nama {hapus.data?.nama} pada tanggal{" "}
                        {hapus.data?.tanggal
                          ? new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "long",
                            }).format(new Date(hapus.data?.tanggal))
                          : ""}
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

        <RiwayatRadiologi
          id_pasien={detailRad.data?.id_pasien!}
          riwRadDialog={riwRadDialog}
          setRiwRadDialog={setRiwRadDialog}
        />

        <div className="hidden">
          <CetakHasilRadiologi
            ref={cetakHasilRef}
            data={{
              pemeriksaan: pemeriksaanRad.data,
              permintaan: detailRad.data,
            }}
          />
        </div>
      </Dialog>
    </Transition>
  );
};
