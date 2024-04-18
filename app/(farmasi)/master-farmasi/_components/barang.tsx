import { useState, useMemo, useEffect, Fragment } from "react";
import { Barang, Satuan, Sediaan, Tipe, Zat } from "../../schema";
import Cookies from "js-cookie";
import { APIURL } from "@/lib/connection";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/button";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import { Input, InputArea } from "@/components/form";

type UbahState = {
  modal: boolean;
  data?: Barang;
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

type BarangDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahState;
  ubahDispatch: React.Dispatch<UbahAction>;
  loadBarang: () => Promise<void>;
};

export default function BarangDialog({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadBarang,
}: BarangDialogProps) {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : ubahDispatch({
          type: "setUbah",
          ubah: {
            ...ubah,
            modal: false,
          },
        });
  };

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? "Ubah Barang" : "Tambah Barang");
    return ubah.modal ? "Ubah Barang" : "Tambah Barang";
  }, [tambahDialog, ubah.modal]);

  type ParamsFarmasi = "satuan" | "sediaan" | "tipe" | "zat";

  const loadList = async (param: ParamsFarmasi, keyword: string) => {
    try {
      const url = new URL(`${APIURL}/rs/farmasi/${param}`);
      const params = {
        page: 1,
        perPage: 10,
        // cari: deferredCari,
        keyword: keyword,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      return json?.data;
    } catch (error) {
      console.error(error);
    }
  };

  const [satuanOptions, setSatuanOptions] = useState<MyOptions>([]);
  const loadSatuan = async (inputText: string): Promise<MyOptions> => {
    try {
      const data: Satuan[] = await loadList("satuan", inputText);
      const options = data.map((val) => ({
        value: val.id,
        label: val.nama,
      }));
      setSatuanOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const [sediaanOptions, setSediaanOptions] = useState<MyOptions>([]);
  const loadSediaan = async (inputText: string): Promise<MyOptions> => {
    try {
      const data: Sediaan[] = await loadList("sediaan", inputText);
      const options = data.map((val) => ({
        value: val.id,
        label: val.nama,
      }));
      setSediaanOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const [tipeOptions, setTipeOptions] = useState<MyOptions>([]);
  const loadTipe = async (inputText: string): Promise<MyOptions> => {
    try {
      const data: Tipe[] = await loadList("tipe", inputText);
      const options = data.map((val) => ({
        value: val.id,
        label: val.nama,
      }));
      setTipeOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const [zatOptions, setZatOptions] = useState<MyOptions>([]);
  const loadZat = async (inputText: string): Promise<MyOptions> => {
    try {
      const data: Zat[] = await loadList("zat", inputText);
      const options = data.map((val) => ({
        value: val.id,
        label: val.nama,
      }));
      setZatOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const BarangSchema = z.object({
    nama: z.string().min(1, "harus diisi"),
    id_satuan: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    stok: z.number({ required_error: "harus diisi" }),
    kekuatan: z.string(),
    id_sediaan: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    id_tipe: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
    id_zat: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  });
  type BarangSch = z.infer<typeof BarangSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<BarangSch>({
    resolver: zodResolver(BarangSchema),
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    loadSatuan("");
    loadSediaan("");
    loadTipe("");
    loadZat("");
  }, []);

  useEffect(() => {
    if (ubah.modal) {
      setValue("nama", ubah.data?.nama!);
      setValue("id_satuan", ubah.data?.id_satuan!);
      setValue("id_sediaan", ubah.data?.id_sediaan!);
      setValue("id_tipe", ubah.data?.id_tipe!);
      setValue("id_zat", ubah.data?.id_zat!);
      setValue("stok", ubah.data?.stok!);
    }

    return () => {
      setValue("id_satuan", NaN);
      setValue("id_sediaan", NaN);
      setValue("id_tipe", NaN);
      setValue("id_zat", NaN);
    };
  }, [tambahDialog, ubah.modal]);

  const submitHandler: SubmitHandler<BarangSch> = async (data, e) => {
    try {
      e?.preventDefault();
      let resJson: any;
      if (ubah.modal) {
        const put = await fetch(
          `${APIURL}/rs/farmasi/barang/${ubah.data?.id}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(data),
          }
        );
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const post = await fetch(`${APIURL}/rs/farmasi/barang`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      tutup();
      toast.success(resJson.message);
      loadBarang();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={ubah.modal || tambahDialog} as={Fragment}>
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
                  {judul}
                </Dialog.Title>
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div
                      className={cn(
                        "max-w-xs",
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
                      <Input {...register("nama")} />
                    </div>

                    <div
                      className={cn(
                        "max-w-xs",
                        errors.id_tipe && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="tipe"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Tipe
                        </label>
                        {errors.id_tipe ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_tipe.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_tipe"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadTipe}
                            defaultOptions={tipeOptions}
                            value={tipeOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) =>
                              onChange(option?.value)
                            }
                            placeholder="Pilih Tipe"
                          />
                        )}
                      />
                    </div>

                    <Transition
                      show={watch("id_tipe") === 1}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div
                        className={cn(
                          "max-w-xs",
                          errors.kekuatan && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="kekuatan"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Kekuatan
                          </label>
                          {errors.kekuatan ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.kekuatan.message}
                            </p>
                          ) : null}
                        </div>
                        <Input {...register("kekuatan")} />
                      </div>
                    </Transition>

                    <Transition
                      show={watch("id_tipe") === 1}
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div
                        className={cn(
                          "max-w-xs",
                          errors.id_sediaan && "rounded-lg bg-red-100"
                        )}
                      >
                        <div className="flex items-baseline justify-between">
                          <label
                            htmlFor="sediaan"
                            className="text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Sediaan
                          </label>
                          {errors.id_sediaan ? (
                            <p className="pr-0.5 text-xs text-red-500">
                              {errors.id_sediaan.message}
                            </p>
                          ) : null}
                        </div>
                        <Controller
                          control={control}
                          name="id_sediaan"
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelectInput
                              cacheOptions
                              loadOptions={loadSediaan}
                              defaultOptions={sediaanOptions}
                              value={sediaanOptions.find(
                                (val) => val.value === value
                              )}
                              onChange={(option: MyOption | null) =>
                                onChange(option?.value)
                              }
                              placeholder="Pilih Sediaan"
                            />
                          )}
                        />
                      </div>
                    </Transition>

                    <div
                      className={cn(
                        "max-w-xs",
                        errors.id_zat && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="zat"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Zat
                        </label>
                        {errors.id_zat ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_zat.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_zat"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadZat}
                            defaultOptions={zatOptions}
                            value={zatOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) =>
                              onChange(option?.value)
                            }
                            placeholder="Pilih Zat"
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "max-w-xs",
                        errors.id_satuan && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="satuan"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Satuan
                        </label>
                        {errors.id_satuan ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_satuan.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_satuan"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadSatuan}
                            defaultOptions={satuanOptions}
                            value={satuanOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) =>
                              onChange(option?.value)
                            }
                            placeholder="Pilih Satuan"
                          />
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "max-w-xs",
                        errors.stok && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="stok"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Stok
                        </label>
                        {errors.stok ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.stok.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        className="w-24"
                        type="number"
                        {...register("stok")}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <Button
                      type="submit"
                      color={tambahDialog ? "green100" : "cyan100"}
                    >
                      {judul}
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
      </Dialog>
    </Transition>
  );
}
