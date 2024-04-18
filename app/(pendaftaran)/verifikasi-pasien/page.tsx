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
import {
  Fragment,
  SetStateAction,
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Dialog, Transition } from "@headlessui/react";
import { Tooltip } from "@/components/tooltip";
import { TbCheck, TbChecklist, TbCircleX } from "react-icons/tb";

type TVerifPasien = {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  agama: string;
  ibu: string;
  hp: string;
  wn: string;
  created_at: Date;
  tanggal_lahir: Date;
  nomer: number;
  aktif: boolean;
  keterangan: string;
  nonaktif_at: Date;
  updated_at: Date;
};

export default function VerifikasiPasien() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  // const [data] = useState([
  //   {
  //     id: 122846,
  //     nik: "3318150910760001",
  //     nama: "EKO SURATNO, TN",
  //     jenis_kelamin: "Laki-laki",
  //     alamat: "",
  //     agama: "ISLAM",
  //     ibu: "RUMIATI",
  //     hp: "082673202842",
  //     wn: "WNI",
  //     created_at: null,
  //     tanggal_lahir: "1976-10-08T17:00:00.000Z",
  //     nomer: null,
  //     aktif: null,
  //     keterangan: null,
  //     nonaktif_at: null,
  //     updated_at: null,
  //   },
  // ]);

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [listData, setListData] = useState<TVerifPasien[]>([]);

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

  type VerifState = {
    modal: boolean;
    data?: {
      id?: number;
      nomer?: number;
      nama?: string;
    };
  };
  type VerifAction = {
    type: "setVerif";
    verif: VerifState;
  };
  const verifState = {
    modal: false,
    data: {
      id: undefined,
      nama: undefined,
    },
  };
  const verifActs = (state: VerifState, action: VerifAction) => {
    switch (action.type) {
      case "setVerif": {
        return {
          ...action.verif,
        };
      }
    }
  };
  const [verif, verifDispatch] = useReducer(verifActs, verifState);
  const handleVerif = async () => {
    try {
      let postData: { id: number; nomer?: number } = {
        id: verif.data?.id!,
      };
      if (!!verif.data?.nomer) postData.nomer = verif.data?.nomer;
      const verifPasien = await fetch(`${APIURL}/rs/pasien/verify`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(postData),
      });
      const data = await verifPasien.json();
      verifDispatch({
        type: "setVerif",
        verif: { modal: false },
      });
      if (data.status !== "Ok") throw new Error(data.message);
      toast.success(data?.message);
      loadData();
    } catch (error) {
      toast.error("Gagal verifikasi pasien!", {
        onOpen: loadData,
      });
      verifDispatch({
        type: "setVerif",
        verif: { modal: false },
      });
      console.error(error);
    }
  };
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/pasien/request`);
      const params = {
        /* page: meta.page,
        perPage: meta.perPage,
        cari: deferredCari,
        keyword: deferredCari, */
      };
      url.search = new URLSearchParams(params as any).toString();
      const fetchData = await fetch(url, { method: "GET", headers: headers });
      const data = await fetchData.json();
      // console.log(data);
      if (data.status !== "Ok") throw new Error(data.message);
      setListData(data?.data);
      /* metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(data?.page.page),
          perPage: parseInt(data?.page.perPage),
          lastPage: parseInt(data?.page.lastPage),
          total: parseInt(data?.page.total),
        },
      }) */
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
              <TbChecklist
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Verifikasi Pasien
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between pb-3">
            {/* <PerPage
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
              <InputSearch
                onChange={(e) => {
                  metaDispatch({
                    type: "page",
                    page: 1,
                  });
                  setCari(e.target.value);
                }}
              />
            </div> */}
          </div>
          <div
            ref={tableDivRef}
            className={cn(
              "h-[calc(100vh-157px)]",
              css.scrollbar,
              isMutating ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            <table className="w-full text-left text-sm font-semibold text-gray-600">
              <thead>
                <tr>
                  <Th>
                    <ThDiv>No. KTP</ThDiv>
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
                      <div className="flex items-center justify-center gap-1.5 py-2">
                        <button
                          type="button"
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-center text-sm font-medium focus:outline-none focus:ring-0 disabled:opacity-50",
                            "border border-slate-400 text-slate-200 dark:border-slate-200 dark:text-slate-400"
                          )}
                        >
                          <span>
                            <TbCheck className="mr-2 inline" />
                          </span>
                          <span>Konfirmasi</span>
                        </button>

                        <TbCircleX
                          size="1.5rem"
                          className="bg-slate-200 dark:bg-slate-400"
                        />
                      </div>
                    </tr>
                  ))
                ) : listData.length === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={5}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  listData?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
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
                        <div className="flex items-center justify-center gap-1.5 py-2">
                          <button
                            type="button"
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-center text-sm font-medium focus:outline-none focus:ring-0 disabled:opacity-50",
                              "border border-green-500 text-green-500 hover:bg-green-100 active:bg-green-200"
                            )}
                            onClick={() =>
                              verifDispatch({
                                type: "setVerif",
                                verif: {
                                  modal: true,
                                  data: {
                                    id: data.id,
                                    nomer: data.nomer,
                                    nama: data.nama,
                                  },
                                },
                              })
                            }
                          >
                            <span>
                              <TbCheck className="mr-2 inline" />
                            </span>
                            <span>Konfirmasi</span>
                          </button>

                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() => false}
                                >
                                  <TbCircleX
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
                                <p>Tolak</p>
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
          {/* <Pagination
            meta={meta}
            mutating={isMutating}
            setPage={(pageVal: number) => {
              metaDispatch({ type: "page", page: pageVal });
              tableDivRef.current?.scrollTo(0, 0);}
            }
          /> */}
        </div>
      </main>
      <Transition show={verif.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() =>
            verifDispatch({
              type: "setVerif",
              verif: {
                modal: false,
                data: verif.data,
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
                    Verifikasi
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Verifikasi data pasien atas nama {verif.data?.nama}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="green100" onClick={handleVerif}>
                      Verifikasi
                    </Button>
                    <Button
                      color="red"
                      onClick={() =>
                        verifDispatch({
                          type: "setVerif",
                          verif: {
                            modal: false,
                            data: verif.data,
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
