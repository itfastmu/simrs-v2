import { Penunjang } from "@/app/(penunjang)/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { InputArea } from "@/components/form";
import { InputSearch } from "@/components/table";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import { useParams, useSearchParams } from "next/navigation";
import React, {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { TAsesmenDok } from "../../schema";

export const FormPenunjangSchema = z.object({
  id_kunjungan: z.string(),
  cito: z.boolean(),
  // perujuk_luar: z.number().nullable(),
  id_perujuk: z.string().optional().nullable(),
  diagnosis: z.string().min(1, "harus diisi"),
  informasi: z.string().min(1, "harus diisi"),
  detail: z.number().array(),
});
export type FormPenunjang = z.infer<typeof FormPenunjangSchema>;

export type tempPermintaan = {
  id: number;
  nama: string;
};
type PermintPenunjangDialogProps = {
  isUpdate: boolean;
  terajukan: boolean;
  permintDialog: boolean;
  listPermintaan: tempPermintaan[];
  setTerajukan: React.Dispatch<React.SetStateAction<boolean>>;
  setPermintDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setListPermintaan: React.Dispatch<React.SetStateAction<tempPermintaan[]>>;
};
export function PermintLabDialog({
  isUpdate,
  terajukan,
  permintDialog,
  listPermintaan,
  setPermintDialog,
  setTerajukan,
  setListPermintaan,
}: PermintPenunjangDialogProps) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const params = useParams();
  const searchParams = useSearchParams();
  const [idPegawai] = useState(searchParams.get("kode")!);
  const [tanggal] = useState<string>(
    (params.idKunjungan as string).substring(0, 8)
  );
  const updateKemarin = useMemo(() => {
    return (
      (isUpdate &&
        tanggal < new Date().toISOString().slice(0, 10).replace(/-/g, "")) ||
      false
    );
  }, [tanggal]);

  const [tindakansLab, setTindakansLab] = useState<Penunjang[]>([]);
  const [cariLab, setCariLab] = useState<string>("");
  const deferredCariLab = useDeferredValue(cariLab);

  const {
    watch,
    setValue,
    trigger,
    unregister,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  const getTindakansLab = async () => {
    try {
      const url = new URL(`${APIURL}/rs/laborat`);
      const params = {
        keyword: deferredCariLab,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setTindakansLab(json.data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };
  const laborat = watch("laborat");
  useEffect(() => {
    if (!permintDialog) return;
    getTindakansLab();
    if (laborat) dPermintLabDispatch({ type: "dpermint", dpermint: laborat });
    return () => {
      setCariLab("");
    };
  }, [permintDialog]);
  useEffect(() => {
    getTindakansLab();
  }, [deferredCariLab]);

  type DPermintLabState = {
    diagnosis: string;
    informasi: string;
    detail: number[];
  };
  type DPermintLabAction =
    | { type: "reset" }
    | {
        type: "dpermint";
        dpermint: DPermintLabState;
      }
    | {
        type: "diagnosis";
        diagnosis: string;
      }
    | {
        type: "informasi";
        informasi: string;
      }
    | {
        type: "detail";
        detail: number[];
      };
  const dPermintLabState = {
    diagnosis: "",
    informasi: "",
    detail: [],
  };
  const dPermintLabActs = (
    state: DPermintLabState,
    action: DPermintLabAction
  ) => {
    switch (action.type) {
      case "reset": {
        return {
          ...dPermintLabState,
        };
      }
      case "dpermint": {
        return {
          ...action.dpermint,
        };
      }
      case "diagnosis": {
        return {
          ...state,
          diagnosis: action.diagnosis,
        };
      }
      case "informasi": {
        return {
          ...state,
          informasi: action.informasi,
        };
      }
      case "detail": {
        return {
          ...state,
          detail: action.detail,
        };
      }
    }
  };
  const [dPermintLab, dPermintLabDispatch] = useReducer(
    dPermintLabActs,
    dPermintLabState
  );

  const ajukanPermintaanLab = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      e?.preventDefault();
      setValue("laborat", dPermintLab);
      const tes = await trigger("laborat");
      if (!tes)
        return toast.warn("Lengkapi isian terlebih dahulu!", {
          position: "top-left",
        });
      const post = await fetch(`${APIURL}/rs/penunjang/permintaan/lab`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          ...dPermintLab,
          id_kunjungan: params.idKunjungan as string,
          id_perujuk: idPegawai,
        }),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      setTerajukan(true);
      setListPermintaan(
        listPermintaan.filter((val) => dPermintLab.detail.includes(val.id))
      );
      dPermintLabDispatch({ type: "reset" });
      setPermintDialog(false);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={permintDialog} as={Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={() => false}>
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
                  "flex h-screen w-full max-w-2xl transform flex-col justify-stretch rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Permintaan Laboratorium
                </Dialog.Title>
                <div className="flex h-fit flex-1 flex-col overflow-y-auto text-xs">
                  <div className="grid grid-cols-2 gap-2 py-2">
                    <div
                      className={cn(
                        errors?.laborat?.diagnosis && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Diagnosis Klinis
                        </label>
                        {errors?.laborat?.diagnosis ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors?.laborat?.diagnosis.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="-mb-1.5 px-2 py-1 text-xs"
                        value={dPermintLab.diagnosis}
                        onChange={(e) =>
                          dPermintLabDispatch({
                            type: "diagnosis",
                            diagnosis: e.target.value,
                          })
                        }
                        disabled={updateKemarin}
                        // {...register("diagnosis")}
                      />
                    </div>
                    <div
                      className={cn(
                        errors?.laborat?.informasi && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Informasi Tambahan
                        </label>
                        {errors?.laborat?.informasi ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors?.laborat.informasi.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="-mb-1.5 px-2 py-1 text-xs"
                        value={dPermintLab.informasi}
                        onChange={(e) =>
                          dPermintLabDispatch({
                            type: "informasi",
                            informasi: e.target.value,
                          })
                        }
                        disabled={updateKemarin}
                        // {...register("laborat.informasi")}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex flex-1 flex-col gap-2 overflow-y-auto rounded bg-slate-100 p-2 pt-0 dark:bg-gray-700",
                      css.scrollbar
                    )}
                  >
                    <div className="sticky top-0 flex items-center justify-between bg-slate-100 pt-2 dark:bg-gray-700">
                      <p className="font-semibold">List Tindakan</p>
                      {errors?.laborat?.detail ? (
                        <small className="absolute -bottom-2 w-full bg-slate-100 text-red-500 dark:bg-gray-700">
                          Pilih salah satu
                        </small>
                      ) : null}
                      <InputSearch
                        className="w-fit py-1 pr-2 text-xs"
                        value={cariLab}
                        onChange={(e) => setCariLab(e.target.value)}
                      />
                    </div>
                    {tindakansLab ? (
                      <div className="grid h-fit grid-cols-2 justify-end gap-2 py-1">
                        {/* <Controller
                          control={control}
                          name={"laborat.detail"}
                          render={({ field: { onChange, value, onBlur } }) => {
                            return (
                              <> */}
                        {tindakansLab?.map((val, idx) => (
                          <div
                            className="flex items-start justify-start gap-1"
                            key={idx}
                          >
                            <input
                              type="checkbox"
                              className="cursor-pointer"
                              id={"lab-" + val.id}
                              disabled={updateKemarin}
                              checked={dPermintLab.detail?.some(
                                (some) => some === val.id
                              )}
                              onChange={() => {
                                const updatedDetail = dPermintLab.detail
                                  ? [...dPermintLab.detail]
                                  : [];
                                const index = updatedDetail.indexOf(val.id);
                                if (index === -1) {
                                  updatedDetail.push(val.id);
                                  setListPermintaan([
                                    ...listPermintaan,
                                    { id: val.id, nama: val.nama },
                                  ]);
                                  setValue("deleted.detail_lab", [
                                    ...(
                                      watch("deleted.detail_lab") || []
                                    ).filter((valDel) => valDel !== val.id),
                                  ]);
                                } else {
                                  updatedDetail.splice(index, 1);
                                  setListPermintaan(
                                    listPermintaan.filter(
                                      (tempVal) => tempVal.id !== val.id
                                    )
                                  );
                                  setValue("deleted.detail_lab", [
                                    ...(watch("deleted.detail_lab") || []),
                                    val.id,
                                  ]);
                                }
                                dPermintLabDispatch({
                                  type: "detail",
                                  detail: updatedDetail,
                                });
                              }}
                            />
                            <label
                              className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                              htmlFor={"lab-" + val.id}
                            >
                              {val.nama}
                            </label>
                          </div>
                        ))}
                        {/* </>
                            );
                          }}
                        /> */}
                      </div>
                    ) : (
                      <small className="text-center">
                        Data tidak ditemukan
                      </small>
                    )}
                  </div>
                  <div className="flex justify-end gap-1 py-2">
                    {!isUpdate && !terajukan ? (
                      <Button color="green" onClick={ajukanPermintaanLab}>
                        Ajukan Permintaan
                      </Button>
                    ) : null}
                    <Button
                      onClick={async () => {
                        if (dPermintLab.detail.length > 0) {
                          if (isUpdate) {
                            unregister("deleted.lab");
                            setValue("deleted.detail_lab", [
                              ...(watch("deleted.detail_lab") || []).filter(
                                (valDel) => !dPermintLab.detail.includes(valDel)
                              ),
                            ]);
                          }
                          setValue("laborat", dPermintLab);
                          const tes = await trigger("laborat");
                          if (!tes)
                            return toast.warn(
                              "Lengkapi isian terlebih dahulu!",
                              { position: "top-left" }
                            );
                          setListPermintaan(
                            listPermintaan.filter((val) =>
                              dPermintLab.detail.includes(val.id)
                            )
                          );
                          dPermintLabDispatch({ type: "reset" });
                          setPermintDialog(false);
                        } else {
                          if (isUpdate) setValue("deleted.lab", true);
                          unregister("laborat");
                          setListPermintaan([]);
                          dPermintLabDispatch({ type: "reset" });
                          setPermintDialog(false);
                        }
                      }}
                      color="sky"
                    >
                      {!isUpdate ? "Lanjut" : "Ubah"}
                    </Button>
                    {/* <Button
                      color="red"
                      onClick={() => permintLabDispatch("tutup")}
                    >
                      Keluar
                    </Button> */}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function PermintRadDialog({
  isUpdate,
  terajukan,
  permintDialog,
  listPermintaan,
  setPermintDialog,
  setTerajukan,
  setListPermintaan,
}: PermintPenunjangDialogProps) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const params = useParams();
  const searchParams = useSearchParams();
  const [idPegawai] = useState(searchParams.get("kode")!);
  const [tanggal] = useState<string>(
    (params.idKunjungan as string).substring(0, 8)
  );
  const updateKemarin = useMemo(() => {
    return (
      (isUpdate &&
        tanggal < new Date().toISOString().slice(0, 10).replace(/-/g, "")) ||
      false
    );
  }, [tanggal]);

  const [tindakansRad, setTindakansRad] = useState<Penunjang[]>([]);
  const [cariRad, setCariRad] = useState<string>("");
  const deferredCariRad = useDeferredValue(cariRad);

  const {
    watch,
    setValue,
    trigger,
    unregister,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  const getTindakansRad = async () => {
    try {
      const url = new URL(`${APIURL}/rs/radiologi`);
      const params = {
        keyword: deferredCariRad,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setTindakansRad(json.data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };
  const radiologi = watch("radiologi");
  useEffect(() => {
    if (!permintDialog) return;
    getTindakansRad();
    if (radiologi)
      dPermintRadDispatch({ type: "dpermint", dpermint: radiologi });
    return () => {
      setCariRad("");
    };
  }, [permintDialog]);
  useEffect(() => {
    getTindakansRad();
  }, [deferredCariRad]);

  type DPermintRadState = {
    diagnosis: string;
    informasi: string;
    detail: number[];
  };
  type DPermintRadAction =
    | { type: "reset" }
    | {
        type: "dpermint";
        dpermint: DPermintRadState;
      }
    | {
        type: "diagnosis";
        diagnosis: string;
      }
    | {
        type: "informasi";
        informasi: string;
      }
    | {
        type: "detail";
        detail: number[];
      };
  const dPermintRadState = {
    diagnosis: "",
    informasi: "",
    detail: [],
  };
  const dPermintRadActs = (
    state: DPermintRadState,
    action: DPermintRadAction
  ) => {
    switch (action.type) {
      case "reset": {
        return {
          ...dPermintRadState,
        };
      }
      case "dpermint": {
        return {
          ...action.dpermint,
        };
      }
      case "diagnosis": {
        return {
          ...state,
          diagnosis: action.diagnosis,
        };
      }
      case "informasi": {
        return {
          ...state,
          informasi: action.informasi,
        };
      }
      case "detail": {
        return {
          ...state,
          detail: action.detail,
        };
      }
    }
  };
  const [dPermintRad, dPermintRadDispatch] = useReducer(
    dPermintRadActs,
    dPermintRadState
  );

  const ajukanPermintaanRad = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      e?.preventDefault();
      setValue("radiologi", dPermintRad);
      const tes = await trigger("radiologi");
      if (!tes)
        return toast.warn("Lengkapi isian terlebih dahulu!", {
          position: "top-left",
        });
      const post = await fetch(`${APIURL}/rs/penunjang/permintaan/rad`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          ...dPermintRad,
          id_kunjungan: params.idKunjungan as string,
          id_perujuk: idPegawai,
        }),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      setTerajukan(true);
      setListPermintaan(
        listPermintaan.filter((val) => dPermintRad.detail.includes(val.id))
      );
      dPermintRadDispatch({ type: "reset" });
      setPermintDialog(false);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={permintDialog} as={Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={() => false}>
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
                  "flex h-screen w-full max-w-2xl transform flex-col justify-stretch rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Permintaan Radiologi
                </Dialog.Title>
                <div className="flex h-fit flex-1 flex-col overflow-y-auto text-xs">
                  <div className="grid grid-cols-2 gap-2 py-2">
                    <div
                      className={cn(
                        errors?.radiologi?.diagnosis && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Diagnosis Klinis
                        </label>
                        {errors?.radiologi?.diagnosis ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors?.radiologi?.diagnosis.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="-mb-1.5 px-2 py-1 text-xs"
                        value={dPermintRad.diagnosis}
                        onChange={(e) =>
                          dPermintRadDispatch({
                            type: "diagnosis",
                            diagnosis: e.target.value,
                          })
                        }
                        disabled={updateKemarin}
                      />
                    </div>
                    <div
                      className={cn(
                        errors?.radiologi?.informasi && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="font-semibold dark:text-neutral-200">
                          Informasi Tambahan
                        </label>
                        {errors?.radiologi?.informasi ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors?.radiologi.informasi.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea
                        className="-mb-1.5 px-2 py-1 text-xs"
                        value={dPermintRad.informasi}
                        onChange={(e) =>
                          dPermintRadDispatch({
                            type: "informasi",
                            informasi: e.target.value,
                          })
                        }
                        disabled={updateKemarin}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex flex-1 flex-col gap-2 overflow-y-auto rounded bg-slate-100 p-2 pt-0 dark:bg-gray-700",
                      css.scrollbar
                    )}
                  >
                    <div className="sticky top-0 flex items-center justify-between bg-slate-100 pt-2 dark:bg-gray-700">
                      <p className="font-semibold">List Tindakan</p>
                      {errors?.radiologi?.detail ? (
                        <small className="absolute -bottom-2 w-full bg-slate-100 text-red-500 dark:bg-gray-700">
                          Pilih salah satu
                        </small>
                      ) : null}
                      <InputSearch
                        className="w-fit py-1 pr-2 text-xs"
                        value={cariRad}
                        onChange={(e) => setCariRad(e.target.value)}
                      />
                    </div>
                    {tindakansRad ? (
                      <div className="grid h-fit grid-cols-2 justify-end gap-2 py-1">
                        {tindakansRad?.map((val, idx) => (
                          <div
                            className="flex items-start justify-start gap-1"
                            key={idx}
                          >
                            <input
                              type="checkbox"
                              className="cursor-pointer"
                              id={"rad-" + val.id}
                              disabled={updateKemarin}
                              checked={dPermintRad.detail?.some(
                                (some) => some === val.id
                              )}
                              onChange={() => {
                                const updatedDetail = dPermintRad.detail
                                  ? [...dPermintRad.detail]
                                  : [];
                                const index = updatedDetail.indexOf(val.id);
                                if (index === -1) {
                                  updatedDetail.push(val.id);
                                  setListPermintaan([
                                    ...listPermintaan,
                                    { id: val.id, nama: val.nama },
                                  ]);
                                  setValue("deleted.detail_rad", [
                                    ...(
                                      watch("deleted.detail_rad") || []
                                    ).filter((valDel) => valDel !== val.id),
                                  ]);
                                } else {
                                  updatedDetail.splice(index, 1);
                                  setListPermintaan(
                                    listPermintaan.filter(
                                      (tempVal) => tempVal.id !== val.id
                                    )
                                  );
                                  setValue("deleted.detail_rad", [
                                    ...(watch("deleted.detail_rad") || []),
                                    val.id,
                                  ]);
                                }
                                dPermintRadDispatch({
                                  type: "detail",
                                  detail: updatedDetail,
                                });
                              }}
                            />
                            <label
                              className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
                              htmlFor={"rad-" + val.id}
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
                  <div className="flex justify-end gap-1 py-2">
                    {!isUpdate && !terajukan ? (
                      <Button color="green" onClick={ajukanPermintaanRad}>
                        Ajukan Permintaan
                      </Button>
                    ) : null}
                    <Button
                      onClick={async () => {
                        if (dPermintRad.detail.length > 0) {
                          if (isUpdate) {
                            unregister("deleted.rad");
                            setValue("deleted.detail_rad", [
                              ...(watch("deleted.detail_rad") || []).filter(
                                (valDel) => !dPermintRad.detail.includes(valDel)
                              ),
                            ]);
                          }
                          setValue("radiologi", dPermintRad);
                          const tes = await trigger("radiologi");
                          if (!tes)
                            return toast.warn(
                              "Lengkapi isian terlebih dahulu!",
                              { position: "top-left" }
                            );
                          setListPermintaan(
                            listPermintaan.filter((val) =>
                              dPermintRad.detail.includes(val.id)
                            )
                          );
                          dPermintRadDispatch({ type: "reset" });
                          setPermintDialog(false);
                        } else {
                          if (isUpdate) setValue("deleted.rad", true);
                          unregister("radiologi");
                          setListPermintaan([]);
                          dPermintRadDispatch({ type: "reset" });
                          setPermintDialog(false);
                        }
                      }}
                      color="sky"
                    >
                      {!isUpdate ? "Lanjut" : "Ubah"}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
