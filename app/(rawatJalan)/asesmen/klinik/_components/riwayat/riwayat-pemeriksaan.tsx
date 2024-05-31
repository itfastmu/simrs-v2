"use client";

import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { ImMenu3 } from "react-icons/im";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { THasilDokter, THasilPerawat, THasilPsikolog } from "../../../schema";
import HasilBidan from "./hasil-bidan";
import HasilPerawat from "./hasil-perawat";
import RiwayatDiagnosis from "./riwayat-diagnosis";
import RiwayatDokter from "./riwayat-dokter";
import RiwayatRadiologi from "./riwayat-radiologi";
import RiwayatResep from "./riwayat-resep";
import RiwayatTindakan from "./riwayat-tindakan";
import RiwayatPsikolog from "./riwayat-psikolog";

type TRiwayatPemeriksaanRajal = {
  id: string;
  id_pasien: number;
  id_asuransi: number;
  created_at: string;
  tipe: number;
  tanggal: Date;
  id_kunjungan: string;
  id_jadwal: number;
  nomer: number;
  proses: string;
  dokter: string;
  klinik: string;
  kode_klinik: string;
};

export type RiwDokterState = {
  modal: boolean;
  data?: TRiwayatPemeriksaanRajal;
};
export type RiwDokterAction = RiwDokterState;

