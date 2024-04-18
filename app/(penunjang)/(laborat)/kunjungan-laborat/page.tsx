"use client";

import PasienBaruDialog from "@/app/(pendaftaran)/master-pasien/_components/pasien";
import { MasterPasien } from "@/app/(pendaftaran)/schema";
import { asuransi } from "@/app/(rawatJalan)/asesmen/schema";
import { CaraBayar } from "@/app/(referensi)/list-carabayar/page";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input } from "@/components/form";
import { MyOptions } from "@/components/select";
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
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdMenuOpen } from "react-icons/md";
import { RiFlaskFill } from "react-icons/ri";
import { TbEdit, TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import {
  KunjunganPenunjang,
  KunjunganPenunjangSchema,
  TKunjunganPenunjangSchema,
} from "../../schema";

type UbahState = {
  modal: boolean;
  data?: KunjunganPenunjang;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function KunjunganLaborat() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [tanggal, setTanggal] = useState<Date | "">("");
  const memoizedTanggal = useMemo(
    () => (tanggal instanceof Date ? tanggal?.toLocaleDateString("fr-CA") : ""),
    [tanggal]
  );
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<KunjunganPenunjang[]>([]);
  const [tambahDialog, setTambahDialog] = useState<boolean>(false);

  const ubahState = {
    modal: false,
    data: undefined,
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

  type BatalState = {
    modal: boolean;
    data?: {
      id?: number;
      nm_pasien?: string;
      status?: string;
    };
  };
  type BatalAction = { type: "setBatal"; batal: BatalState };
  const batalState = {
    modal: false,
    data: {
      id: undefined,
      nm_pasien: undefined,
      status: undefined,
    },
  };
  const batalActs = (state: BatalState, action: BatalAction) => {
    switch (action.type) {
      case "setBatal": {
        return {
          ...action.batal,
        };
      }
    }
  };
  const [batal, batalDispatch] = useReducer(batalActs, batalState);
  const handleBatal = async () => {
    try {
      const putData = {
        id: batal.data?.id,
        status: batal.data?.status,
      };
      const batalPasien = await fetch(`${APIURL}/pendaftaran/status`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(putData),
      });
      const data = await batalPasien.json();
      batalDispatch({ type: "setBatal", batal: { modal: false } });
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
  const loadData = async (signal?: AbortSignal) => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/kunjungan/laborat`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
        tanggal: memoizedTanggal,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: signal,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
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
  }, [meta.page, meta.perPage, tanggal, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <RiFlaskFill
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Kunjungan Laboratorium
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
              <Input
                type="date"
                value={memoizedTanggal}
                className="w-fit p-2 text-xs shadow-none"
                onChange={(e) => {
                  setTanggal(e.target.value ? new Date(e.target.value) : "");
                }}
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
                    <ThDiv>No. Kunjungan</ThDiv>
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
                  <Th>
                    <ThDiv>*</ThDiv>
                  </Th>
                </tr>
              </thead>
              <tbody className="bg-slate-200 dark:bg-gray-700">
                {isMutating ? (
                  /* IF DATA FETCHING */
                  [...Array(15)].map((_, i) => (
                    <tr
                      className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                      key={i}
                    >
                      <td className="h-[48.5px]">
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
                      {/* <td>
                        <p className="mx-auto h-5 w-36 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
                ) : /* IF DATA KOSONG */
                meta.total === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={7}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  /* IF DATA ADA */
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
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
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() =>
                                    ubahDispatch({
                                      type: "setUbah",
                                      ubah: {
                                        modal: true,
                                        data: data,
                                      },
                                    })
                                  }
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
                                <p>Ubah Kunjungan</p>
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
                                  onClick={() =>
                                    batalDispatch({
                                      type: "setBatal",
                                      batal: {
                                        modal: true,
                                        data: {
                                          id: data.id_pasien,
                                          nm_pasien: data.nama,
                                        },
                                      },
                                    })
                                  }
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
                                <p>Batal Kunjungan</p>
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

      <KunjungRadDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        ubah={ubah}
        ubahDispatch={ubahDispatch}
        loadData={loadData}
      />

      <Transition show={batal.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() =>
            batalDispatch({
              type: "setBatal",
              batal: {
                modal: false,
                data: batal.data,
              },
            })
          }
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-50"
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
                    Batal Periksa pasien atas nama {batal.data?.nm_pasien}?
                  </Dialog.Title>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleBatal}>
                      Batal Periksa
                    </Button>
                    <Button
                      color="red"
                      onClick={() =>
                        batalDispatch({
                          type: "setBatal",
                          batal: {
                            modal: false,
                            data: batal.data,
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

const KunjungRadDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
}: {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => Promise<void>;
}) => {
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TKunjunganPenunjangSchema>({
    resolver: zodResolver(KunjunganPenunjangSchema),
  });

  const [caraBayarOptions, setCaraBayarOptions] = useState<MyOptions>([]);
  const loadCaraBayar = async () => {
    const resp = await fetch(`${APIURL}/rs/asuransi`, {
      method: "GET",
      headers: headers,
    });
    const json = await resp.json();
    const data = json?.data?.map((data: CaraBayar) => {
      const option = {
        value: data?.id,
        label: data?.nama,
      };
      return option;
    });
    setCaraBayarOptions(data);
  };

  useEffect(() => {
    if (!tambahDialog && !ubah.modal) return;
    if (tambahDialog) {
      setTimeout(() => setPasienDialog(true), 350);
    }
    loadCaraBayar();
    setValue("id_pasien", ubah.data?.id_pasien!);
    setValue(
      "tanggal",
      new Date(ubah.data?.tanggal || new Date()).toLocaleDateString("fr-CA")
    );
  }, [tambahDialog, ubah]);

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
  const [listPasien, setListPasien] = useState<MasterPasien[]>();
  const [pasien, setPasien] = useState<MasterPasien | null>(null);

  const [tambahPasienDialog, setTambahPasienDialog] = useState<boolean>(false);

  const loadPasien = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/pasien`);
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
      setListPasien(json?.data);
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
          lastPage: 0,
          total: 0,
        },
      });
      if (error.message === "Tidak ada pasien" || error.name === "AbortError")
        return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };
  const [pasienDialog, setPasienDialog] = useState<boolean>(false);

  useEffect(() => {
    loadPasien();
  }, [meta.page, meta.perPage, deferredCari, pasienDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const submitHandler: SubmitHandler<TKunjunganPenunjangSchema> = async (
    data,
    e
  ) => {
    try {
      e?.preventDefault();
      if (ubah.modal) {
        const { id_pasien, ...parsedData } = data;
        const put = await fetch(
          `${APIURL}/rs/kunjungan/laborat/${ubah.data?.id_kunjungan}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(parsedData),
          }
        );
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/kunjungan/laborat`, {
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
    <Transition show={tambahDialog || ubah.modal} as={Fragment}>
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
                {ubah.modal ? (
                  <div className="max-w-xs rounded-sm border border-slate-200 py-1.5 text-center">
                    <p>{ubah.data?.nama}</p>
                  </div>
                ) : null}
                <form onSubmit={handleSubmit(submitHandler)}>
                  {tambahDialog ? (
                    <div className="max-w-xs">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="pasien"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Pasien
                        </label>
                        {watch("id_pasien") ? (
                          <Button
                            className="py-1 text-xs"
                            color="sky"
                            onClick={() => setPasienDialog(true)}
                          >
                            Ubah Pasien
                          </Button>
                        ) : null}
                      </div>
                      {!watch("id_pasien") ? (
                        <div
                          className="relative"
                          onClick={() => {
                            return setPasienDialog(true);
                          }}
                        >
                          <Input
                            className="cursor-pointer"
                            readOnly
                            placeholder="Pilih Pasien"
                          />
                          <MdMenuOpen
                            size="1.25rem"
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-700"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5 text-slate-600">
                          <p className="text-sm">
                            {pasien?.nomer + " " + pasien?.nama}
                          </p>
                          <p className="text-xs">
                            {pasien?.tanggal_lahir ? (
                              <>
                                <span>
                                  {new Intl.DateTimeFormat("id-ID", {
                                    dateStyle: "long",
                                  }).format(new Date(pasien?.tanggal_lahir))}
                                </span>
                                <span className="font-light">
                                  {" (" +
                                    getAgeThn(new Date(pasien?.tanggal_lahir)) +
                                    ")"}
                                </span>
                              </>
                            ) : (
                              ""
                            )}
                          </p>
                          <p className="text-xs">{pasien?.alamat}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-col gap-2">
                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.tanggal && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="tgl"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Tanggal
                        </label>
                        {errors.tanggal ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.tanggal.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        id="tgl"
                        type="date"
                        autoFocus
                        {...register("tanggal")}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button type="submit" color="green100">
                      Simpan
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

        <Transition show={pasienDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setPasienDialog(false);
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
                      Pilih Pasien
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
                              className="py-2 text-xs"
                              color="sky"
                              onClick={() => setTambahPasienDialog(true)}
                            >
                              Tambah Pasien
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
                              <ThDiv>No. R.M.</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>NIK</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Nama</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Tgl. Lahir</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Alamat</ThDiv>
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
                                  <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-40 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                                  onClick={() => setTambahPasienDialog(true)}
                                >
                                  Tambah Pasien
                                </Button>
                              </td>
                            </tr>
                          ) : (
                            listPasien?.map((data, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  "cursor-pointer",
                                  pasien?.id === data.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                onClick={() =>
                                  pasien?.id === data.id
                                    ? setPasien(null)
                                    : setPasien(data)
                                }
                                key={i}
                              >
                                <td className="border-b border-slate-200 pt-4 text-center align-top dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={pasien?.id === data.id}
                                    onChange={() =>
                                      pasien?.id === data.id
                                        ? setPasien(null)
                                        : setPasien(data)
                                    }
                                  />
                                </td>
                                <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                                  <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                                    {data.nomer}
                                  </p>
                                </td>
                                <td className="border-b border-slate-200 dark:border-gray-700">
                                  <p>{data.nik}</p>
                                </td>
                                <td className="border-b border-slate-200 dark:border-gray-700">
                                  <p>{data.nama}</p>
                                </td>
                                <td className="border-b border-slate-200 dark:border-gray-700">
                                  <span>
                                    {new Intl.DateTimeFormat("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }).format(new Date(data.tanggal_lahir))}
                                  </span>
                                  <span className="font-light">
                                    {" (" +
                                      getAgeThn(new Date(data.tanggal_lahir)) +
                                      ")"}
                                  </span>
                                </td>
                                <td className="border-b border-slate-200 dark:border-gray-700">
                                  <p>{data.alamat}</p>
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
                          setPasienDialog(false);
                          setCari("");
                          if (!!pasien?.id) setValue("id_pasien", pasien?.id);
                        }}
                      >
                        Simpan
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setPasienDialog(false);
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

            <PasienBaruDialog
              dialog={tambahPasienDialog}
              setDialog={setTambahPasienDialog}
            />
          </Dialog>
        </Transition>
      </Dialog>
    </Transition>
  );
};
