"use client";

import { Kunjungan } from "@/app/(pendaftaran)/schema";
import { asuransi } from "@/app/(rawatJalan)/asesmen/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Input } from "@/components/form";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { APIURL } from "@/lib/connection";
import { cn, getAgeThn } from "@/lib/utils";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { RiUserFollowLine } from "react-icons/ri";
import { TbFingerprint, TbFingerprintOff } from "react-icons/tb";
import { toast } from "react-toastify";

type UbahState = {
  modal: boolean;
  data?: Kunjungan;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function SemuaKunjungan() {
  const router = useRouter();
  const pathname = usePathname();
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [tanggal, setTanggal] = useState<Date>(new Date());
  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);
  const [dataList, setDataList] = useState<Kunjungan[]>([]);

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
      const url = new URL(`${APIURL}/rs/kunjungan`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
        tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
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
              <RiUserFollowLine
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Kunjungan Pemeriksaan
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
                    <ThDiv>No. Rawat</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>No. R.M.</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Nama</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tgl. Lahir</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Pemeriksaan</ThDiv>
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
                        <p className="mx-auto h-[32px] w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-1"></div>
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
                      key={i.toString()}
                    >
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                        <p className="mx-auto w-36 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.kodebooking}
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
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p>{data.tipe}</p>
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
                        <div className="flex flex-nowrap items-center justify-center gap-1"></div>
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
    </>
  );
}