export default function RiwayatPemeriksaan() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [idPegawai] = useState(Cookies.get("id"));
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const grup = searchParams.get("grup");

  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [riwayat, setRiwayat] = useState<TRiwayatPemeriksaanRajal[]>([]);
  const [riwayatIcare, setRiwayatIcare] = useState<
    { url: string } | undefined
  >();
  const loadRiwayatICare = async () => {
    try {
      const url = new URL(`${APIURL}/rs/rajal/icare`);
      const params = {
        nomer: id,
        dokter: idPegawai,
      };
      url.search = new URLSearchParams(params as any).toString();
      const fetchData = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await fetchData.json();
      // console.log(data);
      if (json.status !== "Ok") throw new Error(json.message);
      setRiwayatIcare(json?.data);
    } catch (err) {
      const error = err as Error;
      console.error(error);
    }
  };
  useEffect(() => {
    const loadRiwayat = async () => {
      try {
        setIsMutating(true);
        const url = new URL(`${APIURL}/rs/rajal/history/${id}`);
        const fetchData = await fetch(url, {
          method: "GET",
          headers: headers,
        });
        const json = await fetchData.json();
        // console.log(json);
        if (json.status !== "Ok") throw new Error(json.message);
        (json?.data as TRiwayatPemeriksaanRajal[])?.sort(
          (a, b) =>
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );
        setRiwayat(json?.data);
      } catch (err) {
        const error = err as Error;
        console.error(error);
      } finally {
        setIsMutating(false);
      }
    };
    loadRiwayat();
    loadRiwayatICare();
  }, []);

  const [icareDialog, setIcareDialog] = useState<boolean>(false);
  useEffect(() => {
    if (icareDialog) loadRiwayatICare();
  }, [icareDialog]);

  type RiwPerawatState = {
    modal: boolean;
    data?: TRiwayatPemeriksaanRajal;
  };
  type RiwPerawatAction = { riwPerawat: RiwPerawatState };

  const riwPerawatState = {
    modal: false,
  };
  const riwPerawatActs = (state: RiwPerawatState, action: RiwPerawatAction) => {
    return action.riwPerawat;
  };
  const [riwPerawat, riwPerawatDispatch] = useReducer(
    riwPerawatActs,
    riwPerawatState
  );
  const [hasilPerawat, setHasilPerawat] = useState<THasilPerawat>();
  const loadAsesPerawat = async () => {
    try {
      const url =
        riwPerawat.data?.kode_klinik === "IRM"
          ? `${APIURL}/rs/rajal/assesment/fisioterapi/${riwPerawat.data?.id_kunjungan}`
          : riwPerawat.data?.kode_klinik === "OBG"
          ? `${APIURL}/rs/rajal/assesment/kebidanan/${riwPerawat.data?.id_kunjungan}`
          : `${APIURL}/rs/rajal/assesment/perawat/${riwPerawat.data?.id_kunjungan}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilPerawat(json?.data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan")
        return toast.warning("Belum diasesmen perawat!");
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!riwPerawat.data || !riwPerawat.modal) return;
    loadAsesPerawat();
  }, [riwPerawat]);

  const riwDokterState = {
    modal: false,
  };
  const riwDokterActs = (state: RiwDokterState, action: RiwDokterAction) => {
    return action;
  };
  const [riwDokter, riwDokterDispatch] = useReducer(
    riwDokterActs,
    riwDokterState
  );
  const [hasilDokter, setHasilDokter] = useState<THasilDokter>();
  const loadAsesDokter = async () => {
    try {
      const url = `${APIURL}/rs/rajal/assesment/dokter/${riwDokter.data?.id_kunjungan}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilDokter(json?.data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan")
        return toast.warning("Belum diasesmen dokter!");
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!riwDokter.data || !riwDokter.modal) return;
    loadAsesDokter();
  }, [riwDokter]);

  const riwPsikologState = {
    modal: false,
  };
  const riwPsikologActs = (state: RiwDokterState, action: RiwDokterAction) => {
    return action;
  };
  const [riwPsikolog, riwPsikologDispatch] = useReducer(
    riwPsikologActs,
    riwPsikologState
  );
  const [hasilPsikolog] = useState<THasilPsikolog>({
    id_kunjungan: "202433312321",
    penyakit: {
      keluhan_fisik: "Keluhan Fisik Contoh",
      keluhan_psikologis: "Keluhan Psikologis Contoh",
      diagnosis_dokter: "Diagnosis Dokter Contoh",
    },
    observasi: {
      penampilan: "Terawat",
      sikap: "Kooperatif",
      afek: "Normal",
      muka: "Wajar",
      pikir: "Realistik",
      persepsi: "Tidak Ada",
      emosi: "Stabil",
      perilaku: "Normal",
    },
    kognitif: {
      memori: false,
      konsentrasi: false,
      orientasi: false,
      verbal: false,
      memori_ket: "",
      konsentrasi_ket: "",
      orientasi_ket: "",
      verbal_ket: "",
    },
    psikotes: { tes: [], hasil: "" },
    simpton: [],
    dinamika: "Dinamika Psikologi Contoh",
    diagnosis_psikologi: "Diagnosis Psikologi Contoh",
    rencana: "Rencana Intervensi Contoh",
    intervensi: "Intervensi Contoh",
    diagnosis: [
      {
        id: 12,
        diagnosis: "Diagnosis Utama Anxiety",
        icd10: { id: "AA.00", nama: "AA.00 - Anxiety Disorder" },
        primer: true,
      },
    ],
  });

  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintContent = useCallback(() => {
    return printRef.current;
  }, [printRef.current]);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
  });

  const [riwDiagnosisDialog, setRiwDiagnosisDialog] = useState<boolean>(false);
  const [riwTindakanDialog, setRiwTindakanDialog] = useState<boolean>(false);
  const [riwResepDialog, setRiwResepDialog] = useState<boolean>(false);
  const [riwRadDialog, setRiwRadDialog] = useState<boolean>(false);

  const [menues] = useState([
    { label: "Riwayat Diagnosis", onClick: () => setRiwDiagnosisDialog(true) },
    { label: "Riwayat Tindakan", onClick: () => setRiwTindakanDialog(true) },
    {
      label: "Riwayat Pemeriksaan Laboratorium",
      onClick: () => setRiwResepDialog(true),
    },
    {
      label: "Riwayat Pemeriksaan Radiologi",
      onClick: () => setRiwRadDialog(true),
    },
    { label: "Riwayat Resep Obat", onClick: () => setRiwResepDialog(true) },
    { label: "I-Care", onClick: () => setIcareDialog(true) },
  ]);

  return (
    <Suspense>
      <div className="relative flex h-full flex-col overflow-y-auto rounded-md bg-white text-xs shadow-md dark:bg-slate-700">
        <div className="sticky left-0 top-0 z-10 w-full bg-sky-200/60 py-1 text-sm font-semibold dark:bg-sky-600">
          <div className="flex justify-center">
            <p>Riwayat Pemeriksaan</p>
            <Menu as={Fragment}>
              <div className="">
                <Menu.Button className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ImMenu3
                    size="1.3rem"
                    className="text-slate-800 active:text-slate-700"
                  />
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
                  <Menu.Items className="fixed z-30 mt-6 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                    {menues.map((val) => (
                      <div className="p-0.5" key={val.label}>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={cn(
                                // "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                                "relative block w-full truncate rounded-md p-2 text-left text-xs",
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
        </div>
        <div
          className={cn(
            "relative flex flex-1 flex-col gap-2 p-2",
            isMutating ? "overflow-hidden" : "overflow-y-auto",
            css.scrollbar
          )}
        >
          {isMutating ? (
            [...Array(4)].map((arr, i: number) => (
              <div
                className="relative flex animate-pulse flex-col gap-0.5 border border-gray-300 bg-gray-50 px-2 py-1.5 pr-24 text-left shadow hover:-translate-y-0.5 dark:border-slate-400 dark:bg-slate-700"
                key={i.toString()}
              >
                <p className="mb-1 h-5 w-28 rounded bg-slate-200 text-sm font-semibold dark:bg-slate-400"></p>
                <p className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                <p className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-400"></p>
                <p className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
                <div className="absolute right-2 flex flex-col items-center justify-center gap-1">
                  <Button
                    disabled
                    className="w-20 justify-center py-1.5 text-xs"
                    color="slatesky"
                  >
                    &nbsp;
                  </Button>
                  <Button
                    disabled
                    className="w-20 justify-center py-1.5 text-xs"
                    color="slatesky"
                  >
                    &nbsp;
                  </Button>
                </div>
              </div>
            ))
          ) : riwayat?.length > 0 ? (
            <>
              {riwayat?.map((val) => (
                <div
                  className="relative flex flex-col gap-0.5 border border-gray-300 bg-gray-50 px-2 py-1.5 pr-24 text-left shadow hover:-translate-y-0.5 dark:border-slate-400 dark:bg-slate-700"
                  key={val.id_kunjungan}
                >
                  <p className="mb-1 text-sm font-semibold">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                    }).format(new Date(val.tanggal))}
                  </p>
                  <p>Rawat Jalan</p>
                  <p>{val.tipe === 5 ? "Fisioterapi" : val.klinik}</p>
                  <p>{val.dokter}</p>
                  <div className="absolute right-2 flex flex-col items-center justify-center gap-1">
                    {val.tipe === 5 ? (
                      <Button
                        disabled={parseInt(val.proses) < 4}
                        onClick={() =>
                          riwPerawatDispatch({
                            riwPerawat: { modal: true, data: val },
                          })
                        }
                        className="w-20 justify-center py-1.5 text-xs"
                        color="slatesky"
                      >
                        Fisioterapi
                      </Button>
                    ) : (
                      <>
                        <Button
                          disabled={parseInt(val.proses) < 4}
                          onClick={() =>
                            riwPerawatDispatch({
                              riwPerawat: { modal: true, data: val },
                            })
                          }
                          className="w-20 justify-center py-1.5 text-xs"
                          color="slatesky"
                        >
                          {val.kode_klinik === "OBG"
                            ? "Bidan"
                            : val.kode_klinik === "IRM"
                            ? "Fisioterapi"
                            : "Perawat"}
                        </Button>
                        <Button
                          disabled={parseInt(val.proses) < 5}
                          onClick={() =>
                            riwDokterDispatch({
                              modal: true,
                              data: val,
                            })
                          }
                          className="w-20 justify-center py-1.5 text-xs"
                          color="slatesky"
                        >
                          Dokter
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : null}
          <div className="relative flex flex-col gap-0.5 border border-gray-300 bg-gray-50 px-2 py-1.5 pr-24 text-left shadow hover:-translate-y-0.5 dark:border-slate-400 dark:bg-slate-700">
            <p className="mb-1 text-sm font-semibold">
              {new Intl.DateTimeFormat("id-ID", {
                dateStyle: "long",
              }).format(new Date())}
            </p>
            <p>Rawat Jalan</p>
            <p>Klinik Psikologi</p>
            {/* <p>{val.dokter}</p> */}
            <div className="absolute right-2 flex flex-col items-center justify-center gap-1">
              <Button
                // disabled={parseInt(val.proses) < 5}
                onClick={() =>
                  riwPsikologDispatch({
                    modal: true /* data: val */,
                  })
                }
                className="w-20 justify-center py-1.5 text-xs"
                color="slatesky"
              >
                Psikolog
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Transition show={riwPerawat.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() => riwPerawatDispatch({ riwPerawat: { modal: false } })}
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
            <div className="flex h-screen items-center justify-center px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-50"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex h-full w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <div className="relative">
                    <Dialog.Title
                      as="p"
                      className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                    >
                      {riwPerawat.data?.kode_klinik !== "OBG"
                        ? "Asesmen Keperawatan"
                        : "Asesmen Kebidanan"}
                    </Dialog.Title>
                    <Tooltip.Provider
                      delayDuration={300}
                      disableHoverableContent
                    >
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              riwPerawatDispatch({
                                riwPerawat: { ...riwPerawat, modal: false },
                              });
                              setTimeout(
                                () =>
                                  riwPerawatDispatch({
                                    riwPerawat: { modal: false },
                                  }),
                                250
                              );
                            }}
                            className="absolute right-3 top-0 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IoCloseCircleOutline
                              size="1.5rem"
                              className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
                            />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          side="left"
                          sideOffset={0}
                          className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                        >
                          <p>Keluar</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                  <div
                    className={cn("mt-2 flex-1 overflow-y-auto", css.scrollbar)}
                  >
                    {riwPerawat.data?.kode_klinik !== "OBG" ? (
                      <HasilPerawat data={hasilPerawat} ref={printRef} />
                    ) : (
                      <HasilBidan data={hasilPerawat} ref={printRef} />
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <RiwayatDokter
        riwDokter={riwDokter}
        riwDokterDispatch={riwDokterDispatch}
        hasilDokter={hasilDokter}
      />

      <RiwayatPsikolog
        riwPsikolog={riwPsikolog}
        riwPsikologDispatch={riwPsikologDispatch}
        hasilPsikolog={hasilPsikolog}
      />

      <RiwayatResep
        riwResepDialog={riwResepDialog}
        setRiwResepDialog={setRiwResepDialog}
      />

      <RiwayatTindakan
        riwTindakanDialog={riwTindakanDialog}
        setRiwTindakanDialog={setRiwTindakanDialog}
      />

      <RiwayatDiagnosis
        riwDiagnosisDialog={riwDiagnosisDialog}
        setRiwDiagnosisDialog={setRiwDiagnosisDialog}
      />

      <RiwayatRadiologi
        id_pasien={parseInt(id!)}
        riwRadDialog={riwRadDialog}
        setRiwRadDialog={setRiwRadDialog}
      />

      <Transition show={icareDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1001]"
          onClose={() => setIcareDialog(false)}
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
            <div className="flex min-h-full items-center justify-center px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-50"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex w-full max-w-lg transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <Dialog.Title
                    as="p"
                    className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                  >
                    Riwayat I-Care
                  </Dialog.Title>
                  <div
                    className={cn(
                      "mt-2 flex flex-1 flex-col gap-2 overflow-y-auto",
                      css.scrollbar
                    )}
                  >
                    <div className="relative flex flex-col gap-0.5 border border-gray-300 bg-gray-50 px-2 py-1.5 text-left shadow dark:border-slate-400 dark:bg-slate-700">
                      <div className="flex items-center justify-center gap-2">
                        {riwayatIcare?.url ? (
                          <a
                            href={riwayatIcare?.url}
                            target="_blank"
                            className="cursor-pointer text-xs text-blue-700 underline"
                          >
                            {riwayatIcare?.url}
                          </a>
                        ) : (
                          <p className="text-sm">Belum ada riwayat</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Suspense>
  );
}
