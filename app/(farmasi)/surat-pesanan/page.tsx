"use client";

import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input } from "@/components/form";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { ArrayElementType, cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
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
import { AiOutlineEye } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { TbEdit, TbTrash } from "react-icons/tb";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { z } from "zod";
import { Supplier } from "../list-supplier/page";
import { Depo, DetailPesanan, KFAPOA, SuratPesanan } from "../schema";
import CetakSP from "./_components/cetak-sp";

type LihatState = {
  modal: boolean;
  data?: SuratPesanan;
};
type LihatAction = { type: "setLihat"; lihat: LihatState };

export default function SuratPesananPage() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [grupId] = useState(parseInt(Cookies.get("grupId")!));
  const [isKeu, setIsKeu] = useState(grupId === 10);
  useEffect(() => {
    setIsKeu(grupId === 10);
  }, [grupId]);

  // const [isKeu] = useState(true);

  const [tanggal, setTanggal] = useState<Date | string>("");
  const memoizedTanggal = useMemo(
    () => (tanggal instanceof Date ? tanggal?.toLocaleDateString("fr-CA") : ""),
    [tanggal]
  );
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<SuratPesanan[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
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

  // type ValidasiState = {
  //   modal: boolean;
  //   data?: SuratPesanan;
  // };
  // type ValidasiAction = ValidasiState;
  // const validasiState = {
  //   modal: false,
  // };
  // const validasiActs = (state: ValidasiState, action: ValidasiAction) => {
  //   return {
  //     ...action,
  //   };
  // };
  // const [validasi, validasiDispatch] = useReducer(validasiActs, validasiState);

  // type HapusState = {
  //   modal: boolean;
  //   data?: {
  //     id?: number;
  //     nama?: string;
  //   };
  // };
  // type HapusAction = { type: "setHapus"; hapus: HapusState };
  // const hapusState = {
  //   modal: false,
  //   data: {
  //     id: undefined,
  //     nama: undefined,
  //   },
  // };
  // const hapusActs = (state: HapusState, action: HapusAction) => {
  //   switch (action.type) {
  //     case "setHapus": {
  //       return {
  //         ...action.hapus,
  //       };
  //     }
  //   }
  // };
  // const [hapus, hapusDispatch] = useReducer(hapusActs, hapusState);
  // const handleHapus = async () => {
  //   try {
  //     const resp = await fetch(`${APIURL}/rs/tarif/${hapus.data?.id}`, {
  //       method: "DELETE",
  //       headers: headers,
  //     });
  //     const data = await resp.json();
  //     hapusDispatch({ type: "setHapus", hapus: { modal: false } });
  //     toast.success(data?.message, {
  //       onOpen: loadData,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
      const url = !isKeu
        ? new URL(`${APIURL}/rs/surat/pesanan`)
        : new URL(`${APIURL}/rs/surat/pesanan/validated`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        tanggal: memoizedTanggal,
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
            <div className="ml-3 flex items-center gap-3">
              <div className="relative">
                <IoDocumentText
                  size="1.75rem"
                  className="text-gray-500 dark:text-slate-100"
                />
                <FaPlus
                  size="1rem"
                  className="absolute -bottom-1 -right-3 text-gray-500 dark:text-slate-100"
                />
              </div>
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Surat Pesanan
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
              {!isKeu ? (
                <div className="flex gap-1">
                  <Button
                    className="h-fit px-4 py-[7px]"
                    color="slatesky"
                    onClick={() => setTambahDialog(true)}
                  >
                    Tambah
                  </Button>
                </div>
              ) : null}
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
                    <ThDiv>Kode</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Biaya Pengiriman</ThDiv>
                  </Th>
                  {/* <Th>
                    <ThDiv>Keterangan</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Petugas</ThDiv>
                  </Th> */}
                  <Th>
                    <ThDiv>Tgl. S.P.</ThDiv>
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
                        <p className="mx-auto h-6 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      {/* <td>
                        <p className="mx-auto h-5 w-28 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-56 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td> */}
                      <td>
                        <p className="mx-auto h-4 w-56 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <AiOutlineEye
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
                ) : (
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 py-1.5 dark:border-gray-700">
                        <p className="mx-auto w-44 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.id}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.pengiriman?.replace("Rp", "Rp ")}</p>
                      </td>
                      {/* <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.keterangan}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p className="text-xs">{data.user}</p>
                      </td> */}
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p className="text-xs">
                          {data.created_at
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "long",
                                timeStyle: "short",
                              }).format(new Date(data.created_at))
                            : null}
                        </p>
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

      <PesananDialog
        isKeu={isKeu}
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        lihat={lihat}
        lihatDispatch={lihatDispatch}
        loadData={loadData}
      />
    </>
  );
}

