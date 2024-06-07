"use client";

import css from "@/assets/css/scrollbar.module.css";
import { Button } from "@/components/button";
import { Input, InputArea } from "@/components/form";
import {
  AsyncSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { z } from "zod";
import CetakSEP from "../../list-sep/_components/cetak-sep";

type InfoSEP = {
  noKartu: string;
  tglSep: string;
  ppkPelayanan: string;
  jnsPelayanan: string;
  klsRawatHak: string;
  klsRawatNaik?: string;
  pembiayaan?: string;
  penanggungJawab?: string;
  noMR: string;
  asalRujukan: string;
  tglRujukan: string;
  noRujukan: string;
  ppkRujukan: string;
  ppkNama: string;
  catatan?: string;
  diagAwal: string;
  tujuan: string;
  eksekutif: boolean;
  cob: boolean;
  katarak: boolean;
  lakaLantas?: string;
  noLP?: string;
  tglKejadian?: string;
  keterangan?: string;
  suplesi?: string;
  noSepSuplesi?: string;
  kdPropinsi?: string;
  kdKabupaten?: string;
  kdKecamatan?: string;
  tujuanKunj: string;
  flagProcedure?: string;
  kdPenunjang?: string;
  assesmentPel: string;
  noSurat: string;
  kodeDPJP: string;
  dpjpLayan: string;
  noTelp: string;
};

type ReferensiBPJS = { kode: string; nama: string };

export default function FormSEP() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();
  const searchParams = useSearchParams();
  const tempIdKunjungan = searchParams.get("kode");
  const qlist = searchParams.get("qlist")?.split("-");

  const [kunjunganText, setKunjunganText] = useState<string>("");
  const [PPKText, setPPKText] = useState<string>("");
  const [selFaskes, setSelFaskes] = useState<number | null>(1);
  const [faskesOptions] = useState<MyOptions>([
    { label: "Faskes 1", value: 1 },
    { label: "Faskes 2", value: 2 },
  ]);

  useEffect(() => {
    loadProp();
    setKunjunganText(tempIdKunjungan || "");
  }, []);

  const [infoSEP, setInfoSEP] = useState<InfoSEP | null>(null);
  const [mutateInfo, setMutateInfo] = useState<boolean>(false);
  const loadInfo = async () => {
    try {
      setMutateInfo(true);
      const url = new URL(`${APIURL}/rs/sep/cekKunjungan`);
      const params = {
        id: kunjunganText,
        faskes: selFaskes,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
      toast.success(json?.message);
      setInfoSEP(json?.data);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    } finally {
      setMutateInfo(false);
    }
  };

  useEffect(() => {
    if (!infoSEP) return;
    setValue("id_kunjungan", kunjunganText);
    setValue("noKartu", infoSEP.noKartu);
    setValue("jnsPelayanan", infoSEP.jnsPelayanan);
    setValue("klsRawatHak", infoSEP.klsRawatHak);
    setValue("klsRawatNaik", infoSEP?.klsRawatNaik || "");
    setValue("eksekutif", infoSEP.eksekutif);
    setValue("kodeDPJP", infoSEP.kodeDPJP);
    setValue("dpjpLayan", infoSEP.dpjpLayan);
    setValue("asalRujukan", infoSEP.asalRujukan);
    setValue("tglRujukan", infoSEP.tglRujukan);
    setValue("noRujukan", infoSEP.noRujukan);
    setValue("ppkRujukan", infoSEP.ppkRujukan);
    setValue("tujuan", infoSEP.tujuan);
    setValue("ppkPelayanan", infoSEP.ppkPelayanan);
    setValue("tglSep", infoSEP.tglSep);
    setValue("noMR", infoSEP.noMR);
    setValue("cob", infoSEP.cob);
    setValue("diagAwal", infoSEP.diagAwal);
    setValue("noTelp", infoSEP.noTelp);
    setValue("catatan", infoSEP?.catatan || "");
    setValue("katarak", infoSEP.katarak);
    setValue("lakaLantas", !!infoSEP?.lakaLantas ? infoSEP?.lakaLantas : "0");
    setValue("noLP", infoSEP?.noLP || "");
    setValue("tglKejadian", infoSEP?.tglKejadian || "");
    setValue("keterangan", infoSEP?.keterangan || "");
    setValue("suplesi", infoSEP?.suplesi || "");
    setValue("noSepSuplesi", infoSEP?.noSepSuplesi || "");
    setValue("kdPropinsi", infoSEP?.kdPropinsi || "");
    setValue("kdKabupaten", infoSEP?.kdKabupaten || "");
    setValue("kdKecamatan", infoSEP?.kdKecamatan || "");
    setValue("tujuanKunj", infoSEP.tujuanKunj);
    setValue("flagProcedure", infoSEP?.flagProcedure || "");
    setValue("kdPenunjang", infoSEP?.kdPenunjang || "");
    setValue("assesmentPel", infoSEP.assesmentPel);
    if (infoSEP.assesmentPel) setShowAsesmenPel(true);
    setValue("noSurat", infoSEP.noSurat);
    setValue("penanggungJawab", infoSEP?.penanggungJawab || "");
    setValue("pembiayaan", infoSEP?.pembiayaan || "");
    setPPKText(infoSEP.ppkNama);
    loadKlinik(infoSEP.tujuan);
    loadDpjp(infoSEP.tujuan);
    loadDiagnosis(infoSEP.diagAwal);
  }, [infoSEP]);

  const [text, setText] = useState("Belum");
  const [sepDataPrint, setSepDataPrint] = useState("Belum");
  const loadSEP = async () => {
    try {
      // const url = new URL(`${APIURL}/rs/kontrol/${1}`);
      // const resp = await fetch(url, {
      //   method: "GET",
      //   headers: headers,
      // });
      // const json = await resp.json();
      // // console.log(json.data);
      // if (json.status !== "Ok") throw new Error(json.message);
      // setSepDataPrint(json?.data);
      setText("Sudah");
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  const cetakSEPRef = useRef(null);
  const onBeforeGetContentResolve = useRef<Promise<void> | null>(null);
  const handleOnBeforeGetContent = useCallback(async () => {
    onBeforeGetContentResolve.current = loadSEP();
    await onBeforeGetContentResolve.current;
  }, [setSepDataPrint]);

  const reactToPrintContent = useCallback(() => {
    return cetakSEPRef.current;
  }, [cetakSEPRef.current]);

  const handlePrintSEP = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "SEP",
    onBeforeGetContent: handleOnBeforeGetContent,
    onPrintError: (_, err) => {
      toast.error(err.message);
    },
    removeAfterPrint: true,
  });

  const SEPSchema = z.object({
    id_kunjungan: z.string(),
    noKartu: z.string().min(0),
    tglSep: z.string(),
    ppkPelayanan: z.string(),
    jnsPelayanan: z.string(),
    klsRawatHak: z.string(),
    klsRawatNaik: z.string(),
    pembiayaan: z.string(),
    penanggungJawab: z.string(),
    noMR: z.string(),
    asalRujukan: z.string(),
    tglRujukan: z.string(),
    noRujukan: z.string(),
    ppkRujukan: z.string(),
    catatan: z.string(),
    diagAwal: z.string().min(1, "harus dipilih"),
    tujuan: z.string(),
    eksekutif: z.boolean(),
    cob: z.boolean(),
    katarak: z.boolean(),
    lakaLantas: z.string().min(1, "harus dipilih"),
    noLP: z.string(),
    tglKejadian: z.string(),
    keterangan: z.string(),
    suplesi: z.string(),
    noSepSuplesi: z.string(),
    kdPropinsi: z.string(),
    kdKabupaten: z.string(),
    kdKecamatan: z.string(),
    tujuanKunj: z.string(),
    flagProcedure: z.string(),
    kdPenunjang: z.string(),
    assesmentPel: z.string(),
    noSurat: z.string(),
    kodeDPJP: z.string(),
    dpjpLayan: z.string().min(1, "harus dipilih"),
    noTelp: z.string().min(1, "harus dipilih"),
    user: z.string().min(0).optional(),
    status: z.number().or(z.nan()).optional(),
  });

  type SEP = z.infer<typeof SEPSchema>;

  const [statusKecelakaanOptions] = useState<MyOptions>([
    { label: "Bukan Kecelakaan", value: "0" },
    { label: "Kecelakaan Lalu Lintas dan Bukan Kecelakaan Kerja", value: "1" },
    { label: "Kecelakaan Lalu Lintas dan Kecelakaan Kerja", value: "2" },
    { label: "Kecelakaan Kerja", value: "3" },
  ]);

  const [tujuanKunjunganOptions] = useState<MyOptions>([
    { label: "Normal", value: "0" },
    { label: "Prosedur", value: "1" },
    { label: "Konsul Dokter", value: "2" },
  ]);

  const [flagProsedurOptions] = useState<MyOptions>([
    { label: "Prosedur Tidak Berkelanjutan", value: "0" },
    { label: "Prosedur dan Terapi Berkelanjutan", value: "1" },
  ]);

  const [kdPenunjangOptions] = useState<MyOptions>([
    { label: "Radioterapi", value: "1" },
    { label: "Kemoterapi", value: "2" },
    { label: "Rehabilitasi Medik", value: "3" },
    { label: "Rehabilitasi Psikososial", value: "4" },
    { label: "Transfusi Darah", value: "5" },
    { label: "Pelayanan Gigi", value: "6" },
    { label: "Laboratorium", value: "7" },
    { label: "USG", value: "8" },
    { label: "Farmasi", value: "9" },
    { label: "Lain-Lain", value: "10" },
    { label: "MRI", value: "11" },
    { label: "HEMODIALISA", value: "12" },
  ]);

  const [assesmentPelOptions] = useState<MyOptions>([
    { label: "Poli spesialis tidak tersedia pada hari sebelumnya", value: "1" },
    { label: "Jam Poli telah berakhir pada hari sebelumnya", value: "2" },
    {
      label:
        "Dokter Spesialis yang dimaksud tidak praktek pada hari sebelumnya",
      value: "3",
    },
    { label: "Atas Instruksi RS", value: "4" },
    { label: "Tujuan Kontrol", value: "5" },
  ]);
  const [showAsesmenPel, setShowAsesmenPel] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<SEP>({
    resolver: zodResolver(SEPSchema),
    defaultValues: {
      id_kunjungan: tempIdKunjungan!,
    },
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const [klinikOptions, setKlinikOptions] = useState<MyOptions>([]);
  const loadKlinik = async (klinik: string) => {
    try {
      if (klinik.length < 3) return;
      const url = new URL(`${APIURL}/rs/klinik/bpjs`);
      const params = {
        klinik: klinik,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (resp.status !== 200) throw new Error(json?.message);
      const options = json?.data?.map((data: ReferensiBPJS) => ({
        value: data?.kode,
        label: data?.nama,
      }));
      setKlinikOptions(options);
      // return options;
    } catch (err) {
      console.error(err);
      // return [];
    }
  };

  const [dpjpOptions, setDpjpOptions] = useState<MyOptions>([]);
  const loadDpjp = async (klinik: string) => {
    try {
      const url = new URL(`${APIURL}/rs/dokter/bpjs`);
      const params = {
        klinik: klinik,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (resp.status !== 200) throw new Error(json?.message);
      const options = json?.data?.map((data: ReferensiBPJS) => ({
        value: data?.kode,
        label: data?.nama,
      }));
      setDpjpOptions(options);
      // return options;
    } catch (err) {
      console.error(err);
      // return [];
    }
  };

  const [diagnosisOptions, setDiagnosisOptions] = useState<MyOptions>([]);
  const loadDiagnosis = async (inputText: string): Promise<MyOptions> => {
    try {
      if (inputText.length < 3) return [];
      const url = new URL(`${APIURL}/rs/icd/diagnosis`);
      const params = {
        diagnosis: inputText,
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, { method: "GET", headers: headers });
      const json = await resp.json();
      if (resp.status !== 200) throw new Error(json?.message);
      const options = json?.data?.map((data: ReferensiBPJS) => ({
        value: data?.kode,
        label: data?.nama,
      }));
      setDiagnosisOptions(options);
      return options;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadDataAlamat = async (
    url: string,
    params?: { [key: string]: string }
  ) => {
    try {
      const reqUrl = new URL(`${APIURL}/rs/${url}/bpjs`);
      if (params) reqUrl.search = new URLSearchParams(params as any).toString();
      const data = await fetch(reqUrl, { method: "GET", headers: headers });
      const fetchData = await data.json();
      if (fetchData.status !== "Ok") throw new Error(fetchData.message);
      return fetchData.data;
    } catch (err) {
      const error = err as Error;
      // toast.error(`Gagal mengambil data ${param}!`);
      console.error(error);
    }
  };
  const selProp = watch("kdPropinsi");
  const [listProp, setListProp] = useState<ReferensiBPJS[]>([]);
  const loadProp = async () => {
    const data = await loadDataAlamat("provinsi");
    setListProp(data);
  };

  const selKab = watch("kdKabupaten");
  const [listKab, setListKab] = useState<ReferensiBPJS[]>([]);
  useEffect(() => {
    const loadKab = async () => {
      if (!selProp) return;
      const data = await loadDataAlamat("kabupaten", {
        propinsi: selProp,
      });
      setListKab(data);
    };
    loadKab();
  }, [watch("kdPropinsi")]);

  const [listKec, setListKec] = useState<ReferensiBPJS[]>([]);
  useEffect(() => {
    const loadKec = async () => {
      if (!selKab) return;
      const data = await loadDataAlamat("kecamatan", {
        kabupaten: selKab,
      });
      setListKec(data);
    };
    loadKec();
  }, [selKab]);

  useEffect(() => {
    if (watch("tujuanKunj") === "2") {
      setShowAsesmenPel(true);
    } else if (watch("assesmentPel") === "") {
      setShowAsesmenPel(false);
    }
  }, [watch("tujuanKunj")]);

  const submitHandler: SubmitHandler<SEP> = async (data, e) => {
    try {
      e?.preventDefault();
      const post = await fetch(`${APIURL}/rs/sep`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      const resp = await post.json();
      if (resp.status !== "Created") throw new Error(resp.message);
      toast.success(resp.message);
      reset();
      setPPKText("");
      router.push("/kunjungan-rajal");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <Suspense>
      <div className="relative flex w-full flex-col gap-2 rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
        <div className="flex items-center gap-2 rounded bg-slate-100 p-2 pr-8 dark:bg-gray-800">
          <Input
            className="w-auto px-2 py-1 text-xs"
            placeholder="No. Rawat"
            value={kunjunganText}
            onChange={(e) => setKunjunganText(e.target.value)}
          />
          <SelectInput
            size="sm"
            className="w-28 text-left"
            placeholder="Faskes"
            options={faskesOptions}
            value={faskesOptions.find((val) => val.value === selFaskes)}
            onChange={(option) =>
              setSelFaskes((option as MyOption | null)?.value as number)
            }
          />
          <Button
            className="py-1 text-xs"
            disabled={kunjunganText === ""}
            loading={mutateInfo}
            loadingMessage="Proses..."
            onClick={() => loadInfo()}
          >
            Cek
          </Button>
          <Tooltip.Provider delayDuration={300} disableHoverableContent>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Link
                  href={{
                    pathname: "/kunjungan-rajal",
                    query: {
                      klinik: qlist?.at(0) || "all",
                      dokter: qlist?.at(1) || "all",
                      mulai: qlist?.at(2) || "all",
                    },
                  }}
                  className="absolute right-5 top-[20px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IoCloseCircleOutline
                    size="1.5rem"
                    className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
                  />
                </Link>
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
        <form
          onSubmit={handleSubmit(submitHandler)}
          className={cn(
            // "my-2 h-[calc(100%-40px)] overflow-y-auto text-left text-xs",
            "h-full flex-1 overflow-y-auto bg-slate-100 text-left text-xs dark:bg-gray-800",
            "grid grid-cols-2 gap-4 rounded p-2",
            // "grid grid-cols-2 grid-rows-6 gap-0.5 p-2",
            css.scrollbar
          )}
        >
          <div className="flex flex-col gap-2">
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Spesialis/SubSpesialis*
              </label>
              <div className="flex gap-2">
                <div
                  className={cn(
                    "flex gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-gray-900 shadow-md transition-all duration-150 ease-linear hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
                    "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
                    "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
                    "cursor-pointer"
                  )}
                  onClick={() => setValue("eksekutif", !watch("eksekutif"))}
                >
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={watch("eksekutif")}
                    onChange={(e) => setValue("eksekutif", e.target.checked)}
                  />
                  <label className="cursor-pointer select-none">
                    Eksekutif
                  </label>
                </div>
                <Input
                  className="w-48 flex-shrink px-2 py-1.5 text-xs"
                  // {...register("")}
                  value={
                    klinikOptions.find((val) => val.value === watch("tujuan"))
                      ?.label
                  }
                  readOnly
                />
              </div>
            </div>
            <div
              className={cn(
                errors?.dpjpLayan &&
                  "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                DPJP yang Melayani*
              </label>
              {errors?.dpjpLayan ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.dpjpLayan.message}
                </p>
              ) : null}
              <div className="flex gap-1">
                <Controller
                  control={control}
                  name="dpjpLayan"
                  render={({ field: { onChange, value } }) => (
                    <SelectInput
                      size="sm"
                      placeholder="Pilih DPJP"
                      className="w-72 flex-shrink text-xs"
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      onChange={(val) => onChange((val as MyOption).value)}
                      options={dpjpOptions}
                      value={dpjpOptions.find(
                        (option) => option.value === value
                      )}
                      menuPosition="fixed"
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Asal Rujukan
              </label>
              <div className="flex gap-1">
                <Input
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  value={
                    faskesOptions.find(
                      (val) => val.value === parseInt(watch("asalRujukan"))
                    )?.label
                  }
                  readOnly
                  // {...register("asalRujukan")}
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                PPK Asal Rujukan*
              </label>
              <div className="flex gap-1">
                <Input
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  // {...register("ppkRujukan")}
                  value={PPKText}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Tanggal Rujukan
              </label>
              <div className="flex gap-1">
                <Input
                  type="date"
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  {...register("tglRujukan")}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                No. Rujukan*
              </label>
              <div className="flex gap-1">
                <Input
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  {...register("noRujukan")}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Tgl. SEP
              </label>
              <div className="flex gap-1">
                <Input
                  type="date"
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  {...register("tglRujukan")}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                No. RM*
              </label>
              <div className="flex gap-2">
                <Input
                  className="w-[170px] flex-shrink px-2 py-1.5 text-xs"
                  {...register("noMR")}
                />
                <div
                  className={cn(
                    "flex gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-gray-900 shadow-md transition-all duration-150 ease-linear hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
                    "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
                    "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
                    "cursor-pointer"
                  )}
                  onClick={() => setValue("cob", !watch("cob"))}
                >
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={watch("cob")}
                    onChange={(e) => setValue("cob", e.target.checked)}
                  />
                  <label className="cursor-pointer select-none">
                    Peserta COB
                  </label>
                </div>
              </div>
            </div>
            <div
              className={cn(
                errors?.diagAwal &&
                  "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                Diagnosis*
              </label>
              {errors?.diagAwal ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.diagAwal.message}
                </p>
              ) : null}
              <div className="flex gap-1">
                <Controller
                  control={control}
                  name="diagAwal"
                  render={({ field: { onChange, value } }) => (
                    <AsyncSelectInput
                      size="sm"
                      // cacheOptions
                      loadOptions={loadDiagnosis}
                      defaultOptions={diagnosisOptions}
                      className="w-72 flex-shrink text-xs"
                      value={
                        value !== "" &&
                        !diagnosisOptions.some((val) => val.value === value)
                          ? {
                              label: value,
                              value: value,
                            }
                          : diagnosisOptions.find((val) => val.value === value)
                      }
                      onChange={(option: MyOption | null) =>
                        onChange(option?.value)
                      }
                      placeholder="Pilih Diagnosis"
                      // menuPortalTarget={document.body}
                      menuPosition="fixed"
                      maxMenuHeight={250}
                    />
                  )}
                />
              </div>
            </div>
            <div
              className={cn(
                errors?.noTelp &&
                  "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                No. Telepon*
              </label>
              {errors?.noTelp ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.noTelp.message}
                </p>
              ) : null}
              <div className="flex gap-1">
                <Input
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  {...register("noTelp")}
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Catatan
              </label>
              <div className="flex gap-1">
                <InputArea
                  className="w-72 flex-shrink px-2 py-1.5 text-xs"
                  {...register("catatan")}
                />
              </div>
            </div>
            <div>
              <label className="py-2 font-semibold dark:text-neutral-200">
                Katarak
              </label>
              <div className="flex gap-2">
                <div
                  className={cn(
                    "flex gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-gray-900 shadow-md transition-all duration-150 ease-linear hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
                    "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
                    "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
                    "cursor-pointer"
                  )}
                  onClick={() => setValue("katarak", !watch("katarak"))}
                >
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={watch("katarak")}
                    onChange={(e) => setValue("katarak", e.target.checked)}
                  />
                  <label className="cursor-pointer select-none text-[10px]/[14px]">
                    Centang jika peserta tersebut mendapatkan surat perintah
                    operasi katarak
                  </label>
                </div>
              </div>
            </div>
            <div
              className={cn(
                errors?.lakaLantas &&
                  "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                Status Kecelakaan*
              </label>
              {errors?.lakaLantas ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.lakaLantas.message}
                </p>
              ) : null}
              <div className="flex gap-1">
                <Controller
                  control={control}
                  name="lakaLantas"
                  render={({ field: { onChange, value } }) => (
                    <SelectInput
                      size="sm"
                      placeholder="Pilih Status Kecelakaan"
                      className="w-72 flex-shrink text-xs"
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      onChange={(val) => onChange((val as MyOption).value)}
                      options={statusKecelakaanOptions}
                      value={statusKecelakaanOptions.find(
                        (option) => option.value === value
                      )}
                      menuPosition="fixed"
                    />
                  )}
                />
              </div>
            </div>
            <Transition
              show={parseInt(watch("lakaLantas")) > 0}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 -translate-y-1"
            >
              <div className="flex w-fit flex-col gap-2">
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Tanggal Kejadian
                  </label>
                  <div className="flex gap-1">
                    <Input
                      type="date"
                      className="w-72 flex-shrink px-2 py-1.5 text-xs"
                      {...register("tglKejadian")}
                    />
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    No. LP
                  </label>
                  <div className="flex gap-1">
                    <Input
                      className="w-72 flex-shrink px-2 py-1.5 text-xs"
                      {...register("noLP")}
                    />
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Lokasi Kejadian
                  </label>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <Controller
                        control={control}
                        name="kdPropinsi"
                        render={({ field: { onChange, value } }) => {
                          const options = listProp?.map((val) => ({
                            label: val?.nama,
                            value: val?.kode,
                          }));
                          return (
                            <SelectInput
                              size="sm"
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              className="w-72 flex-shrink text-xs"
                              onChange={(val) =>
                                onChange((val as MyOption).value)
                              }
                              options={options}
                              value={options?.find(
                                (opt) => opt.value === value
                              )}
                              placeholder="Pilih Propinsi"
                              menuPosition="fixed"
                              maxMenuHeight={150}
                            />
                          );
                        }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Controller
                        control={control}
                        name="kdKabupaten"
                        render={({ field: { onChange, value } }) => {
                          const options = listKab?.map((val) => ({
                            label: val?.nama,
                            value: val?.kode,
                          }));
                          return (
                            <SelectInput
                              size="sm"
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              className="w-72 flex-shrink text-xs"
                              onChange={(val) =>
                                onChange((val as MyOption).value)
                              }
                              options={options}
                              value={options?.find(
                                (opt) => opt.value === value
                              )}
                              placeholder="Pilih Kabupaten Kota"
                              menuPosition="fixed"
                              maxMenuHeight={150}
                            />
                          );
                        }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Controller
                        control={control}
                        name="kdKecamatan"
                        render={({ field: { onChange, value } }) => {
                          const options = listKec?.map((val) => ({
                            label: val?.nama,
                            value: val?.kode,
                          }));
                          return (
                            <SelectInput
                              size="sm"
                              noOptionsMessage={(e) => "Tidak ada pilihan"}
                              className="w-72 flex-shrink text-xs"
                              onChange={(val) =>
                                onChange((val as MyOption).value)
                              }
                              options={options}
                              value={options?.find(
                                (opt) => opt.value === value
                              )}
                              placeholder="Pilih Kecamatan"
                              menuPosition="fixed"
                              maxMenuHeight={150}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Keterangan Kejadian
                  </label>
                  <div className="flex gap-1">
                    <InputArea
                      className="w-72 flex-shrink px-2 py-1.5 text-xs"
                      {...register("keterangan")}
                    />
                  </div>
                </div>
              </div>
            </Transition>
            <div
              className={cn(
                errors?.tujuanKunj &&
                  "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
              )}
            >
              <label className="py-2 font-semibold dark:text-neutral-200">
                Tujuan Kunjungan*
              </label>
              {errors?.tujuanKunj ? (
                <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                  {errors.tujuanKunj.message}
                </p>
              ) : null}
              <div className="flex gap-1">
                <Controller
                  control={control}
                  name="tujuanKunj"
                  render={({ field: { onChange, value } }) => (
                    <SelectInput
                      size="sm"
                      placeholder="Pilih Tujuan Kunjungan"
                      className="w-72 flex-shrink text-xs"
                      noOptionsMessage={(e) => "Tidak ada pilihan"}
                      onChange={(val) => {
                        const value = (val as MyOption).value;
                        if (value === "0") {
                          setValue("flagProcedure", "");
                          setValue("kdPenunjang", "");
                        }
                        onChange(value);
                      }}
                      options={tujuanKunjunganOptions}
                      value={tujuanKunjunganOptions.find(
                        (option) => option.value === value
                      )}
                      // menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  )}
                />
              </div>
            </div>
            <Transition
              show={watch("tujuanKunj") === "1"}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 -translate-y-1"
            >
              <div className="flex w-fit flex-col gap-2">
                <div>
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Flag Prosedur*
                  </label>
                  <div className="flex gap-1">
                    <Controller
                      control={control}
                      name="flagProcedure"
                      render={({ field: { onChange, value } }) => (
                        <SelectInput
                          size="sm"
                          placeholder="Pilih Flag Prosedur"
                          className="w-72 flex-shrink text-xs"
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          onChange={(val) => onChange((val as MyOption).value)}
                          options={flagProsedurOptions}
                          value={flagProsedurOptions.find(
                            (option) => option.value === value
                          )}
                          // menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      )}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    errors?.kdPenunjang &&
                      "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
                  )}
                >
                  <label className="py-2 font-semibold dark:text-neutral-200">
                    Penunjang*
                  </label>
                  {errors?.kdPenunjang ? (
                    <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                      {errors.kdPenunjang.message}
                    </p>
                  ) : null}
                  <div className="flex gap-1">
                    <Controller
                      control={control}
                      name="kdPenunjang"
                      render={({ field: { onChange, value } }) => (
                        <SelectInput
                          size="sm"
                          placeholder="Pilih Penunjang"
                          className="w-72 flex-shrink text-xs"
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          onChange={(val) => onChange((val as MyOption).value)}
                          options={kdPenunjangOptions}
                          value={kdPenunjangOptions.find(
                            (option) => option.value === value
                          )}
                          // menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </Transition>
            <Transition
              show={showAsesmenPel}
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 -translate-y-1"
            >
              <div
                className={cn(
                  errors?.assesmentPel &&
                    "relative w-72 rounded-lg bg-red-100 dark:bg-red-500/50"
                )}
              >
                <label className="py-2 font-semibold dark:text-neutral-200">
                  Asesmen Pelayanan*
                </label>
                {errors?.assesmentPel ? (
                  <p className="absolute right-1 top-0 text-red-900 dark:text-red-200">
                    {errors.assesmentPel.message}
                  </p>
                ) : null}
                <div className="flex gap-1">
                  <Controller
                    control={control}
                    name="assesmentPel"
                    render={({ field: { onChange, value } }) => (
                      <SelectInput
                        size="sm"
                        placeholder="Pilih Asesmen Pelayanan"
                        className="w-72 flex-shrink text-xs"
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        onChange={(val) => onChange((val as MyOption).value)}
                        options={assesmentPelOptions}
                        value={assesmentPelOptions.find(
                          (option) => option.value === value
                        )}
                        // menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    )}
                  />
                </div>
              </div>
            </Transition>
          </div>
          <div className="flex h-fit">
            <Button type="submit">Simpan</Button>
            {/* <Button color="sky" onClick={handlePrintSEP}>
            Print
          </Button> */}
            <div className="hidden">
              <CetakSEP ref={cetakSEPRef} text={text} />
            </div>
          </div>
        </form>
      </div>
    </Suspense>
  );
}
