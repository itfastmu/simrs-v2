"use client";

import { KunjunganRajal } from "@/app/(pendaftaran)/schema";
// import css from "@/assets/css/scrollbar.module.css";
// import { Button } from "@/components/button";
// import { Input, LabelButton } from "@/components/form";
// import {
//   InputSearch,
//   Pagination,
//   PerPage,
//   Th,
//   ThDiv,
// } from "@/components/table";
// import { Tooltip } from "@/components/tooltip";
// import { APIURL } from "@/lib/connection";
// import { cn, getAgeThn } from "@/lib/utils";
// import { Dialog, Transition } from "@headlessui/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Cookies from "js-cookie";
// import Link from "next/link";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import {
//   Fragment,
//   Suspense,
//   useCallback,
//   useDeferredValue,
//   useEffect,
//   useMemo,
//   useReducer,
//   useRef,
//   useState,
// } from "react";
// import { Controller, SubmitHandler, useForm } from "react-hook-form";
// import { HiOutlineDocumentAdd, HiOutlineDocumentText } from "react-icons/hi";
// import { IoDocumentTextOutline } from "react-icons/io5";
// import {
//   RiCheckLine,
//   RiDeleteBin5Line,
//   RiNurseFill,
//   RiStethoscopeLine,
// } from "react-icons/ri";
// import { TbFingerprint, TbFingerprintOff } from "react-icons/tb";
// import { toast } from "react-toastify";
// import { z } from "zod";

// type BillingState = {
//   modal: boolean;
//   data?: PasienAsesmen;
// };
// type BillingAction = { type: "setBilling"; billing: BillingState };

// type SkriningState = {
//   modal: boolean;
//   data?: Pick<
//     KunjunganRajal,
//     "id_kunjungan" | "id_pasien" | "nama" | "tanggal_lahir"
//   > & { id_klinik: string };
// };
// type SkriningAction = { type: "setSkrining"; skrining: SkriningState };

// type PasienAsesmen = {
//   alamat: string;
//   alamatpj: string;
//   stts_nikah: string;
//   keluarga: string;
//   namakeluarga: string;
//   nm_pasien: string;
//   tanggal_booking: string;
//   no_rm: number;
//   no_rawat: string;
//   kd_pj: string;
//   no_hp: string;
//   tgl_lahir: string;
//   suku_bangsa: string;
//   pekerjaan: string;
//   id: number;
//   id_jadwal: number;
//   id_pasien: number;
//   nomer: number;
//   status_book: string;
//   is_sent_khanza: number;
//   keterangan: string;
//   booking: string;
//   billing: string;
//   kd_dokter: string;
//   nama: string;
//   spesial: string;
//   kd_sps: string;
//   tanggal: string;
//   hari: number;
//   mulai: string;
//   selesai: string;
//   kuota: number;
//   kd_poli: string;
//   nm_poli: string;
//   registrasi: number;
//   registrasilama: number;
//   poli_aktif: string;
//   terisi: number;
//   no_kartu: string;
//   fp: string;
//   assdokter: number;
//   skrining: boolean;
//   complete: number;
// };

export default function ListPasienAsesmen() {
  return <></>;
}
// export default function ListPasienAsesmen() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const headers = new Headers();
//   const [token] = useState(Cookies.get("token"));
//   headers.append("Authorization", token as string);
//   headers.append("Content-Type", "application/json");

//   const searchParams = useSearchParams();
//   const params = new URLSearchParams(searchParams);
//   const setQueryString = useCallback(
//     (paramsArray: Array<{ name: string; value: string }>) => {
//       paramsArray.forEach((param) => {
//         params.set(param.name, param.value);
//       });

//       return params.toString();
//     },
//     [searchParams]
//   );

//   const [user] = useState(Cookies.get("grup"));
//   const [tanggal] = useState<Date>(new Date());
//   const [cari, setCari] = useState<string>("");
//   const deferredCari = useDeferredValue(cari);

//   type Indexable = {
//     [key: string]: any;
//   };
//   const [caraBayar] = useState<Indexable>({
//     BPJ: {
//       nama: "BPJS",
//       color: "text-green-500",
//     },
//     ASR: {
//       nama: "Asuransi",
//       color: "text-red-600",
//     },
//     A09: {
//       nama: "Umum",
//       color: "text-sky-500",
//     },
//     A67: {
//       nama: "BPJS Ketenagakerjaan",
//       color: "text-sky-600",
//     },
//     A78: {
//       nama: "Swab PCR",
//       color: "text-lime-400",
//     },
//     A79: {
//       nama: "Rapid Antigen",
//       color: "text-amber-500",
//     },
//   });
//   const finger = (finger: boolean) => {
//     if (finger) {
//       return <TbFingerprint className="ml-1 inline-flex" size="1.2rem" />;
//     } else {
//       return (
//         <TbFingerprintOff
//           className="ml-1 inline-flex text-amber-400"
//           size="1.2rem"
//         />
//       );
//     }
//   };

//   const [dataList, setDataList] = useState<PasienAsesmen[]>([]);

//   const skriningState = {
//     modal: false,
//     data: undefined,
//   };
//   const skriningActs = (state: SkriningState, action: SkriningAction) => {
//     switch (action.type) {
//       case "setSkrining": {
//         return {
//           ...action.skrining,
//         };
//       }
//     }
//   };
//   const [skrining, skriningDispatch] = useReducer(skriningActs, skriningState);

//   const billingState = {
//     modal: false,
//     data: undefined,
//   };
//   const billingActs = (state: BillingState, action: BillingAction) => {
//     switch (action.type) {
//       case "setBilling": {
//         return {
//           ...action.billing,
//         };
//       }
//     }
//   };
//   const [billing, billingDispatch] = useReducer(billingActs, billingState);

//   const metaState: Meta = {
//     // page: useAppSelector((state) => state.pageParamsReducer.page),
//     // perPage: useAppSelector((state) => state.pageParamsReducer.perPage),
//     page: 1,
//     perPage: 25,
//     lastPage: NaN,
//     total: NaN,
//   };
//   const metaActs = (state: Meta, action: MetaAction): Meta => {
//     switch (action.type) {
//       case "page": {
//         return {
//           ...state,
//           page: action.page,
//         };
//       }
//       case "perPage": {
//         return {
//           ...state,
//           perPage: action.perPage,
//         };
//       }
//       case "lastPage": {
//         return {
//           ...state,
//           lastPage: action.lastPage,
//         };
//       }
//       case "total": {
//         return {
//           ...state,
//           total: action.total,
//         };
//       }
//       case "setMeta": {
//         return {
//           ...state,
//           ...action.setMeta,
//         };
//       }
//     }
//   };
//   const [meta, metaDispatch] = useReducer(metaActs, metaState);