type PesananDialogProps = {
  isKeu: boolean;
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  lihat: LihatState;
  lihatDispatch: React.Dispatch<LihatAction>;
  loadData: () => Promise<void>;
};

const PesananDialog = ({
  isKeu,
  tambahDialog,
  setTambahDialog,
  lihat,
  lihatDispatch,
  loadData,
}: PesananDialogProps) => {
  const PesananSchema = z.object({
    id_suplier: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    jenis: z.string(),
    pengiriman: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi angka",
    }),
    diskon: z
      .number({
        required_error: "harus diisi",
        invalid_type_error: "harus diisi angka",
      })
      .or(z.nan()),
    ppn: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi angka",
    }),
    detail: z
      .object({
        id_barang: z.number({
          required_error: "harus dipilih",
          invalid_type_error: "harus dipilih",
        }),
        nama: z.string(),
        jumlah: z.number({
          required_error: "harus diisi",
          invalid_type_error: "harus diisi angka",
        }),
        satuan: z.string().min(1, "harus diisi"),
        diskon: z
          .number({
            required_error: "harus diisi",
            invalid_type_error: "harus diisi angka",
          })
          .or(z.nan()),
        harga: z.number({
          required_error: "harus diisi",
          invalid_type_error: "harus diisi angka",
        }),
      })
      .array(),
  });

  type PesananSchemaType = z.infer<typeof PesananSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<PesananSchemaType>({
    resolver: zodResolver(PesananSchema),
    defaultValues: {
      jenis: "obat",
      detail: [],
    },
  });

  const tutup = () => {
    setCari("");
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : lihatDispatch({
          type: "setLihat",
          lihat: {
            modal: false,
          },
        });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [grupId] = useState(parseInt(Cookies.get("grupId")!));

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!lihat.modal && !tambahDialog) return judulLama;
    setJudulLama(lihat.modal ? "Lihat Pesanan" : "Tambah Pesanan");
    return lihat.modal ? "Lihat Pesanan" : "Tambah Pesanan";
  }, [tambahDialog, lihat.modal]);

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
  const [listObat, setListObat] = useState<KFAPOA[]>();

  const loadObat = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/kfa/poa`);
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
      setListObat(json?.data);
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
          total: 0,obat
        },
      });
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };
  const [obatDialog, setObatDialog] = useState<boolean>(false);
  const [obat, setObat] = useState<ArrayElementType<
    PesananSchemaType["detail"]
  > | null>(null);

  type UbahObatState = {
    modal: boolean;
    data?: ArrayElementType<PesananSchemaType["detail"]> & { idx: number };
  };
  type UbahObatAction = { type: "setUbah"; ubah: UbahObatState };

  const ubahState = {
    modal: false,
  };
  const ubahActs = (state: UbahObatState, action: UbahObatAction) => {
    switch (action.type) {
      case "setUbah": {
        return {
          ...action.ubah,
        };
      }
    }
  };
  const [ubahObat, ubahObatDispatch] = useReducer(ubahActs, ubahState);

  useEffect(() => {
    loadObat();
  }, [meta.page, meta.perPage, deferredCari, obatDialog]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const [depoOptions, setDepoOptions] = useState<MyOptions>([]);
  const loadDepo = async (inputText: string) => {
    try {
      const url = new URL(`${APIURL}/rs/farmasi/depo`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const data =
        json?.data?.map((data: Depo) => {
          const option: MyOption = {
            value: data.id,
            label: data.nama,
          };
          return option;
        }) || [];
      setDepoOptions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const [supplierOptions, setSupplierOptions] = useState<MyOptions>([]);
  const loadSupplier = async (inputText: string) => {
    try {
      const url = new URL(`${APIURL}/rs/supplier`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const data =
        json?.data?.map((data: Supplier) => {
          const option: MyOption = {
            value: data.id,
            label: data.nama,
          };
          return option;
        }) || [];
      setSupplierOptions(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const [pesanan, setPesanan] = useState<
    SuratPesanan & { total: string | null; detail: DetailPesanan[] }
  >();
  const loadPesanan = async () => {
    try {
      const url = new URL(`${APIURL}/rs/surat/pesanan/${lihat.data?.id}`);
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setPesanan(json?.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!pesanan) return;
    console.log(pesanan);

    // setValue("detail", pesanan.total);
    // setValue("id_depo", pesanan.id_depo);
    setValue("id_suplier", pesanan.id_suplier);
    setValue("ppn", pesanan.ppn);
    setValue("diskon", pesanan.diskon);
    setValue(
      "pengiriman",
      parseInt(pesanan.pengiriman?.replace("Rp", "").replace(".", ""))
    );
    setValue(
      "detail",
      (pesanan.detail || []).map((val) => ({
        id_barang: val.id_barang,
        nama: val.nama_obat,
        diskon: val.diskon || NaN,
        harga: parseInt(val.harga?.replace("Rp", "").replace(".", "") || ""),
        satuan: val.satuan,
        jumlah: val.jumlah,
      }))
    );
  }, [pesanan]);

  useEffect(() => {
    if (!lihat.modal && !tambahDialog) return;
    loadDepo("");
    loadSupplier("");
    if (lihat.modal) loadPesanan();
    if (!lihat.data) return;
  }, [lihat, tambahDialog]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<PesananSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      // if (ubah.modal) {
      //   const put = await fetch(`${APIURL}/rs/farmasi/pesanan/${ubah.data?.id}`, {
      //     method: "PUT",
      //     headers: headers,
      //     body: JSON.stringify(data),
      //   });
      //   const resp = await put.json();
      //   if (resp.status !== "Updated") throw new Error(resp.message);
      //   toast.success(resp.message);
      // } else {
      const post = await fetch(`${APIURL}/rs/surat/pesanan`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      // }
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const validasiHandler = async (i: string) => {
    try {
      const url = new URL(`${APIURL}/rs/surat/pesanan/validasi/${i}`);
      const resp = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ detail: watch("detail") }),
      });
      const json = await resp.json();
      if (json.status !== "Updated") throw new Error(json.message);
      toast.success(json.message);
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const accHandler = async (i: string) => {
    try {
      const url = new URL(`${APIURL}/rs/surat/pesanan/acc/${i}`);
      const resp = await fetch(url, {
        method: "PUT",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Updated") throw new Error(json.message);
      toast.success(json.message);
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const cetakRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    await onBeforeGetContentResolve.current;
  }, [pesanan]);

  const reactToPrintContent = useCallback(() => {
    return cetakRef.current;
  }, [cetakRef.current]);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Surat Pesanan",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  return (
    <Transition show={lihat.modal || tambahDialog} as={Fragment}>
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
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  {judul}
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="mt-2 flex flex-col gap-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {/* <div
                      className={cn(errors.id_depo && "rounded-lg bg-red-100")}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Menuju Depo
                        </label>
                        {errors.id_depo ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_depo.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_depo"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            isDisabled={lihat.modal}
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={depoOptions}
                            value={depoOptions.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Depo"
                          />
                        )}
                      />
                    </div> */}

                    {/* <div
                      className={cn(errors.id_ref && "rounded-lg bg-red-100")}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Dari Depo
                        </label>
                        {errors.id_ref ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_ref.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_ref"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            isDisabled={lihat.modal}
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={depoOptions}
                            value={depoOptions.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Depo"
                          />
                        )}
                      />
                    </div> */}
                    <div
                      className={cn(
                        errors.id_suplier && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Supplier
                        </label>
                        {errors.id_suplier ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_suplier.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_suplier"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            isDisabled={lihat.modal}
                            cacheOptions
                            loadOptions={loadSupplier}
                            defaultOptions={supplierOptions}
                            value={supplierOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) =>
                              onChange(option?.value)
                            }
                            placeholder="Pilih Supplier"
                            maxMenuHeight={150}
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        errors.pengiriman && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Biaya Pengiriman
                        </label>
                        {errors.pengiriman ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.pengiriman?.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        type="number"
                        disabled={lihat.modal}
                        {...register("pengiriman", { valueAsNumber: true })}
                      />
                    </div>

                    <div
                      className={cn(errors.diskon && "rounded-lg bg-red-100")}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Diskon
                        </label>
                        {errors.diskon ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.diskon.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          className="pr-7"
                          step="0.1"
                          max={100}
                          disabled={lihat.modal}
                          {...register("diskon", { valueAsNumber: true })}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("diskon", 0);
                            +e.target.value > 100 && setValue("diskon", 100);
                          }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          %
                        </div>
                      </div>
                    </div>

                    <div className={cn(errors.ppn && "rounded-lg bg-red-100")}>
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          PPN
                        </label>
                        {errors.ppn ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.ppn.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          className="pr-7"
                          step="0.1"
                          max={100}
                          disabled={lihat.modal}
                          {...register("ppn", { valueAsNumber: true })}
                          onInput={(
                            e: React.FocusEvent<HTMLInputElement, Element>
                          ) => {
                            +e.target.value < 0 && setValue("ppn", 0);
                            +e.target.value > 100 && setValue("ppn", 100);
                          }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="relative flex justify-center border-b border-slate-200">
                      <p className="text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                        Obat
                      </p>
                      <div className="absolute right-0 flex items-center gap-2">
                        {errors.detail ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.detail.message}
                          </p>
                        ) : null}
                        {!lihat.modal ? (
                          <Button
                            className="px-2 py-0.5 text-xs"
                            color="sky"
                            onClick={() => setObatDialog(true)}
                          >
                            Tambah
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={cn("w-full overflow-hidden rounded shadow")}
                    >
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                            <td className="px-4 py-2">Obat</td>
                            <td className="px-4 py-2">Satuan</td>
                            <td className="px-4 py-2">Diskon</td>
                            <td className="px-4 py-2">Harga</td>
                            <td className="px-4 py-2">Jumlah</td>
                            <td className="px-4 py-2">Total</td>
                            <td
                              className={cn(
                                "px-4 py-2 text-center",
                                lihat.modal && "hidden"
                              )}
                            >
                              *
                            </td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {watch("detail")?.map((obat, idx) => (
                            <tr
                              className={cn(
                                "bg-white hover:text-sky-600 dark:bg-slate-900"
                                //, "divide-x divide-gray-300 dark:divide-gray-800"
                              )}
                              key={idx}
                            >
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {obat.nama}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {obat.satuan}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {obat.diskon ? obat.diskon + "%" : ""}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {parseInt(
                                  String(obat.harga || 0)?.replace("Rp", "")
                                ).toLocaleString("id-ID")}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {obat.jumlah}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {(
                                  parseInt(
                                    String(obat.harga || 0)
                                      ?.replace("Rp", "")
                                      .replace(".", "") || ""
                                  ) * obat.jumlah
                                ).toLocaleString("id-ID")}
                              </td>
                              <td
                                className={cn(
                                  "whitespace-pre-wrap px-4 py-2",
                                  lihat.modal && "hidden"
                                )}
                              >
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
                                            ubahObatDispatch({
                                              type: "setUbah",
                                              ubah: {
                                                modal: true,
                                                data: {
                                                  ...obat,
                                                  idx: idx,
                                                },
                                              },
                                            });
                                          }}
                                        >
                                          <TbEdit
                                            size="1rem"
                                            className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                          />
                                        </button>
                                      </Tooltip.Trigger>
                                      <Tooltip.Content
                                        side="left"
                                        sideOffset={0}
                                        className="border border-slate-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
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
                                            setValue(
                                              "detail",
                                              watch("detail").filter(
                                                (_, detailIdx) =>
                                                  detailIdx !== idx
                                              ) || []
                                            );
                                          }}
                                        >
                                          <TbTrash
                                            size="1.2rem"
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {!lihat.modal ? (
                      <Button
                        type="submit"
                        color={
                          judul === "Tambah Pesanan" ? "green100" : "cyan100"
                        }
                      >
                        {judul}
                      </Button>
                    ) : !isKeu ? (
                      <Button
                        onClick={() => validasiHandler(lihat.data?.id!)}
                        color="green100"
                        // disabled={lihat.data?.status! > 1}
                      >
                        Validasi
                      </Button>
                    ) : (
                      <Button
                        onClick={() => accHandler(lihat.data?.id!)}
                        color="green100"
                        // disabled={lihat.data?.status! > 2}
                      >
                        Setujui
                      </Button>
                    )}
                    {/* {!lihat.modal ? (
                      <Button
                        type="submit"
                        color={
                          judul === "Tambah Pesanan" ? "green100" : "cyan100"
                        }
                      >
                        {judul}
                      </Button>
                    ) : !isKeu || grupId === 1 ? (
                      <Button
                        onClick={() => validasiHandler(lihat.data?.id!)}
                        color="green100"
                        disabled={lihat.data?.status! > 2}
                      >
                        Validasi
                      </Button>
                    ) : null}
                    {isKeu || grupId === 1 ? (
                      <Button
                        onClick={() => accHandler(lihat.data?.id!)}
                        color="green100"
                        disabled={lihat.data?.status! < 3}
                      >
                        Setujui
                      </Button>
                    ) : null} */}
                    <Button
                      className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                      color="sky"
                      onClick={handlePrint}
                    >
                      Print
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

                <div className="hidden">
                  <CetakSP
                    ref={cetakRef}
                    data={{
                      suplier: supplierOptions.find(
                        (val) => val.value === watch("id_suplier")
                      )?.label,
                      ...pesanan!,
                    }}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <Transition show={obatDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setObatDialog(false);
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
                      List Obat
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
                              <ThDiv>*</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Barang</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Satuan</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Diskon</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Jumlah</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Harga</ThDiv>
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
                                  <p className="h-5 w-96 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="text-center">
                                  <Input className="pointer-events-none w-40 py-1.5 opacity-50" />
                                </td>
                                <td className="text-center">
                                  <Input className="pointer-events-none w-32 py-1.5 text-xs opacity-50" />
                                </td>
                                <td className="text-center">
                                  <Input className="pointer-events-none w-20 py-1.5 opacity-50" />
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
                            listObat?.map((data, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  obat?.id_barang === data.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                key={i}
                              >
                                <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={obat?.id_barang === data.id}
                                    onChange={() => {
                                      obat?.id_barang === data.id
                                        ? setObat(null)
                                        : setObat({
                                            id_barang: data.id,
                                            nama: data.nama,
                                            diskon: NaN,
                                            satuan: "",
                                            harga: 0,
                                            jumlah: 1,
                                          });
                                    }}
                                  />
                                </td>
                                <td
                                  className={cn(
                                    "border-b border-slate-200 dark:border-gray-700",
                                    "cursor-pointer"
                                  )}
                                  onClick={() =>
                                    obat?.id_barang === data.id
                                      ? setObat(null)
                                      : setObat({
                                          id_barang: data.id,
                                          nama: data.nama,
                                          diskon: NaN,
                                          satuan: "",
                                          harga: 0,
                                          jumlah: 1,
                                        })
                                  }
                                >
                                  <p>{data.nama}</p>
                                </td>
                                <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                                  <Input
                                    className="w-40 py-1.5 text-xs font-normal"
                                    value={
                                      obat?.id_barang === data.id
                                        ? obat?.satuan || ""
                                        : ""
                                    }
                                    onChange={(e) => {
                                      setObat({
                                        ...obat!,
                                        satuan: e.target.value,
                                      });
                                    }}
                                    disabled={obat?.id_barang !== data.id}
                                  />
                                </td>
                                <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      className="w-32 py-1.5 pr-7 text-xs font-normal"
                                      min={0}
                                      max={100}
                                      value={
                                        obat?.id_barang === data.id
                                          ? obat?.diskon || ""
                                          : ""
                                      }
                                      onChange={(e) => {
                                        setObat({
                                          ...obat!,
                                          diskon:
                                            parseFloat(e.target.value) > 100
                                              ? 100
                                              : parseFloat(e.target.value),
                                        });
                                      }}
                                      disabled={obat?.id_barang !== data.id}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      %
                                    </div>
                                  </div>
                                </td>
                                <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-20 py-1.5 text-xs font-normal"
                                    value={
                                      obat?.id_barang === data.id
                                        ? obat?.jumlah || ""
                                        : ""
                                    }
                                    onChange={(e) => {
                                      setObat({
                                        ...obat!,
                                        jumlah: parseInt(e.target.value),
                                      });
                                    }}
                                    disabled={obat?.id_barang !== data.id}
                                  />
                                </td>
                                <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-20 py-1.5 text-xs font-normal"
                                    value={
                                      obat?.id_barang === data.id
                                        ? obat?.harga || 0
                                        : 0
                                    }
                                    onChange={(e) => {
                                      setObat({
                                        ...obat!,
                                        harga: Number(e.target.value),
                                      });
                                    }}
                                    disabled={obat?.id_barang !== data.id}
                                  />
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
                          setObatDialog(false);
                          if (!!obat?.id_barang) {
                            setValue("detail", [...watch("detail"), obat]);
                          }
                          setObat(null);
                        }}
                      >
                        Tambah
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setObatDialog(false);
                          setObat(null);
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

        <Transition show={ubahObat.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1005]"
            onClose={() => {
              ubahObatDispatch({
                type: "setUbah",
                ubah: {
                  ...ubahObat,
                  modal: false,
                },
              });
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      Ubah Obat
                    </Dialog.Title>
                    <div className="mt-1 flex flex-col">
                      <label htmlFor="satuan" className="text-sm">
                        Satuan
                      </label>
                      <Input
                        value={
                          watch("detail")?.find(
                            (_, idx) => idx === ubahObat.data?.idx
                          )?.satuan || ""
                        }
                        onChange={(e) => {
                          const detailSatuan = (watch("detail") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  satuan: e.target.value,
                                };
                              }
                              return val;
                            }
                          );
                          setValue("detail", detailSatuan);
                        }}
                        id="satuan"
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-1 flex flex-col">
                      <label htmlFor="diskon" className="text-sm">
                        Diskon
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={
                          watch("detail")?.find(
                            (_, idx) => idx === ubahObat.data?.idx
                          )?.diskon || ""
                        }
                        onChange={(e) => {
                          const detailDiskon = (watch("detail") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  diskon: parseFloat(e.target.value),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("detail", detailDiskon);
                        }}
                        id="diskon"
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-1 flex flex-col">
                      <label htmlFor="jumlah" className="text-sm">
                        Jumlah
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={
                          watch("detail")?.find(
                            (_, idx) => idx === ubahObat.data?.idx
                          )?.jumlah || ""
                        }
                        onChange={(e) => {
                          const detailJumlah = (watch("detail") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  jumlah: parseInt(e.target.value),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("detail", detailJumlah);
                        }}
                        id="jumlah"
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button
                        color="red"
                        onClick={() => {
                          ubahObatDispatch({
                            type: "setUbah",
                            ubah: {
                              ...ubahObat,
                              modal: false,
                            },
                          });
                        }}
                      >
                        Tutup
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
