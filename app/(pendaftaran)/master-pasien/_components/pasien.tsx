import React, {
  Fragment,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { APIURL } from "@/lib/connection";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/form";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Button } from "@/components/button";
import css from "@/assets/css/scrollbar.module.css";
import { UbahAction, UbahState } from "../page";
import {
  DataPesertaBPJS,
  DetailPasien,
  FormPasien,
  PasienSchema,
  Propinsi,
  listGender,
} from "@/app/(pendaftaran)/schema";
import { Tooltip } from "@/components/tooltip";
import { TbEdit, TbTrash } from "react-icons/tb";
import { CaraBayar } from "@/app/(referensi)/list-carabayar/page";

export default function PasienBaruDialog({
  dialog,
  setDialog,
  ubah,
  ubahDispatch,
  loadData,
}: {
  dialog: boolean;
  setDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah?: UbahState;
  ubahDispatch?: React.Dispatch<UbahAction>;
  loadData?: () => Promise<void>;
}) {
  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah?.modal && !dialog) return judulLama;
    setJudulLama(ubah?.modal ? "Ubah Pasien" : "Tambah Pasien");
    return ubah?.modal ? "Ubah Pasien" : "Tambah Pasien";
  }, [dialog, ubah?.modal]);

  const tutup = () => {
    reset();
    setListKab([]);
    setListKec([]);
    setListKel([]);
    if (dialog) {
      setDialog(false);
    } else {
      initializedEdit.current = false;
      ubahDispatch &&
        ubahDispatch({
          type: "setUbah",
          ubah: { modal: false },
        });
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    control,
    formState: { errors },
  } = useForm<FormPasien>({
    resolver: zodResolver(PasienSchema),
  });

  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);
  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const nik = watch("nik");
  const initializedEdit = useRef<boolean>(false);
  const loadDataPeserta = async () => {
    try {
      if (ubah?.modal && !initializedEdit.current)
        return (initializedEdit.current = true);
      const url = new URL(`${APIURL}/rs/pasien/bpjs`);
      const params = {
        nomer: nik,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      const data = json.data as DataPesertaBPJS;
      setValue("nama", data.nama);
      setValue(
        "jenis_kelamin",
        data.sex === "L" ? "Laki-laki" : data.sex === "P" ? "Perempuan" : ""
      );
      setValue("tanggal_lahir", data.tglLahir);
      setValue("hp", data.mr.noTelepon);
      setValue("propinsi", parseInt(data.nik.substring(0, 2)));
      setValue("kota", parseInt(data.nik.substring(0, 4)));
      setValue("kecamatan", parseInt(data.nik.substring(0, 7)));
      setValue("asuransi", [
        ...(watch("asuransi") || []).filter((val) => val.id_asuransi != 2),
        { id_asuransi: 2, nama: "BPJS Kesehatan", nomer: data.noKartu },
      ]);
    } catch (err) {
      const error = err as Error;
      // toast.error(`Gagal mengambil data ${param}!`);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!nik || nik?.length !== 16) return;
    loadDataPeserta();
  }, [nik]);

  /* ASURANSI */
  const [asuransiDialog, setAsuransiDialog] = useState<boolean>(false);
  type DialogState = {
    modal: boolean;
    data?: {
      idx?: number;
      id_asuransi: number;
      nama: string;
      nomer: string;
    };
  };
  type DialogAction = DialogState;
  const dialogState = {
    modal: false,
    data: undefined,
  };
  const ubahAsuransiActs = (state: DialogState, action: DialogAction) => {
    return action;
  };
  const [ubahAsuransi, ubahAsuransiDispatch] = useReducer(
    ubahAsuransiActs,
    dialogState
  );
  const [asuransiOptions, setAsuransiOptions] = useState<MyOptions>([]);
  const loadAsuransi = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/asuransi`);
      const params = {
        perPage: 25,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      let options = json?.data
        ?.filter((data: CaraBayar) => data.id != 1)
        .map((data: CaraBayar) => ({
          value: data?.id,
          label: data?.nama,
        })) as MyOptions;
      if (!ubah?.modal) {
        options = options.filter(
          (data) =>
            !watch("asuransi")
              ?.map((val) => val.id_asuransi)
              .includes(data.value as number)
        );
      }
      setAsuransiOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  type AsuransiState =
    | {
        id_asuransi: number;
        nama: string;
        nomer: string;
      }
    | undefined;
  type AsuransiAction = AsuransiState;
  const asuransiStateActs = (state: AsuransiState, action: AsuransiAction) => {
    return action;
  };
  const [asuransiState, asuransiStateDispatch] = useReducer(
    asuransiStateActs,
    undefined
  );
  const addAsuransi = async () => {
    setValue("asuransi", [...(watch("asuransi") || []), asuransiState!]);
    asuransiStateDispatch(undefined);
    setAsuransiDialog(false);
  };

  const hapusActs = (state: DialogState, action: DialogAction) => {
    return action;
  };
  const [hapus, hapusDispatch] = useReducer(hapusActs, dialogState);
  const hapusAsuransi = async () => {
    if (watch("asuransi")?.find((_, i) => i === hapus.data?.idx)?.id) {
      setValue("deleted.asuransi", [
        ...(watch("deleted.asuransi") || []),
        watch("asuransi")?.find((_, i) => i === hapus.data?.idx)?.id!,
      ]);
    }
    setValue(
      "asuransi",
      watch("asuransi")?.filter((_, i) => hapus.data?.idx !== i)
    );
    hapusDispatch({ modal: false });
  };

  const loadDataAlamat = async (param: string) => {
    try {
      const url = new URL(`${APIURL}/rs/${param}`);
      const data = await fetch(url, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      return fetchData.data;
    } catch (err) {
      const error = err as Error;
      // toast.error(`Gagal mengambil data ${param}!`);
      console.error(error);
    }
  };
  const selProp = watch("propinsi");
  const [listProp, setListProp] = useState<Propinsi[] | undefined>(undefined);
  const loadProp = async () => {
    const data = await loadDataAlamat("provinsi");
    setListProp(data);
  };

  const selKab = watch("kota");
  const [listKab, setListKab] = useState<unknown[] | undefined>(undefined);
  useEffect(() => {
    const loadKab = async () => {
      if (!selProp) return;
      const data = await loadDataAlamat(`kabupaten/prov/${selProp}`);
      setListKab(data);
    };
    loadKab();
  }, [selProp]);

  const selKec = watch("kecamatan");
  const [listKec, setListKec] = useState<unknown[] | undefined>(undefined);
  useEffect(() => {
    const loadKec = async () => {
      if (!selKab) return;
      const data = await loadDataAlamat(`kecamatan/kab/${selKab}`);
      setListKec(data);
    };
    loadKec();
  }, [selKab]);

  const [listKel, setListKel] = useState<unknown[] | undefined>(undefined);
  useEffect(() => {
    const loadKel = async () => {
      if (!selKec) return;
      const data = await loadDataAlamat(`desa/kec/${selKec}`);
      setListKel(data);
    };
    loadKel();
  }, [selKec]);

  const [listAgama] = useState([
    "Islam",
    "Protestan",
    "Katholik",
    "Hindu",
    "Buddha",
    "Kong Hu Cu",
  ]);

  useEffect(() => {
    if (dialog || ubah?.modal) loadProp();

    if (!ubah?.data) return;
    const loadDetail = async () => {
      const url = new URL(`${APIURL}/rs/pasien/${ubah?.data?.id}`);
      try {
        const res = await fetch(url, { method: "GET", headers: headers });
        const json = await res.json();
        const data: DetailPasien = json.data;
        setValue("nik", data.nik);
        setValue("nama", data.nama);
        setValue("jenis_kelamin", data.jenis_kelamin);
        setValue(
          "tanggal_lahir",
          new Date(data.tanggal_lahir!).toLocaleDateString("fr-CA")
        );
        setValue("hp", data.hp);
        setValue("wn", data.wn);
        setValue("rt", data.rt);
        setValue("rw", data.rw);
        setValue("propinsi", data.id_propinsi);
        setValue("kota", data.id_kabupaten);
        setValue("kecamatan", data.id_kecamatan);
        setValue("desa", parseInt(data.id_kelurahan));
        setValue("alamat", data.alamat);
        setValue("agama", data.agama);
        setValue("ibu", data.ibu);
        setValue("asuransi", data.asuransi);
      } catch (err) {
        const error = err as Error;
        toast.error(`Gagal mengambil data pasien!`);
        console.error(error);
      }
    };
    loadDetail();

    return () => {
      setValue("jenis_kelamin", "");
      setValue("propinsi", NaN);
      setValue("kota", NaN);
      setValue("kecamatan", NaN);
      setValue("desa", NaN);
    };
  }, [dialog, ubah?.modal]);

  const submitHandler: SubmitHandler<FormPasien> = async (data, e) => {
    e?.preventDefault;
    try {
      let resJson: any;
      if (dialog) {
        const res = await fetch(`${APIURL}/rs/pasien`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await res.json();
        if (resJson.status !== "Ok") throw new Error(resJson.message);
      } else {
        const res = await fetch(`${APIURL}/rs/pasien/${ubah?.data?.id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await res.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      }
      toast.success(
        dialog ? "Pasien berhasil didaftarkan!" : "Pasien berhasil dirubah!"
      );
      tutup();
      loadData && loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={dialog || ubah?.modal === true} as={Fragment}>
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
                  "h-full w-full max-w-2xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  {judul}
                </Dialog.Title>
                <form
                  className="flex flex-col"
                  onSubmit={handleSubmit(submitHandler)}
                >
                  <div className="mt-2 grid grid-cols-2 gap-2">
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
                      <Input
                        id="nik"
                        {...register("nik", {
                          onChange: (
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            trigger("nik");
                            e.target.value === "" && setValue("nik", null);
                          },
                        })}
                      />
                    </div>
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
                              value={options.find((c) => c.value === value)}
                              placeholder="Pilih Jenis Kelamin"
                            />
                          );
                        }}
                      />
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
                      <Input
                        id="tgl"
                        type="date"
                        {...register("tanggal_lahir")}
                      />
                    </div>
                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.hp && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="hp"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          No. HP
                        </label>
                        {errors.hp ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.hp.message}
                          </p>
                        ) : null}
                      </div>
                      <Input id="hp" {...register("hp")} />
                    </div>
                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.wn && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="wn"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kewarganegaraan
                        </label>
                        {errors.wn ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.wn.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="wn"
                        render={({ field: { onChange, value } }) => {
                          const options = ["WNI", "WNA"].map((val) => ({
                            label: val,
                            value: val,
                          }));

                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options.find((c) => c.value === value)}
                              placeholder="Pilih Kewarganegaraan"
                            />
                          );
                        }}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.propinsi && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="propinsi"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Propinsi
                        </label>
                        {errors.propinsi ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.propinsi.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="propinsi"
                        render={({ field: { onChange, value } }) => {
                          const options = listProp?.map((val: any) => ({
                            label: val?.nama,
                            value: val?.id,
                          }));
                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options?.find(
                                (c: any) => parseInt(c.value) === value
                              )}
                              placeholder="Pilih Propinsi"
                            />
                          );
                        }}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.kota && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="kota"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kota
                        </label>
                        {errors.kota ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.kota.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="kota"
                        render={({ field: { onChange, value } }) => {
                          const options = listKab?.map((val: any) => ({
                            label: val?.nama,
                            value: val?.id,
                          }));
                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options?.find(
                                (c: any) => parseInt(c.value) === value
                              )}
                              placeholder="Pilih Kota"
                            />
                          );
                        }}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.kecamatan && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="kecamatan"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kecamatan
                        </label>
                        {errors.kecamatan ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.kecamatan.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="kecamatan"
                        render={({ field: { onChange, value } }) => {
                          const options = listKec?.map((val: any) => ({
                            label: val?.nama,
                            value: val?.id,
                          }));
                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options?.find(
                                (c: any) => parseInt(c.value) === value
                              )}
                              placeholder="Pilih Kecamatan"
                            />
                          );
                        }}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.desa && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="desa"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Kelurahan
                        </label>
                        {errors.desa ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.desa.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="desa"
                        render={({ field: { onChange, value } }) => {
                          const options = listKel?.map((val: any) => ({
                            label: val?.nama,
                            value: parseInt(val?.id),
                          }));
                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options?.find(
                                (c: any) => parseInt(c.value) === value
                              )}
                              placeholder="Pilih Kelurahan"
                            />
                          );
                        }}
                      />
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
                      <Input id="alamat" {...register("alamat")} />
                    </div>
                    <div className={"grid max-w-xs grid-cols-2 gap-1.5"}>
                      <div className={cn(errors.rt && "rounded-lg bg-red-100")}>
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="rt"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            RT
                          </label>
                          {errors.rt ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.rt.message}
                            </p>
                          ) : null}
                        </div>
                        <Input id="rt" {...register("rt")} />
                      </div>
                      <div className={cn(errors.rw && "rounded-lg bg-red-100")}>
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="rw"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            RW
                          </label>
                          {errors.rw ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.rw.message}
                            </p>
                          ) : null}
                        </div>
                        <Input id="rw" {...register("rw")} />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.agama && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="agama"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Agama
                        </label>
                        {errors.agama ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.agama.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="agama"
                        render={({ field: { onChange, value } }) => {
                          const options = listAgama?.map((val: any) => ({
                            label: val,
                            value: val,
                          }));
                          return (
                            <SelectInput
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              onChange={(val: any) => onChange(val.value)}
                              options={options}
                              value={options?.find(
                                (c: any) => c.value === value
                              )}
                              menuPlacement="top"
                              placeholder="Pilih Agama"
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
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <p>Asuransi</p>
                        <Button
                          className="px-2 py-0.5 text-xs"
                          color="green"
                          onClick={() => setAsuransiDialog(true)}
                        >
                          Tambah
                        </Button>
                      </div>
                      <div
                        className={cn("w-full overflow-hidden rounded shadow")}
                      >
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                              <td className="px-4 py-2">No.</td>
                              <td className="px-4 py-2">Asuransi</td>
                              <td className="px-4 py-2">No. Peserta</td>
                              <td className="px-4 py-2 text-center">*</td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {watch("asuransi")?.map((as, idx) => (
                              <tr
                                className={cn(
                                  "bg-white hover:text-sky-600 dark:bg-slate-900"
                                  //, "divide-x divide-gray-300 dark:divide-gray-800"
                                )}
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {idx + 1 + "."}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {as.nama}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {as.nomer}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  <div className="flex items-center justify-center gap-2">
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
                                              asuransiStateDispatch(as);
                                              loadAsuransi(as.nama);
                                              ubahAsuransiDispatch({
                                                modal: true,
                                                data: { ...as, idx: idx },
                                              });
                                            }}
                                          >
                                            <TbEdit
                                              size="1.2rem"
                                              className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                            />
                                          </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content
                                          side="left"
                                          sideOffset={0}
                                          className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                        >
                                          <p>Ubah</p>
                                        </Tooltip.Content>
                                      </Tooltip.Root>
                                    </Tooltip.Provider>

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
                                              hapusDispatch({
                                                modal: true,
                                                data: { ...as, idx: idx },
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
                                          <p>Hapus</p>
                                        </Tooltip.Content>
                                      </Tooltip.Root>
                                    </Tooltip.Provider>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      color={ubah?.modal ? "cyan100" : "green100"}
                    >
                      {ubah?.modal ? "Ubah" : "Tambah"}
                    </Button>
                    <Button
                      className="w-fit border border-transparent text-sm font-medium focus:ring-0"
                      color="red"
                      onClick={tutup}
                    >
                      Keluar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={asuransiDialog || ubahAsuransi.modal} as={Fragment}>
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
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                    <Dialog.Title
                      as="p"
                      className="font-medium leading-6 text-gray-900"
                    >
                      {asuransiDialog
                        ? "Tambah Asuransi"
                        : "Ubah Asuransi " + (ubahAsuransi.data?.nama || "")}
                    </Dialog.Title>
                    <form
                      className={cn("mt-2 flex flex-col gap-2")}
                      onSubmit={handleSubmit(submitHandler)}
                    >
                      <div>
                        <AsyncSelectInput
                          isDisabled={ubahAsuransi.modal}
                          cacheOptions
                          loadOptions={loadAsuransi}
                          defaultOptions={asuransiOptions}
                          value={asuransiOptions?.find(
                            (val) => val.value === asuransiState?.id_asuransi
                          )}
                          onMenuOpen={() => loadAsuransi("")}
                          onChange={(option: MyOption | null) =>
                            asuransiStateDispatch({
                              id_asuransi: parseInt(
                                (option?.value as string) || ""
                              ),
                              nama: option?.label as string,
                              nomer: "",
                            })
                          }
                          placeholder="Pilih Asuransi"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          maxMenuHeight={150}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="No. Peserta"
                          disabled={
                            !ubahAsuransi.modal && !asuransiState?.id_asuransi
                          }
                          value={
                            ubahAsuransi.modal
                              ? watch("asuransi")?.find(
                                  (_, idx) => idx === ubahAsuransi.data?.idx
                                )?.nomer
                              : asuransiState?.nomer
                          }
                          onChange={(e) => {
                            if (ubahAsuransi.modal) {
                              const detailNomer = (watch("asuransi") || []).map(
                                (val, idx) => {
                                  if (idx === ubahAsuransi.data?.idx) {
                                    return {
                                      ...val,
                                      nomer: e.target.value,
                                    };
                                  }
                                  return val;
                                }
                              );
                              setValue("asuransi", detailNomer);
                            } else {
                              asuransiStateDispatch({
                                ...asuransiState!,
                                nomer: e.target.value,
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-1">
                        {asuransiDialog ? (
                          <Button color="green100" onClick={addAsuransi}>
                            Tambah
                          </Button>
                        ) : null}
                        <Button
                          color="red"
                          onClick={() => {
                            ubahAsuransi.modal
                              ? ubahAsuransiDispatch({ modal: false })
                              : setAsuransiDialog(false);
                            asuransiStateDispatch(undefined);
                          }}
                        >
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

        <Transition show={hapus.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={() =>
              hapusDispatch({
                modal: false,
                data: hapus.data,
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
                      Hapus Asuransi
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus {hapus.data?.nama}{" "}
                        {!!watch("nama") ? "pasien " + watch("nama") : ""}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-1">
                      <Button color="red100" onClick={hapusAsuransi}>
                        Hapus
                      </Button>
                      <Button
                        color="red"
                        onClick={() =>
                          hapusDispatch({
                            modal: false,
                            data: hapus.data,
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
      </Dialog>
    </Transition>
  );
}