//   /* const filterState = {
//     poli: useAppSelector((state) => state.pageParamsReducer.poli),
//     dokter: useAppSelector((state) => state.pageParamsReducer.dokter),
//     mulai: useAppSelector((state) => state.pageParamsReducer.mulai),
//   }; */

//   const filterKlinik = searchParams.get("klinik") ?? "all";
//   const filterDokter = searchParams.get("dokter") ?? "all";
//   const filterMulai = searchParams.get("mulai") ?? "all";

//   const [listJadwal, setListJadwal] = useState<any[]>([]);
//   const getJadwal = async () => {
//     try {
//       const url = new URL(`${APIURL}/jadwal/poli`);
//       const params = {
//         tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
//       };
//       url.search = new URLSearchParams(params as any).toString();
//       const data = await fetch(url, { method: "GET", headers: headers });
//       const dataPoli = await data.json();
//       setListJadwal(dataPoli.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     getJadwal();
//   }, [tanggal]);

//   const listPoli = useMemo(() => {
//     return Array.from(
//       new Set(listJadwal?.map((a: { kd_poli: string }) => a.kd_poli))
//     ).map((id) =>
//       listJadwal?.find((a: { kd_poli: string }) => a.kd_poli === id)
//     );
//   }, [listJadwal]);

//   const listDokter = useMemo(() => {
//     return Array.from(
//       new Set(
//         listJadwal
//           ?.filter((data) => data.kd_poli === filterKlinik)
//           .map((a) => a.kd_dokter)
//       )
//     ).map((id) => {
//       return listJadwal?.find((a) => a.kd_dokter === id);
//     });
//   }, [filterKlinik, listPoli]);

//   const listJam = useMemo(() => {
//     return listJadwal
//       ?.filter((data) => data.kd_dokter === filterDokter)
//       .map((a) => {
//         a.jam = a.mulai + " - " + a.selesai;
//         return a;
//       });
//   }, [filterDokter, listDokter]);

//   const [isMutating, setIsMutating] = useState<boolean>(false);
//   const loadData = async () => {
//     try {
//       setIsMutating(true);
//       const url = new URL(`${APIURL}/rajal/antrian`);
//       const params = {
//         page: meta.page,
//         perPage: meta.perPage,
//         cari: deferredCari.trimStart(),
//         tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
//         poli: filterKlinik,
//         dokter: filterDokter,
//         mulai: filterMulai,
//       };
//       url.search = new URLSearchParams(params as any).toString();
//       const data = await fetch(url, { method: "GET", headers: headers });
//       const listPasien = await data.json();
//       // console.log(listPasien.data.at(0));
//       setDataList(listPasien?.data);
//       metaDispatch({
//         type: "setMeta",
//         setMeta: {
//           page: parseInt(listPasien?.meta.page),
//           perPage: parseInt(listPasien?.meta.perPage),
//           lastPage: parseInt(listPasien?.meta.lastPage),
//           total: parseInt(listPasien?.meta.total),
//         },
//       });
//     } catch (err) {
//       const error = err as Error;
//       metaDispatch({
//         type: "setMeta",
//         setMeta: {
//           ...meta,
//           total: 0,
//         },
//       });
//       if (error.message === "Data tidak ditemukan") return;
//       toast.error(error.message);
//       console.error(error);
//     } finally {
//       setIsMutating(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     // console.log(meta);
//     // console.log(filter);
//   }, [
//     meta.page,
//     meta.perPage,
//     filterKlinik,
//     filterDokter,
//     filterMulai,
//     deferredCari,
//   ]);

//   const tableDivRef = useRef<HTMLDivElement>(null);

