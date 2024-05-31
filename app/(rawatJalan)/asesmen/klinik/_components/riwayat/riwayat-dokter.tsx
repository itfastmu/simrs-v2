import css from "@/assets/css/scrollbar.module.css";
import ImageMarker from "@/components/image-marker";
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiwDokterAction, RiwDokterState } from "./riwayat-pemeriksaan";
import anatomiAnak from "@/assets/img/anak.png";
import anatomiUmum from "@/assets/img/anatomi-umum.png";
import anatomiGigi from "@/assets/img/gigi.png";
import anatomiJantung from "@/assets/img/jantung.png";
import anatomiObg from "@/assets/img/kandungan.png";
import anatomiMata from "@/assets/img/mata.png";
import anatomiOrto from "@/assets/img/ortopedi.png";
import anatomiParu from "@/assets/img/paru.png";
import anatomiPD from "@/assets/img/penyakit-dalam.png";
import anatomiRehabMedik from "@/assets/img/rehabmedik.png";
import anatomiSaraf from "@/assets/img/saraf.png";
import anatomiTHT from "@/assets/img/tht-kl.png";
import { THasilDokter } from "../../../schema";

export default function RiwayatDokter({
  riwDokter,
  riwDokterDispatch,
  hasilDokter,
}: {
  riwDokter: RiwDokterState;
  riwDokterDispatch: React.Dispatch<RiwDokterAction>;
  hasilDokter: THasilDokter | undefined;
}) {
  const kesadaran = (val: number) => {
    switch (true) {
      case val >= 14:
        return "CM (15-14)";
      case val >= 12:
        return "Apatis (13-12)";
      case val >= 10:
        return "Delirium (11-10)";
      case val >= 7:
        return "Somnolent (9-7)";
      case val >= 4:
        return "Stupor (6-4)";
      case val === 3:
        return "Coma (3)";
      default:
        return "-";
    }
  };

  type Indexable = {
    [key: string]: any;
  };
  const imgSrc: Indexable = {
    ANA: anatomiAnak, // ANAK
    BED: anatomiUmum, // BEDAH
    U0025: anatomiPD, // DIVA
    GIG: anatomiGigi, // GIGI
    END: anatomiGigi, // GIGI KONSERVASI
    JAN: anatomiJantung, // JANTUNG
    MTA: anatomiMata, // MATA
    MCU: anatomiPD, // MCU
    PAR: anatomiParu, // PARU
    OBG: anatomiObg, // OBG
    ORT: anatomiOrto, // ORTHO
    INT: anatomiPD, // PENYAKIT DALAM
    IRM: anatomiRehabMedik, // REHAB MEDIK
    SAR: anatomiSaraf, // SARAF
    THT: anatomiTHT, // THT
  };
  const anatomiImg = imgSrc[hasilDokter?.kunjungan?.kode_klinik || "BED"];

  return (
    <Transition show={riwDokter.modal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1001]"
        onClose={() => riwDokterDispatch({ modal: false })}
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
                  "h-full w-full max-w-5xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                  css.scrollbar
                )}
              >
                <div className="relative">
                  <Dialog.Title
                    as="p"
                    className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
                  >
                    Asesmen Dokter
                  </Dialog.Title>
                  <Tooltip.Provider delayDuration={300} disableHoverableContent>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            riwDokterDispatch({
                              ...riwDokter,
                              modal: false,
                            });
                            setTimeout(
                              () =>
                                riwDokterDispatch({
                                  modal: false,
                                }),
                              250
                            );
                          }}
                          className="absolute right-3 top-0 disabled:cursor-not-allowed disabled:opacity-50"
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
                </div>
                <div className="my-2 flex flex-1 flex-col gap-2 overflow-y-auto">
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Subjektif</p>
                    <table>
                      <tbody className="text-sm">
                        <tr>
                          <td className="py-0.5">Keluhan Utama</td>
                          <td className="pl-5 pr-3">:</td>
                          <td>{hasilDokter?.anamnesis.keluhan}</td>
                        </tr>
                        {hasilDokter?.kunjungan?.kode_klinik !== "ORT" ? (
                          <>
                            <tr>
                              <td className="py-0.5">
                                Riwayat Penyakit Sekarang
                              </td>
                              <td className="pl-5 pr-3">:</td>
                              <td>{hasilDokter?.anamnesis.penyakit}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">
                                Riwayat Penyakit Dahulu
                              </td>
                              <td className="pl-5 pr-3">:</td>
                              <td>
                                {hasilDokter?.anamnesis.riwayat?.join(", ")}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-0.5">
                                Riwayat Penyakit Keluarga
                              </td>
                              <td className="pl-5 pr-3">:</td>
                              <td>
                                {hasilDokter?.anamnesis.riwayat_keluarga?.join(
                                  ", "
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Riwayat Alergi</td>
                              <td className="pl-5 pr-3">:</td>
                              <td>{hasilDokter?.anamnesis.alergi}</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="py-0.5">Mekanisme Injury</td>
                              <td className="pl-5 pr-3">:</td>
                              <td>{hasilDokter?.orto?.injury}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Waktu Kejadian</td>
                              <td className="pl-5 pr-3">:</td>
                              <td>
                                {!!hasilDokter?.orto?.waktu
                                  ? new Intl.DateTimeFormat("id-ID", {
                                      dateStyle: "long",
                                    }).format(
                                      new Date(hasilDokter?.orto?.waktu)
                                    )
                                  : null}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-0.5">
                                Riwayat Penanganan Sebelumnya
                              </td>
                              <td className="pl-5 pr-3">:</td>
                              <td>{hasilDokter?.orto?.penanganan}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Objektif</p>
                    <div className="flex flex-col gap-2">
                      <div
                        className={cn(
                          "relative flex flex-wrap rounded-md border border-gray-300 px-3 py-3"
                        )}
                      >
                        <div className={cn("w-6/12")}>
                          <table>
                            <tbody>
                              <tr className="text-left text-xs">
                                <td className={`w-32`}>Keadaan Umum</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.keadaan}
                                </td>
                              </tr>
                              <tr className="text-left text-xs">
                                <td className="">TD</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.td?.every(
                                    (val) => val !== 0 || !!val
                                  )
                                    ? (hasilDokter?.fisik?.td.at(0) || "-") +
                                      "/" +
                                      (hasilDokter?.fisik?.td.at(1) || "-")
                                    : "-"}{" "}
                                  mmHg
                                </td>
                              </tr>
                              <tr className="text-left text-xs">
                                <td className="">Temp</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.temp} &deg;C
                                </td>
                              </tr>
                              {hasilDokter?.kunjungan?.kode_klinik !== "IRM" ? (
                                <>
                                  <tr className="text-left text-xs">
                                    <td className="">Kesadaran</td>
                                    <td className="">:</td>
                                    <td className="">
                                      {kesadaran(
                                        hasilDokter?.fisik?.gcs?.reduce(
                                          (acc, val) => acc + val,
                                          0
                                        )!
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="text-left text-xs">
                                    <td className="">GCS</td>
                                    <td className="">:</td>
                                    <td className="">
                                      <span className="text-sky-800 dark:text-sky-300">
                                        E
                                      </span>{" "}
                                      = {hasilDokter?.fisik?.gcs.at(0) || "-"},
                                      <span className="text-sky-800 dark:text-sky-300">
                                        {" "}
                                        M
                                      </span>{" "}
                                      = {hasilDokter?.fisik?.gcs.at(1) || "-"},
                                      <span className="text-sky-800 dark:text-sky-300">
                                        {" "}
                                        V
                                      </span>{" "}
                                      = {hasilDokter?.fisik?.gcs.at(2) || "-"}
                                    </td>
                                  </tr>
                                </>
                              ) : (
                                <tr className="text-left text-xs">
                                  <td className="align-top">Lainnya</td>
                                  <td className="">:</td>
                                  <td className="">
                                    {hasilDokter?.fisik?.tambahan || "-"} cm
                                  </td>
                                </tr>
                              )}
                              {hasilDokter?.kunjungan?.kode_klinik === "MTA" ? (
                                <>
                                  <tr className="text-left text-xs">
                                    <td className="">Kaca Mata Lama</td>
                                    <td className="">:</td>
                                    <td className="">
                                      OD{" "}
                                      {hasilDokter?.fisik?.mata?.lama?.at(0) ||
                                        "-"}
                                    </td>
                                  </tr>
                                  <tr className="text-left text-xs">
                                    <td colSpan={2}>&nbsp;</td>
                                    <td className="">
                                      OS{" "}
                                      {hasilDokter?.fisik?.mata?.lama?.at(1) ||
                                        "-"}
                                    </td>
                                  </tr>
                                </>
                              ) : null}
                            </tbody>
                          </table>
                        </div>

                        <div className="w-6/12">
                          <table>
                            <tbody>
                              <tr className="text-left text-xs">
                                <td className="">HR</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.hr || "-"} x/mnt
                                </td>
                              </tr>
                              <tr className="text-left text-xs">
                                <td className="">RR</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.rr || "-"} x/mnt
                                </td>
                              </tr>
                              {hasilDokter?.kunjungan?.kode_klinik !== "IRM" ? (
                                <tr className="text-left text-xs">
                                  <td className="">SpO2</td>
                                  <td className="">:</td>
                                  <td className="">
                                    {hasilDokter?.fisik?.saturasi || "-"} %
                                  </td>
                                </tr>
                              ) : null}
                              <tr className="text-left text-xs">
                                <td className="">TB</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.tb || "-"} cm
                                </td>
                              </tr>
                              <tr className="text-left text-xs">
                                <td className="">BB</td>
                                <td className="">:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.bb || "-"} kg
                                </td>
                              </tr>
                              {hasilDokter?.kunjungan?.kode_klinik === "MTA" ? (
                                <>
                                  <tr className="text-left text-xs">
                                    <td className="">Visus</td>
                                    <td className="">:</td>
                                    <td className="">
                                      OD{" "}
                                      {hasilDokter?.fisik?.mata?.visus?.at(0) ||
                                        "-"}
                                    </td>
                                  </tr>
                                  <tr className="text-left text-xs">
                                    <td colSpan={2}>&nbsp;</td>
                                    <td className="">
                                      OS{" "}
                                      {hasilDokter?.fisik?.mata?.visus?.at(1) ||
                                        "-"}
                                    </td>
                                  </tr>
                                </>
                              ) : null}
                            </tbody>
                          </table>
                        </div>
                        {hasilDokter?.kunjungan?.kode_klinik !== "IRM" ? (
                          <table>
                            <tbody>
                              <tr className="text-left text-xs">
                                <td
                                  className={cn(
                                    "flex",
                                    hasilDokter?.kunjungan?.kode_klinik !==
                                      "IRM"
                                      ? "w-32"
                                      : "w-14"
                                  )}
                                >
                                  Lainnya
                                </td>
                                <td className={`align-baseline`}>:</td>
                                <td className="">
                                  {hasilDokter?.fisik?.tambahan || "-"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                      </div>

                      {hasilDokter?.kunjungan?.kode_klinik === "MTA" ? (
                        <div>
                          <table>
                            <tbody className="text-sm">
                              <tr>
                                <td className="py-0.5 align-top">Funduskopi</td>
                                <td className="pl-5 pr-3 align-top">:</td>
                                <td className="">
                                  <p>
                                    OD{" "}
                                    {hasilDokter?.mata?.funduskopi?.at(0) ||
                                      "-"}
                                  </p>
                                  <p>
                                    OS{" "}
                                    {hasilDokter?.mata?.funduskopi?.at(1) ||
                                      "-"}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 align-top">Tonometri</td>
                                <td className="pl-5 pr-3 align-top">:</td>
                                <td className="">
                                  <p>
                                    OD{" "}
                                    {hasilDokter?.mata?.tonometri?.at(0) || "-"}
                                  </p>
                                  <p>
                                    OS{" "}
                                    {hasilDokter?.mata?.tonometri?.at(1) || "-"}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 align-top">
                                  Anel/Sistem Lakrimal
                                </td>
                                <td className="pl-5 pr-3 align-top">:</td>
                                <td className="">
                                  <p>
                                    OD {hasilDokter?.mata?.anel?.at(0) || "-"}
                                  </p>
                                  <p>
                                    OS {hasilDokter?.mata?.anel?.at(1) || "-"}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : null}

                      {hasilDokter?.kunjungan?.kode_klinik === "ORT" ? (
                        <div>
                          <p className="mb-0.5 text-sm">Pemeriksaan General</p>
                          <table>
                            <tbody className="text-sm">
                              <tr>
                                <td className="py-0.5">Kepala</td>
                                <td className="pl-5 pr-3">:</td>
                                <td>{hasilDokter?.orto?.kepala}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Leher</td>
                                <td className="pl-5 pr-3">:</td>
                                <td>{hasilDokter?.orto?.leher}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Thorak</td>
                                <td className="pl-5 pr-3">:</td>
                                <td>{hasilDokter?.orto?.thorak}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Abdomen</td>
                                <td className="pl-5 pr-3">:</td>
                                <td>{hasilDokter?.orto?.abdomen}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Ekstremitas</td>
                                <td className="pl-5 pr-3">:</td>
                                <td>{hasilDokter?.orto?.ekstremitas}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : null}

                      <div className="flex w-3/4 flex-col">
                        <p className="text-sm">Status Lokalis</p>
                        <div className="grid grid-cols-2">
                          <div className="rounded-md border border-slate-300">
                            <ImageMarker
                              src={anatomiImg}
                              markers={hasilDokter?.status_lokalis}
                            />
                          </div>
                          <div className="px-3 text-sm">
                            <p className="dark:text-neutral-50">Catatan</p>
                            <table className="mb-2 mt-2 w-full">
                              <tbody>
                                {hasilDokter?.status_lokalis?.map((val, idx) =>
                                  val.catatan !== undefined ? (
                                    <tr className="text-left" key={idx}>
                                      <td className="w-5 px-2 py-0.5 dark:text-neutral-50">
                                        {idx + 1 + "."}
                                      </td>
                                      <td className="px-2 py-0.5 dark:text-neutral-50">
                                        {val.catatan}
                                      </td>
                                    </tr>
                                  ) : null
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {hasilDokter?.kunjungan?.kode_klinik === "IRM" ? (
                        <div className="flex w-5/6 flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2">
                              <p className="mb-0.5 py-1">Inspeksi</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.inspeksi}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 py-1">Statis</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.statis}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 py-1">Dinamis</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.dinamis}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 py-1">Kognitif</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.kognitif}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="mb-0.5 py-1">Palpasi</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.palpasi}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 px-4 py-2">Kekuatan Otot</p>
                              {hasilDokter?.rehabmedik?.mmt.every(
                                (val) => !!val
                              ) ? (
                                <table className="ml-4 table-fixed">
                                  <tbody>
                                    <tr className="flex border-b border-b-gray-400">
                                      <td className="grid grid-cols-3 gap-2 border-r border-r-gray-400 px-2">
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(0)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(1)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(2)}
                                        </p>
                                      </td>
                                      <td className="grid grid-cols-3 gap-2 px-2">
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(3)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(4)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(5)}
                                        </p>
                                      </td>
                                    </tr>
                                    <tr className="flex">
                                      <td className="grid grid-cols-3 gap-2 border-r border-r-gray-400 px-2">
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(6)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(7)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(8)}
                                        </p>
                                      </td>
                                      <td className="grid grid-cols-3 gap-2 px-2">
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(9)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(10)}
                                        </p>
                                        <p>
                                          {hasilDokter?.rehabmedik?.mmt.at(11)}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : null}
                            </div>
                            <div>
                              <p className="mb-0.5 px-4 py-2">Luas di</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.luas}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2">
                              <p className="mb-0.5 py-1">Perkusi</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.perkusi}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 py-1">Auskultasi</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.auskultasi}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2">
                              <p className="mb-0.5 py-1">Lokasi Nyeri</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.nyeri}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 px-4 py-2">
                                Nyeri Tekan{" "}
                                <span className="underline">
                                  {hasilDokter?.rehabmedik?.tekan || "__"}
                                </span>{" "}
                                (Numeric)
                              </p>
                              <p className="mb-0.5 px-4 py-2">
                                Nyeri Gerak{" "}
                                <span className="underline">
                                  {hasilDokter?.rehabmedik?.gerak || "__"}
                                </span>{" "}
                                (Numeric)
                              </p>
                              <p className="mb-0.5 px-4 py-2">
                                Nyeri Diam{" "}
                                <span className="underline">
                                  {hasilDokter?.rehabmedik?.diam || "__"}
                                </span>{" "}
                                (Numeric)
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="mb-0.5 py-1">Antropometri</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.antropometri}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0.5 py-1">Pemeriksaan Khusus</p>
                              <div className="rounded-lg border-2 px-4 py-2">
                                {hasilDokter?.rehabmedik?.khusus}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Asesmen</p>
                    <p className="mb-1 text-center text-sm">Diagnosis</p>
                    <div
                      className={cn(
                        "mt-1 w-full overflow-hidden rounded text-xs shadow"
                      )}
                    >
                      <table className="min-w-full">
                        <thead>
                          <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                            <td className={cn("px-4 py-2")}>Diagnosis</td>
                            <td className={cn("px-4 py-2")}>ICD 10</td>
                            <td className={cn("px-4 py-2")}>Primer</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {hasilDokter?.diagnosis.map((diag, idx) => (
                            <tr
                              className="bg-white hover:text-sky-600 dark:bg-slate-900"
                              key={idx}
                            >
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {diag.diagnosis}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                {diag?.icd10?.nama}
                              </td>
                              <td className="whitespace-pre-wrap px-4 py-2">
                                <input
                                  readOnly
                                  type="checkbox"
                                  checked={diag.primer}
                                  className="accent-slate-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Planning & Target</p>
                    <div className="grid grid-cols-2 overflow-hidden rounded text-xs shadow ">
                      <div>
                        <p className="mb-0.5 bg-slate-300/70 px-4 py-2">
                          Rencana Asuhan
                        </p>
                        <p className="bg-white px-4 py-2">
                          {hasilDokter?.asuhantarget.asuhan}
                        </p>
                      </div>
                      <div className="border-l border-l-slate-100">
                        <p className="mb-0.5 bg-slate-300/70 px-4 py-2">
                          Target
                        </p>
                        <p className="bg-white px-4 py-2">
                          {hasilDokter?.asuhantarget.target}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Instruksi</p>
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="mb-1 text-center text-sm">Tindakan</p>
                        <div
                          className={cn(
                            "mt-1 w-full overflow-hidden rounded text-xs shadow"
                          )}
                        >
                          <table className="min-w-full">
                            <thead>
                              <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                                <td className={cn("px-4 py-2")}>Tindakan</td>
                                <td className={cn("px-4 py-2")}>ICD 9</td>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {hasilDokter?.tindakan.map((tdx, idx) => (
                                <tr
                                  className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                  key={idx}
                                >
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {tdx.tindakan}
                                  </td>
                                  <td className="whitespace-pre-wrap px-4 py-2">
                                    {tdx?.icd9?.nama}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <p className="mb-0.5 text-center text-sm">Resep Obat</p>
                        <div className="flex flex-col gap-1.5">
                          <div>
                            <p className="mb-0.5 text-center text-sm">
                              Non Racikan
                            </p>
                            <div
                              className={cn(
                                "mt-1 w-full overflow-hidden rounded shadow"
                              )}
                            >
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="divide-x divide-slate-50 bg-slate-300/70 dark:bg-gray-700">
                                    <td className={cn("px-4 py-2")}>Obat</td>
                                    <td className={cn("px-4 py-2")}>Sediaan</td>
                                    <td className={cn("px-4 py-2")}>Dosis</td>
                                    <td className={cn("px-4 py-2")}>Rute</td>
                                    <td className={cn("px-4 py-2")}>Waktu</td>
                                    <td className={cn("px-4 py-2")}>Jumlah</td>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {hasilDokter?.nonracik?.map((non, idx) => (
                                    <tr
                                      className="bg-white hover:text-sky-600 dark:bg-slate-900"
                                      key={idx}
                                    >
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.nama_obat}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.sediaan}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.kekuatan}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.rute}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.waktu.filter(Boolean).join(" ")}
                                      </td>
                                      <td className="whitespace-pre-wrap px-4 py-2">
                                        {non.jumlah}
                                      </td>
                                    </tr>
                                  ))}
                                  {!hasilDokter?.nonracik ||
                                  hasilDokter?.nonracik?.length === 0 ? (
                                    <tr>
                                      <td colSpan={8}>
                                        <p className="px-4 py-2 text-center">
                                          Tidak ada obat non racik
                                        </p>
                                      </td>
                                    </tr>
                                  ) : null}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div>
                            <p className="mb-0.5 text-center text-sm">
                              Racikan
                            </p>
                            <div
                              className={cn(
                                "w-full overflow-hidden rounded shadow"
                              )}
                            >
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="divide-x divide-slate-50 bg-slate-200 dark:divide-slate-600 dark:bg-gray-800">
                                    <td className="px-2 py-1" rowSpan={2}>
                                      Racikan
                                    </td>
                                    <td className="px-2 py-1" rowSpan={2}>
                                      Metode
                                    </td>
                                    <td className="px-2 py-1" rowSpan={2}>
                                      Rute
                                    </td>
                                    <td className="px-2 py-1" rowSpan={2}>
                                      Waktu
                                    </td>
                                    <td className="px-2 py-1" rowSpan={2}>
                                      Bungkus
                                    </td>
                                    <td
                                      className="px-2 py-1 text-center"
                                      colSpan={5}
                                    >
                                      Detail
                                    </td>
                                  </tr>
                                  <tr className="border-t border-slate-50 bg-slate-200 dark:divide-slate-600 dark:border-slate-600 dark:bg-gray-800">
                                    <td className="border-x border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                      No.
                                    </td>
                                    <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                      Obat
                                    </td>
                                    <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                      Sediaan
                                    </td>
                                    <td className="border-r border-slate-50 px-2 py-0.5 dark:border-slate-600">
                                      Dosis/bungkus
                                    </td>
                                    <td className="px-2 py-0.5">Jumlah</td>
                                  </tr>
                                </thead>
                                <tbody>
                                  {hasilDokter?.racik?.map((racik, idx) => (
                                    <>
                                      <tr
                                        className={cn(
                                          "bg-white hover:text-sky-600 dark:bg-slate-900",
                                          "align-top"
                                        )}
                                        key={idx}
                                      >
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.nama_racik}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.metode}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.rute}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.waktu
                                            .filter(Boolean)
                                            .join(" ")}
                                        </td>
                                        <td
                                          className={cn(
                                            "whitespace-pre-wrap px-2 py-1.5",
                                            "text-center",
                                            "border-b border-gray-200 dark:border-gray-700"
                                          )}
                                          rowSpan={
                                            (racik.detail?.length ?? 0) + 1
                                          }
                                        >
                                          {racik.jumlah}
                                        </td>
                                      </tr>
                                      {racik.detail?.map(
                                        (detail, detailIdx) => (
                                          <tr
                                            className={cn(
                                              "bg-white hover:text-sky-600 dark:bg-slate-900"
                                            )}
                                            key={detailIdx}
                                          >
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-4 py-2",
                                                "text-left",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                            >
                                              {detailIdx + 1}
                                              {"."}
                                            </td>
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-4 py-2",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                            >
                                              {detail.nama}
                                            </td>
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-4 py-2",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                            >
                                              {detail.sediaan}
                                            </td>
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-4 py-2",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                            >
                                              {detail.dosis}
                                            </td>
                                            <td
                                              className={cn(
                                                "whitespace-pre-wrap px-4 py-2",
                                                "text-center",
                                                "border-b border-gray-200 dark:border-gray-700"
                                              )}
                                            >
                                              {detail.jumlah}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </>
                                  ))}
                                  {!hasilDokter?.racik ||
                                  hasilDokter?.racik?.length === 0 ? (
                                    <tr>
                                      <td colSpan={12}>
                                        <p className="px-4 py-2 text-center">
                                          Tidak ada racikan
                                        </p>
                                      </td>
                                    </tr>
                                  ) : null}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      {hasilDokter?.kunjungan?.kode_klinik === "IRM" ? (
                        <div>
                          <p className="mb-0.5 text-center text-sm">Evaluasi</p>
                          <p className="rounded-lg border-2 px-4 py-2 text-sm">
                            {hasilDokter?.rehabmedik?.evaluasi}
                          </p>
                        </div>
                      ) : hasilDokter?.kunjungan?.kode_klinik === "ORT" ? (
                        <div>
                          <p className="mb-0.5 text-center text-sm">
                            Prognosis
                          </p>
                          <div className="mx-5 grid grid-cols-2 gap-1 text-sm">
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_baik"
                                  checked={
                                    hasilDokter?.orto?.prognosis.at(0) ===
                                    "Baik"
                                  }
                                  readOnly
                                />
                                <label htmlFor="prognosis_baik">Baik</label>
                              </div>
                            </div>
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_malunion"
                                  checked={!!hasilDokter?.orto?.prognosis.at(1)}
                                  readOnly
                                />
                                <label htmlFor="prognosis_malunion">
                                  Malunion
                                </label>
                              </div>
                              <p>{hasilDokter?.orto?.prognosis.at(1)}</p>
                            </div>
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_infection"
                                  checked={!!hasilDokter?.orto?.prognosis.at(2)}
                                  readOnly
                                />
                                <label htmlFor="prognosis_infection">
                                  Infection
                                </label>
                              </div>
                              <p>{hasilDokter?.orto?.prognosis.at(2)}</p>
                            </div>
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_compartment_syndrome"
                                  checked={!!hasilDokter?.orto?.prognosis.at(3)}
                                  readOnly
                                />
                                <label htmlFor="prognosis_compartment_syndrome">
                                  Compartment Syndrome
                                </label>
                              </div>
                              <p>{hasilDokter?.orto?.prognosis.at(3)}</p>
                            </div>
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_non_union"
                                  checked={!!hasilDokter?.orto?.prognosis.at(4)}
                                  readOnly
                                />
                                <label htmlFor="prognosis_non_union">
                                  Non Union
                                </label>
                              </div>
                              <p>{hasilDokter?.orto?.prognosis.at(4)}</p>
                            </div>
                            <div className="flex h-6 items-center gap-2">
                              <div className="flex items-center justify-start gap-1.5">
                                <input
                                  type="checkbox"
                                  className="size-3  accent-sky-700"
                                  id="prognosis_contracture"
                                  checked={!!hasilDokter?.orto?.prognosis.at(5)}
                                  readOnly
                                />
                                <label htmlFor="prognosis_contracture">
                                  Contracture
                                </label>
                              </div>
                              <p>{hasilDokter?.orto?.prognosis.at(5)}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
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
