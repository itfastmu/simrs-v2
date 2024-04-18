"use client";

import { APIURL } from "@/lib/connection";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import Cookies from "js-cookie";
import { cn, getAgeThn } from "@/lib/utils";
import React, {
  Fragment,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { RiArrowDropDownLine, RiFileUserLine } from "react-icons/ri";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Dialog, Menu, Tab, Transition } from "@headlessui/react";
import PasienBaruDialog from "./_components/pasien";
import { TbEdit, TbTrash } from "react-icons/tb";
import { PiBed, PiNotebook } from "react-icons/pi";
import { Tooltip } from "@/components/tooltip";
import { Input } from "@/components/form";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import {
  Booking,
  BookingSchema,
  Ranap,
  RanapSchema,
  MasterPasien,
} from "@/app/(pendaftaran)/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { JadwalDokter } from "../jadwal-dokter/page";
import { CaraBayar } from "@/app/(referensi)/list-carabayar/page";
import { Klinik } from "@/app/(referensi)/list-klinik/page";
import { useRouter } from "next/navigation";
import { Bed } from "@/app/(referensi)/list-kamar/page";
import { z } from "zod";

export type UbahState = {
  modal: boolean;
  data?: MasterPasien;
};
export type UbahAction = { type: "setUbah"; ubah: UbahState };

type BookingState = {
  modal: boolean;
  data?: MasterPasien;
};
type BookingAction = { type: "setBooking"; booking: BookingState };

type RanapState = {
  modal: boolean;
  data?: MasterPasien;
};
type RanapAction = { type: "setRanap"; ranap: RanapState };

