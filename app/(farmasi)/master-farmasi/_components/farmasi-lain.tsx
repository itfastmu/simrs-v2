import { useState, useMemo, useEffect, Fragment } from "react";
import { Depo, Satuan, Sediaan, Tipe, Zat } from "../../schema";
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
import { Input } from "@/components/form";
import { Unit } from "@/app/(referensi)/list-unit/page";

type UbahOthersState = {
  modal: boolean;
  data?: Satuan | Depo | Sediaan | Tipe | Omit<Tipe, "kode">;
};
type UbahOthersAction = { type: "setUbahOthers"; ubahOthers: UbahOthersState };

type OthersDialogProps = {
  key: number;
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  ubah: UbahOthersState;
  ubahDispatch: React.Dispatch<UbahOthersAction>;
  loadData: () => Promise<void>;
  judul: "Satuan" | "Depo" | "Sediaan" | "Tipe" | "Zat";
};

export default function OthersDialog({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
  judul,
}: OthersDialogProps) {
  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : ubahDispatch({
          type: "setUbahOthers",
          ubahOthers: {
            modal: false,
          },
        });
  };

  const [judulLama, setJudulLama] = useState<string>("");
  const judulDeskripsi = useMemo(() => {
    if (!ubah.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah.modal ? `Ubah ${judul}` : `Tambah ${judul}`);
    return ubah.modal ? `Ubah ${judul}` : `Tambah ${judul}`;
  }, [tambahDialog, ubah.modal]);

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [unitOptions, setUnitOptions] = useState<MyOptions>([]);
  const loadUnit = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/unit`);
      const params = {
        page: 1,
        perPage: 50,
        // cari: deferredCari,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      const options = json.data.map((val: Unit) => ({
        value: val.id,
        label: val.nama,
      }));
      setUnitOptions(options);
      return options;
    } catch (error) {
      toast.error("Cari unit gagal!");
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (!ubah.modal && !tambahDialog) return;
    loadUnit("");
  }, [ubah, tambahDialog]);

  const SatuanSchema = z.object({
    type: z.literal("Satuan"),
    nama: z.string().min(1, "harus diisi"),
    deskripsi: z.string().min(1, "harus diisi"),
  });

  const DepoSchema = z.object({
    type: z.literal("Depo"),
    nama: z.string().min(1, "harus diisi"),
    id_unit: z.number(),
  });

  const SediaanSchema = z.object({
    type: z.literal("Sediaan"),
    nama: z.string().min(1, "harus diisi"),
  });

  const TipeSchema = z.object({
    type: z.literal("Tipe"),
    nama: z.string().min(1, "harus diisi"),
    kode: z.string().min(1, "harus diisi"),
  });

  const ZatSchema = z.object({
    type: z.literal("Zat"),
    nama: z.string().min(1, "harus diisi"),
    kode: z.string().min(1, "harus diisi"),
  });

  const FormSchema = z.discriminatedUnion("type", [
    SatuanSchema,
    DepoSchema,
    SediaanSchema,
    TipeSchema,
    ZatSchema,
  ]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: judul,
    },
  });

  useEffect(() => {
    if (!ubah.data) return;
    switch (judul) {
      case "Satuan":
        setValue("nama", (ubah.data as Satuan)?.nama);
        setValue("deskripsi", (ubah.data as Satuan)?.deskripsi);
        break;
      case "Depo":
        setValue("nama", (ubah.data as Depo)?.nama);
        setValue("id_unit", (ubah.data as Depo)?.id_unit);
        break;
      case "Sediaan":
        setValue("nama", (ubah.data as Sediaan)?.nama);
        break;
      case "Tipe":
        setValue("nama", (ubah.data as Tipe)?.nama);
        setValue("kode", (ubah.data as Tipe)?.kode);
        break;
      case "Zat":
        setValue("nama", (ubah.data as Zat)?.nama);
        break;
    }

    return () => {
      setValue("id_unit", NaN);
    };
  }, [ubah.data]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      const { type, ...parsedData } = data;
      let resJson: any;
      if (ubah.modal) {
        const url =
          judul === "Satuan"
            ? `${APIURL}/rs/farmasi/satuan/${ubah.data?.id}`
            : judul === "Depo"
            ? `${APIURL}/rs/farmasi/depo/${ubah.data?.id}`
            : judul === "Sediaan"
            ? `${APIURL}/rs/farmasi/sediaan/${ubah.data?.id}`
            : judul === "Tipe"
            ? `${APIURL}/rs/farmasi/tipe/${ubah.data?.id}`
            : judul === "Zat"
            ? `${APIURL}/rs/farmasi/zat/${ubah.data?.id}`
            : "";

        const put = await fetch(url, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await put.json();
        if (resJson.status !== "Updated") throw new Error(resJson.message);
      } else {
        const url =
          judul === "Satuan"
            ? `${APIURL}/rs/farmasi/satuan`
            : judul === "Depo"
            ? `${APIURL}/rs/farmasi/depo`
            : judul === "Sediaan"
            ? `${APIURL}/rs/farmasi/sediaan`
            : judul === "Tipe"
            ? `${APIURL}/rs/farmasi/tipe`
            : judul === "Zat"
            ? `${APIURL}/rs/farmasi/zat`
            : "";

        const post = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(parsedData),
        });
        resJson = await post.json();
        if (resJson.status !== "Created") throw new Error(resJson.message);
      }
      tutup();
      toast.success(resJson.message);
      loadData();
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
              <Dialog.Panel
                className={cn(
                  "w-full transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  judul === "Satuan" ? "max-w-md" : "max-w-2xl"
                )}
              >
                <Dialog.Title
                  as="p"
                  className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                >
                  {judulDeskripsi}
                </Dialog.Title>
                <form
                  className={cn("mt-2 flex flex-col gap-2")}
                  onSubmit={handleSubmit(submitHandler)}
                >
                  {judul === "Satuan" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "nama" in errors &&
                            errors.nama &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Input placeholder="Satuan" {...register("nama")} />
                        {"nama" in errors && errors.nama ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"nama" in errors && errors.nama.message}
                          </p>
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "deskripsi" in errors &&
                            errors.deskripsi &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Input
                          placeholder="Deskripsi"
                          {...register("deskripsi")}
                        />
                        {"deskripsi" in errors && errors.deskripsi ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"deskripsi" in errors && errors.deskripsi.message}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : judul === "Depo" ? (
                    <div
                      className={cn(
                        "w-full",
                        "id_unit" in errors &&
                          errors.id_unit &&
                          "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_unit"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Unit
                        </label>
                        {"id_unit" in errors && errors.id_unit ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {"id_unit" in errors && errors.id_unit.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_unit"
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelectInput
                            cacheOptions
                            loadOptions={loadUnit}
                            defaultOptions={unitOptions}
                            value={unitOptions.find(
                              (val) => val.value === value
                            )}
                            onChange={(option: MyOption | null) => {
                              onChange(option?.value);
                              setValue("nama", option?.label!);
                            }}
                            placeholder="Pilih Unit"
                            maxMenuHeight={150}
                          />
                        )}
                      />
                    </div>
                  ) : judul === "Sediaan" ? (
                    <div
                      className={cn(
                        "w-full",
                        "nama" in errors &&
                          errors.nama &&
                          "rounded-b-sm rounded-t-lg bg-red-100"
                      )}
                    >
                      <Input placeholder="Sediaan" {...register("nama")} />
                      {"nama" in errors && errors.nama ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {"nama" in errors && errors.nama.message}
                        </p>
                      ) : null}
                    </div>
                  ) : judul === "Tipe" ? (
                    <>
                      <div
                        className={cn(
                          "w-full",
                          "nama" in errors &&
                            errors.nama &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Input placeholder="Tipe" {...register("nama")} />
                        {"nama" in errors && errors.nama ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"nama" in errors && errors.nama.message}
                          </p>
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          "w-full",
                          "kode" in errors &&
                            errors.kode &&
                            "rounded-b-sm rounded-t-lg bg-red-100"
                        )}
                      >
                        <Input placeholder="Kode" {...register("kode")} />
                        {"kode" in errors && errors.kode ? (
                          <p className="pr-0.5 text-end text-xs text-red-500">
                            {"kode" in errors && errors.kode.message}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : judul === "Zat" ? (
                    <div
                      className={cn(
                        "w-full",
                        "nama" in errors &&
                          errors.nama &&
                          "rounded-b-sm rounded-t-lg bg-red-100"
                      )}
                    >
                      <Input placeholder="Zat" {...register("nama")} />
                      {"nama" in errors && errors.nama ? (
                        <p className="pr-0.5 text-end text-xs text-red-500">
                          {"nama" in errors && errors.nama.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      type="submit"
                      color={ubah.modal ? "cyan100" : "green100"}
                    >
                      {judulDeskripsi}
                    </Button>
                    <Button color="red" onClick={tutup}>
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
