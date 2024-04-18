import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/form";
import {
  AsyncSelectInput,
  CreatableSelectInput,
  MyOption,
  MyOptions,
  SelectInput,
} from "@/components/select";
import css from "@/assets/css/scrollbar.module.css";
import { ArrayElementType, cn } from "@/lib/utils";
import { RiAddCircleLine, RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { RacikAction, RacikState, TAsesmenDok } from "../../schema";
import { TbEdit } from "react-icons/tb";
import { Button } from "@/components/button";
import { OptionBarang, Sediaan } from "@/app/(farmasi)/schema";
import { APIURL } from "@/lib/connection";
import Cookies from "js-cookie";

export const ResepDokter = ({
  isUpdate,
  resepNonRacik,
  resepRacik,
  racikDispatch,
  POAOptions,
  loadPOA,
}: {
  isUpdate: boolean;
  resepNonRacik: boolean;
  resepRacik: boolean;
  racikDispatch: React.Dispatch<RacikAction>;
  POAOptions: OptionBarang[];
  loadPOA: (inputText: string) => Promise<OptionBarang[]>;
}) => {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<TAsesmenDok>();

  // const [sediaanOptions, setSediaanOptions] = useState<MyOptions>([]);
  // const loadSediaan = async (inputText: string): Promise<MyOptions> => {
  //   try {
  //     const url = new URL(`${APIURL}/rs/farmasi/sediaan`);
  //     const params = {
  //       page: 1,
  //       perPage: 50,
  //       // cari: deferredCari,
  //       keyword: inputText,
  //     };
  //     url.search = new URLSearchParams(params as any).toString();
  //     const resp = await fetch(url, { method: "GET", headers: headers });
  //     const json = await resp.json();
  //     if (json.status !== "Ok") throw new Error(json.message);
  //     const data: Sediaan[] = json?.data;
  //     const options = data.map((val) => ({
  //       value: val.id,
  //       label: val.nama,
  //     }));
  //     setSediaanOptions(options);
  //     return options;
  //   } catch (err) {
  //     console.error(err);
  //     return [];
  //   }
  // };
  const initiated = useRef<boolean>(false);
  useEffect(() => {
    if (!initiated.current) {
      // loadSediaan("");
      initiated.current = true;
    }
  });
  // [
  //   "Tablet/kapsul",
  //   "Sirup/drop",
  //   "Topikal tetes",
  //   "Topikal zalf/cream",
  //   "Inhaler",
  // ].map((val) => ({ label: val, value: val }))

  const [metodeRacikOptions] = useState(
    ["Kapsul", "Puyer", "Pot Salep"].map((val) => ({ label: val, value: val }))
  );

  const [ruteOptions] = useState(
    [
      "oral ditelan",
      "oral dikunyah",
      "oral sublingual",
      "supp peranal",
      "supp pervaginam",
      "topikal tetes",
      "topikal oles",
      "tempel",
      "inhalasi",
    ].map((val) => ({ label: val, value: val }))
  );

  const [waktuAngkaOptions] = useState(
    [
      "1-1-1",
      "1-1-0",
      "1-0-0",
      "0-1-1",
      "0-1-0",
      "0-0-1",
      "1-0-0",
      "1-0-1",
    ].map((val) => ({ label: val, value: val }))
  );

  const [waktuACOptions] = useState([
    { value: "a.c", label: "a.c - Sebelum Makan" },
    { value: "p.c", label: "p.c - Setelah Makan" },
    { value: "d.c", label: "d.c - Saat Makan" },
  ]);

  const nonracik = watch("nonracik") || [];
  const [selBarangNon, setSelBarangNon] = useState<OptionBarang | null>(null);
  // const [selSediaanNon, setSelSediaanNon] = useState<MyOption | null>(null);
  const [dosisNon, setDosisNon] = useState<number>(NaN);
  const [selRuteNon, setSelRuteNon] = useState<MyOption | null>(null);
  const [selWaktuJamNon, setSelWaktuJamNon] = useState<MyOption | null>(null);
  const [selWaktuAngkaNon, setSelWaktuAngkaNon] = useState<MyOption | null>(
    null
  );
  const [waktuPRNNon, setWaktuPRNNon] = useState<string>("");
  const [selWaktuACNon, setSelWaktuACNon] = useState<MyOption | null>(null);
  const [jumlahNon, setJumlahNon] = useState<number>(NaN);
  const addResepNon = () => {
    if (!selBarangNon || !jumlahNon)
      return toast.warning("Isi Resep tidak lengkap!");
    const newBarang = nonracik;
    const waktu = [
      selWaktuJamNon?.label || selWaktuAngkaNon?.label || "",
      waktuPRNNon,
      (selWaktuACNon?.value as string) || "",
    ];
    newBarang?.push({
      id_poa: selBarangNon.value as number,
      nama_obat: selBarangNon.label as string,
      // sediaan: selSediaanNon?.label as string,
      dosis: dosisNon,
      rute: selRuteNon?.value as string,
      waktu: waktu,
      jumlah: jumlahNon,
    });
    loadPOA("");
    setValue("nonracik", [...newBarang]);
    setSelBarangNon(null);
    // setSelSediaanNon(null);
    setDosisNon(NaN);
    setSelRuteNon(null);
    setSelWaktuJamNon(null);
    setSelWaktuAngkaNon(null);
    setWaktuPRNNon("");
    setSelWaktuACNon(null);
    setJumlahNon(NaN);
  };
  const delResepNon = (id: number) => {
    if (isUpdate) {
      if (watch("nonracik")?.find((_, i) => i === id)?.id) {
        setValue("deleted.nonracik", [
          ...(watch("deleted.nonracik") || []),
          watch("nonracik")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    setValue(
      "nonracik",
      nonracik.filter((_, i) => id !== i)
    );
  };

  const racikan = watch("racikan") || [];
  const [namaRacikText, setNamaRacikText] = useState<string>("");
  const [selMetodeRacik, setSelMetodeRacik] = useState<MyOption | null>(null);
  const [jumlahRacik, setJumlahRacik] = useState<number>(NaN);
  const [selRuteRacik, setSelRuteRacik] = useState<MyOption | null>(null);
  const [selWaktuJamRacik, setSelWaktuJamRacik] = useState<MyOption | null>(
    null
  );
  const [selWaktuAngkaRacik, setSelWaktuAngkaRacik] = useState<MyOption | null>(
    null
  );
  const [waktuPRNRacik, setWaktuPRNRacik] = useState<string>("");
  const [selWaktuACRacik, setSelWaktuACRacik] = useState<MyOption | null>(null);
  const [statusRacikOptions] = useState<MyOptions>([
    { label: "DTD", value: "dtd" },
    { label: "Non-DTD", value: "nondtd" },
  ]);
  const [selStatusRacik, setSelStatusRacik] = useState<MyOption>(
    statusRacikOptions.at(0)!
  );
  const addResepRacik = () => {
    if (!namaRacikText || !jumlahRacik || !selMetodeRacik)
      return toast.warning("Isi Resep tidak lengkap!");
    const newBarang = racikan;
    const waktu = [
      selWaktuJamRacik?.label || selWaktuAngkaRacik?.label || "",
      waktuPRNRacik,
      (selWaktuACRacik?.value as string) || "",
    ];
    //   (
    //   !!selWaktuJamRacik || !!selWaktuAngkaRacik
    //     ? (selWaktuJamRacik?.label || selWaktuAngkaRacik?.label) + " "
    //     : ""
    // ) +
    // (!!waktuPRNRacik ? waktuPRNRacik + " " : "") +
    // (selWaktuACRacik?.value || "");
    newBarang?.push({
      nama: namaRacikText,
      metode: selMetodeRacik?.label as string,
      jumlah: jumlahRacik,
      rute: selRuteRacik?.value as string,
      waktu: waktu,
      detail: [],
      tipe: selStatusRacik.value as "dtd" | "nondtd",
    });
    setValue("racikan", [...newBarang]);
    racikDispatch({
      type: "setRacik",
      racik: {
        modal: true,
        tipe: selStatusRacik.value as "dtd" | "nondtd",
        index: newBarang.length - 1,
      },
    });
    loadPOA("");
    setNamaRacikText("");
    setSelMetodeRacik(null);
    setJumlahRacik(NaN);
    setSelRuteRacik(null);
    setSelWaktuJamRacik(null);
    setSelWaktuAngkaRacik(null);
    setWaktuPRNRacik("");
    setSelWaktuACRacik(null);
    setSelStatusRacik(statusRacikOptions.at(0)!);
  };
  const delResepRacik = (id: number) => {
    if (isUpdate) {
      if (watch("racikan")?.find((_, i) => i === id)?.id) {
        setValue("deleted.racikan", [
          ...(watch("deleted.racikan") || []),
          watch("racikan")?.find((_, i) => i === id)?.id!,
        ]);
      }
    }
    setValue(
      "racikan",
      racikan.filter((_, i) => id !== i)
    );
  };

  type UbahObatState = {
    modal: boolean;
    non?: boolean;
    data?: (
      | ArrayElementType<TAsesmenDok["nonracik"]>
      | ArrayElementType<TAsesmenDok["racikan"]>
    ) & { idx: number };
  };
  type UbahObatAction = { type: "setUbah"; ubah: UbahObatState };

  const ubahState = {
    modal: false,
  };
  const ubahActs = (state: UbahObatState, action: UbahObatAction) => {
    switch (action.type) {
      case "setUbah": {
        return {
          ...action.ubah,
        };
      }
    }
  };
  const [ubahObat, ubahObatDispatch] = useReducer(ubahActs, ubahState);
  // useEffect(() => {
  //   console.log(ubahObat);
  // }, [ubahObat]);

  return (
    <>
      <Transition
        show={resepNonRacik}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex flex-col rounded bg-slate-100 p-2 dark:bg-gray-900">
          <label className="py-2 font-semibold dark:text-neutral-200">
            Input Resep Obat Non Racikan
          </label>
          <div className="mb-2 flex flex-shrink flex-col gap-1">
            <div className="grid grid-cols-4 gap-1">
              <AsyncSelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                defaultOptions={POAOptions}
                loadOptions={loadPOA}
                className="col-span-2 flex-1"
                menuPosition="fixed"
                placeholder="Nama Obat*"
                value={selBarangNon}
                maxMenuHeight={250}
                onChange={(option) => {
                  setSelBarangNon(option as OptionBarang | null);
                  // setSelSediaanNon(
                  //   sediaanOptions.find(
                  //     (val) =>
                  //       val.label === (option as OptionBarang | null)?.sediaan
                  //   ) || null
                  // );
                  setDosisNon((option as OptionBarang | null)?.numerator!);
                }}
              />
              {/* <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                isClearable
                options={sediaanOptions}
                className="flex-shrink basis-52"
                menuPosition="fixed"
                placeholder="Sediaan"
                value={selSediaanNon}
                onChange={(option) =>
                  setSelSediaanNon(option as MyOption | null)
                }
              /> */}
              <Input
                // readOnly
                type="number"
                min={1}
                className="flex-shrink basis-52 px-2 py-1 text-xs"
                value={dosisNon}
                onChange={(e) => setDosisNon(parseInt(e.target.value))}
                placeholder="Dosis"
              />
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                isClearable
                options={ruteOptions}
                className="flex-shrink basis-52"
                placeholder="Rute"
                menuPosition="fixed"
                maxMenuHeight={150}
                value={selRuteNon}
                onChange={(option) => setSelRuteNon(option as MyOption | null)}
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {/* <div className="flex flex-shrink basis-[420px] items-center gap-1"> */}
              <div className="col-span-2 flex items-center gap-1">
                <CreatableSelectInput
                  noOptionsMessage={() => "Setiap ... jam"}
                  formatCreateLabel={(val) => "Setiap " + val + " jam"}
                  onCreateOption={(val) => {
                    setSelWaktuJamNon({
                      label: "Setiap " + val + " jam",
                      value: "Setiap " + val + " jam",
                    });
                    setSelWaktuAngkaNon(null);
                  }}
                  isClearable
                  size="sm"
                  className="flex-1"
                  menuPosition="fixed"
                  placeholder="Waktu (Setiap .. Jam)"
                  value={selWaktuJamNon}
                  onChange={(option) =>
                    setSelWaktuJamNon(option as MyOption | null)
                  }
                />
                <small className="flex-shrink">atau</small>
                <SelectInput
                  noOptionsMessage={(e) => "Tidak ada pilihan"}
                  size="sm"
                  isClearable
                  options={waktuAngkaOptions}
                  className="flex-1"
                  placeholder="Waktu (0-1-1)"
                  menuPosition="fixed"
                  value={selWaktuAngkaNon}
                  onChange={(option) => {
                    setSelWaktuAngkaNon(option as MyOption | null);
                    setSelWaktuJamNon(null);
                  }}
                  maxMenuHeight={150}
                />
              </div>
              <div className="col-span-2 grid grid-cols-5 gap-1">
                <Input
                  className="col-span-3 flex-1 px-2 py-1 text-xs"
                  placeholder="Waktu (PRN)"
                  value={waktuPRNNon}
                  onChange={(e) => setWaktuPRNNon(e.target.value)}
                />
                <SelectInput
                  noOptionsMessage={(e) => "Tidak ada pilihan"}
                  size="sm"
                  isClearable
                  options={waktuACOptions}
                  className="col-span-2 flex-1"
                  placeholder="Waktu (a.c)"
                  menuPosition="fixed"
                  value={selWaktuACNon}
                  onChange={(option) =>
                    setSelWaktuACNon(option as MyOption | null)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Input
                type="number"
                min={1}
                className="flex-shrink basis-52 px-2 py-1 text-xs"
                value={jumlahNon}
                onChange={(e) => setJumlahNon(parseInt(e.target.value))}
                placeholder="Jumlah Obat*"
              />
              <button
                type="button"
                className="mx-2 w-fit"
                onClick={addResepNon}
              >
                <RiAddCircleLine
                  size="1.2rem"
                  className="text-blue-600 dark:text-blue-400"
                />
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <Transition
        show={nonracik.length > 0}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={cn("flex flex-col")}>
          <p className="p-1 text-xs">Resep Obat Non Racikan</p>
          <div className={cn("overflow-hidden rounded shadow")}>
            <table className="min-w-full">
              <thead>
                <tr className="divide-x divide-slate-50 bg-slate-300 dark:bg-gray-700">
                  <td className={cn("px-4 py-2")}>Nama Obat</td>
                  {/* <td className={cn("px-4 py-2")}>Sediaan</td>
                <td className={cn("px-4 py-2")}>Dosis</td> */}
                  <td className={cn("px-4 py-2")}>Rute</td>
                  <td className={cn("px-4 py-2")}>Waktu</td>
                  <td className={cn("px-4 py-2")}>Jumlah</td>
                  <td className={cn("px-4 py-2 text-center")}>*</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {nonracik?.map((non, idx) => (
                  <tr
                    className="bg-white hover:text-sky-600 dark:bg-slate-900"
                    key={idx}
                  >
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {non.nama_obat}
                    </td>
                    {/* <td className="whitespace-pre-wrap px-4 py-2">
                    {non.sediaan}
                  </td>
                  <td className="whitespace-pre-wrap px-4 py-2">{non.dosis}</td> */}
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {non.rute}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {non.waktu.filter(Boolean).join(" ")}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {non.jumlah}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <TbEdit
                          className="inline text-cyan-600 hover:cursor-pointer"
                          size="1.2rem"
                          onClick={() => {
                            ubahObatDispatch({
                              type: "setUbah",
                              ubah: {
                                modal: true,
                                non: true,
                                data: {
                                  ...non,
                                  idx: idx,
                                },
                              },
                            });
                          }}
                        />
                        <RiDeleteBin5Line
                          className="inline text-amber-500 hover:cursor-pointer"
                          size="1.2rem"
                          onClick={() => delResepNon(idx)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Transition>
      <Transition
        show={resepRacik}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="rounded bg-slate-100 p-2 dark:bg-gray-900">
          <label className="py-2 font-semibold dark:text-neutral-200">
            Input Resep Obat Racikan
          </label>
          <div className="mb-2 flex flex-col gap-1">
            <div className="grid grid-cols-4 gap-1">
              <Input
                className="flex-shrink basis-52 px-2 py-1 text-xs"
                placeholder="Nama Racikan*"
                value={namaRacikText}
                onChange={(e) => setNamaRacikText(e.target.value)}
              />
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                options={metodeRacikOptions}
                className="flex-shrink basis-52"
                placeholder="Metode Racik*"
                menuPosition="fixed"
                value={selMetodeRacik}
                onChange={(option) =>
                  setSelMetodeRacik(option as MyOption | null)
                }
              />
              <Input
                type="number"
                className="flex-shrink basis-52 px-2 py-1 text-xs"
                value={jumlahRacik}
                onChange={(e) => setJumlahRacik(parseInt(e.target.value))}
                placeholder="Jumlah Racikan*"
                min={0}
              />
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                options={ruteOptions}
                className="flex-shrink basis-52"
                placeholder="Rute"
                menuPosition="fixed"
                maxMenuHeight={150}
                value={selRuteRacik}
                onChange={(option) =>
                  setSelRuteRacik(option as MyOption | null)
                }
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {/* <div className="flex flex-shrink basis-[420px] items-center gap-1"> */}
              <div className="col-span-2 flex items-center gap-1">
                <CreatableSelectInput
                  noOptionsMessage={() => "Setiap ... jam"}
                  formatCreateLabel={(val) => "Setiap " + val + " jam"}
                  onCreateOption={(val) => {
                    setSelWaktuJamRacik({
                      label: "Setiap " + val + " jam",
                      value: "Setiap " + val + " jam",
                    });
                    setSelWaktuAngkaRacik(null);
                  }}
                  isClearable
                  size="sm"
                  className="flex-1 flex-shrink"
                  placeholder="Waktu (Setiap .. Jam)"
                  value={selWaktuJamRacik}
                  onChange={(option) =>
                    setSelWaktuJamRacik(option as MyOption | null)
                  }
                />
                <small className="flex-shrink">atau</small>
                <SelectInput
                  noOptionsMessage={(e) => "Tidak ada pilihan"}
                  size="sm"
                  isClearable
                  options={waktuAngkaOptions}
                  className="flex-1 flex-shrink"
                  placeholder="Waktu (0-1-1)"
                  menuPosition="fixed"
                  value={selWaktuAngkaRacik}
                  onChange={(option) => {
                    setSelWaktuAngkaRacik(option as MyOption | null);
                    setSelWaktuJamRacik(null);
                  }}
                  maxMenuHeight={150}
                />
              </div>
              <Input
                className="flex-shrink basis-52 px-2 py-1 text-xs"
                placeholder="Waktu (PRN)"
                value={waktuPRNRacik}
                onChange={(e) => setWaktuPRNRacik(e.target.value)}
              />
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                options={waktuACOptions}
                className="flex-shrink basis-52"
                placeholder="Waktu (a.c)"
                menuPosition="fixed"
                value={selWaktuACRacik}
                onChange={(option) =>
                  setSelWaktuACRacik(option as MyOption | null)
                }
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                size="sm"
                options={statusRacikOptions}
                // className="flex-1"
                menuPosition="fixed"
                value={selStatusRacik}
                onChange={(option) => setSelStatusRacik(option as MyOption)}
              />
              <button
                type="button"
                className="mx-2 w-fit"
                onClick={addResepRacik}
              >
                <RiAddCircleLine
                  size="1.2rem"
                  className="text-blue-600 dark:text-blue-400"
                />
              </button>
            </div>
          </div>
        </div>
      </Transition>
      <Transition
        show={racikan.length > 0}
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
            "flex flex-col",
            errors?.racikan && "rounded-lg bg-red-200 dark:bg-red-500/40"
          )}
        >
          <div className="flex justify-between p-1 text-xs">
            <p>Resep Obat Racikan</p>
            {errors?.racikan ? (
              <p className="text-red-500">Detail racikan tidak valid</p>
            ) : null}
          </div>
          <div className={cn("overflow-hidden rounded shadow")}>
            <table className="min-w-full">
              <thead>
                <tr className="divide-x divide-slate-50 bg-slate-300 dark:bg-gray-700">
                  <td className={cn("px-4 py-2")}>Nama Racikan</td>
                  <td className={cn("px-4 py-2")}>Metode</td>
                  <td className={cn("px-4 py-2")}>Rute</td>
                  <td className={cn("px-4 py-2")}>Waktu</td>
                  <td className={cn("px-4 py-2")}>Jumlah</td>
                  <td className={cn("px-4 py-2")}>Tipe</td>
                  <td className={cn("px-4 py-2 text-center")}>*</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {racikan?.map((racik, idx) => (
                  <tr
                    className={cn(
                      "bg-white hover:text-sky-600 dark:bg-slate-900",
                      Array.isArray(errors?.racikan) &&
                        errors.racikan.at(idx) &&
                        "bg-red-200 dark:bg-red-400/30"
                    )}
                    key={idx}
                  >
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.nama}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.metode}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.rute}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.waktu.filter(Boolean).join(" ")}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.jumlah}
                    </td>
                    <td className="whitespace-pre-wrap px-4 py-2">
                      {racik.tipe === "dtd" ? "DTD" : "Non-DTD"}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-3">
                        {/* {racik.tipe === "dtd" ? (
                          <button
                            type="button"
                            className="text-xs text-sky-500 hover:text-sky-600 active:text-sky-700"
                            onClick={() =>
                              racikDispatch({
                                type: "setRacik",
                                racik: {
                                  modal: true,
                                  tipe: "dtd",
                                  index: idx,
                                },
                              })
                            }
                          >
                            DTD
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-sky-500 hover:text-sky-600 active:text-sky-700"
                            onClick={() =>
                              racikDispatch({
                                type: "setRacik",
                                racik: {
                                  modal: true,
                                  tipe: "nondtd",
                                  index: idx,
                                },
                              })
                            }
                          >
                            Non-DTD
                          </button>
                        )} */}
                        <TbEdit
                          className="inline text-cyan-600 hover:cursor-pointer"
                          size="1.2rem"
                          onClick={() => {
                            ubahObatDispatch({
                              type: "setUbah",
                              ubah: {
                                modal: true,
                                non: false,
                                data: {
                                  ...racik,
                                  idx: idx,
                                },
                              },
                            });
                          }}
                        />
                        <RiDeleteBin5Line
                          className="inline text-amber-500 hover:cursor-pointer"
                          size="1.2rem"
                          onClick={() => delResepRacik(idx)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Transition>

      <Transition show={ubahObat.modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1005]"
          onClose={() => {
            ubahObatDispatch({
              type: "setUbah",
              ubah: {
                ...ubahObat,
                modal: false,
              },
            });
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
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                  <Dialog.Title
                    as="p"
                    className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                  >
                    Ubah{" "}
                    {ubahObat.non
                      ? "Obat " +
                        watch("nonracik")?.find(
                          (_, idx) => idx === ubahObat.data?.idx
                        )?.nama_obat
                      : "Racikan"}
                  </Dialog.Title>
                  {ubahObat.non ? (
                    <div className="grid grid-flow-row grid-cols-4 gap-1 py-3 pt-5">
                      {/* <div className="flex flex-shrink justify-center gap-1"> */}
                      {/* <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          size="sm"
                          options={sediaanOptions}
                          className="flex-shrink basis-52"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          placeholder="Sediaan"
                          value={
                            watch("nonracik")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.sediaan
                              ? {
                                  label: watch("nonracik")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.sediaan,
                                  value: watch("nonracik")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.sediaan,
                                }
                              : null
                          }
                          onChange={(option) => {
                            const detailSediaan = (watch("nonracik") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    sediaan: (option as MyOption | null)
                                      ?.value as string,
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("nonracik", detailSediaan);
                          }}
                        />
                        <Input
                          type="number"
                          min={1}
                          className="flex-shrink basis-52 px-2 py-1 text-xs"
                          value={
                            watch("nonracik")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.dosis || ""
                          }
                          onChange={(e) => {
                            const detailDosis = (watch("nonracik") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    dosis: parseInt(e.target.value),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("nonracik", detailDosis);
                          }}
                          placeholder="Dosis"
                        /> */}
                      <SelectInput
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        size="sm"
                        options={ruteOptions}
                        className="flex-shrink basis-52"
                        placeholder="Rute"
                        menuPosition="fixed"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        maxMenuHeight={150}
                        value={
                          watch("nonracik")?.find(
                            (_, idx) => idx === ubahObat.data?.idx
                          )?.rute
                            ? {
                                label: watch("nonracik")?.find(
                                  (_, idx) => idx === ubahObat.data?.idx
                                )?.rute,
                                value: watch("nonracik")?.find(
                                  (_, idx) => idx === ubahObat.data?.idx
                                )?.rute,
                              }
                            : null
                        }
                        onChange={(option) => {
                          const detailRute = (watch("nonracik") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  rute: (option as MyOption | null)
                                    ?.value as string,
                                };
                              }
                              return val;
                            }
                          );
                          setValue("nonracik", detailRute);
                        }}
                      />
                      <Input
                        type="number"
                        min={1}
                        className="flex-shrink basis-52 px-2 py-1 text-xs"
                        value={
                          watch("nonracik")?.find(
                            (_, idx) => idx === ubahObat.data?.idx
                          )?.jumlah || NaN
                        }
                        onChange={(e) => {
                          const detailJumlah = (watch("nonracik") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  jumlah: parseInt(e.target.value),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("nonracik", detailJumlah);
                        }}
                        id="jumlah"
                      />
                      {/* </div> */}
                      {/* <div className="flex flex-shrink justify-center gap-1"> */}
                      <div className="col-span-2 flex items-center gap-1">
                        <CreatableSelectInput
                          noOptionsMessage={() => "Setiap ... jam"}
                          formatCreateLabel={(val) => "Setiap " + val + " jam"}
                          isClearable
                          size="sm"
                          className="flex-1"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          placeholder="Waktu (Setiap .. Jam)"
                          value={
                            watch("nonracik")
                              ?.find((_, idx) => idx === ubahObat.data?.idx)
                              ?.waktu.at(0)
                              ?.split(" ")
                              ?.at(0) === "Setiap"
                              ? {
                                  label: watch("nonracik")
                                    ?.find(
                                      (_, idx) => idx === ubahObat.data?.idx
                                    )
                                    ?.waktu.at(0),
                                  value: watch("nonracik")
                                    ?.find(
                                      (_, idx) => idx === ubahObat.data?.idx
                                    )
                                    ?.waktu.at(0),
                                }
                              : null
                          }
                          onCreateOption={(valOpt) => {
                            const detailWaktu = (watch("nonracik") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                      waktuIdx === 0
                                        ? "Setiap " + valOpt + " jam"
                                        : waktuVal
                                    ),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("nonracik", detailWaktu);
                          }}
                          onChange={(option) => {
                            const detailWaktu = (watch("nonracik") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                      waktuIdx === 0
                                        ? ((option as MyOption | null)
                                            ?.value as string) || ""
                                        : waktuVal
                                    ),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("nonracik", detailWaktu);
                          }}
                        />
                        <small className="flex-shrink">atau</small>
                        <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          isClearable
                          size="sm"
                          options={waktuAngkaOptions}
                          className="flex-1"
                          placeholder="Waktu (0-1-1)"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          maxMenuHeight={150}
                          value={
                            watch("nonracik")
                              ?.find((_, idx) => idx === ubahObat.data?.idx)
                              ?.waktu.at(0)
                              ?.at(1) === "-"
                              ? {
                                  label: watch("nonracik")
                                    ?.find(
                                      (_, idx) => idx === ubahObat.data?.idx
                                    )
                                    ?.waktu.at(0),
                                  value: watch("nonracik")
                                    ?.find(
                                      (_, idx) => idx === ubahObat.data?.idx
                                    )
                                    ?.waktu.at(0),
                                }
                              : null
                          }
                          onChange={(option) => {
                            const detailWaktu = (watch("nonracik") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                      waktuIdx === 0
                                        ? ((option as MyOption | null)
                                            ?.value as string) || ""
                                        : waktuVal
                                    ),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("nonracik", detailWaktu);
                          }}
                        />
                      </div>
                      <Input
                        className="flex-shrink basis-52 px-2 py-1 text-xs"
                        placeholder="Waktu (PRN)"
                        value={watch("nonracik")
                          ?.find((_, idx) => idx === ubahObat.data?.idx)
                          ?.waktu.at(1)}
                        onChange={(e) => {
                          const detailWaktu = (watch("nonracik") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                    waktuIdx === 1 ? e.target.value : waktuVal
                                  ),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("nonracik", detailWaktu);
                        }}
                      />
                      <SelectInput
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        size="sm"
                        options={waktuACOptions}
                        className="flex-shrink basis-52"
                        placeholder="Waktu (a.c)"
                        menuPosition="fixed"
                        menuPortalTarget={
                          typeof window !== "undefined" ? document.body : null
                        }
                        value={waktuACOptions.find(
                          (val) =>
                            val.value ===
                            watch("nonracik")
                              ?.find((_, idx) => idx === ubahObat.data?.idx)
                              ?.waktu.at(2)
                        )}
                        onChange={(option) => {
                          const detailWaktu = (watch("nonracik") || []).map(
                            (val, idx) => {
                              if (idx === ubahObat.data?.idx) {
                                return {
                                  ...val,
                                  waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                    waktuIdx === 2
                                      ? ((option as MyOption).value as string)
                                      : waktuVal
                                  ),
                                };
                              }
                              return val;
                            }
                          );
                          setValue("nonracik", detailWaktu);
                        }}
                      />
                    </div>
                  ) : (
                    // </div>
                    <div className="flex flex-shrink flex-col items-stretch gap-1 py-3 pt-5">
                      <div className="flex flex-shrink justify-center gap-1">
                        <Input
                          className="flex-shrink basis-52 px-2 py-1 text-xs"
                          placeholder="Nama Racikan*"
                          value={
                            watch("racikan")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.nama || ""
                          }
                          onChange={(e) => {
                            const detailNama = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    nama: e.target.value,
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailNama);
                          }}
                        />
                        <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          size="sm"
                          options={metodeRacikOptions}
                          className="flex-shrink basis-52"
                          placeholder="Metode Racik*"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          value={
                            watch("racikan")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.metode
                              ? {
                                  label: watch("racikan")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.metode,
                                  value: watch("racikan")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.metode,
                                }
                              : null
                          }
                          onChange={(option) => {
                            const detailMetode = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    metode: (option as MyOption | null)
                                      ?.value as string,
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailMetode);
                          }}
                        />
                        <Input
                          type="number"
                          min={1}
                          className="flex-shrink basis-52 px-2 py-1 text-xs"
                          value={
                            watch("racikan")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.jumlah || NaN
                          }
                          onChange={(e) => {
                            const detailJumlah = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    jumlah: parseInt(e.target.value),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailJumlah);
                          }}
                          id="jumlah"
                        />
                        <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          size="sm"
                          options={ruteOptions}
                          className="flex-shrink basis-52"
                          placeholder="Rute"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          maxMenuHeight={150}
                          value={
                            watch("racikan")?.find(
                              (_, idx) => idx === ubahObat.data?.idx
                            )?.rute
                              ? {
                                  label: watch("racikan")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.rute,
                                  value: watch("racikan")?.find(
                                    (_, idx) => idx === ubahObat.data?.idx
                                  )?.rute,
                                }
                              : null
                          }
                          onChange={(option) => {
                            const detailRute = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    rute: (option as MyOption | null)
                                      ?.value as string,
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailRute);
                          }}
                        />
                      </div>
                      <div className="flex flex-shrink justify-center gap-1">
                        <div className="flex flex-shrink basis-[420px] items-center gap-1">
                          <CreatableSelectInput
                            noOptionsMessage={() => "Setiap ... jam"}
                            formatCreateLabel={(val) =>
                              "Setiap " + val + " jam"
                            }
                            isClearable
                            size="sm"
                            className="flex-shrink basis-[182px]"
                            menuPosition="fixed"
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? document.body
                                : null
                            }
                            placeholder="Waktu (Setiap .. Jam)"
                            value={
                              watch("racikan")
                                ?.find((_, idx) => idx === ubahObat.data?.idx)
                                ?.waktu.at(0)
                                ?.split(" ")
                                ?.at(0) === "Setiap"
                                ? {
                                    label: watch("racikan")
                                      ?.find(
                                        (_, idx) => idx === ubahObat.data?.idx
                                      )
                                      ?.waktu.at(0),
                                    value: watch("racikan")
                                      ?.find(
                                        (_, idx) => idx === ubahObat.data?.idx
                                      )
                                      ?.waktu.at(0),
                                  }
                                : null
                            }
                            onCreateOption={(valOpt) => {
                              const detailWaktu = (watch("racikan") || []).map(
                                (val, idx) => {
                                  if (idx === ubahObat.data?.idx) {
                                    return {
                                      ...val,
                                      waktu: val.waktu.map(
                                        (waktuVal, waktuIdx) =>
                                          waktuIdx === 0
                                            ? "Setiap " + valOpt + " jam"
                                            : waktuVal
                                      ),
                                    };
                                  }
                                  return val;
                                }
                              );
                              setValue("racikan", detailWaktu);
                            }}
                            onChange={(option) => {
                              const detailWaktu = (watch("racikan") || []).map(
                                (val, idx) => {
                                  if (idx === ubahObat.data?.idx) {
                                    return {
                                      ...val,
                                      waktu: val.waktu.map(
                                        (waktuVal, waktuIdx) =>
                                          waktuIdx === 0
                                            ? ((option as MyOption | null)
                                                ?.value as string) || ""
                                            : waktuVal
                                      ),
                                    };
                                  }
                                  return val;
                                }
                              );
                              setValue("racikan", detailWaktu);
                            }}
                          />
                          <small className="flex-shrink">atau</small>
                          <SelectInput
                            noOptionsMessage={(e) => "Tidak ada pilihan"}
                            size="sm"
                            isClearable
                            options={waktuAngkaOptions}
                            className="flex-shrink basis-52"
                            placeholder="Waktu (0-1-1)"
                            menuPosition="fixed"
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? document.body
                                : null
                            }
                            maxMenuHeight={150}
                            value={
                              watch("racikan")
                                ?.find((_, idx) => idx === ubahObat.data?.idx)
                                ?.waktu.at(0)
                                ?.at(1) === "-"
                                ? {
                                    label: watch("racikan")
                                      ?.find(
                                        (_, idx) => idx === ubahObat.data?.idx
                                      )
                                      ?.waktu.at(0),
                                    value: watch("racikan")
                                      ?.find(
                                        (_, idx) => idx === ubahObat.data?.idx
                                      )
                                      ?.waktu.at(0),
                                  }
                                : null
                            }
                            onChange={(option) => {
                              const detailWaktu = (watch("racikan") || []).map(
                                (val, idx) => {
                                  if (idx === ubahObat.data?.idx) {
                                    return {
                                      ...val,
                                      waktu: val.waktu.map(
                                        (waktuVal, waktuIdx) =>
                                          waktuIdx === 0
                                            ? ((option as MyOption | null)
                                                ?.value as string) || ""
                                            : waktuVal
                                      ),
                                    };
                                  }
                                  return val;
                                }
                              );
                              setValue("racikan", detailWaktu);
                            }}
                          />
                        </div>
                        <Input
                          className="flex-shrink basis-52 px-2 py-1 text-xs"
                          placeholder="Waktu (PRN)"
                          value={watch("racikan")
                            ?.find((_, idx) => idx === ubahObat.data?.idx)
                            ?.waktu.at(1)}
                          onChange={(e) => {
                            const detailWaktu = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                      waktuIdx === 1 ? e.target.value : waktuVal
                                    ),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailWaktu);
                          }}
                        />
                        <SelectInput
                          noOptionsMessage={(e) => "Tidak ada pilihan"}
                          size="sm"
                          options={waktuACOptions}
                          className="flex-shrink basis-52"
                          placeholder="Waktu (a.c)"
                          menuPosition="fixed"
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                          value={waktuACOptions.find(
                            (val) =>
                              val.value ===
                              watch("racikan")
                                ?.find((_, idx) => idx === ubahObat.data?.idx)
                                ?.waktu.at(2)
                          )}
                          onChange={(option) => {
                            const detailWaktu = (watch("racikan") || []).map(
                              (val, idx) => {
                                if (idx === ubahObat.data?.idx) {
                                  return {
                                    ...val,
                                    waktu: val.waktu.map((waktuVal, waktuIdx) =>
                                      waktuIdx === 2
                                        ? ((option as MyOption).value as string)
                                        : waktuVal
                                    ),
                                  };
                                }
                                return val;
                              }
                            );
                            setValue("racikan", detailWaktu);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end gap-1">
                    {!ubahObat.non ? (
                      <Button
                        color="sky"
                        onClick={() => {
                          ubahObatDispatch({
                            type: "setUbah",
                            ubah: {
                              ...ubahObat,
                              modal: false,
                            },
                          });
                          racikDispatch({
                            type: "setRacik",
                            racik: {
                              modal: true,
                              tipe: selStatusRacik.value as "dtd" | "nondtd",
                              index: ubahObat.data?.idx,
                            },
                          });
                        }}
                      >
                        Ubah Detail Racikan
                      </Button>
                    ) : null}
                    <Button
                      color="red"
                      onClick={() => {
                        ubahObatDispatch({
                          type: "setUbah",
                          ubah: {
                            ...ubahObat,
                            modal: false,
                          },
                        });
                      }}
                    >
                      Tutup
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export const RacikanDialog = ({
  isUpdate,
  racik,
  racikDispatch,
  POAOptions,
  loadPOA,
}: {
  isUpdate: boolean;
  racik: RacikState;
  racikDispatch: React.Dispatch<RacikAction>;
  POAOptions: OptionBarang[];
  loadPOA: (inputText: string) => Promise<OptionBarang[]>;
}) => {
  const tutup = () => {
    trigger("racikan");
    racikDispatch({
      type: "setRacik",
      racik: { ...racik, modal: false },
    });
  };

  const { setValue, trigger, watch } = useFormContext<TAsesmenDok>();

  const [selBarangRacik, setSelBarangRacik] = useState<OptionBarang | null>(
    null
  );
  const [jumlahDetail, setJumlahDetail] = useState<number>(NaN);
  const [dosisDetail, setDosisDetail] = useState<number>(NaN);
  useEffect(() => {
    if (racik.modal) loadPOA("");
  }, [racik]);
  const addDetail = () => {
    if (!selBarangRacik || (!jumlahDetail && !dosisDetail))
      return toast.warning("Isi Resep tidak lengkap!");
    const newBarang = watch(`racikan.${racik?.index!}.detail`) || [];
    newBarang?.push({
      id_poa: parseInt(selBarangRacik?.value as string),
      nama_obat: selBarangRacik?.label!,
      dosis: dosisDetail,
      jumlah: jumlahDetail,
    });
    loadPOA("");
    setValue(`racikan.${racik?.index!}.detail`, [...newBarang]);
    setSelBarangRacik(null);
    setJumlahDetail(NaN);
    setDosisDetail(NaN);
  };
  const delDetail = (id: number) => {
    if (isUpdate) {
      if (
        watch(`racikan.${racik?.index!}.detail`)?.find((_, i) => i === id)?.id
      ) {
        setValue("deleted.detail_racik", [
          ...(watch("deleted.detail_racik") || []),
          watch(`racikan.${racik?.index!}.detail`)?.find((_, i) => i === id)
            ?.id!,
        ]);
      }
    }
    setValue(
      `racikan.${racik?.index!}.detail`,
      watch(`racikan.${racik?.index!}.detail`)!?.filter((_, i) => id !== i)
    );
  };
  return (
    <Transition show={racik.modal} as={Fragment}>
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
                <Dialog.Title
                  as="p"
                  className="border-b border-slate-200 font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                >
                  Detail Racikan{" "}
                  {watch(`racikan.${racik?.index!}.nama`) +
                    " " +
                    watch(`racikan.${racik?.index!}.jumlah`) +
                    " bungkus"}
                </Dialog.Title>
                <form className="flex flex-col text-xs">
                  <div className="my-2 flex gap-2 pr-2">
                    <div className="flex-1">
                      <label className="py-2 font-semibold dark:text-neutral-200">
                        Nama Obat
                      </label>
                      <AsyncSelectInput
                        noOptionsMessage={(e) => "Tidak ada pilihan"}
                        size="sm"
                        defaultOptions={POAOptions}
                        loadOptions={loadPOA}
                        className="flex-shrink"
                        value={selBarangRacik}
                        placeholder="Pilih Obat"
                        onChange={(option: OptionBarang | null) =>
                          setSelBarangRacik(option)
                        }
                      />
                    </div>
                    {racik.tipe === "nondtd" ? (
                      <div className="w-24">
                        <label className="py-2 font-semibold dark:text-neutral-200">
                          Jumlah
                        </label>
                        <Input
                          type="number"
                          className="px-2 py-1 text-xs"
                          value={jumlahDetail}
                          onChange={(e) => {
                            setJumlahDetail(parseInt(e.target.value));
                            setDosisDetail(
                              (parseInt(e.target.value) *
                                selBarangRacik?.numerator!) /
                                // parseInt(
                                //   selBarangRacik?.numerator?.replace(
                                //     /\D/g,
                                //     ""
                                //   )!,
                                //   10
                                // )
                                watch(`racikan.${racik?.index!}.jumlah`)
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24">
                        <label className="py-2 font-semibold dark:text-neutral-200">
                          Dosis/bungkus
                        </label>
                        <Input
                          type="number"
                          className="px-2 py-1 text-xs"
                          value={dosisDetail}
                          onChange={(e) => {
                            setDosisDetail(parseInt(e.target.value));
                            setJumlahDetail(
                              (watch(`racikan.${racik?.index!}.jumlah`) *
                                parseInt(e.target.value)) /
                                selBarangRacik?.numerator!
                              // parseInt(
                              //   selBarangRacik?.numerator?.replace(/\D/g, "")!,
                              //   10
                              // )
                            );
                          }}
                        />
                      </div>
                    )}
                    <div className="self-end">
                      <button type="button" onClick={addDetail}>
                        <RiAddCircleLine
                          size="1.2rem"
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>
                    </div>
                  </div>
                  <Transition
                    show={true}
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 -translate-y-1"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className={cn("mt-2 overflow-hidden rounded shadow")}>
                      <table className="min-w-full">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-300 dark:bg-gray-700">
                            <td className={cn("px-4 py-2")}>Nama Obat</td>
                            <td className={cn("px-4 py-2")}>Dosis/bungkus</td>
                            <td className={cn("px-4 py-2")}>Jumlah</td>
                            <td className={cn("px-4 py-2")}>*</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {watch(`racikan.${racik?.index!}.detail`)?.map(
                            (obat, idx) => (
                              <tr
                                className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                key={idx}
                              >
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.nama_obat}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.dosis}
                                </td>
                                <td className="whitespace-pre-wrap px-4 py-2">
                                  {obat.jumlah}
                                </td>
                                <td className="text-center">
                                  <div className="flex justify-center gap-1">
                                    <RiDeleteBin5Line
                                      className="inline text-amber-500 hover:cursor-pointer"
                                      size="1.2rem"
                                      onClick={() => delDetail(idx)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Transition>
                </form>
                <div className="mt-4 flex justify-end gap-1">
                  <Button color="red" onClick={tutup}>
                    Tutup
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
