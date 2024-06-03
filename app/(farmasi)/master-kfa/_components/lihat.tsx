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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineEye } from "react-icons/ai";
import { GiMedicines } from "react-icons/gi";
import { MdMenuOpen } from "react-icons/md";
import { TbEdit, TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { z } from "zod";
import { KFAPOA, KFAPOV } from "../../schema";
import { LihatAction, LihatState } from "../page";
import { IoIosArrowBack } from "react-icons/io";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";

export default function LihatDialog({
  lihat,
  lihatDispatch,
}: {
  lihat: LihatState;
  lihatDispatch: React.Dispatch<LihatAction>;
}) {
  const tutup = () => {
    reset();
    lihatDispatch({
      type: "setLihat",
      lihat: {
        modal: false,
      },
    });
    setStatus(0);
    setListPOV(undefined);
    setListPOA(undefined);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const POVSchema = z.object({
    type: z.literal("POV"),
    id: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    nama: z.string().min(1, "harus diisi"),
    id_bza: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    numerator: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    satuan: z.string().min(1, "harus diisi"),
    denominator: z
      .number({
        required_error: "harus diisi",
        invalid_type_error: "harus diisi",
      })
      .or(z.nan())
      .optional(),
    satuan_denom: z.string().optional(),
    id_sediaan: z.string().min(1, "harus diisi"),
  });

  const POASchema = z.object({
    type: z.literal("POA"),
    id: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    nama: z.string().min(1, "harus diisi"),
    id_pov: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    merk: z.string().optional(),
  });

  const FormSchema = z.discriminatedUnion("type", [POVSchema, POASchema]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    handleSubmit,
    setValue,
    reset,
    register,
    watch,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

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

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);

  type UbahState = {
    modal: boolean;
    data?: KFAPOV | KFAPOA;
  };
  type UbahAction = { type: "setUbah"; ubah: UbahState };
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

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah" : "Tambah");
    return ubah.modal ? "Ubah" : "Tambah";
  }, [tambahDialog, ubah.modal]);

  const judulStatus = useMemo(() => {
    return status === 0 ? "POV" : "POA";
  }, [status]);
  useEffect(() => {
    if (judulStatus === "POV") {
      setValue("type", "POV");
    } else {
      setValue("type", "POA");
    }
  }, [judulStatus]);

  const [listPOV, setListPOV] = useState<KFAPOV[]>();
  const loadPOV = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/kfa/pov/${lihat.data?.id}`);
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
      setListPOV(json?.data);
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

  const [listPOA, setListPOA] = useState<KFAPOA[]>();
  const loadPOA = async () => {
    try {
      const url = new URL(`${APIURL}/rs/kfa/poa/${POV?.id}`);
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
      setListPOA(json?.data);
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
  const [POV, setPOV] = useState<KFAPOV | null>(null);

  useEffect(() => {
    if (!lihat.modal) return;
    if (status === 0) {
      loadPOV();
    } else {
      loadPOA();
    }
  }, [meta.page, meta.perPage, deferredCari, lihat, status]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  const [sediaanOptions, setSediaanOptions] = useState<MyOptions>([]);
  const loadSediaan = async (inputText: string) => {
    try {
      const url = new URL(`${APIURL}/rs/kfa/sediaan`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const res = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await res.json();
      const options = json?.data?.map((data: { id: number; nama: string }) => ({
        value: data.id,
        label: data.nama,
      }));
      setSediaanOptions(options);
      return options;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;

    if (!ubah.data) {
      setValue("denominator", 1);
      setValue("satuan_denom", "-");
      return;
    }
    if (judulStatus === "POV") {
      setValue("id", ubah.data?.id!);
      setValue("id_bza", ubah.data?.id_bza!);
      setValue("nama", ubah.data?.nama!);
      setValue("numerator", ubah.data?.numerator!);
      setValue("denominator", ubah.data?.denominator!);
      loadSediaan(ubah.data?.nama_indo || "");
      setValue("id_sediaan", ubah.data?.id_sediaan!);
      setValue("satuan", ubah.data?.satuan!);
      setValue("satuan_denom", ubah.data?.satuan_denom!);
    } else {
      setValue("id", ubah.data?.id!);
      setValue("id_pov", (ubah.data as KFAPOA)?.id_pov!);
      setValue("nama", ubah.data?.nama!);
      setValue("merk", (ubah.data as KFAPOA)?.merk!);
    }

    return () => {
      setValue("id_sediaan", "");
    };
  }, [ubah, tambahDialog]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      let resJson: any;
      if (ubah.modal) {
        const { type, ...parsedData } = data;
        const url =
          judulStatus === "POV"
            ? `${APIURL}/rs/kfa/pov/${ubah.data?.id}`
            : `${APIURL}/rs/kfa/poa/${ubah.data?.id}`;
        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const parsedData = data as Omit<FormSchemaType, "type" | "id_jenis"> & {
          type?: string;
          id_jenis?: number;
        };
        const url =
          judulStatus === "POV"
            ? `${APIURL}/rs/kfa/pov`
            : `${APIURL}/rs/kfa/poa`;
        delete parsedData.type;
        delete parsedData.id_jenis;
        const post = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      toast.success(resJson.message);
      tutup();
      judulStatus === "POV" ? loadPOV() : loadPOA();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={lihat.modal} as={Fragment}>
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
                  "h-full w-full max-w-7xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  {status === 0 ? lihat.data?.nama : POV?.nama}
                </Dialog.Title>
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
                          <ThDiv>
                            {status === 0
                              ? "POV - Produk Obat Virtual"
                              : "POA - Produk Obat Aktual"}
                          </ThDiv>
                        </Th>
                            <Th>
                              <ThDiv>Kekuatan</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Sediaan</ThDiv>
                            </Th>
                        {status!==0 && (
                          <>
                            <Th>
                              <ThDiv>Generik</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Tipe Fornas</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Merk</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Harga Beli</ThDiv>
                            </Th>
                          </>
                        )}
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
                              <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="h-5 w-[500px] rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            {status === 0 ? (
                              <>
                                <td>
                                  <p className="h-5 w-9 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="h-5 w-32 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </>
                            ) : (
                              <td>
                                <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                              </td>
                            )}
                            <td>
                              <div className="mx-2 flex flex-nowrap items-center justify-center gap-2  ">
                                <TbEdit
                                  size="1.2rem"
                                  className="text-slate-200 dark:text-slate-400"
                                />
                                {status === 0 ? (
                                  <AiOutlineEye
                                    size="1.2rem"
                                    className="text-slate-200 dark:text-slate-400"
                                  />
                                ) : null}
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
                      ) : status === 0 ? (
                        listPOV?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>
                                {data.satuan_denom !== "-"
                                  ? data.numerator +
                                    " " +
                                    data.satuan +
                                    "/" +
                                    data.denominator +
                                    " " +
                                    data.satuan_denom
                                  : data.numerator + " " + data.satuan}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama_indo}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <div className="mx-2 flex items-center justify-center gap-2">
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
                                          size="1.2rem"
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
                                          setPOV(data);
                                          setStatus(1);
                                          setIsMutating(true);
                                        }}
                                      >
                                        <AiOutlineEye
                                          size="1.2rem"
                                          className="text-sky-600 hover:text-sky-700 active:text-sky-800"
                                        />
                                      </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content
                                      side="left"
                                      sideOffset={0}
                                      className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                    >
                                      <p>Lihat POA</p>
                                    </Tooltip.Content>
                                  </Tooltip.Root>
                                </Tooltip.Provider>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        listPOA?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i}
                          >
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.generik===true?"Generik":"Non Generik"}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.tipe}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.merk}</p>
                            </td>
                            <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                              <p>{data.harga_beli}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <div className="mx-2 flex items-center justify-center gap-2">
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
                                          size="1.2rem"
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
                <div className="mt-2 flex justify-end gap-1">
                  {status === 1 ? (
                    <Button
                      color="sky"
                      className="flex gap-2"
                      onClick={() => {
                        setStatus(0);
                        loadPOV();
                      }}
                    >
                      <IoIosArrowBack />
                      Kembali ke POV
                    </Button>
                  ) : null}
                  <Button color="red" onClick={tutup}>
                    Keluar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={ubah.modal || tambahDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              reset();
              ubah.modal
                ? ubahDispatch({
                    type: "setUbah",
                    ubah: { modal: false },
                  })
                : setTambahDialog(false);
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
                      {judul} {judulStatus} pada{" "}
                      {status === 0 ? lihat.data?.nama : POV?.nama}
                    </Dialog.Title>
                    <form
                      className={cn("mt-2 flex flex-col gap-2")}
                      onSubmit={handleSubmit(submitHandler)}
                    >
                      {judulStatus === "POV" ? (
                        <>
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
                                "basis-full",
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
                                placeholder="Nama Produk Obat Virtual"
                                {...register("nama")}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div
                              className={cn(
                                "numerator" in errors &&
                                  errors.numerator &&
                                  "rounded-b-lg rounded-t-sm bg-red-100"
                              )}
                            >
                              {"numerator" in errors && errors.numerator ? (
                                <p className="p-0.5 text-xs text-red-500">
                                  {"numerator" in errors &&
                                    errors.numerator.message}
                                </p>
                              ) : null}
                              <Input
                                type="number"
                                placeholder="Numerator"
                                {...register("numerator")}
                              />
                            </div>
                            <div
                              className={cn(
                                "satuan" in errors &&
                                  errors.satuan &&
                                  "rounded-b-lg rounded-t-sm bg-red-100"
                              )}
                            >
                              {"satuan" in errors && errors.satuan ? (
                                <p className="p-0.5 text-xs text-red-500">
                                  {"satuan" in errors && errors.satuan.message}
                                </p>
                              ) : null}
                              <Input
                                placeholder="Satuan"
                                {...register("satuan")}
                              />
                            </div>
                            <div
                              className={cn(
                                "denominator" in errors &&
                                  errors.denominator &&
                                  "rounded-b-lg rounded-t-sm bg-red-100"
                              )}
                            >
                              {"denominator" in errors && errors.denominator ? (
                                <p className="p-0.5 text-xs text-red-500">
                                  {"denominator" in errors &&
                                    errors.denominator.message}
                                </p>
                              ) : null}
                              <Input
                                type="number"
                                placeholder="Denominator"
                                {...register("denominator")}
                              />
                            </div>
                            <div
                              className={cn(
                                "satuan_denom" in errors &&
                                  errors.satuan_denom &&
                                  "rounded-b-lg rounded-t-sm bg-red-100"
                              )}
                            >
                              {"satuan_denom" in errors &&
                              errors.satuan_denom ? (
                                <p className="p-0.5 text-xs text-red-500">
                                  {"satuan_denom" in errors &&
                                    errors.satuan_denom.message}
                                </p>
                              ) : null}
                              <Input
                                placeholder="Satuan Denominator"
                                {...register("satuan_denom")}
                              />
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-full",
                              "id_sediaan" in errors &&
                                errors.id_sediaan &&
                                "rounded-b-sm rounded-t-lg bg-red-100"
                            )}
                          >
                            <Controller
                              control={control}
                              name="id_sediaan"
                              render={({ field: { onChange, value } }) => {
                                return (
                                  <AsyncSelectInput
                                    isDisabled={!tambahDialog}
                                    cacheOptions
                                    loadOptions={loadSediaan}
                                    defaultOptions={sediaanOptions}
                                    value={sediaanOptions?.find(
                                      (val) => val.value === value
                                    )}
                                    onChange={(option: MyOption | null) =>
                                      onChange(option?.value)
                                    }
                                    onMenuOpen={() =>
                                      tambahDialog ? loadSediaan("") : null
                                    }
                                    placeholder="Pilih Sediaan"
                                    menuPosition="fixed"
                                    menuPortalTarget={
                                      typeof window !== "undefined"
                                        ? document.body
                                        : null
                                    }
                                    maxMenuHeight={150}
                                  />
                                );
                              }}
                            />
                            {"id_sediaan" in errors && errors.id_sediaan ? (
                              <p className="pr-0.5 text-end text-xs text-red-500">
                                {"id_sediaan" in errors &&
                                  errors.id_sediaan.message}
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div
                            className={cn(
                              "w-36",
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
                              placeholder="Nama Produk Obat Virtual"
                              {...register("nama")}
                            />
                          </div>
                          <div
                            className={cn(
                              "w-full",
                              "merk" in errors &&
                                errors.merk &&
                                "rounded-b-lg rounded-t-sm bg-red-100"
                            )}
                          >
                            {"merk" in errors && errors.merk ? (
                              <p className="p-0.5 text-xs text-red-500">
                                {"merk" in errors && errors.merk.message}
                              </p>
                            ) : null}
                            <Input placeholder="Merk" {...register("merk")} />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-1">
                        <Button
                          type="submit"
                          color={ubah.modal ? "cyan100" : "green100"}
                        >
                          {judul}
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            reset();
                            ubah.modal
                              ? ubahDispatch({
                                  type: "setUbah",
                                  ubah: { modal: false },
                                })
                              : setTambahDialog(false);
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </Dialog>
    </Transition>
  );
}
