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
import { TbEdit, TbTrash } from "react-icons/tb";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { Input } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { Pegawai } from "@/app/(pegawai)/schema";

// type JadwalDokter = {
//   deleted: string;
//   kd_dokter: string;
//   nama: string;
//   spesial: string;
//   kd_sps: string;
//   id: number;
//   tanggal: string;
//   hari: number;
//   mulai: string;
//   selesai: string;
//   kd_poli: string;
//   kuota: number;
//   nm_poli: string;
//   registrasi: number;
//   registrasilama: number;
//   poli_aktif: string;
//   terisi: number;
// };

export type JadwalDokter = {
  id: number;
  id_klinik: number;
  tanggal: Date;
  mulai: string;
  selesai: string;
  deleted: boolean;
  id_pegawai: string;
  kuota: number;
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  email: string;
  status_kepegawaian: string;
  ibu: string;
  nakes: boolean;
  aktif: boolean;
  id_profesi: number;
  jenis_kelamin: string;
  agama: string;
  klinik: string;
};

type UbahState = {
  modal: boolean;
  data?: JadwalDokter;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function JadwalDokter() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<JadwalDokter[]>([]);

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
      tanggal?: string;
      jam?: string;
    };
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: {
      id: undefined,
      nama: undefined,
      tanggal: undefined,
      jam: undefined,
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
      const resp = await fetch(`${APIURL}/rs/jadwal/${hapus.data?.id}`, {
        method: "DELETE",
        headers: headers,
      });
      const data = await resp.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
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
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/jadwal`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        // cari: deferredCari,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const listJadwal = await data.json();
      if (listJadwal.status !== "Ok") throw new Error(listJadwal.message);
      // console.log(listJadwal);
      setDataList(listJadwal?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(listJadwal?.page.page),
          perPage: parseInt(listJadwal?.page.perPage),
          lastPage: parseInt(listJadwal?.page.lastPage),
          total: parseInt(listJadwal?.page.total),
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
    // console.log(meta);
    // console.log(filter);
  }, [meta.page, meta.perPage, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <AiOutlineSchedule
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Jadwal Dokter
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
                {/* <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                >
                  Salin
                </Button> */}
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
                    <ThDiv>Tanggal</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Dokter</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Hari</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Jam Praktik</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Kuota</ThDiv>
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
                      <td className="h-[56.5px]">
                        <p className="mx-auto h-6 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-16 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-28 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-6 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p className="mx-auto w-fit rounded-sm bg-slate-700 px-2 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {new Intl.DateTimeFormat("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(data.tanggal))}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.nama}
                        </p>
                        <p className="font-light">{data.klinik}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>
                          {new Intl.DateTimeFormat("id-ID", {
                            weekday: "long",
                          }).format(new Date(data.tanggal))}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p className="tracking-wide">
                          {data.mulai?.slice(0, 5) +
                            ` - ` +
                            data.selesai?.slice(0, 5)}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.kuota}</p>
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
                                <p>Ubah Jadwal</p>
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
                                          tanggal: new Intl.DateTimeFormat(
                                            "id-ID",
                                            {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            }
                                          ).format(new Date(data.tanggal)),
                                          jam:
                                            data.mulai?.slice(0, 5) +
                                            ` - ` +
                                            data.selesai?.slice(0, 5),
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
                                <p>Hapus Jadwal</p>
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

      <JadwalDialog
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
                    className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                  >
                    Hapus Jadwal
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Praktik {hapus.data?.nama} pada tanggal{" "}
                      {hapus.data?.tanggal} pukul {hapus.data?.jam}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Hapus Jadwal
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

type JadwalDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadData: () => Promise<void>;
};

const JadwalDialog = ({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
}: JadwalDialogProps) => {
  const JadwalSchema = z.object({
    jadwal: z.object({
      tanggal: z.string().min(1, "harus diisi"),
      id_pegawai: z.string({ required_error: "harus dipilih" }),
      id_klinik: z.number({
        required_error: "harus dipilih",
        invalid_type_error: "harus dipilih",
      }),
      mulai: z.string().min(1, "harus diisi"),
      selesai: z.string().min(1, "harus diisi"),
      kuota: z.number({
        required_error: "harus diisi",
        invalid_type_error: "harus diisi angka",
      }),
    }),
  });
  const JadwalArrSchema = JadwalSchema.array();
  const UnionJadwalSchema = z.union([JadwalSchema, JadwalArrSchema]);

  type Jadwal = z.infer<typeof JadwalSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<Jadwal>({
    resolver: zodResolver(JadwalSchema),
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
    setJudulLama(ubah.modal ? "Ubah Jadwal" : "Tambah Jadwal");
    return ubah.modal ? "Ubah Jadwal" : "Tambah Jadwal";
  }, [tambahDialog, ubah.modal]);

  const [listDokter, setListDokter] = useState<MyOptions>([]);
  const getDokter = async () => {
    try {
      const res = await fetch(`${APIURL}/rs/dokter`, {
        method: "GET",
        headers: headers,
      });
      const json = await res.json();
      setListDokter(
        json?.data?.map((data: Pegawai) => {
          const option: MyOption = {
            value: data.id,
            label: data.nama,
          };
          return option;
        }) || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  type Klinik = { id: number; nama: string; aktif: boolean };

  const [listKlinik, setListKlinik] = useState<MyOptions>([]);
  const getKlinik = async () => {
    const res = await fetch(`${APIURL}/rs/klinik`, {
      method: "GET",
      headers: headers,
    });
    const json = await res.json();
    setListKlinik(
      json?.data?.map((data: Klinik) => {
        const option: MyOption = {
          value: data.id,
          label: data.nama,
        };
        return option;
      }) || []
    );
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    getDokter();
    getKlinik();
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
    setValue(
      "jadwal.tanggal",
      new Date(ubah.data?.tanggal || new Date()).toLocaleDateString("fr-CA")
    );
    setValue("jadwal.id_pegawai", ubah.data?.id_pegawai!);
    setValue("jadwal.id_klinik", ubah.data?.id_klinik!);
    setValue("jadwal.mulai", ubah.data?.mulai!);
    setValue("jadwal.selesai", ubah.data?.selesai!);
    setValue("jadwal.kuota", ubah.data?.kuota!);

    return () => {
      setValue("jadwal.id_pegawai", "");
      setValue("jadwal.id_klinik", NaN);
    };
  }, [ubah.data]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitHandler: SubmitHandler<Jadwal> = async (data, e) => {
    try {
      e?.preventDefault();
      setIsLoading(true);
      if (ubah.modal) {
        const put = await fetch(`${APIURL}/rs/jadwal/${ubah.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/jadwal`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData();
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
    } finally {
      setIsLoading(false);
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
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className="mt-2 flex flex-col gap-2">
                    <div
                      className={cn(
                        "max-w-xs",
                        errors.jadwal?.tanggal && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="tgl"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Tanggal
                        </label>
                        {errors.jadwal?.tanggal ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.jadwal?.tanggal.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        id="tgl"
                        type="date"
                        {...register("jadwal.tanggal")}
                      />
                    </div>
                    <div
                      className={cn(
                        "max-w-xs",
                        errors.jadwal?.id_pegawai && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Dokter
                        </label>
                        {errors.jadwal?.id_pegawai ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.jadwal?.id_pegawai.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="jadwal.id_pegawai"
                        // {...register("dokter.kode")}
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={listDokter}
                            value={listDokter.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Dokter"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        "max-w-xs",
                        errors.jadwal?.id_klinik && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Poliklinik
                        </label>
                        {errors.jadwal?.id_klinik ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.jadwal?.id_klinik.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="jadwal.id_klinik"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={listKlinik}
                            value={listKlinik.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Poliklinik"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        "max-w-xs",
                        (errors.jadwal?.mulai || errors.jadwal?.selesai) &&
                          "rounded-lg bg-red-100"
                      )}
                    >
                      <label
                        htmlFor="jam"
                        className="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Jam Praktik
                      </label>
                      <div
                        className={cn(
                          (errors.jadwal?.mulai || errors.jadwal?.selesai) &&
                            "-mt-1 flex"
                        )}
                      >
                        {errors.jadwal?.mulai ? (
                          <p className="w-full pr-0.5 text-end text-xs text-red-500">
                            {errors.jadwal?.mulai.message}
                          </p>
                        ) : null}
                        {errors.jadwal?.selesai ? (
                          <p className="w-full pr-0.5 text-end text-xs text-red-500">
                            {errors.jadwal?.selesai.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          id="jam"
                          type="time"
                          {...register("jadwal.mulai")}
                        />
                        <Input
                          id="jam0"
                          type="time"
                          {...register("jadwal.selesai")}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.jadwal?.kuota && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="kuota"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kuota
                        </label>
                        {errors.jadwal?.kuota ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.jadwal?.kuota.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        id="kuota"
                        className="w-20"
                        type="number"
                        min={0}
                        {...register("jadwal.kuota", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      loading={isLoading}
                      color={judul === "Tambah Jadwal" ? "green100" : "cyan100"}
                    >
                      {judul}
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
