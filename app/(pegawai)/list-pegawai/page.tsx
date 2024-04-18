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
import { BsFillPersonBadgeFill } from "react-icons/bs";
import css from "@/assets/css/scrollbar.module.css";
import { Button, ButtonTransparent } from "@/components/button";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Menu, Tab, Transition } from "@headlessui/react";
import { SelectInput } from "@/components/select";
import { Input, InputArea, LabelButton } from "@/components/form";
import { AiOutlineEye } from "react-icons/ai";
import { Tooltip } from "@/components/tooltip";
import {
  Pegawai,
  Document,
  DetailPegawai,
  Pendidikan,
  Profesi,
  PendidikanPegawai,
  JabatanPegawai,
  PangkatPegawai,
} from "../schema";
import { RiArrowDropDownLine, RiDeleteBin5Line } from "react-icons/ri";
import JabatanDialog from "./_components/jabatan";
import { TbCheck } from "react-icons/tb";
import PangkatDialog from "./_components/pangkat";
import ProfesiDialog from "./_components/profesi";

type DetailState = {
  modal: boolean;
  data?: Pegawai;
};
type DetailAction = { type: "setDetail"; detail: DetailState };

const PegawaiSchema = z.object({
  nik: z.string().min(1, "harus diisi"),
  nama: z.string().min(1, "harus diisi"),
  jenis_kelamin: z.string({ required_error: "harus dipilih" }),
  tempat_lahir: z.string().min(1, "harus diisi"),
  tanggal_lahir: z.string().min(1, "harus diisi"),
  alamat: z.string().min(1, "harus diisi"),
  status_kepegawaian: z.string({ required_error: "harus dipilih" }),
  email: z.string().min(1, "harus diisi"),
  id_profesi: z.number({ required_error: "harus diisi" }),
  ibu: z.string().min(1, "harus diisi"),
  nakes: z.boolean({ required_error: "harus diisi" }),
});