//   return (
//     <Suspense>
//       <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
//         <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
//           <div className="flex items-center border-b border-b-slate-200 pb-3">
//             <div className="flex items-center">
//               <RiNurseFill
//                 size="1.75rem"
//                 className="mx-3 text-gray-500 dark:text-slate-100"
//               />
//               <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
//                 List Pasien
//               </p>
//             </div>
//           </div>
//           <div className="mt-2 flex items-center justify-between pb-3">
//             <div className="flex items-center gap-2">
//               <PerPage
//                 value={meta.perPage}
//                 onChange={(e) =>
//                   metaDispatch({
//                     type: "setMeta",
//                     setMeta: {
//                       ...meta,
//                       page: 1,
//                       perPage: parseInt(e.target.value),
//                     },
//                   })
//                 }
//               />
//               <select
//                 className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                 value={filterKlinik}
//                 onChange={(e) => {
//                   metaDispatch({
//                     type: "page",
//                     page: 1,
//                   });
//                   router.replace(
//                     pathname +
//                       "?" +
//                       setQueryString([
//                         { name: "klinik", value: e.target.value },
//                         { name: "dokter", value: "all" },
//                         { name: "mulai", value: "all" },
//                       ])
//                   );
//                   // filterDispatch({
//                   //   type: "dokter",
//                   //   dokter: "all",
//                   // });
//                   // filterDispatch({
//                   //   type: "mulai",
//                   //   mulai: "all",
//                   // });
//                   // filterDispatch({
//                   //   type: "poli",
//                   //   poli: e.target.value,
//                   // });
//                   /* reduxDispatch(
//                     setPageParams({
//                       ...pageParamsState,
//                       poli: e.target.value,
//                     })
//                   ); */
//                 }}
//               >
//                 <option value="all">Semua Poliklinik</option>
//                 {listPoli.map((poli, i) => (
//                   <option key={i} value={poli.kd_poli}>
//                     {poli.nm_poli}
//                   </option>
//                 ))}
//               </select>
//               {filterKlinik !== "all" ? (
//                 <select
//                   className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                   value={filterDokter}
//                   onChange={(e) => {
//                     metaDispatch({
//                       type: "page",
//                       page: 1,
//                     });
//                     router.replace(
//                       pathname +
//                         "?" +
//                         setQueryString([
//                           { name: "dokter", value: e.target.value },
//                           { name: "mulai", value: "all" },
//                         ])
//                     );
//                     // filterDispatch({
//                     //   type: "mulai",
//                     //   mulai: "all",
//                     // });
//                     // filterDispatch({
//                     //   type: "dokter",
//                     //   dokter: e.target.value,
//                     // });
//                     // reduxDispatch(
//                     //   setPageParams({
//                     //     ...pageParamsState,
//                     //     dokter: e.target.value,
//                     //   })
//                     // );
//                   }}
//                 >
//                   <option value="all">Semua Dokter</option>
//                   {listDokter.map((dokter, i) => (
//                     <option key={i} value={dokter.kd_dokter}>
//                       {dokter.nama}
//                     </option>
//                   ))}
//                 </select>
//               ) : null}
//               {filterDokter !== "all" ? (
//                 <select
//                   className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                   value={filterMulai}
//                   onChange={(e) => {
//                     metaDispatch({
//                       type: "page",
//                       page: 1,
//                     });
//                     router.replace(
//                       pathname +
//                         "?" +
//                         setQueryString([
//                           { name: "mulai", value: e.target.value },
//                         ])
//                     );
//                     // filterDispatch({
//                     //   type: "mulai",
//                     //   mulai: e.target.value,
//                     // });
//                     // reduxDispatch(
//                     //   setPageParams({
//                     //     ...pageParamsState,
//                     //     mulai: e.target.value,
//                     //   })
//                     // );
//                   }}
//                 >
//                   <option value="all">Semua Jam Praktek</option>
//                   {listJam.map((jam, i) => (
//                     <option key={i} value={jam.mulai}>
//                       {jam.jam}
//                     </option>
//                   ))}
//                 </select>
//               ) : null}
//             </div>
//             <InputSearch
//               onChange={(e) => {
//                 metaDispatch({
//                   type: "page",
//                   page: 1,
//                 });
//                 setCari(e.target.value);
//               }}
//             />
//           </div>
//           <div
//             ref={tableDivRef}
//             className={cn(
//               "h-[calc(100vh-236px)]",
//               css.scrollbar,
//               isMutating ? "overflow-hidden" : "overflow-y-auto"
//             )}
//           >
//             <table className="w-full text-left text-sm font-semibold text-gray-600">
//               <thead>
//                 <tr>
//                   <Th>
//                     <ThDiv>Antrian</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Nama</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Poliklinik</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Dokter</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Cara Bayar</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Proses</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>*</ThDiv>
//                   </Th>
//                 </tr>
//               </thead>
//               <tbody className="bg-slate-200 dark:bg-gray-700">
//                 {isMutating ? (
//                   /* IF DATA FETCHING */
//                   [...Array(9)].map((arr, i: number) => (
//                     <tr
//                       className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
//                       key={i}
//                     >
//                       <td className="h-[56.5px]">
//                         <div className="flex justify-center gap-1">
//                           <p className="h-[32px] w-9 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
//                           <p className="h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
//                         </div>
//                       </td>
//                       <td>
//                         <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <p className="mx-auto h-5 w-44 rounded bg-slate-200 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <div className="grid gap-1">
//                           <p className="h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
//                           <p className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-400"></p>
//                         </div>
//                       </td>
//                       <td>
//                         <p className="mx-auto h-5 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <p className="h-6 w-36 rounded-xl bg-slate-200 px-2.5 py-1 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <div className="flex flex-nowrap items-center justify-center gap-1">
//                           <RiStethoscopeLine
//                             size="1.5rem"
//                             className="text-slate-200 dark:text-slate-400"
//                           />
//                           {user === "Perawat Rajal" ? (
//                             <>
//                               <HiOutlineDocumentAdd
//                                 size="1.5rem"
//                                 className="text-slate-200 dark:text-slate-400"
//                               />
//                               <HiOutlineDocumentText
//                                 size="1.5rem"
//                                 className="text-slate-200 dark:text-slate-400"
//                               />
//                             </>
//                           ) : null}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : /* IF DATA KOSONG */
//                 meta.total === 0 ? (
//                   <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
//                     <td className="p-4 text-center" colSpan={7}>
//                       <p>Data tidak ditemukan</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   /* IF DATA ADA */
//                   dataList?.map((data, i) => (
//                     <tr
//                       className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
//                       key={i}
//                     >
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <div className="flex justify-center gap-1">
//                           <p className="w-9 rounded-sm bg-blue-500 py-1.5 text-center font-light tracking-wide text-slate-100">
//                             {String(data.nomer).padStart(2, "0")}
//                           </p>
//                           <p className="w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
//                             {String(data.id_pasien).padStart(6, "0")}
//                           </p>
//                         </div>
//                       </td>
//                       {/* <td className="border-b border-slate-200 dark:border-gray-700">
//                       </td> */}
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <p>
//                           {data.nm_pasien}{" "}
//                           <span className="text-xs font-normal">
//                             {"(" + getAgeThn(new Date(data.tgl_lahir)) + ")"}
//                           </span>
//                         </p>
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <p>{data.nm_poli}</p>
//                       </td>
//                       <td className="border-b border-slate-200 p-2 dark:border-gray-700">
//                         <p className="text-teal-700 dark:text-teal-200">
//                           {data.nama}
//                         </p>
//                         <p className="font-light">
//                           {data.mulai?.slice(0, 5) +
//                             " - " +
//                             data.selesai?.slice(0, 5)}
//                         </p>
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <p
//                           className={cn(
//                             "text-center font-bold uppercase",
//                             caraBayar[data.kd_pj]?.color
//                           )}
//                         >
//                           {caraBayar[data.kd_pj]?.nama}
//                           {data.kd_pj === "BPJ"
//                             ? finger(data.fp === "1")
//                             : null}
//                         </p>
//                       </td>
//                       <td className="border-b border-slate-200 text-center dark:border-gray-700">
//                         {data.assdokter === 1 ? (
//                           <p className="mx-auto w-fit rounded-xl bg-slate-400 px-2.5 py-1 font-normal text-gray-800">
//                             Telah diasesmen
//                           </p>
//                         ) : (
//                           <p className="mx-auto w-fit rounded-xl bg-slate-200 px-2.5 py-1 font-normal text-gray-600">
//                             Belum diasesmen
//                           </p>
//                         )}
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <div className="flex flex-nowrap items-center justify-center gap-1">
//                           {user === "Perawat Rajal" ? (
//                             <>
//                               <Tooltip.Provider
//                                 delayDuration={300}
//                                 disableHoverableContent
//                               >
//                                 <Tooltip.Root>
//                                   <Tooltip.Trigger
//                                     // disabled={
//                                     //   data.complete === 0 ? true : false
//                                     // }
//                                     // onClick={() =>
//                                     //   skriningDispatch({
//                                     //     type: "setSkrining",
//                                     //     skrining: {
//                                     //       modal: true,
//                                     //       data: {
//                                     //         id_kunjungan: data.no_rawat,
//                                     //         id_pasien: data.id_pasien,
//                                     //         nama: data.nama,
//                                     //         tanggal_lahir: new Date(
//                                     //           data.tgl_lahir
//                                     //         ),
//                                     //         // id_klinik: data.id_klinik
//                                     //         id_klinik: data.kd_poli,
//                                     //       },
//                                     //     },
//                                     //   })
//                                     // }
//                                     className="disabled:cursor-not-allowed disabled:opacity-50"
//                                   >
//                                     <IoDocumentTextOutline
//                                       size="1.5rem"
//                                       className="text-cyan-700 hover:text-cyan-800 active:text-cyan-900"
//                                     />
//                                   </Tooltip.Trigger>
//                                   <Tooltip.Content
//                                     side="left"
//                                     sideOffset={0}
//                                     className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                                   >
//                                     <p>Skrining</p>
//                                   </Tooltip.Content>
//                                 </Tooltip.Root>
//                               </Tooltip.Provider>
//                             </>
//                           ) : null}

