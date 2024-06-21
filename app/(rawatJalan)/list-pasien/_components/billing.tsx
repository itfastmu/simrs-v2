import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { InputSearch } from "@/components/table";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Fragment, useDeferredValue, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { RiCheckLine, RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { BillingAction, BillingState } from "./list-pasien";
import { Billing, BillingSchema, ListTarif } from "@/app/(keuangan)/schema";

export default function BillingDialog({
  billing,
  billingDispatch,
  loadData,
}: {
  billing: BillingState;
  billingDispatch: React.Dispatch<BillingAction>;
  loadData: () => Promise<void>;
}) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

  const tutup = () => {
    reset();
    setCari("");
    billingDispatch({
      type: "setBilling",
      billing: { modal: false },
    });
    setListTindakan([]);
    setListTarif([]);
  };

  type TindakanPasien = {
    id: number;
    id_assesment: number;
    pelaksana: string;
    tindakan: string;
    id_icd9: string;
    deskripsi_panjang: string;
    deskripsi_pendek: string;
  };
  const [listTindakan, setListTindakan] = useState<TindakanPasien[]>([]);
  const loadTindakanPasien = async () => {
    try {
      const url = new URL(
        `${APIURL}/rs/rajal/tindakan_dokter/${billing.data?.id_kunjungan}`
      );
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setListTindakan(json?.data);
    } catch (err) {
      const error = err as Error;
      // if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!billing.modal) return;
    loadTindakanPasien();
    setValue("id_kunjungan", billing.data?.id_kunjungan!);
  }, [billing]);

  const [idxTarif, setIdxTarif] = useState<number>(0);

  const [listTarif, setListTarif] = useState<ListTarif[]>([]);
  const loadTarifUnit = async () => {
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
      // page: 1,
      // perPage: 25,
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
      setListTarif(json?.data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return setListTarif([]);
      toast.error(error.message);
      console.error(error);
    }
  };
  useEffect(() => {
    if (!billing.modal) return;
    loadTarifUnit();
  }, [billing, idxTarif, deferredCari]);

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<Billing>({
    resolver: zodResolver(BillingSchema),
    defaultValues: {
      detail: [],
    },
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (Object.keys(errors).length > 0)
      toast.warn("Lengkapi isian terlebih dahulu!");
    console.log(errors);
  }, [errors]);

  const delTarif = (idx: number) => {
    setValue(
      "detail",
      watch("detail").filter((_, i) => idx !== i)
    );
  };

  const submitHandler: SubmitHandler<Billing> = async (data, e) => {
    try {
      e?.preventDefault();
      const post = await fetch(`${APIURL}/rs/billing`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success("Billing pasien tersimpan");
      tutup();
      loadData();
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
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <div className="flex justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                    <p>{billing.data?.no_rm}</p>
                    <p>{billing.data?.nama}</p>
                    <p>{billing.data?.id_kunjungan}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-center text-sm">Tindakan Dokter</p>
                    <div
                      className={cn(
                        "mt-1 w-full overflow-hidden rounded text-sm shadow"
                      )}
                    >
                      <table className="min-w-full">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                            <td className={cn("px-4 py-2")}>Pelaksana</td>
                            <td className={cn("px-4 py-2")}>Tindakan</td>
                            <td className={cn("px-4 py-2")}>ICD 9</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          { listTindakan.length === 0 
                            ? (
                              <tr className="bg-red-100">
                                <td colSpan={3} className="text-center py-2.5">Tidak ada tindakan</td>
                              </tr>
                            )
                            : listTindakan.map((tdx, idx) => (
                            <tr
                              className="bg-white hover:text-sky-600 dark:bg-slate-900"
                              key={idx}
                            >
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {tdx.pelaksana.charAt(0).toUpperCase() +
                                  tdx.pelaksana.slice(1)}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {tdx.tindakan}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {tdx.id_icd9 + " - " + tdx.deskripsi_panjang}
                              </td>
                            </tr>
                          )) }
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div
                          className={cn("h-fit overflow-hidden rounded shadow")}
                        >
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-100 dark:bg-gray-700">
                                <td className={cn("px-4 py-2")}>No.</td>
                                <td className={cn("px-4 py-2")}>Tindakan</td>
                                <td className={cn("px-4 py-2")}>*</td>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              { watch("detail").length === 0
                                ? (
                                  <tr className="bg-red-100">
                                    <td colSpan={3} className="text-center py-2.5">Tidak ada tindakan</td>
                                  </tr>
                                )
                                : watch("detail").map((val, idx) => (
                                <tr
                                  className="bg-white text-xs hover:text-sky-600 dark:bg-slate-900"
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {idx + 1 + "."}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {val.tarif}
                                  </td>
                                  <td className="text-center">
                                    <RiDeleteBin5Line
                                      className="inline text-amber-500 hover:cursor-pointer"
                                      size="1.2rem"
                                      onClick={() => delTarif(idx)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex justify-end gap-1">
                          <Button type="submit" color="green100">
                            Simpan
                          </Button>
                          <Button color="red" onClick={tutup}>
                            Keluar
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <InputSearch
                          className="w-[405px]"
                          value={cari}
                          onChange={(e) => setCari(e.target.value)}
                        />
                        <div className="flex gap-1">
                          {[
                            "Rawat Jalan",
                            "Rawat Inap",
                            "Laboratorium",
                            "Radiologi",
                          ].map((val, idx) => (
                            <button
                              type="button"
                              className={cn(
                                "relative select-none rounded-lg border border-slate-300 shadow-md dark:border-neutral-700",
                                "bg-white text-slate-700 dark:bg-neutral-300 dark:text-neutral-600",
                                "flex items-center p-2 text-xs tracking-wide",
                                idxTarif === idx &&
                                  "border-2 border-sky-500 pl-9 text-sky-600"
                              )}
                              key={idx}
                              onClick={(e) => setIdxTarif(idx)}
                            >
                              {idxTarif === idx ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                  <RiCheckLine
                                    className="size-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                              <span>{val}</span>
                            </button>
                          ))}
                        </div>
                        <div
                          className={cn(
                            "flex max-h-[400px] flex-col gap-2 overflow-y-auto rounded bg-slate-100 p-2 pt-0 dark:bg-gray-800",
                            css.scrollbar
                          )}
                        >
                          <div className="sticky top-0 flex items-center bg-slate-100 pt-2 dark:bg-gray-800">
                            <p className="text-xs">List Tarif</p>
                          </div>
                          {listTarif.length > 0 ? (
                            <div className="grid h-fit grid-cols-2 justify-end gap-2 py-1">
                              {listTarif.map((val, idx) => (
                                <div
                                  className="flex items-start justify-start gap-1"
                                  key={idx}
                                >
                                  <input
                                    type="checkbox"
                                    className="cursor-pointer"
                                    id={val.id.toString()}
                                    checked={watch("detail").some(
                                      (some) => some.id_tarif === val.id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setValue("detail", [
                                          ...watch("detail"),
                                          {
                                            id_tarif: val.id,
                                            tarif: val.nama,
                                            tipe: billing.data?.tipe!,
                                          },
                                        ]);
                                      } else {
                                        setValue(
                                          "detail",
                                          watch("detail").filter(
                                            (detVal) =>
                                              detVal.id_tarif !== val.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                                    htmlFor={val.id.toString()}
                                  >
                                    {val.nama}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <small className="text-center">
                              Data tidak ditemukan
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
