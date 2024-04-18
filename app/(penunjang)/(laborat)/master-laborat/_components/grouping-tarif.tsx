import {
  GroupingDPenunjangTarifSchema,
  GroupingDPenunjangTarifTSchema,
  GroupingPenunjangTarif,
  Penunjang,
} from "@/app/(penunjang)/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { AsyncSelectInput, MyOption, MyOptions } from "@/components/select";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Fragment, useEffect, useReducer, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TbTrash } from "react-icons/tb";
import { toast } from "react-toastify";
import { GroupingAction, GroupingState } from "../page";

type GroupingDialogProps = {
  grouping: GroupingState;
  groupingDispatch: React.Dispatch<GroupingAction>;
  loadGrouping: () => Promise<void>;
};

export default function GroupingDialog({
  grouping,
  groupingDispatch,
  loadGrouping,
}: GroupingDialogProps) {
  const tutup = () => {
    reset();
    loadGrouping();
    setGroupingDetail([]);
    groupingDispatch({
      type: "setGrouping",
      grouping: {
        modal: false,
      },
    });
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [groupingDetail, setGroupingDetail] = useState<
    Omit<Penunjang, "jenis">[]
  >([]);
  const loadGroupingDetail = async () => {
    try {
      const url = `${APIURL}/rs/laborat/group/${grouping.data?.id}/detail`;
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      // console.log(json);
      const data = json?.data;
      setGroupingDetail(data);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan")
        return setGroupingDetail([]);
      toast.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!grouping.modal) return;
    loadGroupingDetail();
    loadPenunjang("");
    setValue("id_tarif", grouping.data?.id!);
  }, [grouping]);

  const [penunjangOptions, setPenunjangOptions] = useState<MyOptions>([]);
  const loadPenunjang = async (inputText: string): Promise<MyOptions> => {
    try {
      const url = new URL(`${APIURL}/rs/laborat/master/detail`);
      const params = {
        perPage: 50,
        keyword: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      const options = json?.data?.map((data: Penunjang) => ({
        value: data?.id,
        label: data?.nama,
      }));
      setPenunjangOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  type HapusState = {
    modal: boolean;
    data?: Omit<Penunjang, "jenis">;
  };
  type HapusAction = { type: "setHapus"; hapus: HapusState };
  const hapusState = {
    modal: false,
    data: undefined,
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
    try {
      const url = `${APIURL}/rs/laborat/group/detail/${hapus.data?.id}`;
      const resp = await fetch(url, {
        method: "DELETE",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Deleted") throw new Error(json.message);
      hapusDispatch({ type: "setHapus", hapus: { modal: false } });
      toast.success(json?.message);
      loadGroupingDetail();
      loadPenunjang("");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const [tambahDialog, setTambahDialog] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<GroupingDPenunjangTarifTSchema>({
    resolver: zodResolver(GroupingDPenunjangTarifSchema),
    defaultValues: {
      id_tarif: grouping.data?.id,
    },
  });

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  const submitHandler: SubmitHandler<GroupingDPenunjangTarifTSchema> = async (
    data,
    e
  ) => {
    try {
      e?.preventDefault();
      const url = `${APIURL}/rs/laborat/group/detail`;
      const post = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success("Data telah ditambahkan");
      setTambahDialog(false);
      loadGroupingDetail();
      loadPenunjang("");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={grouping.modal} as={Fragment}>
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
                  "h-full w-full max-w-3xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <div className="flex flex-col">
                  <div className="mb-4 flex justify-between gap-1 border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                    <p>{grouping.data?.group}</p>
                  </div>
                  <div className={cn("flex justify-center gap-4")}>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="relative">
                        <p className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100">
                          Detail Grouping Tarif
                        </p>
                        <Button
                          className="absolute right-0 top-0 px-2 py-0.5 text-xs"
                          color="green"
                          onClick={() => setTambahDialog(true)}
                        >
                          Tambah
                        </Button>
                      </div>
                      <div
                        className={cn("w-full overflow-hidden rounded shadow")}
                      >
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr
                              className={cn(
                                "divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800",
                                "*:px-4 *:py-2"
                              )}
                            >
                              <td>No.</td>
                              <td>Nama Pemeriksaan</td>
                              <td className="text-center">*</td>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {groupingDetail?.map((g, idx) => (
                              <tr
                                className={cn(
                                  "bg-white hover:text-sky-600 dark:bg-slate-900"
                                  //   "divide-x divide-gray-300 dark:divide-gray-800"
                                )}
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {idx + 1 + "."}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {g.nama}
                                </td>
                                <td className="text-center">
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
                                              type: "setHapus",
                                              hapus: {
                                                modal: true,
                                                data: g,
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
                                        <p>Hapus Laborat</p>
                                      </Tooltip.Content>
                                    </Tooltip.Root>
                                  </Tooltip.Provider>
                                </td>
                              </tr>
                            ))}
                            {groupingDetail.length === 0 ? (
                              <tr>
                                <td colSpan={3}>
                                  <p className="px-4 py-2 text-center">
                                    Tidak ada pemeriksaan
                                  </p>
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-1">
                    <Button color="red" onClick={tutup}>
                      Keluar
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <Transition show={tambahDialog} as={Fragment}>
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
                      Tambah Pemeriksaan
                    </Dialog.Title>
                    <form
                      className={cn("mt-2 flex flex-col gap-4")}
                      onSubmit={handleSubmit(submitHandler)}
                    >
                      <div
                        className={cn(
                          "id_penunjang" in errors &&
                            errors.id_penunjang &&
                            "rounded-b-lg rounded-t-sm bg-red-100"
                        )}
                      >
                        {"id_penunjang" in errors && errors.id_penunjang ? (
                          <p className="p-0.5 text-xs text-red-500">
                            {"id_penunjang" in errors &&
                              errors.id_penunjang.message}
                          </p>
                        ) : null}
                        <Controller
                          control={control}
                          name="id_penunjang"
                          render={({ field: { onChange, value } }) => {
                            return (
                              <AsyncSelectInput
                                cacheOptions
                                loadOptions={loadPenunjang}
                                defaultOptions={penunjangOptions}
                                value={penunjangOptions?.find(
                                  (val) => val.value === value
                                )}
                                onChange={(option: MyOption | null) =>
                                  onChange(option?.value)
                                }
                                placeholder="Pilih Pemeriksaan"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                maxMenuHeight={250}
                              />
                            );
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button type="submit" color="green100">
                          Tambah
                        </Button>
                        <Button
                          color="red"
                          onClick={() => setTambahDialog(false)}
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
                      Hapus Pemeriksaan
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hapus {hapus.data?.nama}
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
      </Dialog>
    </Transition>
  );
}