//                           <Tooltip.Provider
//                             delayDuration={300}
//                             disableHoverableContent
//                           >
//                             <Tooltip.Root>
//                               <Tooltip.Trigger
//                                 className="disabled:cursor-not-allowed disabled:opacity-50"
//                                 disabled={data.complete === 0}
//                                 asChild={data.complete === 1}
//                               >
//                                 {data.complete === 0 ? (
//                                   <RiStethoscopeLine
//                                     size="1.5rem"
//                                     className={cn(
//                                       "text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
//                                     )}
//                                   />
//                                 ) : (
//                                   <Link
//                                     href={{
//                                       pathname: `/asesmen/${data.no_rawat.replaceAll(
//                                         "/",
//                                         "-"
//                                       )}`,
//                                       query: {
//                                         id: data.no_rm,
//                                         poli: data.nm_poli,
//                                         kd_poli: data.kd_poli,
//                                         dokter: data.nama,
//                                         qlist:
//                                           filterKlinik +
//                                           "-" +
//                                           filterDokter +
//                                           "-" +
//                                           filterMulai,
//                                       },
//                                     }}
//                                   >
//                                     <RiStethoscopeLine
//                                       size="1.5rem"
//                                       className={cn(
//                                         "text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
//                                       )}
//                                     />
//                                   </Link>
//                                 )}
//                               </Tooltip.Trigger>
//                               <Tooltip.Content
//                                 side="left"
//                                 sideOffset={0}
//                                 className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                               >
//                                 <p>Asesmen</p>
//                               </Tooltip.Content>
//                             </Tooltip.Root>
//                           </Tooltip.Provider>

//                           {user === "Perawat Rajal" ? (
//                             <>
//                               <Tooltip.Provider
//                                 delayDuration={300}
//                                 disableHoverableContent
//                               >
//                                 <Tooltip.Root>
//                                   <Tooltip.Trigger
//                                     // disabled={
//                                     //   data.complete === 0 ? true : false
//                                     // }
//                                     onClick={() =>
//                                       billingDispatch({
//                                         type: "setBilling",
//                                         billing: { modal: true },
//                                       })
//                                     }
//                                     className="disabled:cursor-not-allowed disabled:opacity-50"
//                                   >
//                                     <HiOutlineDocumentAdd
//                                       size="1.5rem"
//                                       className="text-yellow-600 ui-not-disabled:hover:text-yellow-700 ui-not-disabled:active:text-yellow-800"
//                                     />
//                                   </Tooltip.Trigger>
//                                   <Tooltip.Content
//                                     side="left"
//                                     sideOffset={0}
//                                     className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                                   >
//                                     <p>Billing</p>
//                                   </Tooltip.Content>
//                                 </Tooltip.Root>
//                               </Tooltip.Provider>

//                               <Tooltip.Provider
//                                 delayDuration={300}
//                                 disableHoverableContent
//                               >
//                                 <Tooltip.Root>
//                                   <Tooltip.Trigger
//                                     disabled={
//                                       data.complete === 0 ? true : false
//                                     }
//                                     className="disabled:cursor-not-allowed disabled:opacity-50"
//                                   >
//                                     <HiOutlineDocumentText
//                                       size="1.5rem"
//                                       className="text-green-600 ui-not-disabled:hover:text-green-700 ui-not-disabled:active:text-green-800"
//                                     />
//                                   </Tooltip.Trigger>
//                                   <Tooltip.Content
//                                     side="left"
//                                     sideOffset={0}
//                                     className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                                   >
//                                     <p>SKDP</p>
//                                   </Tooltip.Content>
//                                 </Tooltip.Root>
//                               </Tooltip.Provider>

//                               {/* <ButtonTransparent
//                                 className="py-1.5 text-xs"
//                                 color="amber"
//                                 disabled={data.complete === 0 ? true : false}
//                               >
//                                 Billing
//                               </ButtonTransparent> */}
//                             </>
//                           ) : null}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <Pagination
//             meta={meta}
//             mutating={isMutating}
//             setPage={(pageVal: number) => {
//               metaDispatch({ type: "page", page: pageVal });
//               tableDivRef.current?.scrollTo(0, 0);
//               // reduxDispatch(
//               //   setPageParams({
//               //     ...pageParamsState,
//               //     page: pageVal,
//               //   })
//               // );
//             }}
//           />
//         </div>
//       </main>
//       <BillingDialog billing={billing} billingDispatch={billingDispatch} />
//       <SkriningPerawatDialog
//         skriningState={skrining}
//         skriningDispatch={skriningDispatch}
//         loadData={loadData}
//       />
//     </Suspense>
//   );
// }

