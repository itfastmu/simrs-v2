import css from "@/assets/css/scrollbar.module.css";
import { Tooltip } from "@/components/tooltip";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { RiwDokterAction, RiwDokterState } from "./riwayat-pemeriksaan";
import { THasilPsikolog } from "../../../schema";
import { Button } from "@/components/button";

export default function RiwayatPsikolog({
  riwPsikolog,
  riwPsikologDispatch,
  hasilPsikolog,
}: {
  riwPsikolog: RiwDokterState;
  riwPsikologDispatch: React.Dispatch<RiwDokterAction>;
  hasilPsikolog: THasilPsikolog | undefined;
}) {
  return (
    <Transition show={riwPsikolog.modal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1001]"
        onClose={() => riwPsikologDispatch({ modal: false })}
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
                    Asesmen Psikologi
                  </Dialog.Title>
                  <Tooltip.Provider delayDuration={300} disableHoverableContent>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            riwPsikologDispatch({
                              ...riwPsikolog,
                              modal: false,
                            });
                            setTimeout(
                              () =>
                                riwPsikologDispatch({
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
                  <div className="relative rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Riwayat Penyakit</p>
                    <Button className="absolute right-1 top-1 rounded px-2 py-1 text-xs">
                      Salin
                    </Button>
                    <table>
                      <tbody className="text-xs">
                        <tr>
                          <td className="py-0.5">Keluhan Fisik</td>
                          <td className="pl-5 pr-3">:</td>
                          <td>{hasilPsikolog?.penyakit.keluhan_fisik}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5">Keluhan Psikologis</td>
                          <td className="pl-5 pr-3">:</td>
                          <td>{hasilPsikolog?.penyakit.keluhan_psikologis}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5">Diagnosis Dokter</td>
                          <td className="pl-5 pr-3">:</td>
                          <td>{hasilPsikolog?.penyakit.diagnosis_dokter}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="relative rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Asesmen</p>
                    <Button className="absolute right-1 top-1 rounded px-2 py-1 text-xs">
                      Salin
                    </Button>
                    <p className="mb-1 text-center text-sm">Observasi</p>
                    <div className="w-full px-4 py-2">
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <label className="text-sm font-semibold dark:text-neutral-200">
                              Deskripsi Umum
                            </label>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Penampilan Umum
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Terawat", "Tidak Terawat"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi
                                            .penampilan !== val &&
                                            "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Sikap terhadap Pemeriksa
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Kooperatif", "Kurang Kooperatif"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.sikap !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Afek
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Normal", "Datar", "Depresif"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.afek !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Roman Muka
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Wajar", "Murung", "Euphoria"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.muka !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Proses Pikir
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Realistik", "Tidak Realistik"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.pikir !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-semibold dark:text-neutral-200">
                                Gangguan Persepsi
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Tidak Ada", "Halusinasi", "Delusi"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.persepsi !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold dark:text-neutral-200">
                              Fungsi Psikologi
                            </label>

                            <div className="grid text-left text-xs">
                              <label className="font-bold dark:text-neutral-200">
                                Kognitif
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="font-semibold dark:text-neutral-200">
                                    Memori
                                  </label>
                                  <div className="flex items-center">
                                    <p className="text-sm">
                                      {hasilPsikolog?.kognitif.memori
                                        ? "-"
                                        : "+"}
                                    </p>
                                    {hasilPsikolog?.kognitif.memori_ket ? (
                                      <p>
                                        <span>, </span>
                                        {hasilPsikolog?.kognitif.memori_ket}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-semibold dark:text-neutral-200">
                                    Konsentrasi
                                  </label>
                                  <div className="flex items-center">
                                    <p className="text-sm">
                                      {hasilPsikolog?.kognitif.konsentrasi
                                        ? "-"
                                        : "+"}
                                    </p>
                                    {hasilPsikolog?.kognitif.konsentrasi_ket ? (
                                      <p>
                                        <span>, </span>
                                        {
                                          hasilPsikolog?.kognitif
                                            .konsentrasi_ket
                                        }
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-semibold dark:text-neutral-200">
                                    Orientasi
                                  </label>
                                  <div className="flex items-center">
                                    <p className="text-sm">
                                      {hasilPsikolog?.kognitif.orientasi
                                        ? "-"
                                        : "+"}
                                    </p>
                                    {hasilPsikolog?.kognitif.orientasi_ket ? (
                                      <p>
                                        <span>, </span>
                                        {hasilPsikolog?.kognitif.orientasi_ket}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                <div>
                                  <label className="font-semibold dark:text-neutral-200">
                                    Kemampuan Verbal
                                  </label>
                                  <div className="flex items-center">
                                    <p className="text-sm">
                                      {hasilPsikolog?.kognitif.verbal
                                        ? "-"
                                        : "+"}
                                    </p>
                                    {hasilPsikolog?.kognitif.verbal_ket ? (
                                      <p>
                                        <span>, </span>
                                        {hasilPsikolog?.kognitif.verbal_ket}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-bold dark:text-neutral-200">
                                Emosi
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {["Stabil", "Tidak Stabil"].map(
                                  (val, idx, arr) => (
                                    <>
                                      <p
                                        key={idx}
                                        className={cn(
                                          hasilPsikolog?.observasi.emosi !==
                                            val && "line-through"
                                        )}
                                      >
                                        {val}
                                      </p>
                                      {idx + 1 !== arr.length ? (
                                        <span>/</span>
                                      ) : null}
                                    </>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="grid text-left text-xs">
                              <label className="font-bold dark:text-neutral-200">
                                Perilaku
                              </label>
                              <div className="mb-2 flex gap-0.5">
                                {[
                                  "Normal",
                                  "Ada Hambatan",
                                  "Agresif",
                                  "Menarik Diri",
                                ].map((val, idx, arr) => (
                                  <>
                                    <p
                                      key={idx}
                                      className={cn(
                                        hasilPsikolog?.observasi.perilaku !==
                                          val && "line-through"
                                      )}
                                    >
                                      {val}
                                    </p>
                                    {idx + 1 !== arr.length ? (
                                      <span>/</span>
                                    ) : null}
                                  </>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <label className="text-sm font-semibold dark:text-neutral-200">
                          Psikotes Pendukung
                        </label>
                        <div className="flex flex-col items-center gap-2">
                          <div className="grid w-3/4 grid-flow-col grid-rows-3 gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div className="w-full" key={i}>
                                <p className="text-xs">
                                  {i + 1 + ". "}
                                  {hasilPsikolog?.psikotes.tes.at(i)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div
                            className={cn(
                              "relative w-3/4"
                              // errors.anamnesis?.keluhan &&
                              //   "rounded-lg bg-red-300 dark:bg-red-500/50"
                            )}
                          >
                            <label className="py-2 text-sm font-semibold dark:text-neutral-200">
                              Hasil Tes
                            </label>
                            <div className="rounded bg-white p-2 text-xs">
                              <p>{hasilPsikolog?.psikotes.hasil}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <label className="text-sm font-semibold dark:text-neutral-200">
                          Simptom
                        </label>
                        <div className="mx-auto grid w-3/4 grid-cols-3 gap-2">
                          <div className="grid gap-1">
                            {[
                              "Sakit kepala",
                              "Kurang nafsu makan",
                              "Sulit tidur",
                              "Mudah takut",
                              "Tegang",
                              "Cemas",
                              "Gemetar",
                            ].map((val) => (
                              <div
                                className="flex items-start justify-start gap-1"
                                key={val}
                              >
                                <input
                                  readOnly
                                  type="checkbox"
                                  id={"simpton-" + val}
                                  checked={hasilPsikolog?.simpton?.some(
                                    (some) => some === val
                                  )}
                                />
                                <label className="whitespace-pre-wrap text-[11px]/[12px]">
                                  {val}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-1">
                            {[
                              "Gangguan perut",
                              "Sulit konsentrasi",
                              "Sedih",
                              "Sulit mengambil keputusan",
                              "Kehilangan minat",
                              "Merasa tidak berguna",
                              "Mudah lupa",
                            ].map((val) => (
                              <div
                                className="flex items-start justify-start gap-1"
                                key={val}
                              >
                                <input
                                  readOnly
                                  type="checkbox"
                                  id={"simpton-" + val}
                                  checked={hasilPsikolog?.simpton?.some(
                                    (some) => some === val
                                  )}
                                />
                                <label className="whitespace-pre-wrap text-[11px]/[12px]">
                                  {val}
                                </label>
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-1">
                            {[
                              "Merasa bersalah",
                              "Mudah lelah",
                              "Putus asa",
                              "Mudah marah",
                              "Mudah tersinggung",
                              "Mimpi buruk",
                              "Tidak percaya diri",
                            ].map((val) => (
                              <div
                                className="flex items-start justify-start gap-1"
                                key={val}
                              >
                                <input
                                  readOnly
                                  type="checkbox"
                                  id={"simpton-" + val}
                                  checked={hasilPsikolog?.simpton?.some(
                                    (some) => some === val
                                  )}
                                />
                                <label className="whitespace-pre-wrap text-[11px]/[12px]">
                                  {val}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Dinamika Psikologi</p>
                    <Button className="absolute right-1 top-1 rounded px-2 py-1 text-xs">
                      Salin
                    </Button>
                    <div className="flex flex-col gap-2">
                      <div className="rounded bg-white p-2 text-xs">
                        <p>{hasilPsikolog?.dinamika}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Diagnosis Psikologi</p>
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
                          {hasilPsikolog?.diagnosis.map((diag, idx) => (
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
                  {/* <div className="rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Planning & Target</p>
                    <div className="grid grid-cols-2 overflow-hidden rounded text-sm shadow ">
                      <div>
                        <p className="mb-0.5 bg-slate-300/70 px-4 py-2">
                          Rencana Asuhan
                        </p>
                        <p className="bg-white px-4 py-2">
                          {hasilPsikolog?.asuhantarget.asuhan}
                        </p>
                      </div>
                      <div className="border-l border-l-slate-100">
                        <p className="mb-0.5 bg-slate-300/70 px-4 py-2">
                          Target
                        </p>
                        <p className="bg-white px-4 py-2">
                          {hasilPsikolog?.asuhantarget.target}
                        </p>
                      </div>
                    </div>
                  </div> */}

                  <div className="relative rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Rencana Intervensi</p>
                    <Button className="absolute right-1 top-1 rounded px-2 py-1 text-xs">
                      Salin
                    </Button>
                    <div className="flex flex-col gap-2">
                      <div className="rounded bg-white p-2 text-xs">
                        <p>{hasilPsikolog?.rencana}</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative rounded bg-slate-50 p-2 shadow-sm">
                    <p className="pb-1.5 text-sky-900">Intervensi</p>
                    <Button className="absolute right-1 top-1 rounded px-2 py-1 text-xs">
                      Salin
                    </Button>
                    <div className="flex flex-col gap-2">
                      <div className="rounded bg-white p-2 text-xs">
                        <p>{hasilPsikolog?.intervensi}</p>
                      </div>
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
