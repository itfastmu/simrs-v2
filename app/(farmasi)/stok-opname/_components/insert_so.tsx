import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input } from "@/components/form";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import React, { Fragment, useEffect, useReducer, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { LuFileInput } from "react-icons/lu";
import { TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { Depo, SOListDepo } from "../../schema";
import { LihatAction, LihatState } from "../page";
import { z } from "zod";

type StokOpnameDialogProps = {
  tambahDialog: boolean;
  setTambahDialog: React.Dispatch<React.SetStateAction<boolean>>;
  lihat: LihatState;
  lihatDispatch: React.Dispatch<LihatAction>;
  loadData: () => Promise<void>;
};
export default function StokOpnameDialog({
  tambahDialog,
  setTambahDialog,
  lihat,
  lihatDispatch,
  loadData,
}: StokOpnameDialogProps) {
  const tutup = () => {
    reset();
    tambahDialog
      ? setTambahDialog(false)
      : lihatDispatch({
          type: "setLihat",
          lihat: {
            modal: false,
          },
        });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const OpenSOSchema = z.object({
    type: z.literal("buka"),
    tanggal: z.string().min(1, "harus diisi"),
    keterangan: z.string(),
    depo: z
      .object({
        id: z.number(),
        nama: z.string(),
      })
      .array()
      .min(1, "harus dipilih"),
  });

  const InsertSOSchema = z.object({
    type: z.literal("lihat"),
    id_so: z.number(),
    so: z
      .object({
        id_poa: z.number(),
        nama: z.string(),
        stok_awal: z.number(),
        jumlah: z.number(),
        check: z.boolean(),
      })
      .array(),
  });

  const FormSchema = z.discriminatedUnion("type", [
    OpenSOSchema,
    InsertSOSchema,
  ]);
  type FormSchemaType = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: lihat.modal ? "lihat" : "buka",
    },
  });

  const [depoDialog, setDepoDialog] = useState<boolean>(false);
  const [depo, setDepo] = useState<
    (Pick<Depo, "id" | "nama"> & { id_so?: number }) | null
  >(null);

  // type UbahObatState = {
  //   modal: boolean;
  //   data?: ArrayElementType<StokOpname["detail"]> & { idx: number };
  // };
  // type UbahObatAction = { type: "setUbah"; ubah: UbahObatState };

  // const ubahState = {
  //   modal: false,
  // };
  // const ubahActs = (state: UbahObatState, action: UbahObatAction) => {
  //   switch (action.type) {
  //     case "setUbah": {
  //       return {
  //         ...action.ubah,
  //       };
  //     }
  //   }
  // };
  // const [ubahObat, ubahObatDispatch] = useReducer(ubahActs, ubahState);

  const [depoOptions, setDepoOptions] = useState<MyOptions>([]);
  const loadDepo = async (inputText: string) => {
    try {
      const url = new URL(`${APIURL}/rs/farmasi/depo`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const data =
        json?.data?.map((data: Depo) => {
          const option: MyOption = {
            value: data.id,
            label: data.nama,
          };
          return option;
        }) || [];
      setDepoOptions(data);
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    loadDepo("");
  }, [depoDialog]);

  const [stokObatOp, setStokObatOp] = useState<SOListDepo[]>();
  const loadStokObatOp = async () => {
    try {
      const url = new URL(
        `${APIURL}/rs/farmasi/stock_opname/open/${lihat.data?.id}`
      );
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      setStokObatOp(json?.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!stokObatOp) return;
    setValue(
      "tanggal",
      new Date(lihat.data?.tanggal!).toLocaleDateString("fr-CA")
    );
    setValue("keterangan", lihat.data?.keterangan!);
    setValue(
      "depo",
      (stokObatOp || []).map((val) => ({
        id: val.id_depo,
        nama: val.nama,
        id_so: val.id_so,
      }))
    );
  }, [stokObatOp]);

  type ObatDepoState = {
    modal: boolean;
    data?: { id: number; nama: string; id_so?: number };
  };
  type ObatDepoAction = ObatDepoState;
  const obatDepoState = {
    modal: false,
  };
  const obatDepoActs = (state: ObatDepoState, action: ObatDepoAction) => {
    return {
      ...action,
    };
  };
  const [obatDepo, obatDepoDispatch] = useReducer(obatDepoActs, obatDepoState);
  const loadObatDepo = async () => {
    try {
      const url = new URL(
        `${APIURL}/rs/farmasi/stock_opname/list_barang/`
      );
      // const params = {
      //   page: 1,
      //   perPage: 1000,
      // };
      // url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const data: { id_poa: number; nama: string; stok: number }[] = json.data;
      // setValue("so", [
      //   ...data
      //     .filter((val) =>
      //       watch("so")
      //         .filter((soFilter) => soFilter.check === false)
      //         .map((soMap) => soMap.id_poa)
      //         .includes(val.id_poa)
      //     )
      //     .map((val) => ({
      //       id_poa: val.id_poa,
      //       nama: val.nama,
      //       stok_awal: val.stok,
      //       jumlah: val.stok,
      //       check: false,
      //     })),
      // ]);
      setValue(
        "so",
        data.map((val) => ({
          id_poa: val.id_poa,
          nama: val.nama,
          stok_awal: val.stok,
          jumlah: val.stok,
          check: false,
        })) || []
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!obatDepo.modal) return;
    loadObatDepo();
    setValue("id_so", obatDepo.data?.id_so!);
  }, [obatDepo]);

  useEffect(() => {
    if (!lihat.modal && !tambahDialog) return;
    // loadSupplier("");
    if (lihat.modal) {
      loadStokObatOp();
      setValue("type", "lihat");
      return;
    }
    setValue("type", "buka");
    setValue("tanggal", new Date().toLocaleDateString("fr-CA"));
  }, [lihat, tambahDialog]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<FormSchemaType> = async (data, e) => {
    try {
      e?.preventDefault();
      if (lihat.modal) {
        const post = await fetch(`${APIURL}/rs/farmasi/insert_so`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
        obatDepoDispatch({ modal: false });
        loadData();
      } else {
        const post = await fetch(`${APIURL}/rs/farmasi/open_so`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
        tutup();
        loadData();
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const submitPartiallyHandler = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      e?.preventDefault();
      const soPartial = watch("so").filter((val) => val.check);
      const post = await fetch(`${APIURL}/rs/farmasi/insert_so`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          id_so: watch("id_so"),
          so: soPartial,
        }),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      // obatDepoDispatch({ modal: false });
      setValue(
        "so",
        watch("so")?.filter((val) => !val.check)
      );
      loadData();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={lihat.modal || tambahDialog} as={Fragment}>
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
                  {lihat.modal ? "Stok Opname" : "Tambah Header Stok Opname"}
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="mt-2 flex flex-col gap-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={cn(
                        "tanggal" in errors &&
                          errors.tanggal &&
                          "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Tanggal
                        </label>
                        {"tanggal" in errors && errors.tanggal ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.tanggal.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        disabled={lihat.modal}
                        type="date"
                        {...register("tanggal")}
                      />
                    </div>

                    <div
                      className={cn(
                        "keterangan" in errors &&
                          errors.keterangan &&
                          "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Keterangan
                        </label>
                        {"keterangan" in errors && errors.keterangan ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.keterangan.message}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        disabled={lihat.modal}
                        {...register("keterangan")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="relative flex justify-center border-b border-slate-200">
                      <p className="text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                        Depo
                      </p>
                      <div className="absolute right-0 flex items-center gap-2">
                        {"depo" in errors && errors.depo ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.depo.message}
                          </p>
                        ) : null}
                        {!lihat.modal ? (
                          <Button
                            className="px-2 py-0.5 text-xs"
                            color="sky"
                            onClick={() => setDepoDialog(true)}
                          >
                            Tambah
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={cn("w-full overflow-hidden rounded shadow")}
                    >
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                            <td className="px-4 py-2">Depo</td>
                            <td
                              className={cn(
                                "px-4 py-2 text-center"
                                // lihat.modal && "hidden"
                              )}
                            >
                              *
                            </td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {watch("depo")?.map((dp, idx) => (
                            <tr
                              className={cn(
                                "bg-white hover:text-sky-600 dark:bg-slate-900"
                                //, "divide-x divide-gray-300 dark:divide-gray-800"
                              )}
                              key={idx}
                            >
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {dp.nama}
                              </td>
                              <td
                                className={cn(
                                  "whitespace-pre-wrap px-4 py-2"
                                  // lihat.modal && "hidden"
                                )}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  {lihat.modal ? (
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
                                              obatDepoDispatch({
                                                modal: true,
                                                data: dp,
                                              });
                                            }}
                                          >
                                            <LuFileInput
                                              size="1rem"
                                              className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
                                            />
                                          </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content
                                          side="left"
                                          sideOffset={0}
                                          className="border border-slate-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                                        >
                                          <p>Input Obat</p>
                                        </Tooltip.Content>
                                      </Tooltip.Root>
                                    </Tooltip.Provider>
                                  ) : (
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
                                              setValue(
                                                "depo",
                                                watch("depo").filter(
                                                  (_, depoIdx) =>
                                                    depoIdx !== idx
                                                ) || []
                                              );
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
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {!lihat.modal ? (
                      <Button type="submit" color="green100">
                        Tambah
                      </Button>
                    ) : null}
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

        <Transition show={depoDialog} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={() => setDepoDialog(false)}
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
                      Tambah Depo
                    </Dialog.Title>
                    <form
                      className={cn("mt-2 flex flex-col gap-2")}
                      onSubmit={handleSubmit(submitHandler)}
                    >
                      <div>
                        <AsyncSelectInput
                          cacheOptions
                          loadOptions={loadDepo}
                          defaultOptions={depoOptions}
                          value={depoOptions?.find(
                            (val) => val.value === depo?.id
                          )}
                          onChange={(option: MyOption | null) =>
                            setDepo({
                              id: option?.value as number,
                              nama: option?.label!,
                            })
                          }
                          placeholder="Pilih Depo"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          menuPosition="fixed"
                          maxMenuHeight={250}
                        />
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          color="cyan100"
                          onClick={() => {
                            setDepoDialog(false);
                            if (!!depo?.id) {
                              setValue("depo", [
                                ...(watch("depo") || []),
                                { id: depo.id, nama: depo.nama },
                              ]);
                            }
                            setDepo(null);
                          }}
                        >
                          Tambah
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            setDepoDialog(false);
                            setDepo(null);
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition show={obatDepo.modal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[1010]"
            onClose={() => {
              obatDepoDispatch({ modal: false });
              setValue("so", []);
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
                      Stok Opname Obat {obatDepo.data?.nama}
                    </Dialog.Title>
                    <form
                      className={cn("mt-2 flex flex-col gap-2")}
                      onSubmit={handleSubmit(submitHandler)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="relative flex justify-center border-b border-slate-200">
                          <p className="text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                            List Obat
                          </p>
                          <div className="absolute right-0 flex items-center gap-2">
                            {"so" in errors && errors.so ? (
                              <p className="pr-0.5 text-xs text-red-500">
                                {errors.so.message}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-full overflow-hidden rounded shadow"
                          )}
                        >
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                <td className="px-4 py-2">Kode</td>
                                <td className="px-4 py-2">Nama</td>
                                <td className="px-4 py-2">Stok Awal</td>
                                <td className="px-4 py-2">Stok Aktual</td>
                                <td className="px-4 py-2 text-center">*</td>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {watch("so")?.map((so, idx) => (
                                <tr
                                  className={cn(
                                    "bg-white hover:text-sky-600 dark:bg-slate-900"
                                    //, "divide-x divide-gray-300 dark:divide-gray-800"
                                  )}
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {so.id_poa}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {so.nama}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {so.stok_awal}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    <Input
                                      type="number"
                                      className="w-20 py-1 text-xs font-normal"
                                      value={
                                        watch("so")?.find((_, i) => idx === i)
                                          ?.jumlah || ""
                                      }
                                      onChange={(e) => {
                                        const det = (watch("so") || []).map(
                                          (val, i) => {
                                            if (idx === i) {
                                              return {
                                                ...val,
                                                jumlah: parseInt(
                                                  e.target.value
                                                ),
                                              };
                                            }
                                            return val;
                                          }
                                        );
                                        setValue("so", det);
                                      }}
                                    />
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    <input
                                      type="checkbox"
                                      className="size-4 cursor-pointer text-xs font-normal"
                                      checked={
                                        watch("so")?.find((_, i) => idx === i)
                                          ?.check || false
                                      }
                                      onChange={(e) => {
                                        const det = (watch("so") || []).map(
                                          (val, i) => {
                                            if (idx === i) {
                                              return {
                                                ...val,
                                                check: e.target.checked,
                                              };
                                            }
                                            return val;
                                          }
                                        );
                                        setValue("so", det);
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          color="green"
                          disabled={
                            !watch("so") ||
                            watch("so")?.length === 0 ||
                            watch("so")?.find((val) => val.check === true)
                              ?.check ||
                            false
                          }
                          type="submit"
                        >
                          Kirim Semua
                        </Button>
                        <Button
                          color="green100"
                          disabled={
                            !watch("so") ||
                            watch("so")?.every((val) => val.check === false)
                          }
                          onClick={submitPartiallyHandler}
                        >
                          Kirim
                        </Button>
                        <Button
                          color="red"
                          onClick={() => {
                            obatDepoDispatch({ modal: false });
                            setValue("so", []);
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
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