// const BillingDialog = ({
//   billing,
//   billingDispatch,
// }: {
//   billing: BillingState;
//   billingDispatch: React.Dispatch<BillingAction>;
// }) => {
//   const headers = new Headers();
//   const [token] = useState(Cookies.get("token"));
//   headers.append("Authorization", token as string);
//   headers.append("Content-Type", "application/json");

//   const BillingSchema = z.object({
//     // tanggal: z
//     //   .string({
//     //     required_error: "harus diisi",
//     //   })
//     //   .nonempty("harus diisi"),
//     // poli: z.string({
//     //   required_error: "harus diisi",
//     // }),
//     // penjamin: z.string({
//     //   required_error: "harus diisi",
//     // }),
//     // id_jadwal: z.string({
//     //   required_error: "harus diisi",
//     // }),
//   });

//   type Billing = z.infer<typeof BillingSchema>;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     getValues,
//     reset,
//     trigger,
//     control,
//     formState: { errors },
//   } = useForm<Billing>({
//     resolver: zodResolver(BillingSchema),
//   });

//   useEffect(() => {
//     // getJadwal(billing.data?.kd_poli);
//     // setValue("tanggal", new Date().toLocaleDateString("fr-CA"));
//     // setValue("poli", billing.data?.kd_poli || "");
//     // setValue("penjamin", billing.data?.kd_pj || "");
//     // setValue("id_jadwal", String(billing.data?.id_jadwal) || "");
//   }, [billing.data]);

//   const [listTindakan, setListTindakan] = useState<any[]>([]);
//   const getJadwal = async () => {
//     // const url = new URL(`${APIURL}/jadwal`);
//     // const params = {
//     //   tanggal: getValues("tanggal"),
//     //   kd_poli: poli,
//     //   perPage: 50,
//     // };
//     // url.search = new URLSearchParams(params as any).toString();
//     // const listPenjamin = await fetch(url, {
//     //   method: "GET",
//     //   headers: headers,
//     // });
//     // const data = await listPenjamin.json();
//     // setListTindakan(data.data);
//   };

//   // useEffect(() => {
//   //   console.log(errors);
//   // }, [errors]);

//   useEffect(() => {
//     // getPoli();
//     // getPenjamin();
//   }, []);

//   const submitHandler: SubmitHandler<Billing> = (data, e) => {
//     e?.preventDefault();
//     // console.log(data);
//   };

//   const tutup = () => {
//     billingDispatch({
//       type: "setBilling",
//       billing: { modal: false, data: billing.data },
//     });
//   };

//   const [tindakans] = useState([
//     {
//       kd_jenis_prw: "1",
//       nm_perawatan: "\tIr+Tens+Massage lokal.1x Tindakan",
//       kd_kategori: "-",
//       material: 14000,
//       bhp: 0,
//       tarif_tindakandr: 0,
//       tarif_tindakanpr: 7855,
//       kso: 0,
//       menejemen: 33217,
//       total_byrdr: 59000,
//       total_byrpr: 21855,
//       total_byrdrpr: 21855,
//       kd_pj: "-",
//       kd_poli: "FIS",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "GDM.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A06",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "147",
//       nm_perawatan:
//         "Fisioterapi SWD ( Shorth Wave Diathermy ) Rawat Jalan Pasien Umum",
//       kd_kategori: "-",
//       material: 20250,
//       bhp: 6000,
//       tarif_tindakandr: 1250,
//       tarif_tindakanpr: 2500,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 27500,
//       total_byrpr: 28750,
//       total_byrdrpr: 30000,
//       kd_pj: "A09",
//       kd_poli: "FIS",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "CAR.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A27",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "SNM.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A33",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "ADK.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A53",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "AIH.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A54",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "APP.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A57",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "JRJ.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "A66",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "NKR.DS.RJU_262",
//       nm_perawatan: "USG 2 Mata",
//       kd_kategori: "KP1",
//       material: 183000,
//       bhp: 138000,
//       tarif_tindakandr: 150000,
//       tarif_tindakanpr: 4000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 471000,
//       total_byrpr: 325000,
//       total_byrdrpr: 475000,
//       kd_pj: "A67",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "AR.DS.RJU_262",
//       nm_perawatan: "USG 2 Mata",
//       kd_kategori: "KP1",
//       material: 183000,
//       bhp: 138000,
//       tarif_tindakandr: 150000,
//       tarif_tindakanpr: 4000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 471000,
//       total_byrpr: 325000,
//       total_byrdrpr: 475000,
//       kd_pj: "ASR",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "100",
//       nm_perawatan: "Post Natal Exercise ",
//       kd_kategori: "-",
//       material: 55480,
//       bhp: 2500,
//       tarif_tindakandr: 623,
//       tarif_tindakanpr: 1247,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 58603,
//       total_byrpr: 59227,
//       total_byrdrpr: 59850,
//       kd_pj: "BPJ",
//       kd_poli: "FIS",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "MIH.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "INH",
//       kd_poli: "RJL",
//       status: "0",
//     },
//     {
//       kd_jenis_prw: "NSC.KP.GGU.001",
//       nm_perawatan: "Pemasangan Diamond  Oleh Dokter Gigi Umum",
//       kd_kategori: "KP",
//       material: 61000,
//       bhp: 38600,
//       tarif_tindakandr: 96500,
//       tarif_tindakanpr: 5000,
//       kso: 0,
//       menejemen: 0,
//       total_byrdr: 196100,
//       total_byrpr: 104600,
//       total_byrdrpr: 201100,
//       kd_pj: "Nas",
//       kd_poli: "RJL",
//       status: "0",
//     },
//   ]);

