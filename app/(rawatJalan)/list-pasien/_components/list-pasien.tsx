"use client";

import { JadwalDokter } from "@/app/(pendaftaran)/jadwal-dokter/page";
import FormSKDPDialog from "@/app/(pendaftaran)/list-skdp/_components/skdp";
import { SKDP } from "@/app/(pendaftaran)/list-skdp/page";
import { KunjunganRajal } from "@/app/(pendaftaran)/schema";
import css from "@/assets/css/scrollbar.module.css";
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
import { cn, getAgeThn } from "@/lib/utils";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { FaCheck } from "react-icons/fa6";
import { HiOutlineDocumentAdd, HiOutlineDocumentText } from "react-icons/hi";
import { IoBookOutline, IoDocumentTextOutline } from "react-icons/io5";
import { RiNurseFill, RiStethoscopeLine } from "react-icons/ri";
import { TbFingerprint, TbFingerprintOff } from "react-icons/tb";
import { toast } from "react-toastify";
import SkriningPerawatDialog, {
  SkriningAction,
  SkriningState,
} from "../../asesmen/_components/skrining-perawat";
import { asuransi } from "../../asesmen/schema";
import BillingDialog from "./billing";

export type BillingState = {
  modal: boolean;
  data?: KunjunganRajal;
};
export type BillingAction = { type: "setBilling"; billing: BillingState };