export default function MasterPasien() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<MasterPasien[]>([]);

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

  const bookingState = {
    modal: false,
    data: undefined,
  };
  const bookingActs = (state: BookingState, action: BookingAction) => {
    switch (action.type) {
      case "setBooking": {
        return {
          ...action.booking,
        };
      }
    }
  };
  const [booking, bookingDispatch] = useReducer(bookingActs, bookingState);

  const ranapState = {
    modal: false,
    data: undefined,
  };
  const ranapActs = (state: RanapState, action: RanapAction) => {
    switch (action.type) {
      case "setRanap": {
        return {
          ...action.ranap,
        };
      }
    }
  };
  const [ranap, ranapDispatch] = useReducer(ranapActs, ranapState);

  const [dialog, setDialog] = useState<boolean>(false);
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
    data?: Pick<MasterPasien, "id" | "nama">;
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
      // const hapusPasien = await fetch(`${APIURL}/pasien/${hapus.data?.id}`, {
      //   method: "DELETE",
      //   headers: headers,
      // });
      // const data = await hapusPasien.json();
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      // toast.success(data?.message);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const [isMutating, setIsMutating] = useState<boolean>(false);

  const loadData = async (signal?: AbortSignal) => {
    try {
      setIsMutating(true);
      tableDivRef.current?.scrollTo(0, 0);
      const url = new URL(`${APIURL}/rs/pasien`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const fetchData = await fetch(url, {
        method: "GET",
        headers: headers,
        signal: signal,
      });
      const data = await fetchData.json();
      // console.log(data);
      if (data.status !== "Ok") throw new Error(data.message);
      setDataList(data?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(data?.page.page),
          perPage: parseInt(data?.page.perPage),
          lastPage: parseInt(data?.page.lastPage),
          total: parseInt(data?.page.total),
        },
      });
      setIsMutating(false);
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") return;
      if (error.message === "Tidak ada pasien") return setIsMutating(false);
      console.error(error);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          ...meta,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
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
            <div className="flex items-center">
              <RiFileUserLine
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Master Pasien
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
              {/* <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button
                    className={cn(
                      "inline-flex rounded p-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                      "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                      "flex h-fit px-4 py-[7px]"
                    )}
                  >
                    Master Data
                    <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-30 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                    <div className="p-0.5 ">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={cn(
                              "flex w-full items-center rounded-md px-2 py-2 text-sm",
                              active
                                ? "bg-slate-200 text-sky-600"
                                : "text-gray-900 dark:text-slate-100"
                            )}
                            onClick={() => false}
                          >
                            Pendidikan
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu> */}
            </div>
            <div className="flex items-baseline gap-2">
              <Button
                className="h-fit px-5 py-[7px]"
                color="slatesky"
                onClick={() => setDialog(true)}
              >
                Tambah
              </Button>
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
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <PiNotebook
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <PiBed
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <button
                            type="button"
                            className="text-lg text-slate-200 dark:text-slate-400"
                          >
                            SEP
                          </button>
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
                ) : (
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
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
                          {" (" + getAgeThn(new Date(data.tanggal_lahir)) + ")"}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.alamat}</p>
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
                                  onClick={() =>
                                    bookingDispatch({
                                      type: "setBooking",
                                      booking: {
                                        modal: true,
                                        data: data,
                                      },
                                    })
                                  }
                                >
                                  <PiNotebook
                                    size="1.5rem"
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800"
                                  />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Registrasi Rawat Jalan</p>
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
                                    ranapDispatch({
                                      type: "setRanap",
                                      ranap: {
                                        modal: true,
                                        data: data,
                                      },
                                    })
                                  }
                                >
                                  <PiBed
                                    size="1.5rem"
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800"
                                  />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Rawat Inap Pasien</p>
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
                                  className="text-lg text-green-500 hover:text-green-600 focus:outline-none active:text-green-700"
                                  onClick={() => router.push(`/sep/${data.id}`)}
                                >
                                  SEP
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>SEP Pasien</p>
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
                                <p>Ubah Pasien</p>
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
                                <p>Hapus Pasien</p>
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

      <BookingDialog booking={booking} bookingDispatch={bookingDispatch} />
      <RanapDialog ranap={ranap} ranapDispatch={ranapDispatch} />

      <PasienBaruDialog
        dialog={dialog}
        setDialog={setDialog}
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
                    Hapus Pasien
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Pasien atas nama {hapus.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red100" onClick={handleHapus}>
                      Hapus Pasien
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

const BookingDialog = ({
  booking,
  bookingDispatch,
}: {
  booking: BookingState;
  bookingDispatch: React.Dispatch<BookingAction>;
}) => {
  const tutup = () => {
    bookingDispatch({
      type: "setBooking",
      booking: { modal: false, data: booking.data },
    });
    reset();
    setListJadwal([]);
    setSelKlinik(null);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [menues] = useState(["Klinik", "Fisioterapi", "HD", "MCU"]);
  const [tabIdx, setTabIdx] = useState(0);

  const BookingRajalSchema = BookingSchema.merge(
    z.object({
      type: z.literal(0),
    })
  );

  const BookingFisioSchema = BookingSchema.omit({ id_jadwal: true }).merge(
    z.object({
      type: z.literal(1),
    })
  );

  const BookingHDSchema = BookingSchema.omit({ id_jadwal: true }).merge(
    z.object({
      type: z.literal(2),
    })
  );

  const BookingMCUSchema = BookingSchema.omit({
    id_jadwal: true,
    id_asuransi: true,
  }).merge(
    z.object({
      type: z.literal(3),
    })
  );

  const FormSchema = z.discriminatedUnion("type", [
    BookingRajalSchema,
    BookingFisioSchema,
    BookingHDSchema,
    BookingMCUSchema,
  ]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: 0,
    },
  });

  useEffect(() => {
    setValue(
      "type",
      tabIdx === 0 ? 0 : tabIdx === 1 ? 1 : tabIdx === 2 ? 2 : 3
    );
  }, [tabIdx]);

  const tanggal = watch("tanggal");

  const [listKlinik, setListKlinik] = useState<MyOptions>([]);
  const [selKlinik, setSelKlinik] = useState<MyOption | null>(null);
  const getKlinik = async () => {
    const resp = await fetch(`${APIURL}/rs/klinik`, {
      method: "GET",
      headers: headers,
    });
    const json = await resp.json();
    let data = json.data.map((data: Klinik) => {
      const option = {
        value: data?.id,
        label: data?.nama,
      };
      return option;
    });
    setListKlinik(data);
  };

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

  const [listJadwal, setListJadwal] = useState<JadwalDokter[]>([]);
  const getJadwal = async () => {
    if (!selKlinik?.value || !tanggal) return;
    const url = new URL(`${APIURL}/rs/jadwal/klinik/${selKlinik?.value}`);
    const params = {
      tanggal: tanggal,
    };
    url.search = new URLSearchParams(params as any).toString();
    const resp = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const data = await resp.json();
    const jadwal: JadwalDokter[] = data.data;
    setListJadwal(
      jadwal?.sort(
        (val1, val2) =>
          parseInt(val1.mulai?.slice(0, 2)) - parseInt(val2.mulai?.slice(0, 2))
      ) || []
    );
  };
  useEffect(() => {
    getJadwal();
  }, [selKlinik, tanggal]);

  useEffect(() => {
    if (!booking.modal) return;
    getKlinik();
    loadCaraBayar();
    setValue("id_pasien", booking.data?.id!);
    // setValue("id_jadwal", 5);
    setValue("tanggal", new Date().toLocaleDateString("fr-CA"));

    return () => {
      setValue("id_asuransi", NaN);
    };
  }, [booking.modal]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      const { type, ...parsedData } = data;
      e?.preventDefault();
      const url =
        tabIdx === 0
          ? `${APIURL}/rs/kunjungan/rajal`
          : tabIdx === 1
          ? `${APIURL}/rs/kunjungan/fisioterapi`
          : tabIdx === 2
          ? `${APIURL}/rs/kunjungan/hd`
          : tabIdx === 3
          ? `${APIURL}/rs/kunjungan/mcu`
          : "";
      const post = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(parsedData),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      tutup();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={booking.modal} as={Fragment}>
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
                <Tab.Group
                  selectedIndex={tabIdx}
                  onChange={(index) => {
                    setTabIdx(index);
                  }}
                >
                  <Tab.List className="mb-1 flex max-w-sm space-x-0.5 rounded-md bg-gray-900/20 p-0.5 dark:bg-slate-600">
                    {menues.map((menu) => (
                      <Tab
                        className={cn(
                          "w-full rounded py-1.5 text-sm leading-5 text-gray-700 focus:outline-none ui-selected:bg-white ui-selected:shadow ui-not-selected:hover:bg-white/[0.12] dark:text-slate-50 ui-selected:dark:bg-slate-800 ui-not-selected:dark:hover:bg-slate-700"
                        )}
                        key={menu}
                      >
                        {menu}
                      </Tab>
                    ))}
                  </Tab.List>
                </Tab.Group>
                <div className="max-w-sm rounded-sm border border-slate-200 py-1.5 text-center">
                  <p>{booking.data?.nama}</p>
                </div>
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className="mt-2 flex flex-col gap-2">
                    <div
                      className={cn(
                        "grid max-w-sm",
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
                      <Input id="tgl" type="date" {...register("tanggal")} />
                    </div>
                    <Transition
                      show={tabIdx === 0}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <div className={cn("grid max-w-sm")}>
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="poli"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Poliklinik
                          </label>
                        </div>
                        <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          onChange={(option: unknown) =>
                            setSelKlinik(option as MyOption | null)
                          }
                          options={listKlinik}
                          value={selKlinik}
                          placeholder="Pilih Poliklinik"
                        />
                      </div>
                    </Transition>
                    <Transition
                      show={tabIdx !== 3}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <div
                        className={cn(
                          "grid max-w-sm",
                          "id_asuransi" in errors &&
                            errors.id_asuransi &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="id_asuransi"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Cara Bayar
                          </label>
                          {"id_asuransi" in errors && errors.id_asuransi ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {"id_asuransi" in errors &&
                                errors.id_asuransi.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_asuransi"
                          render={({ field: { onChange, value } }) => (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={caraBayarOptions}
                              value={caraBayarOptions.find(
                                (c: any) => c.value === value
                              )}
                              placeholder="Pilih Cara Bayar"
                            />
                          )}
                        />
                      </div>
                    </Transition>
                    <Transition
                      show={tabIdx === 0}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <div
                        className={cn(
                          "flex max-w-sm flex-col",
                          "id_jadwal" in errors &&
                            errors.id_jadwal &&
                            "rounded-lg bg-red-100"
                        )}
                      >
                        {"id_jadwal" in errors && errors.id_jadwal ? (
                          <p className="pr-0.5 pt-1 text-end text-xs text-red-500">
                            {"id_jadwal" in errors && errors.id_jadwal.message}
                          </p>
                        ) : null}
                        {listJadwal?.map((jadwal, idx) => (
                          <div
                            className={cn(
                              idx + 1 !== listJadwal?.length ? "my-1" : "mt-1"
                            )}
                            key={idx}
                          >
                            <input
                              type="radio"
                              id={"jadwal-" + idx}
                              className="peer hidden"
                              value={jadwal.id}
                              checked={watch("id_jadwal") === jadwal.id}
                              onChange={() => setValue("id_jadwal", jadwal.id)}
                            />
                            <label
                              htmlFor={"jadwal-" + idx}
                              className="block cursor-pointer rounded bg-green-100 px-3 py-2 shadow-md hover:bg-green-200 peer-checked:bg-green-500 peer-checked:text-white dark:bg-blue-900 dark:hover:bg-blue-800 dark:peer-checked:bg-blue-400"
                            >
                              <p className="text-md">{jadwal?.nama}</p>
                              <p className="text-sm">{jadwal?.klinik}</p>
                              <div className="mt-1.5 flex justify-between">
                                <p className="text-sm">{`${jadwal?.mulai?.slice(
                                  0,
                                  5
                                )} - ${jadwal?.selesai?.slice(0, 5)}`}</p>
                              </div>
                            </label>
                          </div>
                        ))}
                        {listJadwal.length === 0 ? (
                          <p className="p-2 text-center text-sm">
                            Jadwal belum ditemukan
                          </p>
                        ) : null}
                      </div>
                    </Transition>
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
      </Dialog>
    </Transition>
  );
};

const RanapDialog = ({
  ranap,
  ranapDispatch,
}: {
  ranap: RanapState;
  ranapDispatch: React.Dispatch<RanapAction>;
}) => {
  const tutup = () => {
    ranapDispatch({
      type: "setRanap",
      ranap: { modal: false, data: ranap.data },
    });
    reset();
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    trigger,
    control,
    formState: { errors },
  } = useForm<Ranap>({
    resolver: zodResolver(RanapSchema),
  });

  const tanggal = watch("tanggal");

  const [caraBayarOptions, setCaraBayarOptions] = useState<MyOptions>([]);
  const [listKelas, setListKelas] = useState<MyOptions>([
    { label: "VVIP", value: 1 },
    { label: "VIP", value: 2 },
    { label: "Kelas 1", value: 3 },
  ]);
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

  // const [selKamar, setSelKamar] = useState<MyOption | null>(null);
  const [kamarOptions, setKamarOptions] = useState<MyOptions>([]);
  const loadKamar = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/kamar`);
      const params = {
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: any) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setKamarOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // useEffect(() => {
  //   loadBed("");
  // }, [selKamar]);
  const [bedOptions, setBedOptions] = useState<MyOptions>([]);
  const loadBed = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/kamar/bed`);
      const params = {
        keyword: inputText,
        tanggal: new Date().toLocaleDateString("fr-CA"),
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: Bed) => ({
        value: data?.id,
        label: data?.kamar,
      }));
      setBedOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    if (!ranap.modal) return;
    loadCaraBayar();
    loadKamar("");
    loadBed("");
    setValue("id_pasien", ranap.data?.id!);
    setValue("status", "booking");
    setValue("tanggal", new Date().toLocaleDateString("fr-CA"));

    return () => {
      setValue("id_asuransi", NaN);
      setValue("id_kelas", NaN);
      setValue("id_kamar", NaN);
      setValue("id_bed", NaN);
    };
  }, [ranap.modal]);

  // console.log(errors);

  const submitHandler: SubmitHandler<Ranap> = async (data, e) => {
    try {
      e?.preventDefault();
      const post = await fetch(`${APIURL}/rs/kunjungan/ranap`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      tutup();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={ranap.modal} as={Fragment}>
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
                <div className="max-w-xs rounded-sm border border-slate-200 py-1.5 text-center">
                  <p>{ranap.data?.nama}</p>
                </div>
                <form onSubmit={handleSubmit(submitHandler)}>
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
                      <Input id="tgl" type="date" {...register("tanggal")} />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.id_asuransi && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_asuransi"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Cara Bayar
                        </label>
                        {errors.id_asuransi ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_asuransi.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_asuransi"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={caraBayarOptions}
                            value={caraBayarOptions.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Cara Bayar"
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.id_kelas && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_kelas"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kelas
                        </label>
                        {errors.id_kelas ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_kelas.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_kelas"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={listKelas}
                            value={listKelas.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Kelas"
                          />
                        )}
                      />
                    </div>

                    <div className={cn("grid max-w-xs")}>
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="kamar"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kamar
                        </label>
                      </div>
                      <Controller
                        control={control}
                        name="id_kamar"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadKamar}
                            defaultOptions={kamarOptions}
                            value={kamarOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) => {
                              onChange(option?.value);
                            }}
                            placeholder="Pilih Kamar"
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.id_bed && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_bed"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Bed
                        </label>
                        {errors.id_bed ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_bed.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_bed"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadBed}
                            defaultOptions={bedOptions}
                            value={bedOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) => {
                              onChange(option?.value);
                            }}
                            placeholder="Pilih Bed"
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.keterangan && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="ket"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Keterangan
                        </label>
                        {errors.keterangan ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.keterangan.message}
                          </p>
                        ) : null}
                      </div>
                      <Input id="ket" {...register("keterangan")} />
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
      </Dialog>
    </Transition>
  );
};