//   return (
//     <Transition show={billing.modal} as={Fragment}>
//       <Dialog as="div" className="relative z-[1001]" onClose={tutup}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-25" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex h-screen items-center justify-end overflow-hidden text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-50"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 translate-x-5 scale-95"
//             >
//               <Dialog.Panel
//                 className={cn(
//                   "h-full w-full max-w-6xl transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
//                   css.scrollbar
//                 )}
//               >
//                 <form onSubmit={handleSubmit(submitHandler)}>
//                   <div className="mt-2 flex flex-col gap-2">
//                     <div className="flex">
//                       <InputSearch className="w-96" />
//                     </div>
//                     <div className="flex gap-1">
//                       {[
//                         "Rawat Jalan",
//                         "Rawat Inap",
//                         "IGD",
//                         "Penunjang",
//                         "ICU",
//                       ].map((val, idx) => (
//                         <button
//                           type="button"
//                           className={cn(
//                             "relative select-none rounded-lg border border-slate-300 shadow-md dark:border-neutral-700",
//                             "bg-white text-slate-700 dark:bg-neutral-300 dark:text-neutral-600",
//                             "flex items-center py-2 pl-10 pr-2 text-sm",
//                             "border-2 border-sky-500 font-semibold tracking-wide text-sky-600"
//                           )}
//                           key={idx}
//                         >
//                           <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
//                             <RiCheckLine
//                               className="h-5 w-5"
//                               aria-hidden="true"
//                             />
//                           </span>
//                           <span className={cn("block truncate", "font-medium")}>
//                             {val}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                     <div className="flex gap-6">
//                       <div className={cn("overflow-hidden rounded shadow")}>
//                         <table className="min-w-full text-sm">
//                           <thead>
//                             <tr className="divide-x divide-slate-50 bg-slate-100">
//                               <td className={cn("px-4 py-2")}>Kode</td>
//                               <td className={cn("px-4 py-2")}>Tindakan</td>
//                               <td className={cn("px-4 py-2")}>Pembayaran</td>
//                               <td className={cn("px-4 py-2")}>*</td>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                             {tindakans?.map((val, idx) => (
//                               <tr
//                                 className="bg-white hover:text-sky-600 dark:bg-slate-900"
//                                 key={idx}
//                               >
//                                 <td className="whitespace-pre-wrap px-4 py-2">
//                                   {val.kd_jenis_prw}
//                                 </td>
//                                 <td className="whitespace-pre-wrap px-4 py-2">
//                                   {val.nm_perawatan}
//                                 </td>
//                                 <td className="whitespace-pre-wrap px-4 py-2">
//                                   {val.kd_pj}
//                                 </td>
//                                 <td className="text-center">
//                                   <RiDeleteBin5Line
//                                     className="inline text-amber-500 hover:cursor-pointer"
//                                     size="1.2rem"
//                                     // onClick={() => delDiagnosis(idx)}
//                                   />
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div className="relative grid h-fit basis-[400px] grid-cols-2 justify-end gap-2 rounded bg-slate-100 p-3 pt-6">
//                         <p className="absolute left-3 top-1 text-xs">
//                           Penambahan
//                         </p>
//                         {tindakans?.map((val, idx) => (
//                           <div
//                             className="flex items-start justify-start gap-1"
//                             key={idx}
//                           >
//                             <input
//                               type="checkbox"
//                               className="cursor-pointer"
//                               id={val.kd_jenis_prw}
//                               value={val.kd_jenis_prw}
//                             />
//                             <label
//                               className="cursor-pointer whitespace-pre-wrap text-[11px]/[12px]"
//                               htmlFor={val.kd_jenis_prw}
//                             >
//                               {val.nm_perawatan}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mt-4 flex justify-end gap-1">
//                     <Button type="submit" color="cyan100">
//                       Simpan
//                     </Button>
//                     <Button color="red" onClick={tutup}>
//                       Keluar
//                     </Button>
//                   </div>
//                 </form>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// const SkriningPerawatDialog = ({
//   skriningState,
//   skriningDispatch,
//   loadData,
// }: {
//   skriningState: SkriningState;
//   skriningDispatch: React.Dispatch<SkriningAction>;
//   loadData: () => Promise<void>;
// }) => {
//   const headers = new Headers();
//   const [token] = useState(Cookies.get("token"));
//   headers.append("Authorization", token as string);
//   headers.append("Content-Type", "application/json");

//   const tutup = () => {
//     skriningDispatch({
//       type: "setSkrining",
//       skrining: { ...skrining, modal: false },
//     });
//     if (watch("id_kunjungan") !== skriningState.data?.id_kunjungan) reset();
//     formRef.current?.scrollTo(0, 0);
//   };

//   // type TSkrining = {
//   //   id: number;
//   //   subject: string;
//   //   name?: "s.s_rawatjalan" | "s.s_tbdewasa" | "s.s_tbanak" | "s.s_covid";
//   //   data: {
//   //     id: number;
//   //     pertanyaan: string;
//   //     def: number;
//   //     data: {
//   //       jawaban: string;
//   //       skor: number;
//   //     }[];
//   //   }[];
//   // }[];
//   // const [skrining, setSkrining] = useState<TSkrining>([]);
//   // useEffect(() => {
//   //   const loadSkrining = async () => {
//   //     try {
//   //       setIsMutating(true);
//   //       let get = await fetch(`${APIURL}/skrining/detail`, {
//   //         headers: headers,
//   //       });
//   //       let res: TSkrining = await get.json();
//   //       res.map((skr) => {
//   //         switch (skr.subject) {
//   //           case "SKRINING RAWAT JALAN":
//   //             skr.name = "s.s_rawatjalan";
//   //             break;
//   //           case "SKRINING SUSPEK TB DEWASA":
//   //             skr.name = "s.s_tbdewasa";
//   //             break;
//   //           case "SKRINING SUSPEK TB ANAK":
//   //             skr.name = "s.s_tbanak";
//   //             break;
//   //           case "SKRINING SUSPEK COVID-19":
//   //             skr.name = "s.s_covid";
//   //             break;
//   //         }
//   //         return skr;
//   //       });

//   //       /* LOG MENU SKRINING */
//   //       // console.log(res);

//   //       if (umur <= 18) {
//   //         res.splice(1, 1);
//   //       } else {
//   //         res.splice(2, 1);
//   //       }
//   //       setSkrining(res);
//   //     } catch (err) {
//   //       console.error(err);
//   //     } finally {
//   //       setIsMutating(false);
//   //     }
//   //   };
//   //   loadSkrining();
//   // }, []);

