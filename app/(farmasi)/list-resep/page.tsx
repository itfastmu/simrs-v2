"use client";

import {
  InputSearch,
  PerPage,
  Pagination,
  Th,
  ThDiv,
} from "@/components/table";
import { APIURL } from "@/lib/connection";
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
import { TbEdit, TbTrash } from "react-icons/tb";
import { ArrayElementType, cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { Input, InputArea, LabelButton } from "@/components/form";
import { Tooltip } from "@/components/tooltip";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { Barang, Resep, ObatResep, KFAPOA } from "../schema";
import { IoDocumentTextOutline } from "react-icons/io5";
import { asuransi } from "@/app/(rawatJalan)/asesmen/schema";
import { FaCheck, FaPrescriptionBottle } from "react-icons/fa6";
import ResepDialog from "./_components/resep";

const SupplierSchema = z.object({
  nama: z.string().min(1, "harus diisi"),
  alamat: z.string().min(1, "harus diisi"),
  hp: z.string().min(1, "harus diisi"),
  //   tipe: z.string().min(1, "harus diisi"),
  tipe: z.string(),
});

type SupplierSch = z.infer<typeof SupplierSchema>;

export type ValidResepState = {
  modal: boolean;
  data?: Resep;
};
type ValidResepAction = { type: "setValidResep"; validResep: ValidResepState };
export type ResepAction = { type: "setResep"; resep: ValidResepState };

export default function Resep() {
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
  const [dataList, setDataList] = useState<Resep[]>([]);

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);
  const validResepState = {
    modal: false,
  };
  const validResepActs = (state: ValidResepState, action: ValidResepAction) => {
    switch (action.type) {
      case "setValidResep": {
        return {
          ...action.validResep,
        };
      }
    }
  };
  const [validResep, validResepDispatch] = useReducer(
    validResepActs,
    validResepState
  );

  const resepState = {
    modal: false,
  };
  const resepActs = (state: ValidResepState, action: ResepAction) => {
    switch (action.type) {
      case "setResep": {
        return {
          ...action.resep,
        };
      }
    }
  };
  const [resep, resepDispatch] = useReducer(resepActs, resepState);

  type HapusState = {
    modal: boolean;
    data?: Resep;
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
      const hapusSupplier = await fetch(
        `${APIURL}/rs/supplier/${hapus.data?.id_kunjungan}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      const data = await hapusSupplier.json();
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
      const url = new URL(`${APIURL}/rs/farmasi/resep`);
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
      setDataList(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page?.page),
          perPage: parseInt(json?.page?.perPage),
          lastPage: parseInt(json?.page?.lastPage),
          total: parseInt(json?.page?.total),
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
      // toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [meta.page, meta.perPage, memoizedTanggal, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <HiOutlineDocumentText
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Resep Pasien
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
                {/* <Button
                  className="h-fit px-4 py-[7px]"
                  color="slatesky"
                  onClick={() => setTambahDialog(true)}
                >
                  Tambah
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
                    <ThDiv>Dokter</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Cara Bayar</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Proses</ThDiv>
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
                        <p className="mx-auto h-[32px] w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-44 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded-xl bg-slate-200 px-2.5 py-1 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <IoDocumentTextOutline
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <FaPrescriptionBottle
                            size="1.3rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : meta.total === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={8}>
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
                        <p>
                          {new Intl.DateTimeFormat("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(data.tanggal))}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.dokter}
                        </p>
                        <p className="font-light">{data.klinik}</p>
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
                      <td className="border-b border-slate-200 text-center text-[10px]/[12px] dark:border-gray-700">
                        <p className="mx-auto w-fit rounded-xl bg-slate-400 px-2.5 py-1 text-gray-800">
                          {data.proses}
                        </p>
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
                                  className="relative focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={data.proses !== "Belum divalidasi"}
                                  onClick={() => {
                                    validResepDispatch({
                                      type: "setValidResep",
                                      validResep: {
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
                                  {data.proses !== "Belum divalidasi" ? (
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
                                <p>Validasi</p>
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
                                  disabled={data.proses === "Belum divalidasi"}
                                  className="relative focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => {
                                    resepDispatch({
                                      type: "setResep",
                                      resep: {
                                        modal: true,
                                        data: data,
                                      },
                                    });
                                  }}
                                >
                                  <FaPrescriptionBottle
                                    size="1.3rem"
                                    className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                  />
                                  {data.proses === "Obat diserahkan" ? (
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
                                <p>Resep</p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                          {/* <Tooltip.Provider
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
                                <p>Ubah Resep</p>
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
                                <p>Hapus Resep</p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider> */}
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

      <TelaahDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        validResep={validResep}
        validResepDispatch={validResepDispatch}
        loadData={loadData}
      />

      <ResepDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        resep={resep}
        resepDispatch={resepDispatch}
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
                    Hapus Resep
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Nonaktifkan {hapus.data?.nama}
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

type TelaahDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  validResep: ValidResepState;
  validResepDispatch: React.Dispatch<ValidResepAction>;
  loadData: () => Promise<void>;
};

const TelaahDialog = ({
  tambahDialog,
  setTambahDialog,
  validResep,
  validResepDispatch,
  loadData,
}: TelaahDialogProps) => {
  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : validResepDispatch({
          type: "setValidResep",
          validResep: {
            modal: false,
          },
        });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [aspekAdministratif] = useState<
    {
      name: "identitas" | "ruangRawat" | "pembiayaan" | "tanggal" | "dokter";
      label: string;
    }[]
  >([
    { name: "identitas", label: "Kesesuaian identitas" },
    { name: "ruangRawat", label: "Ruang rawat" },
    { name: "pembiayaan", label: "Status pembiayaan" },
    { name: "tanggal", label: "Tanggal resep" },
    { name: "dokter", label: "Identitas dokter penulis resep" },
  ]);
  const [aspekFarmasetik] = useState<
    {
      name: "obat" | "sediaan" | "jumlah" | "instruksi" | "stabilitas";
      label: string;
    }[]
  >([
    { name: "obat", label: "Nama obat" },
    { name: "sediaan", label: "Bentuk dan kekuatan sediaan" },
    { name: "jumlah", label: "Jumlah obat" },
    {
      name: "instruksi",
      label: "Instruksi cara pembuatan (jika diperlukan peracikan)",
    },
    { name: "stabilitas", label: "Stabilitas dan inkompabilitas sediaan" },
  ]);
  const [aspekKlinis] = useState<
    {
      name:
        | "ketepatan"
        | "duplikasi"
        | "alergi"
        | "interaksi"
        | "formularium"
        | "fisiologis"
        | "kontraindikasi";
      label: string;
    }[]
  >([
    {
      name: "ketepatan",
      label:
        "Ketepatan identitas pasien, obat, dosis, frekuensi, aturan pakai dan waktu pemberian",
    },
    { name: "duplikasi", label: "Tidak ada duplikasi pengobatan" },
    {
      name: "alergi",
      label: "Tidak ada potensi alergi atau hipersensitivitas",
    },
    {
      name: "interaksi",
      label:
        "Tidak ada interaksi antara obat dan obat lain atau dengan makanan",
    },
    {
      name: "formularium",
      label:
        "Variasi kriteria penggunaan dari rumah sakit (membandingkan dengan PPK dan Formularium Nasional)",
    },
    {
      name: "fisiologis",
      label: "Berat badan pasien dan atau informasi fisiologis lainnya",
    },
    { name: "kontraindikasi", label: "Tidak ada kontraindikasi" },
  ]);

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!validResep.modal && !tambahDialog) return judulLama;
    setJudulLama(validResep.modal ? "Ubah Resep" : "Tambah Resep");
    return validResep.modal ? "Ubah Resep" : "Tambah Resep";
  }, [tambahDialog, validResep.modal]);

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
  const tableDivRef = useRef<HTMLDivElement>(null);

  const [resepPasien, setResepPasien] = useState<ObatResep>();
  useEffect(() => {
    if (!validResep.modal) return;
    setValue("id_kunjungan", validResep.data?.id_kunjungan!);

    const loadResep = async () => {
      try {
        const url = `${APIURL}/rs/farmasi/resep/${validResep.data?.id_kunjungan}`;
        const resp = await fetch(url, { method: "GET", headers: headers });
        const json = await resp.json();
        if (json.status !== "Ok") throw new Error(json.message);
        // console.log(json);
        const data: ObatResep = json?.data;
        setResepPasien(data);
        for (const nonracik of data.nonracik) {
          let obat = watch("obat") || [];
          if (obat?.find((val) => val.id_poa === nonracik.id_poa)) {
            /* SAMA */
            const index = obat.findIndex(
              (val) => val.id_poa === nonracik.id_poa
            );
            obat[index].jumlah += nonracik.jumlah;
            setValue("obat", [...obat]);
          } else {
            obat.push({
              id_poa: nonracik.id_poa,
              nama: nonracik.nama_obat,
              jumlah: nonracik.jumlah,
            });
            setValue("obat", [...obat]);
          }
        }
        data.racik.forEach((racik) => {
          if (racik.detail)
            for (const detail of racik.detail) {
              let obat = watch("obat") || [];
              if (obat?.find((val) => val.id_poa === detail.id_poa)) {
                /* SAMA */
                const index = obat.findIndex(
                  (val) => val.id_poa === detail.id_poa
                );
                obat[index].jumlah += detail.jumlah;
                setValue("obat", [...obat]);
              } else {
                obat.push({
                  id_poa: detail.id_poa,
                  nama: detail.nama,
                  jumlah: detail.jumlah,
                });
                setValue("obat", [...obat]);
              }
            }
        });
      } catch (err) {
        const error = err as Error;
        toast.error(error.message);
        console.error(error);
      }
    };
    loadResep();
    loadObat();
  }, [validResep]);

  useEffect(() => {
    loadObat();
  }, [meta.page, meta.perPage, deferredCari]);

  const [obatDialog, setObatDialog] = useState<boolean>(false);
  const [obat, setObat] = useState<ArrayElementType<
    ValidasiResep["obat"]
  > | null>(null);

  type ValidResepObatState = {
    modal: boolean;
    data?: ArrayElementType<ValidasiResep["obat"]> & { idx: number };
  };
  type ValidResepObatAction = {
    type: "setValidResep";
    validResep: ValidResepObatState;
  };

  const validResepState = {
    modal: false,
  };
  const validResepActs = (
    state: ValidResepObatState,
    action: ValidResepObatAction
  ) => {
    switch (action.type) {
      case "setValidResep": {
        return {
          ...action.validResep,
        };
      }
    }
  };
  const [validResepObat, validResepObatDispatch] = useReducer(
    validResepActs,
    validResepState
  );

  const ValidasiResepSchema = z.object({
    id_kunjungan: z.string(),
    obat: z
      .object({
        id_poa: z.number(),
        nama: z.string(),
        jumlah: z.number(),
      })
      .array(),
    telaah: z.object({
      identitas: z.boolean(),
      ruangRawat: z.boolean(),
      pembiayaan: z.boolean(),
      tanggal: z.boolean(),
      dokter: z.boolean(),
      obat: z.boolean(),
      sediaan: z.boolean(),
      jumlah: z.boolean(),
      instruksi: z.boolean(),
      stabilitas: z.boolean(),
      ketepatan: z.boolean(),
      duplikasi: z.boolean(),
      alergi: z.boolean(),
      interaksi: z.boolean(),
      formularium: z.boolean(),
      fisiologis: z.boolean(),
      kontraindikasi: z.boolean(),
    }),
    keterangan: z.string(),
  });

  type ValidasiResep = z.infer<typeof ValidasiResepSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ValidasiResep>({
    resolver: zodResolver(ValidasiResepSchema),
    defaultValues: {
      id_kunjungan: validResep.data?.id_kunjungan,
      telaah: {
        identitas: true,
        ruangRawat: true,
        pembiayaan: true,
        tanggal: true,
        dokter: true,
        obat: true,
        sediaan: true,
        jumlah: true,
        instruksi: true,
        stabilitas: true,
        ketepatan: true,
        duplikasi: true,
        alergi: true,
        interaksi: true,
        formularium: true,
        fisiologis: true,
        kontraindikasi: true,
      },
    },
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<ValidasiResep> = async (data, e) => {
    try {
      e?.preventDefault();
      const post = await fetch(`${APIURL}/rs/farmasi/resep/validasi`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={validResep.modal || tambahDialog} as={Fragment}>
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
                <form
                  className="flex flex-col"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <div className="mb-4 flex justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                    <p>{validResep.data?.no_rm}</p>
                    <p>{validResep.data?.nama}</p>
                    <p>{validResep.data?.id_kunjungan}</p>
                  </div>
                  <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <p className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                          Resep Dokter
                        </p>
                        <div className="flex flex-col">
                          <p className="text-center text-sm">
                            Resep Non Racikan
                          </p>
                          <div
                            className={cn(
                              "w-full overflow-hidden rounded shadow"
                            )}
                          >
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                  <td className="px-4 py-2">Nama Obat</td>
                                  <td className="px-4 py-2">Sediaan</td>
                                  <td className="px-4 py-2">Dosis</td>
                                  <td className="px-4 py-2">Rute</td>
                                  <td className="px-4 py-2">Waktu</td>
                                  <td className="px-4 py-2">Jumlah</td>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {resepPasien?.nonracik?.map((nonracik, idx) => (
                                  <tr
                                    className={cn(
                                      "bg-white hover:text-sky-600 dark:bg-slate-900"
                                      // "divide-x divide-gray-300 dark:divide-gray-800"
                                    )}
                                    key={idx}
                                  >
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {nonracik.nama_obat}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {nonracik.sediaan}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {nonracik.kekuatan}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {nonracik.rute}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {nonracik.waktu.filter(Boolean).join(" ")}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                      {nonracik.jumlah}
                                    </td>
                                  </tr>
                                ))}
                                {resepPasien?.nonracik.length === 0 ? (
                                  <tr>
                                    <td colSpan={8}>
                                      <p className="px-4 py-2 text-center">
                                        Tidak ada obat non racik
                                      </p>
                                    </td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-center text-sm">Resep Racikan</p>
                          <div
                            className={cn(
                              "w-full overflow-hidden rounded shadow"
                            )}
                          >
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Racikan
                                  </td>
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Metode
                                  </td>
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Rute
                                  </td>
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Waktu
                                  </td>
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Bungkus
                                  </td>
                                  <td className="px-2 py-1" rowSpan={2}>
                                    Tipe
                                  </td>
                                  <td
                                    className="px-2 py-1 text-center"
                                    colSpan={5}
                                  >
                                    Detail
                                  </td>
                                </tr>
                                <tr className="border-t border-slate-50 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-800">
                                  <td className="border-x border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    No.
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Obat
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Sediaan
                                  </td>
                                  <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                    Dosis/bungkus
                                  </td>
                                  <td className="px-2 py-0.5">Jumlah</td>
                                </tr>
                              </thead>
                              <tbody>
                                {resepPasien?.racik?.map((racik, idx) => (
                                  <>
                                    <tr
                                      className={cn(
                                        "bg-white hover:text-sky-600 dark:bg-slate-900",
                                        "align-top"
                                      )}
                                      key={idx}
                                    >
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.nama_racik}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.metode}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.rute}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.waktu.filter(Boolean).join(" ")}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "text-center",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.jumlah}
                                      </td>
                                      <td
                                        className={cn(
                                          "whitespace-pre-wrap px-2 py-1.5",
                                          "text-center",
                                          "border-b border-gray-200 dark:border-gray-700"
                                        )}
                                        rowSpan={
                                          (racik.detail?.length ?? 0) + 1
                                        }
                                      >
                                        {racik.tipe === "dtd"
                                          ? "DTD"
                                          : "Non-DTD"}
                                      </td>
                                    </tr>
                                    {racik.detail?.map((detail, detailIdx) => (
                                      <tr
                                        className={cn(
                                          "bg-white hover:text-sky-600 dark:bg-slate-900"
                                        )}
                                        key={detailIdx}
                                      >
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-4 py-2",
                                            "text-left",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {detailIdx + 1}
                                          {"."}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-4 py-2",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {detail.nama}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-4 py-2",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {detail.sediaan}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-4 py-2",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {detail.dosis}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-4 py-2",
                                            "text-center",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {detail.jumlah}
                                        </td>
                                      </tr>
                                    ))}
                                  </>
                                ))}
                                {resepPasien?.racik.length === 0 ? (
                                  <tr>
                                    <td colSpan={12}>
                                      <p className="px-4 py-2 text-center">
                                        Tidak ada racikan
                                      </p>
                                    </td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 self-stretch">
                          <div className="relative flex justify-center border-b border-slate-200">
                            <p className="text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                              Validasi Obat
                            </p>
                            <Button
                              className="absolute right-0 px-2 py-0.5 text-xs"
                              color="green"
                              onClick={() => setObatDialog(true)}
                            >
                              Tambah
                            </Button>
                          </div>
                          <div
                            className={cn(
                              "w-full overflow-hidden rounded shadow"
                            )}
                          >
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                  <td className="px-4 py-2">Obat</td>
                                  <td className="px-4 py-2">Harga</td>
                                  <td className="px-4 py-2">Jumlah</td>
                                  <td className="px-4 py-2 text-center">*</td>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {watch("obat")?.map((obat, idx) => (
                                  <tr
                                    className={cn(
                                      "bg-white hover:text-sky-600 dark:bg-slate-900"
                                      // "divide-x divide-gray-300 dark:divide-gray-800"
                                    )}
                                    key={idx}
                                  >
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {obat.nama}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-2">
                                      {obat.jumlah}
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
                                                className="focus:outline-none"
                                                onClick={() => {
                                                  validResepObatDispatch({
                                                    type: "setValidResep",
                                                    validResep: {
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
                                                  setValue("obat", [
                                                    ...watch("obat").filter(
                                                      (_, i) => i !== idx
                                                    ),
                                                  ]);
                                                }}
                                              >
                                                <TbTrash
                                                  size="1rem"
                                                  className="text-red-500 hover:text-red-600 active:text-red-700"
                                                />
                                              </button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content
                                              side="left"
                                              sideOffset={0}
                                              className="border border-slate-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
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
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                        Pengkajian Resep
                      </p>
                      <div className="flex flex-col">
                        <p className="text-center text-xs">
                          1. Aspek Administratif
                        </p>
                        <table className="text-[10px]/[12px]">
                          <thead>
                            <tr className="divide-x divide-slate-50 border border-slate-200 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-700">
                              <td className="w-60 py-1"></td>
                              <td className="w-14 py-1 text-center">Sesuai</td>
                              <td className="w-14 py-1 text-center">
                                Tidak Sesuai
                              </td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 border border-t-0 border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                            {aspekAdministratif?.map((admin, idx) => (
                              <tr
                                className="divide-x divide-gray-300 bg-white hover:text-sky-600 dark:divide-gray-800 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-3 py-1">
                                  {admin.label}
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${admin.name}`) === true
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${admin.name}`, true)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${admin.name}`) === false
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${admin.name}`, false)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-center text-xs">
                          2. Aspek Farmasetik
                        </p>
                        <table className="text-[10px]/[12px]">
                          <thead>
                            <tr className="divide-x divide-slate-50 border border-slate-200 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-700">
                              <td className="w-60 py-1"></td>
                              <td className="w-14 py-1 text-center">Sesuai</td>
                              <td className="w-14 py-1 text-center">
                                Tidak Sesuai
                              </td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 border border-t-0 border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                            {aspekFarmasetik?.map((farma, idx) => (
                              <tr
                                className="divide-x divide-gray-300 bg-white hover:text-sky-600 dark:divide-gray-800 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-3 py-1">
                                  {farma.label}
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${farma.name}`) === true
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${farma.name}`, true)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${farma.name}`) === false
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${farma.name}`, false)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-center text-xs">3. Aspek Klinis</p>
                        <table className="text-[10px]/[12px]">
                          <thead>
                            <tr className="divide-x divide-slate-50 border border-slate-200 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-700">
                              <td className="w-60 py-1"></td>
                              <td className="w-14 py-1 text-center">Sesuai</td>
                              <td className="w-14 py-1 text-center">
                                Tidak Sesuai
                              </td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 border border-t-0 border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                            {aspekKlinis?.map((klinis, idx) => (
                              <tr
                                className="divide-x divide-gray-300 bg-white hover:text-sky-600 dark:divide-gray-800 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-3 py-1.5">
                                  {klinis.label}
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${klinis.name}`) === true
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${klinis.name}`, true)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3 accent-slate-500"
                                    checked={
                                      watch(`telaah.${klinis.name}`) === false
                                    }
                                    onChange={() =>
                                      setValue(`telaah.${klinis.name}`, false)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-center text-xs">
                          Keterangan (Tindak lanjut)
                        </label>
                        <InputArea
                          className="px-2 py-1.5 text-xs"
                          {...register("keterangan")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-1">
                    <Button type="submit" color="green100">
                      Simpan
                    </Button>
                    <Button color="red" onClick={tutup}>
                      Tidak
                    </Button>
                  </div>
                </form>
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
                  <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
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
                              <ThDiv>Restriksi</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Harga</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Jumlah</ThDiv>
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
                                  <p className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="text-center">
                                  <Input className="pointer-events-none w-40 py-1.5 opacity-50" />
                                </td>
                                <td className="text-center">
                                  <Input
                                    type="date"
                                    className="pointer-events-none w-32 py-1.5 text-xs opacity-50"
                                  />
                                </td>
                                <td>
                                  <p className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td>
                                  <p className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                                  obat?.id_poa === data.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                  // !!watch("obat")?.find(
                                  //   (val) => val.id_poa === data.id
                                  // ) && "bg-slate-100 dark:bg-gray-900"
                                )}
                                key={i}
                              >
                                <td className="border-b border-slate-200 text-center dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={
                                      obat?.id_poa === data.id
                                      // !!watch("obat")?.find(
                                      //   (val) => val.id_poa === data.id
                                      // )
                                    }
                                    onChange={() => {
                                      obat?.id_poa === data.id
                                        ? setObat(null)
                                        : setObat({
                                            id_poa: data.id,
                                            nama: data.nama,
                                            jumlah: 1,
                                          });
                                      // !!watch("obat")?.find(
                                      //   (val) => val.id_poa === data.id
                                      // )
                                      //   ? setValue("obat", [
                                      //       ...watch("obat").filter(
                                      //         (val) => val.id_poa !== data.id
                                      //       ),
                                      //     ])
                                      //   : setValue("obat", [
                                      //       ...watch("obat"),
                                      //       {
                                      //         id_poa: data.id,
                                      //         nama: data.nama,
                                      //         harga: data.harga||0,
                                      //         jumlah: NaN,
                                      //       },
                                      //     ])
                                    }}
                                  />
                                </td>
                                <td
                                  className={cn(
                                    "border-b border-slate-200 dark:border-gray-700",
                                    "cursor-pointer"
                                  )}
                                  onClick={() =>
                                    obat?.id_poa === data.id
                                      ? setObat(null)
                                      : setObat({
                                          id_poa: data.id,
                                          nama: data.nama,
                                          jumlah: 1,
                                        })
                                  }
                                >
                                  <p>{data.nama}</p>
                                </td>
                                <td
                                  className={cn(
                                    "max-w-36 border-b border-slate-200 dark:border-gray-700",
                                    "cursor-pointer"
                                  )}
                                  onClick={() =>
                                    obat?.id_poa === data.id
                                      ? setObat(null)
                                      : setObat({
                                          id_poa: data.id,
                                          nama: data.nama,
                                          jumlah: 1,
                                        })
                                  }
                                >
                                  <p>{/* data.restriksi */}</p>
                                </td>
                                <td
                                  className={cn(
                                    "border-b border-slate-200 dark:border-gray-700",
                                    "cursor-pointer"
                                  )}
                                  onClick={() =>
                                    obat?.id_poa === data.id
                                      ? setObat(null)
                                      : setObat({
                                          id_poa: data.id,
                                          nama: data.nama,
                                          jumlah: 1,
                                        })
                                  }
                                >
                                  <p>{data.harga}</p>
                                </td>
                                <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-20 py-1.5 text-xs font-normal"
                                    value={
                                      obat?.id_poa === data.id
                                        ? obat?.jumlah || NaN
                                        : NaN
                                      // watch("obat")?.find(
                                      //   (val) => val.id_poa === data.id
                                      // )?.jumlah || NaN
                                    }
                                    onChange={(e) => {
                                      setObat({
                                        ...obat!,
                                        jumlah: parseInt(e.target.value),
                                      });
                                      // const detailJumlah = (
                                      //   watch("obat") || []
                                      // ).map((val) => {
                                      //   if (val.id_poa === data.id) {
                                      //     return {
                                      //       ...val,
                                      //       jumlah: parseInt(e.target.value),
                                      //     };
                                      //   }
                                      //   return val;
                                      // });
                                      // setValue("obat", detailJumlah);
                                    }}
                                    disabled={obat?.id_poa !== data.id}
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
                          setCari("");
                          if (!!obat?.id_poa) {
                            // !!watch("obat")?.find(
                            //   (val) => val.id_poa === obat.id_poa
                            // )
                            //   ? setValue("obat", [
                            //       ...watch("obat").filter(
                            //         (val) => val.id_poa !== obat.id_poa
                            //       ),
                            //     ])
                            //   : setValue("obat", [...watch("obat"), obat]);
                            setValue("obat", [...watch("obat"), obat]);
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
                          setCari("");
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

        <Transition show={validResepObat.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1005]"
            onClose={() => {
              validResepObatDispatch({
                type: "setValidResep",
                validResep: {
                  ...validResepObat,
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
                      <label htmlFor="jumlah" className="text-sm">
                        Jumlah
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={
                          watch("obat")?.find(
                            (_, idx) => idx === validResepObat.data?.idx
                          )?.jumlah || NaN
                        }
                        onChange={(e) => {
                          const detailJumlah = (watch("obat") || []).map(
                            (val, idx) => {
                              if (idx === validResepObat.data?.idx) {
                                return {
                                  ...val,
                                  jumlah: parseInt(e.target.value),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("obat", detailJumlah);
                        }}
                        id="jumlah"
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button
                        color="red"
                        onClick={() => {
                          validResepObatDispatch({
                            type: "setValidResep",
                            validResep: {
                              ...validResepObat,
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
