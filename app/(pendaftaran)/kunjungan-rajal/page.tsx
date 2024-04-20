"use client";

import {
  Booking,
  BookingSchema,
  KunjunganRajal,
} from "@/app/(pendaftaran)/schema";
import { asuransi } from "@/app/(rawatJalan)/asesmen/schema";
import { CaraBayar } from "@/app/(referensi)/list-carabayar/page";
import { Klinik } from "@/app/(referensi)/list-klinik/page";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input } from "@/components/form";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
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
import { Dialog, Tab, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
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
import { HiOutlineDocumentText } from "react-icons/hi";
import { RiUserHeartLine } from "react-icons/ri";
import {
  TbEdit,
  TbFingerprint,
  TbFingerprintOff,
  TbTrash,
} from "react-icons/tb";
import { toast } from "react-toastify";
import { JadwalDokter } from "../jadwal-dokter/page";
import FormSKDPDialog from "../list-skdp/_components/skdp";
import { SKDP } from "../list-skdp/page";
// import Portal from "@/components/portal";
// import { offset, useFloating } from "@floating-ui/react";

type UbahState = {
  modal: boolean;
  data?: KunjunganRajal;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function KunjunganRajal() {
  const router = useRouter();
  const pathname = usePathname();
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const setQueryString = useCallback(
    (paramsArray: Array<{ name: string; value: string }>) => {
      paramsArray.forEach((param) => {
        params.set(param.name, param.value);
      });

      return params.toString();
    },
    [searchParams]
  );

  const [tanggal, setTanggal] = useState<Date>(new Date());
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<KunjunganRajal[]>([]);

  const finger = (finger: boolean) => {
    if (finger) {
      return <TbFingerprint className="ml-1 inline-flex" size="1.2rem" />;
    } else {
      return (
        <TbFingerprintOff
          className="ml-1 inline-flex text-amber-400"
          size="1.2rem"
        />
      );
    }
  };

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
  const handleCheckIn = async () => {
    try {
      const putData = {
        id: ubah.data?.id_pasien,
        // id_jadwal: ubah.data?.id,
      };
      // const checkInPasien = await fetch(`${APIURL}/pendaftaran/checkin`, {
      //   method: "PUT",
      //   headers: headers,
      //   body: JSON.stringify(putData),
      // });
      // const data = await checkInPasien.json();
      ubahDispatch({ type: "setUbah", ubah: { modal: false } });
      // toast.success(data?.message);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  type SkdpState = {
    modal: boolean;
    data?: (SKDP | KunjunganRajal) & { ubah: boolean };
  };
  type SkdpAction = {
    type: "setUbah";
    ubah: SkdpState;
  };
  const skdpState = {
    modal: false,
    data: undefined,
  };
  const skdpActs = (state: SkdpState, action: SkdpAction) => {
    switch (action.type) {
      case "setUbah": {
        return {
          ...action.ubah,
        };
      }
    }
  };
  const [skdp, skdpDispatch] = useReducer(skdpActs, skdpState);

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
      // const batalPasien = await fetch(`${APIURL}/pendaftaran/status`, {
      //   method: "PUT",
      //   headers: headers,
      //   body: JSON.stringify(putData),
      // });
      // const data = await batalPasien.json();
      batalDispatch({ type: "setBatal", batal: { modal: false } });
      // toast.success(data?.message);
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

  const filterKlinik: string | number = searchParams.get("klinik") ?? "all";
  const filterDokter = searchParams.get("dokter") ?? "all";
  const filterMulai = searchParams.get("mulai") ?? "all";

  const [listJadwal, setListJadwal] = useState<JadwalDokter[]>([]);
  const getJadwal = async () => {
    try {
      const url = new URL(`${APIURL}/rs/jadwal`);
      const params = {
        tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
        // tanggal: "2023-10-18",
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setListJadwal(json.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getJadwal();
  }, [tanggal]);

  const listKlinik = useMemo(() => {
    return Array.from(new Set(listJadwal?.map((val) => val.id_klinik))).map(
      (id) => listJadwal.find((val) => val.id_klinik === id)
    );
  }, [listJadwal]);

  const listDokter = useMemo(() => {
    return Array.from(
      new Set(
        listJadwal
          .filter((val) => val.id_klinik === parseInt(filterKlinik))
          .map((val) => val.id_pegawai)
      )
    ).map((id) => {
      return listJadwal.find((val) => val.id_pegawai === id);
    });
  }, [filterKlinik]);

  const listJam = useMemo(() => {
    return listJadwal
      .filter((data) => data.id_pegawai === filterDokter)
      .map((val) => {
        // console.log(parseInt(val.mulai?.slice(0, 2)));
        return {
          mulai: val.mulai,
          jam: val.mulai?.slice(0, 5) + " - " + val.selesai?.slice(0, 5),
        };
      })
      .sort(
        (val1, val2) =>
          parseInt(val1.mulai?.slice(0, 2)) - parseInt(val2.mulai?.slice(0, 2))
      );
  }, [filterDokter]);

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const loadData = async (signal?: AbortSignal) => {
    try {
      setIsMutating(true);
      tableDivRef.current?.scrollTo(0, 0);
      const url = new URL(`${APIURL}/rs/kunjungan/rajal`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
        tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
        klinik: filterKlinik === "all" ? "" : filterKlinik,
        dokter: filterDokter === "all" ? "" : filterDokter,
        mulai: filterMulai === "all" ? "" : filterMulai,
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
  }, [
    meta.page,
    meta.perPage,
    tanggal,
    filterKlinik,
    filterDokter,
    filterMulai,
    deferredCari,
  ]);

  // const { refs, floatingStyles } = useFloating({
  //   placement: "bottom-end",
  //   strategy: "fixed",
  // });
  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <RiUserHeartLine
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Kunjungan Rawat Jalan
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
                value={tanggal.toLocaleDateString("fr-CA")}
                className="w-fit p-2 text-xs shadow-none"
                onChange={(e) => {
                  setTanggal(new Date(e.target.value));
                }}
              />
              <select
                className={cn(
                  "w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                  "transition-all duration-150 ease-linear"
                )}
                value={filterKlinik}
                onChange={(e) => {
                  metaDispatch({
                    type: "page",
                    page: 1,
                  });
                  router.replace(
                    pathname +
                      "?" +
                      setQueryString([
                        { name: "klinik", value: e.target.value },
                        { name: "dokter", value: "all" },
                        { name: "mulai", value: "all" },
                      ])
                  );
                }}
              >
                <option value="all">Semua Poliklinik</option>
                {listKlinik.map((klinik, i) => (
                  <option key={i.toString()} value={klinik?.id_klinik}>
                    {klinik?.klinik}
                  </option>
                ))}
              </select>
              {filterKlinik !== "all" ? (
                <select
                  className={cn(
                    "w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    "transition-all duration-150 ease-linear"
                  )}
                  value={filterDokter}
                  onChange={(e) => {
                    metaDispatch({
                      type: "page",
                      page: 1,
                    });
                    router.replace(
                      pathname +
                        "?" +
                        setQueryString([
                          { name: "dokter", value: e.target.value },
                          { name: "mulai", value: "all" },
                        ])
                    );
                  }}
                >
                  <option value="all">Semua Dokter</option>
                  {listDokter.map((dokter, i) => (
                    <option key={i.toString()} value={dokter?.id_pegawai}>
                      {dokter?.nama}
                    </option>
                  ))}
                </select>
              ) : null}
              {filterDokter !== "all" ? (
                <select
                  className={cn(
                    "w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                    "transition-all duration-150 ease-linear"
                  )}
                  value={filterMulai}
                  onChange={(e) => {
                    metaDispatch({
                      type: "page",
                      page: 1,
                    });
                    router.replace(
                      pathname +
                        "?" +
                        setQueryString([
                          { name: "mulai", value: e.target.value },
                        ])
                    );
                  }}
                >
                  <option value="all">Semua Jam Praktek</option>
                  {listJam.map((jam, i) => (
                    <option key={i.toString()} value={jam.mulai}>
                      {jam.jam}
                    </option>
                  ))}
                </select>
              ) : null}
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
                    <ThDiv>Antrian</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>No. Kunjungan</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Nama</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tgl. Lahir</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Poliklinik</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Dokter</ThDiv>
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
                      key={i.toString()}
                    >
                      <td className="h-[56.5px]">
                        <div className="flex gap-1">
                          <p className="mx-auto h-[32px] w-9 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                          <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-[32px] w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <p className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <TbEdit
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <button
                            className="text-lg text-slate-200 dark:text-slate-400"
                            type="button"
                          >
                            SEP
                          </button>
                          <HiOutlineDocumentText
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
                    <td className="p-4 text-center" colSpan={8}>
                      <p>Data tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  /* IF DATA ADA */
                  dataList?.map((data, i) => (
                    <tr
                      className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                      key={i.toString()}
                    >
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex gap-1">
                          <p
                            className={cn(
                              "mx-auto w-9 rounded-sm py-1.5 text-center font-light tracking-wide text-slate-100",
                              data.antrian === null ? "hidden" : "",
                              data.id_asuransi === 2
                                ? "bg-green-500"
                                : "bg-blue-500"
                            )}
                          >
                            {String(data.antrian).padStart(2, "0")}
                          </p>
                          <p className="mx-auto w-16 rounded-sm bg-gray-800 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                            {data.no_rm}
                          </p>
                        </div>
                      </td>
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                        <p className="mx-auto w-36 rounded-sm bg-slate-800 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.id_kunjungan}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.nama}</p>
                        <p className="text-xs text-green-700/80 dark:text-green-600">
                          {data.sep}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        {data.tanggal_lahir ? (
                          <p className="text-xs">
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
                          </p>
                        ) : null}
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.klinik}</p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.dokter}
                        </p>
                        <p className="font-light">
                          {(data.mulai?.slice(0, 5) || "") +
                            " - " +
                            (data.selesai?.slice(0, 5) || "")}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p
                          className={cn(
                            "text-center font-bold uppercase",
                            asuransi[data.id_asuransi]?.cn
                          )}
                        >
                          {asuransi[data.id_asuransi]?.nama}
                          {new Date(tanggal).getDate() ===
                            new Date().getDate() && data.id_asuransi === 2
                            ? finger(data.finger === 1)
                            : null}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex flex-nowrap items-center justify-center gap-1 px-2">
                          {/* <Menu as={Fragment}>
                            <div className="relative">
                              <Menu.Button
                                className={cn(
                                  "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                                  "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                                  "h-fit px-4 py-[7px]"
                                )}
                                ref={refs.setReference}
                              >
                                <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                              </Menu.Button>
                              <Portal>
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
                                    className="z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700"
                                    ref={refs.setFloating}
                                    style={floatingStyles}
                                  >
                                    {[
                                      { label: "Tes", onClick: () => false },
                                    ].map((val) => (
                                      <div className="p-0.5" key={val.label}>
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={cn(
                                                // "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                                                "relative flex w-full items-center rounded-md p-2 text-sm",
                                                active
                                                  ? "bg-slate-200 text-sky-600"
                                                  : "text-gray-900"
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
                              </Portal>
                            </div>
                          </Menu> */}
                          {data.antrian === null ? (
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
                                  <p>Ubah Periksa</p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          ) : null}
                          {data.id_asuransi === 2 && data.antrian !== null ? (
                            <Tooltip.Provider
                              delayDuration={300}
                              disableHoverableContent
                            >
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <Link
                                    className="text-lg text-green-500 hover:text-green-600 active:text-green-700"
                                    href={{
                                      pathname: `/sep/${data.id_pasien}`,
                                      query: {
                                        kode: data.id_kunjungan,
                                        bag: "klinik",
                                        qlist:
                                          filterKlinik +
                                          "-" +
                                          filterDokter +
                                          "-" +
                                          filterMulai,
                                      },
                                    }}
                                  >
                                    SEP
                                  </Link>
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
                          ) : null}
                          {data.id_asuransi === 2 && data.antrian !== null ? (
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
                                      skdpDispatch({
                                        type: "setUbah",
                                        ubah: {
                                          modal: true,
                                          data: { ...data, ubah: false },
                                        },
                                      });
                                    }}
                                  >
                                    <HiOutlineDocumentText
                                      size="1.5rem"
                                      className="text-yellow-600 ui-not-disabled:hover:text-yellow-700 ui-not-disabled:active:text-yellow-800"
                                    />
                                  </button>
                                </Tooltip.Trigger>
                                <Tooltip.Content
                                  side="left"
                                  sideOffset={0}
                                  className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                >
                                  <p>SKDP Pasien</p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          ) : null}
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
                                <p>Batal Periksa</p>
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

      <UbahDialog ubah={ubah} ubahDispatch={ubahDispatch} />

      <FormSKDPDialog ubah={skdp} ubahDispatch={skdpDispatch} />

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

const UbahDialog = ({
  ubah,
  ubahDispatch,
}: {
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
}) => {
  const tutup = () => {
    ubahDispatch({
      type: "setUbah",
      ubah: { modal: false, data: ubah.data },
    });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [menues] = useState(["Check In", "Booking"]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<Booking>({
    resolver: zodResolver(BookingSchema),
  });

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
      perPage: 50,
    };
    url.search = new URLSearchParams(params as any).toString();
    const resp = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const data = await resp.json();
    setListJadwal(data.data);
  };
  useEffect(() => {
    getJadwal();
  }, [selKlinik, tanggal]);

  // useEffect(() => {
  //   console.log(errors);
  // }, [errors]);

  useEffect(() => {
    if (!ubah.modal) return;
    getKlinik();
    loadCaraBayar();
    // setSelKlinik({ label: ubah.data?.nm_klinik!, value: ubah.data?.kd_klinik! });
    setValue("id_pasien", ubah.data?.id_pasien!);
    // setValue("id_jadwal", parseInt(ubah.data?.id_jadwal!));
    // setValue("id_asuransi", parseInt(ubah.data?.kd_pj!));
    setValue("tanggal", new Date().toLocaleDateString("fr-CA"));

    return () => {
      setValue("id_asuransi", NaN);
    };
  }, [ubah.modal]);

  const submitHandler: SubmitHandler<Booking> = (data, e) => {
    e?.preventDefault();
    // console.log(data);
  };

  return (
    <Transition show={ubah.modal} as={Fragment}>
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
                <Tab.Group>
                  <Tab.List className="flex max-w-xs space-x-0.5 rounded-md bg-gray-900/20 p-0.5 dark:bg-slate-600">
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
                    <div className="max-w-xs rounded-sm border border-slate-200 py-1.5 text-center">
                      <p>{ubah.data?.nama}</p>
                    </div>
                    <Tab.Panel className={cn("focus:outline-none")}>
                      <div className="mt-2">
                        <div className="max-w-xs rounded border p-2 shadow-lg">
                          <p className="text-md">{ubah.data?.dokter}</p>
                          <p className="text-sm">{ubah.data?.klinik}</p>
                          <div className="mt-1.5 flex justify-between">
                            <p className="text-sm">
                              {(ubah.data?.mulai?.slice(0, 5) || "") +
                                " - " +
                                (ubah.data?.selesai?.slice(0, 5) || "")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <Button type="submit" color="cyan100">
                            Check In
                          </Button>
                          <Button color="red" onClick={tutup}>
                            Keluar
                          </Button>
                        </div>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel className={cn("focus:outline-none")}>
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
                            <Input
                              id="tgl"
                              type="date"
                              {...register("tanggal")}
                            />
                          </div>
                          <div className={cn("grid max-w-xs")}>
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
                              "flex max-w-xs flex-col gap-2",
                              errors.id_jadwal && "rounded-lg bg-red-100"
                            )}
                          >
                            {errors.id_jadwal ? (
                              <p className="pr-0.5 pt-1 text-end text-xs text-red-500">
                                {errors.id_jadwal.message}
                              </p>
                            ) : null}
                            {listJadwal?.map((jadwal, idx) => (
                              <div key={idx.toString()}>
                                <input
                                  type="radio"
                                  id={"jadwal-" + idx}
                                  className="peer hidden"
                                  value={jadwal.id}
                                  {...register("id_jadwal")}
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
                          </div>
                        </div>
                        <div className="mt-4 flex gap-1">
                          <Button type="submit" color="cyan100">
                            Ubah Booking
                          </Button>
                          <Button color="red" onClick={tutup}>
                            Keluar
                          </Button>
                        </div>
                      </form>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