//   // type TSkrining = {
//   //   id: number;
//   //   id_tipe: number;
//   //   header: string;
//   //   pertanyaan: {
//   //     pertanyaan: string;
//   //     jawaban: {
//   //       id: number;
//   //       id_instrumen: number;
//   //       jawaban: string;
//   //       skor: number;
//   //     }[];
//   //   }[];
//   // }[];
//   const [isMutating, setIsMutating] = useState<boolean>(false);
//   type TSkrining = {
//     id: number;
//     id_tipe: number;
//     tipe: string;
//     skrining: {
//       header: string | null;
//       detail: {
//         pertanyaan: string;
//         jawaban: {
//           id_instrumen: number;
//           jawaban: string;
//           skor: number;
//         }[];
//       }[];
//     }[];
//   }[];
//   const [skrining, setSkrining] = useState<TSkrining>([]);
//   useEffect(() => {
//     if (!skriningState.modal) return;
//     setValue("id_kunjungan", skriningState.data?.id_kunjungan!);
//     const loadSkrining = async () => {
//       try {
//         setIsMutating(true);
//         let get = await fetch(`${APIURL}/rs/rajal/skrining`, {
//           headers: headers,
//         });
//         let res = await get.json();
//         if (res.status !== "Ok") throw new Error(res.message);
//         let data = res.data as TSkrining;
//         // const umur = getAge(skriningState.data?.tanggal_lahir as Date);
//         // switch (true) {
//         //   case umur <= 5:
//         //     data = data.filter(
//         //       (val) =>
//         //         !val.tipe.toLowerCase().includes("dewasa") &&
//         //         !val.tipe.toLowerCase().includes("gizi awal anak")
//         //     );
//         //     break;
//         //   case umur <= 18:
//         //     data = data.filter(
//         //       (val) =>
//         //         !val.tipe.toLowerCase().includes("dewasa") &&
//         //         !val.tipe.toLowerCase().includes("gizi awal balita")
//         //     );
//         //     break;
//         //   case umur > 18:
//         //     data = data.filter(
//         //       (val) =>
//         //         !val.tipe.toLowerCase().includes("anak") &&
//         //         !val.tipe.toLowerCase().includes("balita")
//         //     );
//         //     break;
//         // }

//         // if (skriningState.data?.id_klinik !== 2)
//         if (skriningState.data?.id_klinik !== "ANA") {
//           data = data.map((item) => {
//             if (item.tipe === "Risiko Jatuh") {
//               const updatedSkrining = item.skrining.map((skriningItem) => {
//                 if (skriningItem.detail) {
//                   skriningItem.detail = skriningItem.detail.filter(
//                     (detailItem) => detailItem.pertanyaan !== "Humpty Dumpty"
//                   );
//                 }
//                 return skriningItem;
//               });
//               item.skrining = updatedSkrining;
//             }
//             return item;
//           });
//         }
//         setSkrining(data);
//         // if (watch("skrining")?.some((val) => val?.skor?.length > 0)) return;
//         (data as TSkrining).forEach((val, idx) => {
//           const pertanyaan: string[] = [];
//           val.skrining.forEach((per) =>
//             per.detail.forEach((val_per) => pertanyaan.push(val_per.pertanyaan))
//           );
//           // console.log(val.tipe);
//           setValue(`skrining.${idx}`, {
//             id_tipe: val.id_tipe,
//             pertanyaan: pertanyaan,
//             skor: Array.from(
//               { length: pertanyaan.length },
//               () =>
//                 // val.tipe === "Nyeri" ? NaN : 0
//                 0
//             ),
//           });
//         });
//       } catch (err) {
//         console.error(err);
//       } finally {
//         formRef.current?.scrollTo(0, 0);
//         setIsMutating(false);
//       }
//     };
//     loadSkrining();
//   }, [skriningState]);

//   const skeletonComponents = () => {
//     return [...Array(2)].map((_, i) => (
//       <div className="animate-pulse pr-1" key={i}>
//         <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
//           &nbsp;
//         </div>
//         <div className="h-screen rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
//           &nbsp;
//         </div>
//       </div>
//     ));
//   };

//   const SkriningSchema = z.object({
//     id_kunjungan: z.string(),
//     skrining: z
//       .object({
//         id_tipe: z.number(),
//         pertanyaan: z.string().array(),
//         skor: z.number().array(),
//       })
//       .array(),
//   });

//   type TSkriningSchema = z.infer<typeof SkriningSchema>;

//   const {
//     handleSubmit,
//     watch,
//     control,
//     register,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<TSkriningSchema>({
//     resolver: zodResolver(SkriningSchema),
//     defaultValues: {
//       id_kunjungan: skriningState.data?.id_kunjungan,
//       skrining: [],
//     },
//   });

//   useEffect(() => {
//     const subscription = watch((value, { name, type }) =>
//       console.log(value, name, type)
//     );
//     return () => subscription.unsubscribe();
//   }, [watch]);

//   const submitHandler: SubmitHandler<TSkriningSchema> = async (data, e) => {
//     try {
//       e?.preventDefault();
//       // let resJson: any;
//       // if (ubah.modal) {
//       //   const put = await fetch(
//       //     `${APIURL}/rs/rajal/skrining/${ubah.data?.id}`,
//       //     {
//       //       method: "PUT",
//       //       headers: headers,
//       //       body: JSON.stringify(data),
//       //     }
//       //   );
//       //   resJson = await put.json();
//       //   if (resJson.status !== "Updated") throw new Error(resJson.message);
//       // } else {
//       const post = await fetch(`${APIURL}/rs/rajal/skrining`, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data),
//       });
//       const resJson = await post.json();
//       if (resJson.status !== "Created") throw new Error(resJson.message);
//       // }
//       tutup();
//       toast.success(resJson.message);
//       loadData();
//     } catch (err) {
//       const error = err as Error;
//       toast.error(error.message);
//       console.error(error);
//     }
//   };

//   const formRef = useRef<HTMLFormElement>(null);