export default function ListPasienAsesmen({
  user,
  idPegawai,
}: {
  user: string;
  idPegawai: string;
}) {
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

  const [tanggal, setTanggal] = useState<Date | string>(new Date());
  const memoizedTanggal = useMemo(
    () => (tanggal instanceof Date ? tanggal?.toLocaleDateString("fr-CA") : ""),
    [tanggal]
  );
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

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

  const [dataList, setDataList] = useState<KunjunganRajal[]>([]);

  const skriningState = {
    modal: false,
    data: undefined,
  };
  const skriningActs = (state: SkriningState, action: SkriningAction) => {
    switch (action.type) {
      case "setSkrining": {
        return {
          ...action.skrining,
        };
      }
    }
  };
  const [skrining, skriningDispatch] = useReducer(skriningActs, skriningState);

  const billingState = {
    modal: false,
    data: undefined,
  };
  const billingActs = (state: BillingState, action: BillingAction) => {
    switch (action.type) {
      case "setBilling": {
        return {
          ...action.billing,
        };
      }
    }
  };
  const [billing, billingDispatch] = useReducer(billingActs, billingState);

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
        tanggal: memoizedTanggal,
        // tanggal: "2023-10-18",
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setListJadwal(json.data || []);
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
        tanggal: memoizedTanggal,
        klinik: filterKlinik === "all" ? "" : filterKlinik,
        dokter:
          user === "Dokter"
            ? idPegawai
            : filterDokter === "all"
            ? ""
            : filterDokter,
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
    memoizedTanggal,
    filterKlinik,
    filterDokter,
    filterMulai,
    deferredCari,
  ]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <Suspense>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <RiNurseFill
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                List Pasien
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
              {/* <Transition
                show={user === "Dewa"}
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 -translate-y-1"
              > */}
              <Input
                type="date"
                value={memoizedTanggal}
                className={cn("w-fit p-2 text-xs shadow-none")}
                onChange={(e) => {
                  setTanggal(e.target.value ? new Date(e.target.value) : "");
                }}
              />
              {/* </Transition> */}
              {user !== "Dokter" ? (
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
              ) : null}
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
                    <ThDiv>Nama</ThDiv>
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
                    <ThDiv>Proses</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>*</ThDiv>
                  </Th>
                </tr>
              </thead>
              <tbody className="bg-slate-200 dark:bg-gray-700">
                {isMutating ? (
                  /* IF DATA FETCHING */
                  [...Array(15)].map((arr, i: number) => (
                    <tr
                      className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                      key={i}
                    >
                      <td className="h-[56.5px]">
                        <div className="flex justify-center gap-1">
                          <p className="h-[32px] w-9 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <p className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-44 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="grid gap-1">
                          <p className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
                          <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                        </div>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded-xl bg-slate-200 px-2.5 py-1 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          {user === "Perawat Rajal" || user === "Dewa" ? (
                            <IoDocumentTextOutline
                              size="1.5rem"
                              className="text-slate-200 dark:text-slate-400"
                            />
                          ) : null}
                          <IoBookOutline
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          <RiStethoscopeLine
                            size="1.5rem"
                            className="text-slate-200 dark:text-slate-400"
                          />
                          {user === "Perawat Rajal" || user === "Dewa" ? (
                            <>
                              <HiOutlineDocumentAdd
                                size="1.5rem"
                                className="text-slate-200 dark:text-slate-400"
                              />
                              <HiOutlineDocumentText
                                size="1.5rem"
                                className="text-slate-200 dark:text-slate-400"
                              />
                            </>
                          ) : null}
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
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex justify-center gap-1">
                          <p className="w-9 rounded-sm bg-blue-500 py-1.5 text-center font-light tracking-wide text-slate-100">
                            {String(data.antrian).padStart(2, "0")}
                          </p>
                          <p className="w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                            {data.no_rm}
                          </p>
                        </div>
                      </td>
                      {/* <td className="border-b border-slate-200 dark:border-gray-700">
                      </td> */}
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>
                          {data.nama}{" "}
                          {data.tanggal_lahir ? (
                            <span className="text-xs font-normal">
                              {"(" +
                                getAgeThn(new Date(data.tanggal_lahir)) +
                                ")"}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-green-700/80 dark:text-green-600">
                          {data.sep}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.klinik}</p>
                      </td>
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="text-teal-700 dark:text-teal-200">
                          {data.dokter}
                        </p>
                        <p className="font-light">
                          {data.mulai?.slice(0, 5) +
                            " - " +
                            data.selesai?.slice(0, 5)}
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
                      <td className="border-b border-slate-200 text-center text-[10px]/[12px] dark:border-gray-700">
                        <p className="mx-auto w-fit rounded-xl bg-slate-400 px-2.5 py-1 text-gray-800">
                          {data.proses}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex flex-nowrap items-center justify-center gap-1 px-2">
                          {user === "Perawat Rajal" || user === "Dewa" ? (
                            <>
                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    onClick={() =>
                                      skriningDispatch({
                                        type: "setSkrining",
                                        skrining: {
                                          modal: true,
                                          data: {
                                            id_kunjungan: data.id_kunjungan,
                                            id_pasien: data.id_pasien,
                                            nama: data.nama,
                                            tanggal_lahir: data.tanggal_lahir,
                                            id_klinik: data.id_klinik,
                                            id_proses: data.id_proses,
                                          },
                                        },
                                      })
                                    }
                                    className="relative disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <IoDocumentTextOutline
                                      size="1.5rem"
                                      className="text-cyan-700 hover:text-cyan-800 active:text-cyan-900 dark:text-cyan-500 dark:hover:text-cyan-600 dark:active:text-cyan-700"
                                    />
                                    {parseInt(data.id_proses) > 3 ? (
                                      <FaCheck
                                        className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={0}
                                    className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                  >
                                    <p>Skrining</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </>
                          ) : null}

                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                onClick={
                                  () => false
                                  // skriningDispatch({
                                  //   type: "setSkrining",
                                  //   skrining: {
                                  //     modal: true,
                                  //     data: {
                                  //       id_kunjungan: data.id_kunjungan,
                                  //       id_pasien: data.id_pasien,
                                  //       nama: data.nama,
                                  //       tanggal_lahir: data.tanggal_lahir,
                                  //       id_klinik: data.id_klinik,
                                  //       id_proses: data.id_proses,
                                  //     },
                                  //   },
                                  // })
                                }
                                className="relative disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <IoBookOutline
                                  size="1.5rem"
                                  className="text-cyan-700 hover:text-cyan-800 active:text-cyan-900 dark:text-cyan-500 dark:hover:text-cyan-600 dark:active:text-cyan-700"
                                />
                                {/* {parseInt(data.id_proses) > 3 ? (
                                  <FaCheck
                                    className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                    aria-hidden="true"
                                  />
                                ) : null} */}
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>Edukasi</p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>

                          {user === "Dewa" ? (
                            <Tooltip.Provider
                              delayDuration={300}
                              disableHoverableContent
                            >
                              <Tooltip.Root>
                                <Tooltip.Trigger
                                  className="relative disabled:cursor-not-allowed disabled:opacity-50"
                                  asChild
                                >
                                  <Link
                                    className="relative"
                                    href={{
                                      pathname: `/asesmen/klinik/${data.id_kunjungan}`,
                                      // pathname: `/asesmen/klinik/${data.id_kunjungan.includes("/") ? data.id_kunjungan.replace("/", "") : data.id_kunjungan}`,
                                      query: {
                                        id: data.id_pasien,
                                        klinik: data.klinik,
                                        kode_klinik: data.kode_klinik,
                                        dokter: data.dokter,
                                        qlist:
                                          filterKlinik +
                                          "-" +
                                          filterDokter +
                                          "-" +
                                          filterMulai,
                                        kode: data.id_pegawai,
                                        proses: data.id_proses,
                                        grup: "Perawat Rajal",
                                      },
                                    }}
                                  >
                                    <RiStethoscopeLine
                                      size="1.5rem"
                                      className={cn(
                                        "text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                      )}
                                    />
                                    {parseInt(data.id_proses) > 3 ? (
                                      <FaCheck
                                        className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                  </Link>
                                </Tooltip.Trigger>
                                <Tooltip.Content
                                  side="left"
                                  sideOffset={0}
                                  className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                >
                                  <p>Asesmen Perawat</p>
                                </Tooltip.Content>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          ) : null}

                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                className="relative disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={
                                  user === "Perawat Rajal" &&
                                  parseInt(data.id_proses) < 2
                                }
                                asChild={
                                  user === "Dokter" ||
                                  parseInt(data.id_proses) >= 2
                                }
                              >
                                {user === "Perawat Rajal" &&
                                parseInt(data.id_proses) < 2 ? (
                                  <>
                                    <RiStethoscopeLine
                                      size="1.5rem"
                                      className={cn(
                                        "text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                      )}
                                    />
                                  </>
                                ) : (
                                  <Link
                                    className="relative"
                                    href={{
                                      pathname: `/asesmen/klinik/${data.id_kunjungan}`,
                                      query: {
                                        id: data.id_pasien,
                                        klinik: data.klinik,
                                        kode_klinik: data.kode_klinik,
                                        dokter: data.dokter,
                                        qlist:
                                          filterKlinik +
                                          "-" +
                                          filterDokter +
                                          "-" +
                                          filterMulai,
                                        kode: data.id_pegawai,
                                        proses: data.id_proses,
                                        grup: user,
                                      },
                                    }}
                                  >
                                    <RiStethoscopeLine
                                      size="1.5rem"
                                      className={cn(
                                        "text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                      )}
                                    />
                                    {((user === "Dokter" || user === "Dewa") &&
                                      parseInt(data.id_proses) > 4) ||
                                    (user === "Perawat Rajal" &&
                                      parseInt(data.id_proses) > 3) ? (
                                      <FaCheck
                                        className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                  </Link>
                                )}
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                side="left"
                                sideOffset={0}
                                className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                              >
                                <p>
                                  {user === "Dewa"
                                    ? "Asesmen Dokter"
                                    : "Asesmen"}
                                </p>
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>

                          {user === "Perawat Rajal" || user === "Dewa" ? (
                            <>
                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    disabled={parseInt(data.id_proses) < 5}
                                    onClick={() =>
                                      billingDispatch({
                                        type: "setBilling",
                                        billing: { modal: true, data: data },
                                      })
                                    }
                                    className="relative disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <HiOutlineDocumentAdd
                                      size="1.5rem"
                                      className="text-yellow-600 ui-not-disabled:hover:text-yellow-700 ui-not-disabled:active:text-yellow-800"
                                    />
                                    {data.billing ? (
                                      <FaCheck
                                        className="absolute -right-1 -top-1 h-3 w-3 text-green-500"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={0}
                                    className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                  >
                                    <p>Billing</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              </Tooltip.Provider>

                              <Tooltip.Provider
                                delayDuration={300}
                                disableHoverableContent
                              >
                                <Tooltip.Root>
                                  <Tooltip.Trigger
                                    disabled={parseInt(data.id_proses) < 5}
                                    className="disabled:cursor-not-allowed disabled:opacity-50"
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
                                      className="text-green-600 ui-not-disabled:hover:text-green-700 ui-not-disabled:active:text-green-800"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={0}
                                    className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                  >
                                    <p>SKDP</p>
                                  </Tooltip.Content>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                            </>
                          ) : null}
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
              // reduxDispatch(
              //   setPageParams({
              //     ...pageParamsState,
              //     page: pageVal,
              //   })
              // );
            }}
          />
        </div>
      </main>

      <SkriningPerawatDialog
        skriningState={skrining}
        skriningDispatch={skriningDispatch}
        loadData={loadData}
      />

      <BillingDialog
        billing={billing}
        billingDispatch={billingDispatch}
        loadData={loadData}
      />

      <FormSKDPDialog
        ubah={skdp}
        ubahDispatch={skdpDispatch}
        loadData={loadData}
      />
    </Suspense>
  );
}
