import { APIURL } from "@/lib/connection";
import React, {
  useEffect,
  useMemo,
  useState,
  Fragment,
  useRef,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Dialog, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { MyOption, MyOptions, SelectInput } from "@/components/select";
import { Input, InputArea } from "@/components/form";
import Cookies from "js-cookie";
import {
  KunjunganRajal,
  SKDPSch,
  SKDPSchema,
} from "@/app/(pendaftaran)/schema";
import { Klinik } from "@/app/(referensi)/list-klinik/page";
import { useReactToPrint } from "react-to-print";
import CetakSKDP from "./cetak-skdp";
import { SKDP } from "../page";
import { JadwalDokter } from "../../jadwal-dokter/page";

type UbahState = {
  modal: boolean;
  data?: (SKDP | KunjunganRajal) & { ubah: boolean };
};
type UbahAction = { type: "setUbah"; ubah: UbahState };

type FormSKDPDialogProps = {
  tambahDialog?: boolean;
  setTambahDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  ubah?: UbahState;
  ubahDispatch?: React.Dispatch<UbahAction>;
  loadData?: () => Promise<void>;
};
export default function FormRTLDialog({
  tambahDialog,
  setTambahDialog,
  ubah,
  ubahDispatch,
  loadData,
}: FormSKDPDialogProps) {
  const tutup = () => {
    reset();
    tambahDialog ? setTambahDialog && setTambahDialog(false) : false;
    ubah?.modal
      ? ubahDispatch &&
        ubahDispatch({
          type: "setUbah",
          ubah: {
            modal: false,
          },
        })
      : false;
  };

  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [judulLama, setJudulLama] = useState<string>("");
  const judul = useMemo(() => {
    if (!ubah?.modal && !tambahDialog) return judulLama;
    setJudulLama(ubah?.data?.ubah ? "Ubah SKDP" : "Tambah SKDP");
    return ubah?.data?.ubah ? "Ubah SKDP" : "Tambah SKDP";
  }, [tambahDialog, ubah?.modal]);

  const [text, setText] = useState("Belum");
  const [skdpDataPrint, setSkdpDataPrint] = useState("Belum");
  const loadSKDP = async () => {
    try {
      // const url = new URL(`${APIURL}/rs/kontrol/${1}`);
      // const resp = await fetch(url, {
      //   method: "GET",
      //   headers: headers,
      // });
      // const json = await resp.json();
      // // console.log(json.data);
      // if (json.status !== "Ok") throw new Error(json.message);
      // setSkdpDataPrint(json?.data);
      setText("Sudah");
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const cetakSKDPRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    onBeforeGetContentResolve.current = loadSKDP();
    await onBeforeGetContentResolve.current;
  }, [setSkdpDataPrint]);

  const reactToPrintContent = useCallback(() => {
    return cetakSKDPRef.current;
  }, [cetakSKDPRef.current]);

  const handlePrintSKDP = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "SKDP",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  // useEffect(() => {
  //   if (onBeforeGetContentResolve.current !== null) {
  //     onBeforeGetContentResolve.current();
  //   }
  // }, [onBeforeGetContentResolve.current]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<SKDPSch>({
    resolver: zodResolver(SKDPSchema),
  });

  const [listKlinik, setListKlinik] = useState<MyOptions>([]);
  const getKlinik = async () => {
    const res = await fetch(`${APIURL}/rs/klinik`, {
      method: "GET",
      headers: headers,
    });
    const json = await res.json();
    setListKlinik(
      json?.data?.map((data: Klinik) => {
        const option: MyOption = {
          value: data.id,
          label: data.nama,
        };
        return option;
      }) || []
    );
  };

  const klinik = watch("id_klinik");
  const tanggal = watch("tanggal");
  const [listJadwal, setListJadwal] = useState<JadwalDokter[]>([]);
  const getJadwal = async () => {
    if (!klinik || !tanggal) return;
    const url = new URL(`${APIURL}/rs/jadwal/klinik/${klinik}`);
    const params = {
      tanggal: tanggal,
    };
    url.search = new URLSearchParams(params as any).toString();
    const resp = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const data = await resp.json();
    setListJadwal(data.data);
  };
  useEffect(() => {
    getJadwal();
  }, [klinik, tanggal]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  useEffect(() => {
    if (!ubah?.modal && !tambahDialog) return;
    getKlinik();
    return () => {
      setListJadwal([]);
    };
  }, [ubah, tambahDialog]);

  useEffect(() => {
    if (!ubah?.modal) return;
    if (ubah.data?.ubah) {
      setValue(
        "tanggal",
        new Date(ubah?.data?.tanggal || new Date()).toLocaleDateString("fr-CA")
      );
      setValue("id_jadwal", ubah?.data?.id_jadwal!);
      setValue("alasan", (ubah?.data as SKDP)?.alasan!);
      setValue("rtl", ubah?.data?.rtl!);
    }
    setValue("id_pasien", ubah?.data?.id_pasien!);
    setValue("id_asuransi", (ubah?.data as KunjunganRajal)?.id_asuransi!);
    setValue("id_klinik", ubah?.data?.id_klinik!);
    setValue("klinik", ubah?.data?.klinik!);
    setValue("id_dokter", (ubah?.data as SKDP)?.id_dokter!);

    return () => {
      setValue("id_klinik", NaN);
      setValue("id_dokter", "");
    };
  }, [ubah?.modal]);

  const submitHandler: SubmitHandler<SKDPSch> = async (data, e) => {
    try {
      e?.preventDefault();
      if (ubah?.data?.ubah) {
        const put = await fetch(
          `${APIURL}/rs/kontrol/${(ubah?.data as SKDP)?.id}`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(data),
          }
        );
        const resp = await put.json();
        if (resp.status !== "Updated") throw new Error(resp.message);
        toast.success(resp.message);
      } else {
        const post = await fetch(`${APIURL}/rs/kontrol`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(data),
        });
        const resp = await post.json();
        if (resp.status !== "Created") throw new Error(resp.message);
        toast.success(resp.message);
      }
      loadData && loadData();
      tutup();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Transition show={tambahDialog || ubah?.modal || false} as={Fragment}>
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
                  "h-full w-full max-w-sm transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  SKDP (Kontrol)
                </Dialog.Title>
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="grid max-w-xs">
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="perkiraan"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Perkiraan Kontrol
                        </label>
                      </div>
                      <SelectInput
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        onChange={(val: any) => {
                          const d = new Date()
                          d.setDate(d.getDate()+Number(val.value))
                          if(d.getDay()===7){
                            d.setDate(d.getDate()+1)
                          }
                          
                          setValue("tanggal", d.toLocaleDateString('fr-CA'));
                        }}
                        options={[{value:7,label:"1 Minggu"},{value:30,label:"30 Hari"}]}
                        // value={[{value:7,data:"1 Minggu"},{value:30,data:"30 Hari"}].find(
                        //   (c: any) => c.value === value
                        // )}
                        placeholder="Pilih Perkiraan"
                      />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        // errors.tanggal && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="tgl"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Tanggal
                        </label>
                        {errors.tanggal ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.tanggal.message}
                          </p>
                        ) : null}
                      </div>
                      <Input id="tgl" type="date" {...register("tanggal")} />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.id_klinik && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_klinik"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Klinik
                        </label>
                        {errors.id_klinik ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_klinik.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_klinik"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            isDisabled={!ubah?.data?.ubah}
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => {
                              onChange(val.value);
                              setValue("klinik", val.label);
                            }}
                            options={listKlinik}
                            value={listKlinik.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Klinik"
                          />
                        )}
                      />
                    </div>

                    {/* <div
                      className={cn(
                        "grid max-w-xs",
                        errors.id_dokter && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="id_dokter"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Dokter
                        </label>
                        {errors.id_dokter ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.id_dokter.message}
                          </p>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="id_dokter"
                        render={({ field: { onChange, value } }) => (
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            onChange={(val: any) => onChange(val.value)}
                            options={listDokter}
                            value={listDokter.find(
                              (c: any) => c.value === value
                            )}
                            placeholder="Pilih Dokter"
                          />
                        )}
                      />
                    </div> */}

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.alasan && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="alasan"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Alasan
                        </label>
                        {errors.alasan ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.alasan.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea id="alasan" {...register("alasan")} />
                    </div>

                    <div
                      className={cn(
                        "grid max-w-xs",
                        errors.rtl && "rounded-lg bg-red-100"
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="rtl"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          RTL
                        </label>
                        {errors.rtl ? (
                          <p className="pr-0.5 text-xs text-red-500">
                            {errors.rtl.message}
                          </p>
                        ) : null}
                      </div>
                      <InputArea id="rtl" {...register("rtl")} />
                    </div>

                    <div
                      className={cn(
                        "mt-2 flex max-w-xs flex-col gap-2",
                        errors.id_jadwal && "rounded-lg bg-red-100"
                      )}
                    >
                      {errors.id_jadwal ? (
                        <p className="pr-0.5 pt-1 text-end text-xs text-red-500">
                          {errors.id_jadwal.message}
                        </p>
                      ) : null}
                      {listJadwal?.map((jadwal, idx) => (
                        <div key={idx.toString()}>
                          <input
                            type="radio"
                            id={"jadwal-" + idx}
                            className="peer hidden"
                            value={jadwal.id}
                            checked={watch("id_jadwal") === jadwal.id}
                            onChange={() => {
                              setValue("id_jadwal", jadwal.id);
                              setValue("id_dokter", jadwal.id_pegawai);
                              setValue("dokter", jadwal.nama);
                            }}
                          />
                          <label
                            htmlFor={"jadwal-" + idx}
                            className="block cursor-pointer rounded bg-green-100 px-3 py-2 shadow-md hover:bg-green-200 peer-checked:bg-green-500 peer-checked:text-white dark:bg-blue-900 dark:hover:bg-blue-800 dark:peer-checked:bg-blue-400"
                          >
                            <p className="text-md">{jadwal?.nama}</p>
                            <p className="text-sm">{jadwal?.klinik}</p>
                            <div className="mt-1.5 flex justify-between">
                              <p className="text-sm">{`${jadwal?.mulai?.slice(
                                0,
                                5
                              )} - ${jadwal?.selesai?.slice(0, 5)}`}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                      {!listJadwal || listJadwal?.length === 0 ? (
                        <p className="p-2 text-center text-sm">
                          Jadwal belum ditemukan
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between pr-4">
                    <div className="flex gap-1">
                      <Button
                        type="submit"
                        color={judul === "Tambah SKDP" ? "green100" : "cyan100"}
                      >
                        {judul}
                      </Button>
                      <Button color="red" onClick={tutup}>
                        Keluar
                      </Button>
                    </div>
                    <Button
                      color="sky"
                      onClick={handlePrintSKDP}
                      disabled={
                        !watch("tanggal") ||
                        !watch("id_dokter") ||
                        !watch("id_klinik")
                      }
                    >
                      Print
                    </Button>
                  </div>
                </form>

                <div className="hidden">
                  <CetakSKDP
                    ref={cetakSKDPRef}
                    data={{ ...(ubah?.data as KunjunganRajal), skdp: watch() }}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