//   return (
//     <Transition show={skriningState.modal} as={Fragment}>
//       <Dialog as="div" className="relative z-[1001]" onClose={() => false}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-25" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex h-screen items-center justify-center px-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-50"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="flex h-full w-full max-w-5xl transform flex-col overflow-hidden rounded-2xl bg-white p-6 pt-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
//                 <Dialog.Title
//                   as="p"
//                   className="border-b border-slate-200 text-center font-medium leading-6 text-gray-900 dark:border-slate-300 dark:text-slate-100"
//                 >
//                   Skrining Awal Rawat Jalan
//                 </Dialog.Title>
//                 <form
//                   onSubmit={handleSubmit(submitHandler)}
//                   className={cn("mt-2 flex-1 overflow-y-auto", css.scrollbar)}
//                   ref={formRef}
//                 >
//                   <div
//                     className={cn("mb-2 grid grid-flow-row grid-cols-2 gap-2")}
//                   >
//                     {isMutating ? skeletonComponents() : null}
//                     {skrining?.map((data, dataId) => (
//                       <div key={data.id} className="pr-1 text-end">
//                         <div className="select-none rounded-t bg-cyan-600 py-1.5 text-center text-sm uppercase tracking-normal text-slate-50 dark:bg-sky-700">
//                           Skrining {data.tipe}
//                         </div>
//                         <div className="h-[calc(100%-32px)] rounded-b bg-slate-200 p-2 text-xs shadow-md dark:bg-gray-800">
//                           <div className="mx-1.5 grid grid-cols-2 gap-2 py-2">
//                             {data.skrining?.map((skrining, skrId) => (
//                               <Fragment key={skrId}>
//                                 {skrining.detail.map((detail, detailId) => (
//                                   <>
//                                     {detail.pertanyaan !== "Psikologis" /* &&
//                                     data.tipe !== "Nyeri" */ ? (
//                                       /* NYERI TIDAK ADA */
//                                       <label
//                                         className="py-2 font-semibold dark:text-neutral-200"
//                                         htmlFor={`${detailId}-${1}`}
//                                         key={detailId}
//                                       >
//                                         {detail.pertanyaan}
//                                       </label>
//                                     ) : null}
//                                     {/*
//                                     {data.tipe === "Nyeri" &&
//                                     detail.pertanyaan !== "Nyeri" ? (
//                                       <Transition
//                                         show={watch(`skrining.4.skor.0`) === 1}
//                                         as={Fragment}
//                                         enter="ease-out duration-300"
//                                         enterFrom="opacity-0 -translate-x-1"
//                                         enterTo="opacity-100"
//                                         leave="ease-in duration-150"
//                                         leaveFrom="opacity-100"
//                                         leaveTo="opacity-0 -translate-x-1"
//                                       >
//                                         <p>Nyeri</p>
//                                       </Transition>
//                                     ) : null} */}

//                                     {data.id_tipe !== 12 ? (
//                                       <Controller
//                                         control={control}
//                                         name={`skrining.${dataId}.skor.${detailId}`}
//                                         render={({
//                                           field: { onChange, value, onBlur },
//                                         }) => (
//                                           <div
//                                             className={cn(
//                                               "mb-2 flex flex-wrap items-center justify-center",
//                                               detail.pertanyaan ===
//                                                 "Psikologis" && "col-span-2"
//                                             )}
//                                           >
//                                             {detail.jawaban?.map(
//                                               (jawaban, jwbId) => {
//                                                 return (
//                                                   <LabelButton
//                                                     type="radio"
//                                                     className={cn(
//                                                       "h-fit",
//                                                       (data.id === 2 ||
//                                                         detail.jawaban.length >
//                                                           2) &&
//                                                         "rounded-lg",
//                                                       // Kegiatan Ibadah
//                                                       jawaban.id_instrumen ===
//                                                         38 && "rounded-lg"
//                                                     )}
//                                                     id={`${detail.pertanyaan.replace(
//                                                       /\s/g,
//                                                       "_"
//                                                     )}-${jwbId + 1}`}
//                                                     key={jwbId}
//                                                     onBlur={onBlur}
//                                                     checked={
//                                                       value === jawaban.skor
//                                                     }
//                                                     onChange={() =>
//                                                       onChange(jawaban.skor)
//                                                     }
//                                                   >
//                                                     {jawaban.jawaban}
//                                                   </LabelButton>
//                                                 );
//                                               }
//                                             )}
//                                           </div>
//                                         )}
//                                       />
//                                     ) : (
//                                       /* NYERI */
//                                       <>
//                                         {detail.pertanyaan === "Nyeri" ? (
//                                           <div>
//                                             {["Tidak Ada", "Ada"].map(
//                                               (val, idx) => (
//                                                 <LabelButton
//                                                   type="radio"
//                                                   id={`${detail.pertanyaan.replace(
//                                                     /\s/g,
//                                                     "_"
//                                                   )}-${idx}`}
//                                                   value={idx}
//                                                   key={val}
//                                                   {...register(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     {
//                                                       valueAsNumber: true,
//                                                     }
//                                                   )}
//                                                 >
//                                                   {val}
//                                                 </LabelButton>
//                                               )
//                                             )}
//                                           </div>
//                                         ) : null}
//                                         {detail.pertanyaan === "NIPS" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-7"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 7 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     7
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "FLACC" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-10"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 10 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     10
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan ===
//                                           "Wong Baker" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-10"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value % 2 !== 0 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     +e.target.value + 1
//                                                   );
//                                                 +e.target.value > 10 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     10
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "Numeric" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-10"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 10 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     10
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "Comfort" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               placeholder="8-40"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onBlurCapture={(e) => {
//                                                 !!e.target.value &&
//                                                   +e.target.value < 8 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     8
//                                                   );
//                                               }}
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 40 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     40
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "PAINAD" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-10"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 10 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     10
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "CRIES" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               min={0}
//                                               placeholder="0-10"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 10 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     10
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : detail.pertanyaan === "BPS" ? (
//                                           <div>
//                                             <Input
//                                               type="number"
//                                               className="w-fit px-2 py-1 text-xs"
//                                               placeholder="3-12"
//                                               {...register(
//                                                 `skrining.${dataId}.skor.${detailId}`,
//                                                 {
//                                                   valueAsNumber: true,
//                                                 }
//                                               )}
//                                               onWheel={(e) =>
//                                                 e.currentTarget.blur()
//                                               }
//                                               onBlurCapture={(e) => {
//                                                 !!e.target.value &&
//                                                   +e.target.value < 3 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     3
//                                                   );
//                                               }}
//                                               onInput={(
//                                                 e: React.FocusEvent<
//                                                   HTMLInputElement,
//                                                   Element
//                                                 >
//                                               ) => {
//                                                 +e.target.value > 12 &&
//                                                   setValue(
//                                                     `skrining.${dataId}.skor.${detailId}`,
//                                                     12
//                                                   );
//                                               }}
//                                             />
//                                           </div>
//                                         ) : null}
//                                       </>
//                                     )}
//                                   </>
//                                 ))}
//                               </Fragment>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="flex justify-center gap-1">
//                     <Button color="cyan100" type="submit">
//                       Simpan
//                     </Button>
//                     <Button color="red" onClick={tutup}>
//                       Keluar
//                     </Button>
//                   </div>
//                 </form>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };
