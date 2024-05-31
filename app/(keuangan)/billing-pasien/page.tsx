"use client";

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
import { ArrayElementType, cn, getAge } from "@/lib/utils";
import { Dialog, Listbox, Popover, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
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
import { IoDocumentTextOutline, IoPrint } from "react-icons/io5";
import { RiArrowDropDownLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { Billing, ListBilling, ListTarif, TBillingPasien } from "../schema";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";
import { TbTrash } from "react-icons/tb";
import CetakBilling from "./_components/cetak-billing";

export type BillingState = {
  modal: boolean;
  data?: ListBilling;
};
export type BillingAction = { type: "setBilling"; billing: BillingState };

export default function ListPasienBilling() {
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

  const [dataList, setDataList] = useState<ListBilling[]>([]);

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
      const url = new URL(`${APIURL}/rs/billing`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
        tanggal: memoizedTanggal,
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
  }, [meta.page, meta.perPage, memoizedTanggal, deferredCari]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="flex items-center">
              <IoDocumentTextOutline
                size="1.75rem"
                className="mx-3 text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Billing Pasien
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
                    <ThDiv>Nama Pasien</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Cara Bayar</ThDiv>
                  </Th>
                  <Th>
                    <ThDiv>Tipe</ThDiv>
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
                      <td className="h-[48px]">
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
                        <p className="mx-auto h-5 w-20 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      </td>
                      <td>
                        <div className="flex flex-nowrap items-center justify-center gap-2  ">
                          <IoDocumentTextOutline
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
                      <td className="border-b border-slate-200 p-2 dark:border-gray-700">
                        <p className="mx-auto w-32 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.kodebooking}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                        <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                          {data.nomer}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p>{data.nama}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <p className={cn("text-center font-bold uppercase")}>
                          {data.cara_bayar}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 text-center dark:border-gray-700">
                        <p className="mx-auto">{data.tipe}</p>
                      </td>
                      <td className="border-b border-slate-200 dark:border-gray-700">
                        <div className="flex flex-nowrap items-center justify-center gap-1">
                          <Tooltip.Provider
                            delayDuration={300}
                            disableHoverableContent
                          >
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                onClick={() =>
                                  billingDispatch({
                                    type: "setBilling",
                                    billing: { modal: true, data: data },
                                  })
                                }
                                className="relative disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <IoDocumentTextOutline
                                  size="1.5rem"
                                  className="text-sky-600 ui-not-disabled:hover:text-sky-700 ui-not-disabled:active:text-sky-800"
                                />
                                {data.status > 1 ? (
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
      <BillingDialog
        billing={billing}
        billingDispatch={billingDispatch}
        loadData={loadData}
      />
    </>
  );
}

const BillingDialog = ({
  billing,
  billingDispatch,
  loadData,
}: {
  billing: BillingState;
  billingDispatch: React.Dispatch<BillingAction>;
  loadData: () => Promise<void>;
}) => {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const tutup = () => {
    billingDispatch({
      type: "setBilling",
      billing: { modal: false },
    });
    setBillingPasien(undefined);
    setDeletedDetail([]);
  };

  useEffect(() => {
    if (!billing.modal) return;
    loadBillingDetail();
    // getJadwal(billing.data?.kd_poli);
    // setValue("tanggal", new Date().toLocaleDateString("fr-CA"));
    // setValue("poli", billing.data?.kd_poli || "");
    // setValue("penjamin", billing.data?.kd_pj || "");
    // setValue("id_jadwal", String(billing.data?.id_jadwal) || "");
  }, [billing]);

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [billingPasien, setBillingPasien] = useState<TBillingPasien>();
  const loadBillingDetail = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/billing/${billing.data?.id}`);
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setBillingPasien(json?.data);
    } catch (err) {
      const error = err as Error;
      // if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutating(false);
    }
  };

  const cetakRef1 = useRef(null);
  const cetakRef2 = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    await onBeforeGetContentResolve.current;
  }, [billing]);

  const reactToPrintContent1 = useCallback(() => {
    return cetakRef1.current;
  }, [cetakRef1.current]);
  const reactToPrintContent2 = useCallback(() => {
    return cetakRef2.current;
  }, [cetakRef2.current]);

  const handlePrint1 = useReactToPrint({
    content: reactToPrintContent1,
    documentTitle: `Billing ${billing.data?.kodebooking}`,
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  const handlePrint2 = useReactToPrint({
    content: reactToPrintContent2,
    documentTitle: `Billing ${billing.data?.kodebooking}`,
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  // useEffect(() => {
  //   if (Object.keys(errors).length > 0)
  //     toast.warn("Belum ada tarif yang dipilih");
  //   console.log(errors);
  // }, [errors]);

  const bayarBilling = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e?.preventDefault();
      const post = await fetch(`${APIURL}/rs/billing/bayar`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ id_billing: billing.data?.id }),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success("Billing pasien sukses terbayar");
      tutup();
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  /* EDIT TARIF TINDAKAN */
  type HapusState = {
    modal: boolean;
    data?: ArrayElementType<TBillingPasien["detail"]>;
    idx?: number;
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: undefined,
    idx: undefined,
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
    const detailDelete = billingPasien?.detail?.find((_, i) => i === hapus.idx);
    if (detailDelete?.id) {
      setDeletedDetail([...deletedDetail, detailDelete?.id]);
    }
    setBillingPasien((prev) => {
      if (!prev) return prev;
      const prevTotal = prev?.total || 0;
      const nominalToSubtract = parseInt(
        billingPasien?.detail
          ?.at(hapus?.idx!)
          ?.nominal?.replace("Rp", "")
          .replace(".", "") || "0"
      );
      const newTotal = prevTotal - nominalToSubtract;
      const newDetail =
        billingPasien?.detail?.filter((_, index) => index !== hapus.idx) || [];
      return {
        ...prev,
        total: newTotal,
        detail: newDetail,
      };
    });
    hapusDispatch({ type: "setHapus", hapus: { modal: false } });
    setIsEditing(true);
  };

  const metaState: Meta = {
    page: 1,
    perPage: 25,
    lastPage: NaN,
    total: NaN,
  };
  const metaActs = (
    state: Meta,
    action: MetaAction | { type: "reset" }
  ): Meta => {
    switch (action.type) {
      case "reset": {
        return metaState;
      }
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
  const [isMutatingTindakan, setIsMutatingTindakan] = useState<boolean>(false);
  const [listTindakan, setListTindakan] = useState<ListTarif[]>();

  const [tindakanDialog, setTindakanDialog] = useState<boolean>(false);
  const [selLTindakan, setSelLTindakan] = useState<ArrayElementType<
    TBillingPasien["detail"]
  > | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [menues] = useState([
    "Rawat Jalan",
    "Rawat Inap",
    "Laboratorium",
    "Radiologi",
  ]);
  const [idxTarif, setIdxTarif] = useState<number>(0);
  const loadTindakan = async () => {
    setIsMutatingTindakan(true);
    let url: string | URL = `${APIURL}/rs/tarif/unit/`;
    switch (idxTarif) {
      case 0:
        url += "rajal";
        break;
      case 1:
        url += "ranap";
        break;
      case 2:
        url += "lab";
        break;
      case 3:
        url += "rad";
        break;
    }
    const params = {
      page: meta.page,
      perPage: meta.perPage,
      keyword: deferredCari,
    };
    url = new URL(url);
    url.search = new URLSearchParams(params as any).toString();
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListTindakan(json?.data);
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
      if (error.message === "Data tidak ditemukan") return setListTindakan([]);
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsMutatingTindakan(false);
    }
  };
  const tableDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTindakan();
  }, [meta.page, meta.perPage, deferredCari, idxTarif]);

  const [deletedDetail, setDeletedDetail] = useState<number[]>([]);
  useEffect(() => {
    console.log(deletedDetail);
  }, [deletedDetail]);

  const ubahBilling = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e?.preventDefault();
      const put = await fetch(`${APIURL}/rs/billing`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          id_kunjungan: billing.data?.kodebooking!,
          detail: billingPasien?.detail?.map((val) => ({
            id: val?.id,
            id_tarif: val.id_tarif,
            tarif: val.nama_tarif,
            tipe: billing.data?.id_tipe!,
          })),
          deleted: deletedDetail,
        } as Billing & { deleted: number[] }),
      });
      const resp = await put.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success("Billing pasien berhasil diubah");
      setTimeout(() => {
        loadBillingDetail();
      }, 100);
      setIsEditing(false);
      setDeletedDetail([]);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={billing.modal} as={Fragment}>
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
                  "h-full w-full max-w-6xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                {/* <form onSubmit={handleSubmit(submitHandler)}> */}
                <div className="mb-4 flex flex-col justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                  <div className="flex justify-between">
                    <p>{billing.data?.nomer}</p>
                    <p>{billing.data?.nama}</p>
                    <p>{billing.data?.kodebooking}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>{billing.data?.instansi}</p>
                    <p>{billing.data?.dokter}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex w-full flex-col gap-0.5">
                    <div className="relative">
                      <p>Tindakan</p>
                      <Button
                        className="absolute right-0 top-0 px-2 py-0.5 text-xs"
                        color="green"
                        disabled={billing.data?.status === 2}
                        onClick={() => setTindakanDialog(true)}
                      >
                        Tambah
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "mt-1 w-full overflow-hidden rounded text-sm shadow"
                      )}
                    >
                      <table className="min-w-full">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                            <td className={cn("px-4 py-2")}>No.</td>
                            <td className={cn("px-4 py-2")}>Nama Tarif</td>
                            <td className={cn("px-4 py-2")}>Total</td>
                            <td className={cn("px-4 py-2 text-center")}>*</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {isMutating ? (
                            [...Array(3)].map((_, i: number) => (
                              <tr
                                className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                key={"tindakan-skl-" + i}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-4 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-48 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                  <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </tr>
                            ))
                          ) : !billingPasien?.detail ||
                            billingPasien?.detail?.length === 0 ? (
                            <tr>
                              <td colSpan={5}>
                                <p className="px-4 py-2 text-center">
                                  Tidak ada tindakan
                                </p>
                              </td>
                            </tr>
                          ) : (
                            billingPasien?.detail?.map((tarif, idx) => (
                              <tr
                                className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {idx + 1 + "."}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {tarif.nama_tarif}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {tarif.nominal?.replace("Rp", "Rp ")}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2 text-center">
                                  <Tooltip.Provider
                                    delayDuration={300}
                                    disableHoverableContent
                                  >
                                    <Tooltip.Root>
                                      <Tooltip.Trigger asChild>
                                        <button
                                          type="button"
                                          className="focus:outline-none"
                                          disabled={billing.data?.status === 2}
                                          onClick={() => {
                                            hapusDispatch({
                                              type: "setHapus",
                                              hapus: {
                                                modal: true,
                                                data: tarif,
                                                idx: idx,
                                              },
                                            });
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
                                        <p>Hapus Tarif Tindakan</p>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-0.5">
                    <div className="relative">
                      <p>Obat</p>
                    </div>
                    <div
                      className={cn(
                        "mt-1 w-full overflow-hidden rounded text-sm shadow"
                      )}
                    >
                      <table className="min-w-full">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                            <td className={cn("px-4 py-2")}>No.</td>
                            <td className={cn("px-4 py-2")}>Nama Obat</td>
                            <td className={cn("px-4 py-2")}>Bebas</td>
                            <td className={cn("px-4 py-2")}>Harga</td>
                            <td className={cn("px-4 py-2")}>Jumlah</td>
                            <td className={cn("px-4 py-2")}>Total</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {isMutating ? (
                            [...Array(3)].map((_, i: number) => (
                              <tr
                                className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                key={"obat-skl-" + i}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-4 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-48 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2"></td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-8 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                                </td>
                              </tr>
                            ))
                          ) : !billingPasien?.obat ||
                            billingPasien?.obat?.length === 0 ? (
                            <tr>
                              <td colSpan={7}>
                                <p className="px-4 py-2 text-center">
                                  Tidak ada obat
                                </p>
                              </td>
                            </tr>
                          ) : (
                            billingPasien?.obat?.map((obat, idx) => (
                              <tr
                                className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {idx + 1 + "."}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.nama}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.bebas ? (
                                    <RiCheckLine
                                      size="1.2rem"
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <RiCloseLine
                                      size="1.2rem"
                                      className="text-red-500"
                                    />
                                  )}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {!!obat.harga
                                    ? new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(obat.harga)
                                    : ""}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.jumlah}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {!!obat.total
                                    ? new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(obat.total)
                                    : ""}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mb-1.5 mt-3 flex justify-end px-4">
                  <div className="flex flex-col align-top">
                    <p>Total Tagihan</p>
                    <p>
                      {isMutating ? (
                        <p className="h-5 w-28 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                      ) : !!billingPasien?.total ? (
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(billingPasien.total)
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-1">
                  <Popover className="relative">
                    <Popover.Button
                      className={cn(
                        "inline-flex items-center rounded p-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-0 disabled:opacity-50",
                        "bg-cyan-500 enabled:hover:bg-cyan-600 enabled:active:bg-cyan-700",
                        "justify-between gap-4"
                      )}
                    >
                      Print
                      <FaChevronDown />
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel
                        className={cn(
                          // "absolute left-1/2 z-[1010] mt-1.5 max-h-36 w-80 origin-top-left -translate-x-1/2 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                          "fixed z-[1020] mt-2 max-h-32 w-32 origin-top-right overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                          // "-top-2 mb-2 mt-0 -translate-y-full",
                          css.scrollbar
                        )}
                      >
                        <div className="p-0.5">
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center rounded-md px-2 py-2 text-[11px]/[12px]",
                              "gap-4"
                            )}
                            onClick={handlePrint1}
                          >
                            <IoPrint className="size-3" />
                            Print Besar
                          </button>
                        </div>
                        <div className="p-0.5">
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center rounded-md px-2 py-2 text-[11px]/[12px]",
                              "gap-4"
                            )}
                            onClick={handlePrint2}
                          >
                            <IoPrint className="size-3" />
                            Print Kecil
                          </button>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </Popover>
                  {billing.data?.status === 1 ? (
                    <Button
                      color="green"
                      disabled={isEditing}
                      onClick={bayarBilling}
                    >
                      Bayar
                    </Button>
                  ) : null}
                  {billing.data?.status !== 2 ? (
                    <Button
                      color="green100"
                      disabled={!isEditing}
                      onClick={ubahBilling}
                    >
                      Simpan Perubahan
                    </Button>
                  ) : null}
                  <Button color="red" onClick={tutup}>
                    Keluar
                  </Button>
                </div>
                <div className="hidden">
                  <CetakBilling
                    billing={billing}
                    billingPasien={billingPasien}
                    ref={cetakRef1}
                  />
                  <CetakBilling
                    billing={billing}
                    billingPasien={billingPasien}
                    small
                    ref={cetakRef2}
                  />
                </div>
                {/* </form> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

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
                      Hapus Tarif Tindakan
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus {hapus.data?.nama_tarif}
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

        <Transition show={tindakanDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1001]"
            onClose={() => {
              setTindakanDialog(false);
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
                      List Tindakan
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
                        <Listbox
                          value={idxTarif}
                          onChange={(val) => {
                            setIdxTarif(val);
                            metaDispatch({
                              type: "setMeta",
                              setMeta: {
                                ...meta,
                                page: 1,
                              },
                            });
                          }}
                        >
                          <div className="relative">
                            <Listbox.Button
                              className={cn(
                                "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                                "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                                "h-fit px-4 py-[7px]"
                              )}
                            >
                              {menues[idxTarif]}
                              <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Listbox.Options className="absolute z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                                {menues.map((menu, menuIdx) => (
                                  <div
                                    className="p-0.5"
                                    key={"list-" + menuIdx}
                                  >
                                    <Listbox.Option
                                      as="button"
                                      className={({ active }) =>
                                        cn(
                                          "relative flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm",
                                          active
                                            ? "bg-slate-200 text-sky-600"
                                            : "text-gray-900 dark:text-slate-100"
                                        )
                                      }
                                      value={menuIdx}
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={cn(
                                              "block truncate",
                                              selected
                                                ? "font-medium"
                                                : "font-normal"
                                            )}
                                          >
                                            {menu}
                                          </span>
                                          {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                              <RiCheckLine
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  </div>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
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
                        isMutatingTindakan
                          ? "overflow-hidden"
                          : "overflow-y-auto"
                      )}
                    >
                      <table className="w-full text-left text-sm font-semibold text-gray-600">
                        <thead>
                          <tr>
                            <Th>
                              <ThDiv>*</ThDiv>
                            </Th>
                            <Th>
                              <ThDiv>Tindakan</ThDiv>
                            </Th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-200 dark:bg-gray-700">
                          {isMutatingTindakan ? (
                            [...Array(15)].map((_, i) => (
                              <tr
                                className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={i}
                              >
                                <td className="h-[39px] text-center">
                                  <input
                                    type="checkbox"
                                    className="size-4 opacity-30"
                                  />
                                </td>
                                <td>
                                  <p className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-400"></p>
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
                            listTindakan?.map((tdk, i) => (
                              <tr
                                className={cn(
                                  "bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900",
                                  "cursor-pointer",
                                  selLTindakan?.id_tarif === tdk.id &&
                                    "bg-slate-100 dark:bg-gray-900"
                                )}
                                onClick={() =>
                                  selLTindakan?.id_tarif === tdk.id
                                    ? setSelLTindakan(null)
                                    : setSelLTindakan({
                                        id_billing: billing.data?.id!,
                                        id_tarif: tdk.id,
                                        nama_tarif: tdk.nama,
                                      })
                                }
                                onDoubleClick={() => {
                                  setBillingPasien((prev) => {
                                    if (!prev) return prev;
                                    const oldDet = prev.detail || [];
                                    return {
                                      ...prev,
                                      detail: [
                                        ...oldDet,
                                        {
                                          id_billing: billing.data?.id!,
                                          id_tarif: tdk.id,
                                          nama_tarif: tdk.nama,
                                        },
                                      ],
                                    };
                                  });
                                  metaDispatch({ type: "reset" });
                                  setCari("");
                                  setIsEditing(true);
                                  setSelLTindakan(null);
                                  setTindakanDialog(false);
                                }}
                                key={i}
                              >
                                <td className="border-b border-slate-200 py-2 text-center dark:border-gray-700">
                                  <input
                                    type="checkbox"
                                    className="size-4 cursor-pointer"
                                    checked={selLTindakan?.id_tarif === tdk.id}
                                    onChange={() => {
                                      selLTindakan?.id_tarif === tdk.id
                                        ? setSelLTindakan(null)
                                        : setSelLTindakan({
                                            id_billing: billing.data?.id!,
                                            id_tarif: tdk.id,
                                            nama_tarif: tdk.nama,
                                          });
                                    }}
                                  />
                                </td>
                                <td
                                  className={cn(
                                    "border-b border-slate-200 dark:border-gray-700"
                                  )}
                                >
                                  <p>{tdk.nama}</p>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="relative">
                      <p className="absolute -top-2 left-0 text-[10px]/[14px]">
                        Catatan: Bisa dipilih dengan dobel klik
                      </p>
                      <Pagination
                        meta={meta}
                        mutating={isMutatingTindakan}
                        setPage={(pageVal: number) => {
                          metaDispatch({ type: "page", page: pageVal });
                          tableDivRef.current?.scrollTo(0, 0);
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        className="py-1"
                        disabled={!selLTindakan?.id_tarif}
                        color="green"
                        onClick={() => {
                          setBillingPasien((prev) => {
                            if (!prev) return prev;
                            const oldDet = prev.detail || [];
                            return {
                              ...prev,
                              detail: [...oldDet, selLTindakan!],
                            };
                          });
                          setTindakanDialog(false);
                          metaDispatch({ type: "reset" });
                          setIsEditing(true);
                          setCari("");
                          setSelLTindakan(null);
                        }}
                      >
                        Tambah
                      </Button>
                      <Button
                        className="py-1"
                        color="red"
                        onClick={() => {
                          setTindakanDialog(false);
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
      </Dialog>
    </Transition>
  );
};
