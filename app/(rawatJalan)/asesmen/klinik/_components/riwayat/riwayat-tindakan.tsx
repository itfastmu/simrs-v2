import css from "@/assets/css/scrollbar.module.css";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";

export default function RiwayatTindakan({
  id_pasien,
  riwTindakanDialog,
  setRiwTindakanDialog,
}: {
  id_pasien?: string | number;
  riwTindakanDialog: boolean;
  setRiwTindakanDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  type Tindakans = {
    tanggal: string;
    id_kunjungan: string;
    tindakan: string;
    klinik: string;
    dokter: string;
    icd9: string;
  };
  type ParsedTindakans = Omit<Tindakans, "icd9" | "tindakan"> & {
    detail: Pick<Tindakans, "tindakan" | "icd9">[];
  };

  const [tindakans, setTindakans] = useState<ParsedTindakans[]>([]);
  const loadTindakan = async () => {
    try {
      const url = `${APIURL}/rs/rajal/history/tindakan/${id || id_pasien}`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      const reducedData: { [key: string]: ParsedTindakans } | undefined = (
        json?.data as Tindakans[] | null
      )?.reduce((acc, tindak) => {
        const tanggal = tindak.tanggal;
        if (!acc[tanggal]) {
          acc[tanggal] = {
            tanggal: tanggal,
            klinik: tindak.klinik,
            id_kunjungan: tindak.id_kunjungan,
            dokter: tindak.dokter,
            detail: [],
          };
        }

        const existingDetail = acc[tanggal].detail.find(
          (item) =>
            item.tindakan === tindak.tindakan && item.icd9 === tindak.icd9
        );

        if (!existingDetail) {
          acc[tanggal].detail.push({
            tindakan: tindak.tindakan || "-",
            icd9: tindak.icd9 || "-",
          });
        }

        return acc;
      }, {} as { [key: string]: ParsedTindakans });
      console.log(reducedData);
      const parsedData: ParsedTindakans[] = Object.values(reducedData || []);
      setTindakans(parsedData);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };

  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (riwTindakanDialog && !initialized.current) {
      loadTindakan();
      initialized.current = true;
    }
  }, [riwTindakanDialog]);

  return (
    <Transition show={riwTindakanDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1001]"
        onClose={() => setRiwTindakanDialog(false)}
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
              <Dialog.Panel className="flex h-[512px] w-full max-w-6xl transform flex-col gap-2 overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                <div className="relative">
                  <Dialog.Title
                    as="p"
                    className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                  >
                    Riwayat Tindakan
                  </Dialog.Title>
                  <Tooltip.Provider delayDuration={300} disableHoverableContent>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          onClick={() => setRiwTindakanDialog(false)}
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
                  className={cn(
                    "h-fit w-full flex-1 overflow-hidden overflow-y-auto rounded shadow",
                    css.scrollbar
                  )}
                >
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="sticky top-0 z-20 bg-slate-100 *:border-r *:border-r-slate-50 *:px-4 *:py-2 *:text-center dark:bg-gray-700 xl:-top-[1px]">
                        <td rowSpan={2}>No. Kunjungan</td>
                        <td rowSpan={2}>Tanggal</td>
                        <td rowSpan={2}>Dokter</td>
                        <td colSpan={3} className="!border-r-0">
                          Tindakan
                        </td>
                      </tr>
                      <tr
                        className={cn(
                          "sticky top-[37px] z-20 border-y border-t-slate-50 bg-slate-100 dark:border-slate-600 dark:bg-gray-700",
                          "*:border-slate-50 *:px-2 *:py-0.5 *:text-center *:dark:border-slate-600"
                        )}
                      >
                        <td className="border-x">No.</td>
                        <td className="border-r">Tindakan</td>
                        <td>ICD-9</td>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700">
                      {tindakans?.map((tindak, idx) => (
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
                                "border-b border-gray-200 dark:border-gray-700",
                                "align-middle"
                              )}
                              rowSpan={(tindak?.detail?.length ?? 0) + 1}
                            >
                              <p className="mx-auto w-28 rounded-sm bg-slate-800 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
                                {tindak.id_kunjungan}
                              </p>
                            </td>
                            <td
                              className={cn(
                                "whitespace-pre-wrap px-2 py-1.5",
                                "border-b border-gray-200 dark:border-gray-700",
                                "text-center align-middle"
                              )}
                              rowSpan={(tindak?.detail?.length ?? 0) + 1}
                            >
                              <p>
                                {new Intl.DateTimeFormat("id-ID", {
                                  dateStyle: "long",
                                }).format(new Date(tindak.tanggal))}
                              </p>
                            </td>
                            <td
                              className={cn(
                                "whitespace-pre-wrap px-2 py-1.5",
                                "border-b border-gray-200 dark:border-gray-700",
                                "text-center align-middle"
                              )}
                              rowSpan={(tindak?.detail?.length ?? 0) + 1}
                            >
                              <p className="text-teal-700 dark:text-teal-200">
                                {tindak.dokter}
                              </p>
                              <p className="font-light">{tindak.klinik}</p>
                            </td>
                          </tr>
                          {tindak.detail.map((detail, detIdx) => (
                            <tr
                              className="bg-white text-xs *:align-top hover:text-sky-600 dark:bg-slate-900"
                              key={detIdx}
                            >
                              <td className="whitespace-pre-wrap border-b border-gray-200 px-0.5 py-2 text-center dark:border-gray-700">
                                {detIdx + 1 + "."}
                              </td>
                              <td className="whitespace-pre-wrap border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                                {detail.tindakan}
                              </td>
                              <td className="whitespace-pre-wrap border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                                {detail.icd9}
                              </td>
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
