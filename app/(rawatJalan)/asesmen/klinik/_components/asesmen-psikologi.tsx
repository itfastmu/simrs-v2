"use client";

import { DataPesertaBPJS } from "@/app/(pendaftaran)/schema";
import css from "@/assets/css/scrollbar.module.css";
import { Button, LinkButton } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { APIURL } from "@/lib/connection";
import { cn, getAgeAll } from "@/lib/utils";
import { Dialog, Tab, Transition } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiCheckFill } from "react-icons/ri";
import { toast } from "react-toastify";
import {
  AsesmenPsiSchema,
  KlinikAsesmen,
  TAsesmenDok,
  TAsesmenPsi,
  TData,
  THasilDokter,
  THasilPerawat,
  listPenyakit,
} from "../../schema";
import HasilBidan from "./riwayat/hasil-bidan";
import HasilPerawat from "./riwayat/hasil-perawat";
import RiwayatPemeriksaan from "./riwayat/riwayat-pemeriksaan";
import FormPsikologi from "./psikologi";
import DataPasien from "./data-pasien";

export default function AsesmenPsikologi({
  data,
  klinik,
}: {
  data: TData | undefined;
  klinik: KlinikAsesmen;
}) {
  const headers = new Headers();
  const token = Cookies.get("token");
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const qlist = searchParams.get("qlist")?.split("-");
  const id = searchParams.get("id");
  const kode = searchParams.get("kode");
  const grupId = parseInt(Cookies.get("grupId")!);
  const proses = parseInt(searchParams.get("proses")!);

  const [dataPeserta, setDataPeserta] = useState<DataPesertaBPJS>();
  const loadInfoPeserta = async () => {
    try {
      const urlPeserta = new URL(`${APIURL}/rs/pasien/bpjs`);
      const paramsPeserta = {
        id_pasien: id,
      };
      urlPeserta.search = new URLSearchParams(paramsPeserta as any).toString();
      const resPeserta = await fetch(urlPeserta, {
        method: "GET",
        headers: headers,
      });
      const fetchDataPeserta = await resPeserta.json();
      setDataPeserta(fetchDataPeserta?.data as DataPesertaBPJS);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };

  const methods = useForm<TAsesmenPsi>({
    resolver: zodResolver(AsesmenPsiSchema),
    defaultValues: {
      id_kunjungan: params.idKunjungan as string,
      observasi: {
        penampilan: "Terawat",
        sikap: "Kooperatif",
        afek: "Normal",
        muka: "Wajar",
        pikir: "Realistik",
        persepsi: "Tidak Ada",
        emosi: "Stabil",
        perilaku: "Normal",
      },
      kognitif: {
        memori: false,
        orientasi: false,
        konsentrasi: false,
        verbal: false,
      },
      //   anamnesis: {
      //     riwayat: [],
      //     riwayat_keluarga: [],
      //   },
    },
  });

  const [hasilPerawat, setHasilPerawat] = useState<THasilPerawat>();
  const [cek, setCek] = useState<boolean>(false);
  const [viewHasilPerawat, setViewHasilPerawat] = useState<boolean>(false);
  const loadAsesPerawat = async () => {
    try {
      const url = klinik.isRehab
        ? `${APIURL}/rs/rajal/assesment/fisioterapi/${
            params.idKunjungan as string
          }`
        : klinik.isObg
        ? `${APIURL}/rs/rajal/assesment/kebidanan/${
            params.idKunjungan as string
          }`
        : `${APIURL}/rs/rajal/assesment/perawat/${
            params.idKunjungan as string
          }`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilPerawat(json?.data);
      console.log(json);
    } catch (err) {
      const error = err as Error;
      if (
        error.message === "Data tidak ditemukan" ||
        error.message === "Belum dilakukan asesmen"
      )
        return /* toast.warning("Belum diasesmen perawat!") */;
      toast.error(error.message);
      console.error(error);
    }
  };
  //   useEffect(() => {
  //     if (!hasilPerawat || klinik.isRehab || klinik.isPsi) return;
  //     setViewHasilPerawat(true);
  //     // setValue("anamnesis.keluhan", hasilPerawat.anamnesis.keluhan);
  //     // setValue("anamnesis.alergi", hasilPerawat.anamnesis.alergi);
  //   }, [hasilPerawat]);

  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [hasilDokter, setHasilDokter] = useState<THasilDokter>();
  const loadAsesDokter = async () => {
    const mta = "2024012320002";
    const rhb = "2024012320003";
    const ort = "2024012320004";
    try {
      const url = `${APIURL}/rs/rajal/assesment/dokter/${
        params.idKunjungan as string
      }`;
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      if (json.status !== "Ok") throw new Error(json.message);
      setHasilDokter(json?.data);
      console.log(json);
    } catch (err) {
      const error = err as Error;
      if (
        error.message === "Data tidak ditemukan" ||
        error.message === "Belum dilakukan asesmen"
      )
        return toast.warning("Belum diasesmen dokter!");
      toast.error(error.message);
      console.error(error);
    }
  };

  const initialized = useRef<boolean>(false);
  useEffect(() => {
    if (!initialized.current && !klinik.isPsi) {
      loadInfoPeserta();
      if (proses < 5) {
        loadAsesPerawat();
      } else if (proses > 4) {
        loadAsesDokter();
      } else if (proses < 4) {
        toast.warning("Belum diasesmen perawat!");
      }

      if (proses < 4) {
        // if (klinik.isOrt)
        //   setValue("orto.prognosis", [...Array.from({ length: 6 }, () => "")]);
        // if (klinik.isRehab) setValue("fisik.keadaan", "Baik");
      }
      initialized.current = true;
    }
  }, []);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

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

  /* LAIN */
  /* TIDAK ORTO */
  const [lainRiwayat, setLainRiwayat] = useState("");
  const [lainRiwayatKel, setLainRiwayatKel] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitHandler: SubmitHandler<TAsesmenPsi> = async (data, e) => {
    try {
      e?.preventDefault();
      setIsLoading(true);
      //   if (!klinik.isOrt) {
      //     setValue(
      //       "anamnesis.riwayat",
      //       !data?.anamnesis?.riwayat
      //         ? [lainRiwayat]
      //         : [
      //             ...data?.anamnesis?.riwayat.filter((val) =>
      //               listPenyakit.includes(val)
      //             ),
      //             lainRiwayat,
      //           ]
      //     );
      //     setValue(
      //       "anamnesis.riwayat_keluarga",
      //       !data?.anamnesis?.riwayat_keluarga
      //         ? [lainRiwayatKel]
      //         : [
      //             ...data?.anamnesis?.riwayat_keluarga.filter((val) =>
      //               listPenyakit.includes(val)
      //             ),
      //             lainRiwayatKel,
      //           ]
      //     );
      //   }
      console.log(data);
      const url = `${APIURL}/rs/rajal/assesment/psikologi`;
      const resp = await fetch(
        !isUpdate ? url : url + "/" + data?.id_kunjungan,
        {
          method: !isUpdate ? "POST" : "PUT",
          headers: headers,
          body: JSON.stringify(data),
        }
      );
      const json = await resp.json();
      if (json.status !== "Created" && json.status !== "Updated")
        throw new Error(json.message);
      toast.success("Asesmen berhasil disimpan!");
      router.replace(`/list-pasien?user=Dokter&id=${id?.replaceAll(".", "_")}`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const panelDivRef = useRef<HTMLElement>(null);

  const [tutupAsesmen, setTutupAsesmen] = useState<boolean>(false);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="mx-auto flex h-full gap-2 overflow-auto px-4 pb-[68px] pt-1"
      >
        <div className="flex basis-1/4 flex-col gap-2">
          <DataPasien
            data={data}
            dataPeserta={dataPeserta}
            hasilPerawat={hasilPerawat}
            hasilDokter={hasilDokter}
          />
          <RiwayatPemeriksaan />
        </div>
        <div className="relative flex-1 rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <FormPsikologi
            isUpdate={isUpdate}
            tanggal_lahir={data?.tanggal_lahir as string | undefined}
          />
          <Tooltip.Provider delayDuration={300} disableHoverableContent>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => setTutupAsesmen(true)}
                  className="absolute right-3 top-[18px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IoCloseCircleOutline
                    size="1.5rem"
                    className="text-red-600 ui-not-disabled:hover:text-red-700 ui-not-disabled:active:text-red-800"
                  />
                </button>
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

          <Transition show={viewHasilPerawat} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1001]"
              onClose={() => false}
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
                <div className="flex h-screen items-center justify-center px-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-50"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="flex h-full w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
                      <Dialog.Title
                        as="p"
                        className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                      >
                        {!klinik.isObg ? "Asesmen Perawat" : "Asesmen Bidan"}
                      </Dialog.Title>
                      <div
                        className={cn(
                          "mt-2 flex-1 overflow-y-auto",
                          css.scrollbar
                        )}
                      >
                        {!klinik.isObg ? (
                          <HasilPerawat
                            data={hasilPerawat}
                            cek={cek}
                            setCek={setCek}
                            previewDokter
                          />
                        ) : (
                          <HasilBidan
                            data={hasilPerawat}
                            cek={cek}
                            setCek={setCek}
                            previewDokter
                          />
                        )}
                        <div className="flex justify-center gap-1">
                          <Button
                            disabled={!cek}
                            color="green"
                            className="items-center gap-1"
                            onClick={() => setViewHasilPerawat(false)}
                          >
                            <span>
                              <RiCheckFill size="1rem" />
                            </span>
                            <span>Saya telah mengkaji asesmen awal</span>
                          </Button>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>

          {/* <PermintLabDialog
            kunjungan={params.idKunjungan as string}
            permintLab={permintLab}
            permintLabDispatch={permintLabDispatch}
          />

          <PermintRadDialog
            kunjungan={params.idKunjungan as string}
            permintRad={permintRad}
            permintRadDispatch={permintRadDispatch}
          /> */}

          <Transition show={tutupAsesmen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-[1001]"
              onClose={() => setTutupAsesmen(false)}
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
                        className="font-medium leading-6 text-gray-900 dark:text-slate-100"
                      >
                        Tutup Asesmen
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Asesmen belum disimpan, apakah Anda yakin untuk
                          menutup asesmen tanpa disimpan?
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end gap-1">
                        <Link
                          href={{
                            pathname: "/list-pasien",
                            query: {
                              user: grupId != 1 ? "Dokter" : "Dewa",
                              id: kode?.replaceAll(".", "_"),
                            },
                          }}
                          onClick={() => setTutupAsesmen(false)}
                          passHref
                          legacyBehavior
                        >
                          <LinkButton color="red100">Tutup</LinkButton>
                        </Link>
                        <Button
                          color="red"
                          onClick={() => setTutupAsesmen(false)}
                        >
                          Batal
                        </Button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </form>
    </FormProvider>
  );
}