export default function ListPegawai() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<Pegawai[]>([]);

  const detailState = {
    modal: false,
    data: undefined,
  };
  const detailActs = (state: DetailState, action: DetailAction) => {
    switch (action.type) {
      case "setDetail": {
        return {
          ...action.detail,
        };
      }
    }
  };
  const [detail, detailDispatch] = useReducer(detailActs, detailState);

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

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);

  const [listStatusPegawai] = useState<string[]>([
    "Kontrak",
    "MPA",
    "Outsourcing",
    "Magang",
    "Tetap",
  ]);

  const [listProfesi, setListProfesi] = useState<Profesi[]>([]);
  const loadProfesi = async () => {
    try {
      const url = new URL(`${APIURL}/rs/profesi`);
      // const params = {
      //   page: meta.page,
      //   perPage: meta.perPage,
      //   keyword: deferredCari,
      // };
      // url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      setListProfesi(fetchData.data);
    } catch (err) {
      const error = err as Error;
      toast.error("Gagal mengambil data profesi!");
      console.error(error);
    }
  };

  const [listPendidikan, setListPendidikan] = useState<Pendidikan[]>([]);
  const loadPendidikan = async () => {
    try {
      const url = new URL(`${APIURL}/rs/pendidikan`);
      const params = {
        // page: meta.page,
        // perPage: meta.perPage,
        // keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      setListPendidikan(fetchData.data);
    } catch (err) {
      const error = err as Error;
      toast.error("Gagal mengambil data pendidikan!");
      console.error(error);
    }
  };

  const [listJabatan, setListJabatan] = useState<Pendidikan[]>([]);
  const loadJabatan = async () => {
    try {
      const url = new URL(`${APIURL}/rs/jabatan`);
      // const params = {
      //   page: meta.page,
      //   perPage: meta.perPage,
      //   keyword: deferredCari,
      // };
      // url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      setListJabatan(fetchData.data);
    } catch (err) {
      const error = err as Error;
      toast.error("Gagal mengambil data jabatan!");
      console.error(error);
    }
  };

  const [listPangkat, setListPangkat] = useState<Pendidikan[]>([]);
  const loadPangkat = async () => {
    try {
      const url = new URL(`${APIURL}/rs/pangkat`);
      // const params = {
      //   page: meta.page,
      //   perPage: meta.perPage,
      //   keyword: deferredCari,
      // };
      // url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      setListPangkat(fetchData.data);
    } catch (err) {
      const error = err as Error;
      toast.error("Gagal mengambil data pangkat!");
      console.error(error);
    }
  };

  useEffect(() => {
    loadProfesi();
    loadPendidikan();
    loadJabatan();
    loadPangkat();
  }, []);

  const [profesiDialog, setProfesiDialog] = useState<boolean>(false);
  const [jabatanDialog, setJabatanDialog] = useState<boolean>(false);
  const [pangkatDialog, setPangkatDialog] = useState<boolean>(false);
  const [menues] = useState([
    { label: "List Profesi", onClick: () => setProfesiDialog(true) },
    { label: "List Jabatan", onClick: () => setJabatanDialog(true) },
    { label: "List Pangkat", onClick: () => setPangkatDialog(true) },
  ]);

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const loadData = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/pegawai`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        // cari: deferredCari,
        keyword: deferredCari,
      };
      url.search = new URLSearchParams(params as any).toString();
      const data = await fetch(url, { method: "GET", headers: headers });
      const listPegawai = await data.json();
      if (listPegawai.status !== "Ok") throw new Error(listPegawai.message);
      // console.log(listPegawai.data);
      setDataList(listPegawai.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(listPegawai.page.page),
          perPage: parseInt(listPegawai.page.perPage),
          lastPage: parseInt(listPegawai.page.lastPage),
          total: parseInt(listPegawai.page.total),
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
              <BsFillPersonBadgeFill
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Pegawai
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
              <Menu as={Fragment}>
                <div className="relative">
                  <Menu.Button
                    className={cn(
                      "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                      "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                      "h-fit px-4 py-[7px]"
                    )}
                  >
                    Master Data
                    <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
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
                    {/* <Menu.Items className="absolute left-0 z-30 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"> */}
                    <Menu.Items className="absolute z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                      {menues.map((val) => (
                        <div className="p-0.5" key={val.label}>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={cn(
                                  // "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                                  "relative flex w-full items-center rounded-md p-2 text-sm",
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
            <div className="flex items-baseline gap-1">
              <Button
                className="h-fit px-5 py-[7px]"
                color="slatesky"
                onClick={() => setTambahDialog(true)}
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
                    <ThDiv>NIP</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Pegawai</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>J.K.</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Status Peg.</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>TTL</ThDiv>
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
                        <p className="mx-auto h-5 w-24 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-40 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-5 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-64 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <AiOutlineEye
                          size="1.5rem"
                          className="text-slate-200 dark:text-slate-400"
                        />
                      </td>
                    </tr>
                  ))
                ) : meta.total === 0 ? (
                  <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                    <td className="p-4 text-center" colSpan={7}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i}
                    >
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.id}</p>
                      </td>
                      <td className="border-b border-slate-200 p-2 text-center dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>
                          {data.jenis_kelamin === "Laki-laki"
                            ? "L"
                            : data.jenis_kelamin === "Perempuan"
                            ? "P"
                            : ""}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.status_kepegawaian}</p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>
                          {data.tempat_lahir +
                            ", " +
                            new Intl.DateTimeFormat("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(new Date(data.tanggal_lahir))}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.alamat}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-1.5 py-2">
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
                                    detailDispatch({
                                      type: "setDetail",
                                      detail: {
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

      <ProfesiDialog
        profesiDialog={profesiDialog}
        setProfesiDialog={setProfesiDialog}
      />

      <JabatanDialog
        jabatanDialog={jabatanDialog}
        setJabatanDialog={setJabatanDialog}
      />

      <PangkatDialog
        pangkatDialog={pangkatDialog}
        setPangkatDialog={setPangkatDialog}
      />

      <DetailDialog
        detail={detail}
        detailDispatch={detailDispatch}
        listProfesi={listProfesi}
        listPendidikan={listPendidikan}
        listJabatan={listJabatan}
        listPangkat={listPangkat}
        listStatusPegawai={listStatusPegawai}
        loadData={loadData}
      />

      <TambahDialog
        tambahDialog={tambahDialog}
        setTambahDialog={setTambahDialog}
        listProfesi={listProfesi}
        listStatusPegawai={listStatusPegawai}
        loadData={loadData}
      />
    </>
  );
}

const DetailDialog = ({
  detail,
  detailDispatch,
  listProfesi,
  listPendidikan,
  listJabatan,
  listPangkat,
  listStatusPegawai,
  loadData,
}: {
  detail: DetailState;
  detailDispatch: React.Dispatch<DetailAction>;
  listPendidikan: Pendidikan[];
  listProfesi: Profesi[];
  listJabatan: Pendidikan[];
  listPangkat: Pendidikan[];
  listStatusPegawai: string[];
  loadData: () => Promise<void>;
}) => {
  const tutup = () => {
    if (lainDialog || hapus.modal) return;
    detailDispatch({
      type: "setDetail",
      detail: { modal: false },
    });
    reset();
    setDetailEdit(false);
    setDetailPegawai(undefined);
    setTabIdx(0);
  };

  const [tabIdx, setTabIdx] = useState(0);
  const [menues] = useState(["Detail", "Pendidikan", "Jabatan", "Pangkat"]);

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  type HapusState = {
    modal: boolean;
    data?: {
      id?: number;
      nama?: string;
    };
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: {
      id: undefined,
      nama: undefined,
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
  const handleHapusLain = async () => {
    try {
      const url = `${APIURL}/rs/pegawai/${detailPegawai?.id}/${judul}/${hapus.data?.id}`;
      const post = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const resJson = await post.json();
      if (resJson.status !== "Ok") throw new Error(resJson.message);
      hapusDispatch({
        type: "setHapus",
        hapus: {
          modal: false,
          data: hapus.data,
        },
      });
      toast.success("Data berhasil dihapus", {
        position: "bottom-right",
      });
      handleLoadLain();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const [detailPegawai, setDetailPegawai] = useState<DetailPegawai>();
  const loadDetail = async () => {
    try {
      const url = new URL(`${APIURL}/rs/pegawai/detail/${detail.data?.id}`);
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      setDetailPegawai(fetchData.data);
    } catch (err) {
      const error = err as Error;
      // toast.error("Gagal mengambil detail data!");
      console.error(error);
    }
  };
  const [detailEdit, setDetailEdit] = useState<boolean>(false);

  const loadDetailLain = async (param: string) => {
    try {
      const url = new URL(`${APIURL}/rs/pegawai/${detail.data?.id}/${param}`);
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      return fetchData.data;
    } catch (err) {
      const error = err as Error;
      // toast.error("Gagal mengambil detail data!");
      console.error(error);
    }
  };

  const [pendidikanPegawai, setPendidikanPegawai] =
    useState<PendidikanPegawai[]>();
  const loadPendidikanPeg = async () => {
    const data = await loadDetailLain("pendidikan");
    setPendidikanPegawai(data);
  };

  const [jabatanPegawai, setJabatanPegawai] = useState<JabatanPegawai[]>();
  const loadJabatanPeg = async () => {
    const data = await loadDetailLain("jabatan");
    setJabatanPegawai(data);
  };

  const [pangkatPegawai, setPangkatPegawai] = useState<PangkatPegawai[]>();
  const loadPangkatPeg = async () => {
    const data = await loadDetailLain("pangkat");
    setPangkatPegawai(data);
  };

  useEffect(() => {
    if (!detail.data?.id) return;
    loadDetail();
    loadPendidikanPeg();
    loadJabatanPeg();
    loadPangkatPeg();
  }, [detail]);

  const [lainDialog, setLainDialog] = useState<boolean>(false);

  const judul = useMemo(() => {
    switch (tabIdx) {
      default:
      case 1:
        return "pendidikan";
      case 2:
        return "jabatan";
      case 3:
        return "pangkat";
    }
  }, [tabIdx]);

  const handleLoadLain = useMemo(() => {
    switch (tabIdx) {
      default:
      case 1:
        return loadPendidikanPeg;
      case 2:
        return loadJabatanPeg;
      case 3:
        return loadPangkatPeg;
    }
  }, [tabIdx]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<Pegawai>({
    resolver: zodResolver(PegawaiSchema),
  });

  return (
    <>
      <Transition show={detail.modal} as={Fragment}>
        <Dialog as="div" className="relative z-[1010]" onClose={tutup}>
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
                    "h-full w-full max-w-3xl transform rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                    css.scrollbar
                  )}
                >
                  <Tab.Group selectedIndex={tabIdx} onChange={setTabIdx}>
                    <Tab.List className="mx-auto flex max-w-[44rem] space-x-0.5 rounded-md bg-gray-900/20 p-0.5 dark:bg-slate-600">
                      {menues.map((menu) => (
                        <Tab
                          className={({ selected }) =>
                            cn(
                              "w-full rounded py-1.5 text-sm leading-5 text-gray-700 dark:text-slate-50",
                              selected
                                ? "bg-white shadow dark:bg-slate-800"
                                : "hover:bg-white/[0.12] dark:hover:bg-slate-700"
                            )
                          }
                          key={menu}
                        >
                          {menu}
                        </Tab>
                      ))}
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                      <div
                        className={cn(
                          "relative mx-auto flex max-w-[44rem] items-center py-1.5 text-gray-700",
                          tabIdx === 0 ? "justify-end" : "justify-center"
                        )}
                      >
                        {tabIdx !== 0 ? <p>{detailPegawai?.nama}</p> : null}
                        {!detailEdit && tabIdx === 0 ? (
                          <ButtonTransparent
                            className={cn("self-end px-2 py-1 text-sm")}
                            onClick={() => setDetailEdit(true)}
                          >
                            Ubah
                          </ButtonTransparent>
                        ) : null}
                        {tabIdx !== 0 ? (
                          <ButtonTransparent
                            className={cn(
                              "absolute right-0 self-end px-2 py-1 text-sm"
                            )}
                            color="green"
                            onClick={() => setLainDialog(true)}
                          >
                            Tambah
                          </ButtonTransparent>
                        ) : null}
                      </div>
                      <Tab.Panel className={cn("focus:outline-none")}>
                        <Transition
                          as={Fragment}
                          show={!detailEdit}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 scale-100"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-50"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-100"
                        >
                          <div
                            className={cn(
                              "overflow-hidden rounded-md bg-slate-100",
                              detailEdit && "mt-10"
                            )}
                          >
                            <table className="min-w-full text-sm">
                              <tbody>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Nama</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.nama}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("w-60 px-4 py-2")}>
                                    Nomor Induk Pegawai
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.id}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>
                                    Jenis Kelamin
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.jenis_kelamin}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>
                                    Tempat Lahir
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.tempat_lahir}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>
                                    Tanggal Lahir
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.tanggal_lahir
                                      ? new Intl.DateTimeFormat("id-ID", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }).format(
                                          new Date(detailPegawai.tanggal_lahir)
                                        ) +
                                        " (" +
                                        getAgeThn(
                                          new Date(detailPegawai.tanggal_lahir)
                                        ) +
                                        ")"
                                      : ""}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Alamat</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.alamat}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>
                                    Nomor Induk Kependudukan
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.nik}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>
                                    Status Kepegawaian
                                  </td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.status_kepegawaian}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Profesi</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {
                                      listProfesi.find(
                                        (val) =>
                                          val.id === detailPegawai?.id_profesi
                                      )?.nama
                                    }
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Nakes</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.nakes
                                      ? "Nakes"
                                      : "Bukan Nakes"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Nama Ibu</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.ibu}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cn("px-4 py-2")}>Email</td>
                                  <td className={cn("px-0.5 py-2 text-center")}>
                                    :
                                  </td>
                                  <td className={cn("px-4 py-2")}>
                                    {detailPegawai?.email}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </Transition>
                        <Transition
                          as={Fragment}
                          show={detailEdit}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 translate-y-5 scale-98"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-50"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-100"
                        >
                          <FormPegawai
                            ubah={detailEdit}
                            setUbah={setDetailEdit}
                            detailPegawai={detailPegawai}
                            listProfesi={listProfesi}
                            listStatusPegawai={listStatusPegawai}
                            loadDetail={loadDetail}
                            loadData={loadData}
                          />
                        </Transition>
                      </Tab.Panel>
                      <Tab.Panel className={cn("focus:outline-none")}>
                        <div className="overflow-hidden rounded shadow">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-300">
                                <td className={cn("px-4 py-2")}>No.</td>
                                <td className={cn("px-4 py-2")}>Pendidikan</td>
                                <td className={cn("px-4 py-2")}>Aktif</td>
                                <td className={cn("px-4 py-2")}>*</td>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {pendidikanPegawai?.map((pen, idx) => (
                                <tr
                                  className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {idx + 1}
                                    {"."}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {pen.nama}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {pen.aktif ? (
                                      <TbCheck
                                        size="1.5rem"
                                        className="mx-auto text-green-500"
                                      />
                                    ) : null}
                                  </td>
                                  <td className="text-center">
                                    <RiDeleteBin5Line
                                      className="inline text-amber-500 hover:cursor-pointer"
                                      size="1.2rem"
                                      onClick={() =>
                                        hapusDispatch({
                                          type: "setHapus",
                                          hapus: {
                                            modal: true,
                                            data: {
                                              id: pen.id,
                                              nama: pen.nama,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Tab.Panel>
                      <Tab.Panel className={cn("focus:outline-none")}>
                        <div className="overflow-hidden rounded shadow">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-300">
                                <td className={cn("px-4 py-2")}>No.</td>
                                <td className={cn("px-4 py-2")}>Jabatan</td>
                                <td className={cn("px-4 py-2")}>Tanggal</td>
                                <td className={cn("px-4 py-2")}>Aktif</td>
                                {/* <td className={cn("px-4 py-2")}>*</td> */}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {jabatanPegawai?.map((jab, idx) => (
                                <tr
                                  className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {idx + 1}
                                    {"."}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {jab.nama}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {new Intl.DateTimeFormat("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }).format(new Date(jab.tanggal))}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {jab.aktif ? (
                                      <TbCheck
                                        size="1.5rem"
                                        className="mx-auto text-green-500"
                                      />
                                    ) : null}
                                  </td>
                                  {/* <td className="text-center">
                                    <RiDeleteBin5Line
                                      className="inline text-amber-500 hover:cursor-pointer"
                                      size="1.2rem"
                                      onClick={() =>
                                        hapusDispatch({
                                          type: "setHapus",
                                          hapus: {
                                            modal: true,
                                            data: {
                                              id: jab.id,
                                              nama: jab.nama,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Tab.Panel>
                      <Tab.Panel className={cn("focus:outline-none")}>
                        <div className="overflow-hidden rounded shadow">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-300">
                                <td className={cn("px-4 py-2")}>No.</td>
                                <td className={cn("px-4 py-2")}>Pangkat</td>
                                <td className={cn("px-4 py-2")}>Pada</td>
                                <td className={cn("px-4 py-2")}>Aktif</td>
                                {/* <td className={cn("px-4 py-2")}>*</td> */}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {pangkatPegawai?.map((pangkat, idx) => (
                                <tr
                                  className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {idx + 1}
                                    {"."}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {pangkat.nama}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {new Intl.DateTimeFormat("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }).format(new Date(pangkat.created_at))}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {pangkat.aktif ? (
                                      <TbCheck
                                        size="1.5rem"
                                        className="mx-auto text-green-500"
                                      />
                                    ) : null}
                                  </td>
                                  {/* <td className="text-center">
                                    <RiDeleteBin5Line
                                      className="inline text-amber-500 hover:cursor-pointer"
                                      size="1.2rem"
                                      onClick={() =>
                                        hapusDispatch({
                                          type: "setHapus",
                                          hapus: {
                                            modal: true,
                                            data: {
                                              id: pangkat.id,
                                              nama: pangkat.nama,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
          <Transition show={hapus.modal} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1020]"
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
                        {/* TITLE CASE STRING */}
                        Hapus {judul.charAt(0).toUpperCase() + judul.slice(1)}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Hapus {judul.charAt(0).toUpperCase() + judul.slice(1)}{" "}
                          {hapus.data?.nama}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end gap-1">
                        <Button color="red100" onClick={handleHapusLain}>
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

          <DetailLainDialog
            key={tabIdx}
            lainDialog={lainDialog}
            setLainDialog={setLainDialog}
            listPendidikan={listPendidikan}
            listJabatan={listJabatan}
            listPangkat={listPangkat}
            nama={detailPegawai?.nama!}
            id_pegawai={detailPegawai?.id!}
            judul={judul}
            loadData={handleLoadLain}
          />
        </Dialog>
      </Transition>
    </>
  );
};

const DetailLainDialog = ({
  lainDialog,
  setLainDialog,
  listPendidikan,
  listJabatan,
  listPangkat,
  nama,
  id_pegawai,
  judul,
  loadData,
}: {
  lainDialog: boolean;
  setLainDialog: React.Dispatch<React.SetStateAction<boolean>>;
  listPendidikan: Pendidikan[];
  listJabatan: Pendidikan[];
  listPangkat: Pendidikan[];
  nama: string;
  id_pegawai: string;
  judul: "pendidikan" | "jabatan" | "pangkat";
  loadData: () => Promise<void>;
}) => {
  const tutup = () => {
    setLainDialog(false);
    reset();
    clearErrors();
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const PendidikanSchema = z.object({
    type: z.literal("pendidikan"),
    id_pendidikan: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  });

  const JabatanSchema = z.object({
    type: z.literal("jabatan"),
    id_jabatan: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    tanggal: z.string().min(1, "harus diisi"),
  });

  const PangkatSchema = z.object({
    type: z.literal("pangkat"),
    id_pangkat: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  });

  const FormSchema = z.discriminatedUnion("type", [
    PendidikanSchema,
    JabatanSchema,
    PangkatSchema,
  ]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    register,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: judul,
    },
  });

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      const { type, ...parsedData } = data;
      const url = `${APIURL}/rs/pegawai/${id_pegawai}/${judul}`;
      const post = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(parsedData),
      });
      const resJson = await post.json();
      if (resJson.status !== "Created") throw new Error(resJson.message);
      tutup();
      toast.success(`Berhasil menambahkan ${judul}!`, {
        position: "bottom-right",
      });
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={lainDialog} as={Fragment}>
      <Dialog as="div" className="relative z-[1020]" onClose={tutup}>
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
              <Dialog.Panel
                className={cn(
                  "w-full max-w-xl transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700"
                )}
              >
                <Dialog.Title
                  as="p"
                  className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                >
                  Tambah {judul.charAt(0).toUpperCase() + judul.slice(1)} {nama}
                </Dialog.Title>
                <form
                  className={cn("mt-2 flex flex-col gap-2")}
                  onSubmit={handleSubmit(submitHandler)}
                >
                  {judul === "pendidikan" ? (
                    <div
                      className={cn(
                        "w-full",
                        "id_pendidikan" in errors &&
                          errors.id_pendidikan &&
                          "rounded-b-sm rounded-t-lg bg-red-100"
                      )}
                    >
                      <Controller
                        control={control}
                        name="id_pendidikan"
                        render={({ field: { onChange, value } }) => {
                          const options = listPendidikan.map((val) => ({
                            label: val.nama,
                            value: val.id,
                          }));

                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options.find((c) => c.value === value)}
                              placeholder="Pilih Pendidikan"
                            />
                          );
                        }}
                      />
                      {"id_pendidikan" in errors && errors.id_pendidikan ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {errors.id_pendidikan.message}
                        </p>
                      ) : null}
                    </div>
                  ) : judul === "jabatan" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "id_jabatan" in errors &&
                            errors.id_jabatan &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <label className="text-sm">Jabatan</label>
                        <Controller
                          control={control}
                          name="id_jabatan"
                          render={({ field: { onChange, value } }) => {
                            const options = listJabatan.map((val) => ({
                              label: val.nama,
                              value: val.id,
                            }));

                            return (
                              <SelectInput
                                noOptionsMessage={(e) => "Tidak ada pilihan"}
                                onChange={(val: any) => onChange(val.value)}
                                options={options}
                                value={options.find((c) => c.value === value)}
                                placeholder="Pilih Jabatan"
                              />
                            );
                          }}
                        />
                        {"id_jabatan" in errors && errors.id_jabatan ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {errors.id_jabatan.message}
                          </p>
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "tanggal" in errors &&
                            errors.tanggal &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <label className="text-sm">Tanggal Mulai</label>
                        <Input type="date" {...register("tanggal")} />
                        {"tanggal" in errors && errors.tanggal ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {errors.tanggal.message}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : judul === "pangkat" ? (
                    <div
                      className={cn(
                        "w-full",
                        "id_pangkat" in errors &&
                          errors.id_pangkat &&
                          "rounded-b-sm rounded-t-lg bg-red-100"
                      )}
                    >
                      <Controller
                        control={control}
                        name="id_pangkat"
                        render={({ field: { onChange, value } }) => {
                          const options = listPangkat.map((val) => ({
                            label: val.nama,
                            value: val.id,
                          }));

                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options.find((c) => c.value === value)}
                              placeholder="Pilih Pangkat"
                            />
                          );
                        }}
                      />
                      {"id_pangkat" in errors && errors.id_pangkat ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {errors.id_pangkat.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-1">
                    <Button type="submit" color="green100">
                      Tambah
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

const TambahDialog = ({
  tambahDialog,
  setTambahDialog,
  listProfesi,
  listStatusPegawai,
  loadData,
}: {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<SetStateAction<boolean>>;
  listProfesi: Profesi[];
  listStatusPegawai: string[];
  loadData: () => Promise<void>;
}) => {
  const tutup = () => {
    setTambahDialog(false);
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  return (
    <Transition show={tambahDialog} as={Fragment}>
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
                  "h-full w-full max-w-2xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Tambah Pegawai Baru
                </Dialog.Title>
                <FormPegawai
                  listProfesi={listProfesi}
                  listStatusPegawai={listStatusPegawai}
                  setTambahDialog={setTambahDialog}
                  loadData={loadData}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

type FormPegawaiProps = {
  detailPegawai?: DetailPegawai;
  ubah?: boolean;
  setUbah?: React.Dispatch<React.SetStateAction<boolean>>;
  setTambahDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  listProfesi: Profesi[];
  listStatusPegawai: string[];
  loadDetail?: () => Promise<void>;
  loadData: () => Promise<void>;
};
const FormPegawai = React.forwardRef<HTMLFormElement, FormPegawaiProps>(
  (
    {
      detailPegawai,
      ubah,
      setUbah,
      setTambahDialog,
      listProfesi,
      listStatusPegawai,
      loadDetail,
      loadData,
    },
    ref
  ) => {
    const tutup = () => {
      setUbah && setUbah(false);
      setTambahDialog && setTambahDialog(false);
    };

    const headers = new Headers();
    const [token] = useState(Cookies.get("token"));
    headers.append("Authorization", token as string);
    headers.append("Content-Type", "application/json");

    const [listNakes] = useState([
      { value: false, label: "Tidak" },
      { value: true, label: "Iya" },
    ]);
    const [listGender] = useState(["Laki-laki", "Perempuan"]);

    const {
      register,
      handleSubmit,
      control,
      setValue,
      reset,
      watch,
      formState: { errors },
    } = useForm<Pegawai>({
      resolver: zodResolver(PegawaiSchema),
      defaultValues: {
        nakes: false,
      },
    });

    // useEffect(() => {
    //   const subscription = watch((value, { name, type }) =>
    //     console.log(value, name, type)
    //   );
    //   return () => subscription.unsubscribe();
    // }, [watch]);

    // console.log(errors);

    const submitHandler: SubmitHandler<Pegawai> = async (data, e) => {
      try {
        e?.preventDefault();
        if (ubah) {
          const put = await fetch(
            `${APIURL}/rs/pegawai/${detailPegawai?.id}`,
            {
              method: "PUT",
              headers: headers,
              body: JSON.stringify(data),
            }
          );
          const resp = await put.json();
          if (resp.status !== "Ok") throw new Error(resp.message);
          toast.success(resp.message);
        } else {
          const post = await fetch(`${APIURL}/rs/pegawai`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data),
          });
          const resp = await post.json();
          if (resp.status !== "Ok") throw new Error(resp.message);
          toast.success(resp.message);
        }
        loadDetail && loadDetail();
        loadData();
        tutup();
      } catch (err) {
        const error = err as Error;
        toast.error(error.message);
        console.error(error);
      }
    };

    useEffect(() => {
      if (!ubah) return;
      setValue("nik", detailPegawai?.nik!);
      setValue("nama", detailPegawai?.nama!);
      setValue("jenis_kelamin", detailPegawai?.jenis_kelamin!);
      setValue("tempat_lahir", detailPegawai?.tempat_lahir!);
      setValue(
        "tanggal_lahir",
        new Date(detailPegawai?.tanggal_lahir!).toLocaleDateString("fr-CA")
      );
      setValue("alamat", detailPegawai?.alamat!);
      setValue("email", detailPegawai?.email!);
      setValue("id_profesi", detailPegawai?.id_profesi!);
      setValue("status_kepegawaian", detailPegawai?.status_kepegawaian!);
      setValue("ibu", detailPegawai?.ibu!);
      setValue("nakes", detailPegawai?.nakes!);
    }, [ubah]);

    return (
      <>
        <form
          ref={ref}
          onSubmit={handleSubmit(submitHandler)}
          className={cn(ubah && "mt-6")}
        >
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div
              className={cn(
                "grid max-w-xs",
                errors.nama && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="nama"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Nama
                </label>
                {errors.nama ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.nama.message}
                  </p>
                ) : null}
              </div>
              <Input id="nama" {...register("nama")} />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.nik && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="nik"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  NIK
                </label>
                {errors.nik ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.nik.message}
                  </p>
                ) : null}
              </div>
              <Input id="nik" {...register("nik")} />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.jenis_kelamin && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="jenis_kelamin"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Jenis Kelamin
                </label>
                {errors.jenis_kelamin ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.jenis_kelamin.message}
                  </p>
                ) : null}
              </div>
              <Controller
                control={control}
                name="jenis_kelamin"
                render={({ field: { onChange, value } }) => {
                  const options = listGender.map((val) => ({
                    label: val,
                    value: val,
                  }));

                  return (
                    <SelectInput
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      onChange={(val: any) => onChange(val.value)}
                      options={options}
                      value={options.find((c: any) => c.value === value)}
                      placeholder="Pilih Jenis Kelamin"
                    />
                  );
                }}
              />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.tempat_lahir && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="tempat_lahir"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tempat Lahir
                </label>
                {errors.tempat_lahir ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.tempat_lahir.message}
                  </p>
                ) : null}
              </div>
              <Input id="tempat_lahir" {...register("tempat_lahir")} />
            </div>

            <div
              className={cn(
                "max-w-xs",
                errors.tanggal_lahir && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="tgl"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tanggal Lahir
                </label>
                {errors.tanggal_lahir ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.tanggal_lahir.message}
                  </p>
                ) : null}
              </div>
              <Input id="tgl" type="date" {...register("tanggal_lahir")} />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.id_profesi && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="profesi"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Profesi
                </label>
                {errors.id_profesi ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.id_profesi.message}
                  </p>
                ) : null}
              </div>
              <Controller
                control={control}
                name="id_profesi"
                render={({ field: { onChange, value } }) => {
                  const options = listProfesi.map((val) => ({
                    label: val.nama,
                    value: val.id,
                  }));

                  return (
                    <SelectInput
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      menuPlacement="top"
                      onChange={(val: any) => onChange(val.value)}
                      options={options}
                      value={options.find(
                        (c: any) => parseInt(c.value) === value
                      )}
                      placeholder="Pilih Profesi"
                    />
                  );
                }}
              />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.status_kepegawaian && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="status_kepegawaian"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Status Kepegawaian
                </label>
                {errors.status_kepegawaian ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.status_kepegawaian.message}
                  </p>
                ) : null}
              </div>
              <Controller
                control={control}
                name="status_kepegawaian"
                render={({ field: { onChange, value } }) => {
                  const options = listStatusPegawai.map((val) => ({
                    label: val,
                    value: val,
                  }));

                  return (
                    <SelectInput
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      menuPlacement="top"
                      onChange={(val: any) => onChange(val.value)}
                      options={options}
                      value={options.find((c: any) => c.value === value)}
                      placeholder="Pilih Status Kepegawaian"
                    />
                  );
                }}
              />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.ibu && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="ibu"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Nama Ibu
                </label>
                {errors.ibu ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.ibu.message}
                  </p>
                ) : null}
              </div>
              <Input id="ibu" {...register("ibu")} />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.alamat && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="alamat"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Alamat
                </label>
                {errors.alamat ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.alamat.message}
                  </p>
                ) : null}
              </div>
              <InputArea id="alamat" {...register("alamat")} />
            </div>

            <div
              className={cn(
                "flex max-w-xs flex-col",
                errors.email && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                {errors.email ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <Input id="email" className="h-fit" {...register("email")} />
            </div>

            <div
              className={cn(
                "grid max-w-xs",
                errors.nakes && "rounded-lg bg-red-100"
              )}
            >
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="nakes"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Nakes
                </label>
                {errors.nakes ? (
                  <p className="pr-0.5 text-xs text-red-500">
                    {errors.nakes.message}
                  </p>
                ) : null}
              </div>
              <Controller
                control={control}
                name="nakes"
                render={({ field: { onChange, value, onBlur } }) => (
                  <div className="text-sm">
                    {listNakes.map((val, idx) => (
                      <LabelButton
                        type="radio"
                        id={"nakes-" + (idx + 1)}
                        onBlur={onBlur}
                        onChange={() => onChange(val.value)}
                        checked={value === val.value}
                        key={idx}
                      >
                        {val.label}
                      </LabelButton>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            <Button type="submit" color="green100">
              {ubah ? "Ubah" : "Tambah"}
            </Button>
            <Button
              className="w-fit border border-transparent text-sm font-medium focus:ring-0"
              color="red"
              onClick={tutup}
            >
              {ubah ? "Batal" : "Keluar"}
            </Button>
          </div>
        </form>
      </>
    );
  }
);
FormPegawai.displayName = "FormPegawai";
