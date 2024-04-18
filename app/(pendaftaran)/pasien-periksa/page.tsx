// "use client";

// import { APIURL } from "@/lib/connection";
// import {
//   InputSearch,
//   Pagination,
//   PerPage,
//   Th,
//   ThDiv,
// } from "@/components/table";
// import { getAgeThn } from "@/lib/utils";
// import {
//   useEffect,
//   useMemo,
//   useReducer,
//   useState,
//   Fragment,
//   useDeferredValue,
// } from "react";
// import { toast } from "react-toastify";
// import { RiUserHeartLine } from "react-icons/ri";
// import css from "@/assets/css/scrollbar.module.css";
// import { Button } from "@/components/button";
// import { useRouter } from "next/navigation";
// import { Dialog, Tab, Transition } from "@headlessui/react";
// import { cn } from "@/lib/utils";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Controller, SubmitHandler, useForm } from "react-hook-form";
// import { MyOption, MyOptions, SelectInput } from "@/components/select";
// import { Input } from "@/components/form";
// import { Tooltip } from "@/components/tooltip";
// import { TbEdit, TbTrash } from "react-icons/tb";
// import Cookies from "js-cookie";
// import { Booking, BookingSchema } from "@/app/(pendaftaran)/schema";
// import { Klinik } from "@/app/(referensi)/list-klinik/page";
// import { Asuransi } from "@/app/(referensi)/list-asuransi/page";
// import { JadwalDokter } from "../jadwal-dokter/page";

// type UbahState = {
//   modal: boolean;
//   data?: Pasien;
// };
// type UbahAction = { type: "setUbah"; ubah: UbahState };

export default function PasienPeriksa() {
  return <></>;
}
//   const headers = new Headers();
//   const [token] = useState(Cookies.get("token"));
//   headers.append("Authorization", token as string);
//   headers.append("Content-Type", "application/json");

//   const router = useRouter();
//   const [tanggal, setTanggal] = useState<Date>(new Date());
//   const [cari, setCari] = useState<string>("");
//   const deferredCari = useDeferredValue(cari);
//   const [dataList, setDataList] = useState<Pasien[]>([]);

//   const ubahState = {
//     modal: false,
//     data: undefined,
//   };
//   const ubahActs = (state: UbahState, action: UbahAction) => {
//     switch (action.type) {
//       case "setUbah": {
//         return {
//           ...action.ubah,
//         };
//       }
//     }
//   };
//   const [ubah, ubahDispatch] = useReducer(ubahActs, ubahState);
//   const handleCheckIn = async () => {
//     try {
//       const putData = {
//         id: ubah.data?.id,
//         id_jadwal: ubah.data?.id_jadwal,
//       };
//       const checkInPasien = await fetch(`${APIURL}/pendaftaran/checkin`, {
//         method: "PUT",
//         headers: headers,
//         body: JSON.stringify(putData),
//       });
//       const data = await checkInPasien.json();
//       ubahDispatch({ type: "setUbah", ubah: { modal: false } });
//       toast.success(data?.message, {
//         onOpen: loadData,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   type BatalState = {
//     modal: boolean;
//     data?: {
//       id?: number;
//       nm_pasien?: string;
//       status?: string;
//     };
//   };
//   type BatalAction = { type: "setBatal"; batal: BatalState };
//   const batalState = {
//     modal: false,
//     data: {
//       id: undefined,
//       nm_pasien: undefined,
//       status: undefined,
//     },
//   };
//   const batalActs = (state: BatalState, action: BatalAction) => {
//     switch (action.type) {
//       case "setBatal": {
//         return {
//           ...action.batal,
//         };
//       }
//     }
//   };
//   const [batal, batalDispatch] = useReducer(batalActs, batalState);
//   const handleBatal = async () => {
//     try {
//       const putData = {
//         id: batal.data?.id,
//         status: batal.data?.status,
//       };
//       const batalPasien = await fetch(`${APIURL}/pendaftaran/status`, {
//         method: "PUT",
//         headers: headers,
//         body: JSON.stringify(putData),
//       });
//       const data = await batalPasien.json();
//       batalDispatch({ type: "setBatal", batal: { modal: false } });
//       toast.success(data?.message, {
//         onOpen: loadData,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const metaState: Meta = {
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

//   const filterState = {
//     poli: "all",
//     dokter: "all",
//     mulai: "all",
//   };
//   const filterDisp = (state: Filter, action: FilterAction): Filter => {
//     switch (action.type) {
//       case "poli": {
//         return {
//           ...state,
//           poli: action.poli,
//         };
//       }
//       case "dokter": {
//         return {
//           ...state,
//           dokter: action.dokter,
//         };
//       }
//       case "mulai": {
//         return {
//           ...state,
//           mulai: action.mulai,
//         };
//       }
//     }
//   };
//   const [filter, filterDispatch] = useReducer(filterDisp, filterState);

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
//       listJadwal.find((a: { kd_poli: string }) => a.kd_poli === id)
//     );
//   }, [listJadwal]);

//   const listDokter = useMemo(() => {
//     return Array.from(
//       new Set(
//         listJadwal
//           .filter((data) => data.kd_poli === filter.poli)
//           .map((a) => a.kd_dokter)
//       )
//     ).map((id) => {
//       return listJadwal.find((a) => a.kd_dokter === id);
//     });
//   }, [filter.poli]);

//   const listJam = useMemo(() => {
//     return listJadwal
//       .filter((data) => data.kd_dokter === filter.dokter)
//       .map((a) => {
//         a.jam = a.mulai + " - " + a.selesai;
//         return a;
//       });
//   }, [filter.dokter]);

//   const [isMutating, setIsMutating] = useState<boolean>(false);
//   const loadData = async () => {
//     try {
//       setIsMutating(true);
//       const url = new URL(`${APIURL}/pasien/periksa`);
//       const params = {
//         page: meta.page,
//         perPage: meta.perPage,
//         cari: deferredCari.trimStart(),
//         tanggal: new Date(tanggal).toLocaleDateString("fr-CA"),
//         poli: filter.poli,
//         dokter: filter.dokter,
//         mulai: filter.mulai,
//       };
//       url.search = new URLSearchParams(params as any).toString();
//       const data = await fetch(url, { method: "GET", headers: headers });
//       const listPasien = await data.json();
//       // console.log(listPasien);
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
//     } catch (error) {
//       toast.error("Cari pasien gagal!");
//       console.error(error);
//       metaDispatch({
//         type: "setMeta",
//         setMeta: {
//           ...meta,
//           total: 0,
//         },
//       });
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
//     tanggal,
//     filter.poli,
//     filter.dokter,
//     filter.mulai,
//     deferredCari,
//   ]);

//   return (
//     <>
//       <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
//         <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
//           <div className="flex items-center border-b border-b-slate-200 pb-3">
//             <div className="flex items-center">
//               <RiUserHeartLine
//                 size="1.75rem"
//                 className="mx-3 text-gray-500 dark:text-slate-100"
//               />
//               <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
//                 Pasien Periksa
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
//               <input
//                 type="date"
//                 value={tanggal.toLocaleDateString("fr-CA")}
//                 className="w-fit rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                 onChange={(e) => {
//                   setTanggal(new Date(e.target.value));
//                 }}
//               />
//               <select
//                 className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                 value={filter.poli}
//                 onChange={(e) => {
//                   metaDispatch({
//                     type: "page",
//                     page: 1,
//                   });
//                   filterDispatch({
//                     type: "dokter",
//                     dokter: "all",
//                   });
//                   filterDispatch({
//                     type: "mulai",
//                     mulai: "all",
//                   });
//                   filterDispatch({
//                     type: "poli",
//                     poli: e.target.value,
//                   });
//                 }}
//               >
//                 <option value={`all`}>Semua Poliklinik</option>
//                 {listPoli.map((poli, i) => (
//                   <option key={i} value={poli.kd_poli}>
//                     {poli.nm_poli}
//                   </option>
//                 ))}
//               </select>
//               {filter.poli !== "all" ? (
//                 <select
//                   className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                   value={filter.dokter}
//                   onChange={(e) => {
//                     metaDispatch({
//                       type: "page",
//                       page: 1,
//                     });
//                     filterDispatch({
//                       type: "mulai",
//                       mulai: "all",
//                     });
//                     filterDispatch({
//                       type: "dokter",
//                       dokter: e.target.value,
//                     });
//                   }}
//                 >
//                   <option value={`all`}>Semua Dokter</option>
//                   {listDokter.map((dokter, i) => (
//                     <option key={i} value={dokter.kd_dokter}>
//                       {dokter.nama}
//                     </option>
//                   ))}
//                 </select>
//               ) : null}
//               {filter.dokter !== "all" ? (
//                 <select
//                   className="w-48 rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
//                   value={filter.mulai}
//                   onChange={(e) => {
//                     metaDispatch({
//                       type: "page",
//                       page: 1,
//                     });
//                     filterDispatch({
//                       type: "mulai",
//                       mulai: e.target.value,
//                     });
//                   }}
//                 >
//                   <option value={`all`}>Semua Jam Praktek</option>
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
//                     <ThDiv>No. R.M.</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Nama</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Tgl. Lahir</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Poliklinik</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>Dokter</ThDiv>
//                   </Th>
//                   <Th>
//                     <ThDiv>*</ThDiv>
//                   </Th>
//                 </tr>
//               </thead>
//               <tbody className="bg-slate-200 dark:bg-gray-700">
//                 {isMutating ? (
//                   /* IF DATA FETCHING */
//                   [...Array(15)].map((_, i) => (
//                     <tr
//                       className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
//                       key={i}
//                     >
//                       <td className="h-[56.5px]">
//                         <p className="mx-auto h-[32px] w-9 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <p className="mx-auto h-[32px] w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
//                       </td>
//                       <td>
//                         <p className="mx-auto h-5 w-52 rounded bg-slate-200 dark:bg-slate-400"></p>
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
//                         <p className="mx-auto h-9 w-10 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
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
//                         <p
//                           className={cn(
//                             "mx-auto w-9 rounded-sm py-1.5 text-center font-light tracking-wide text-slate-100",
//                             data.nomer === null ? "hidden" : "",
//                             data.kd_pj === "BPJ"
//                               ? "bg-green-500"
//                               : "bg-blue-500"
//                           )}
//                         >
//                           {String(data.nomer).padStart(2, "0")}
//                         </p>
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <p className="mx-auto w-16 rounded-sm bg-slate-700 py-2 text-center text-xs font-medium tracking-wider text-slate-100">
//                           {String(data.id_pasien).padStart(6, "0")}
//                         </p>
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <p>{data.nm_pasien}</p>
//                       </td>
//                       <td className="border-b border-slate-200 dark:border-gray-700">
//                         <span>
//                           {new Intl.DateTimeFormat("id-ID", {
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric",
//                           }).format(new Date(data.tgl_lahir))}
//                         </span>
//                         <span className="font-light">
//                           {" ("}
//                           {getAgeThn(new Date(data.tgl_lahir))}
//                           {")"}
//                         </span>
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
//                         <div className="flex flex-nowrap items-center justify-center gap-1">
//                           {data.nomer === null ? (
//                             <Tooltip.Provider
//                               delayDuration={300}
//                               disableHoverableContent
//                             >
//                               <Tooltip.Root>
//                                 <Tooltip.Trigger asChild>
//                                   <button
//                                     type="button"
//                                     className="focus:outline-none"
//                                     onClick={() =>
//                                       ubahDispatch({
//                                         type: "setUbah",
//                                         ubah: {
//                                           modal: true,
//                                           data: data,
//                                         },
//                                       })
//                                     }
//                                   >
//                                     <TbEdit
//                                       size="1.5rem"
//                                       className="text-cyan-600 hover:text-cyan-700 active:text-cyan-800"
//                                     />
//                                   </button>
//                                 </Tooltip.Trigger>
//                                 <Tooltip.Content
//                                   side="left"
//                                   sideOffset={0}
//                                   className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                                 >
//                                   <p>Ubah Periksa</p>
//                                 </Tooltip.Content>
//                               </Tooltip.Root>
//                             </Tooltip.Provider>
//                           ) : null}
//                           {data.kd_pj === "BPJ" && data.nomer !== null ? (
//                             <Tooltip.Provider
//                               delayDuration={300}
//                               disableHoverableContent
//                             >
//                               <Tooltip.Root>
//                                 <Tooltip.Trigger asChild>
//                                   <button
//                                     className="text-lg text-green-500 hover:text-green-600 active:text-green-700"
//                                     type="button"
//                                   >
//                                     SEP
//                                   </button>
//                                 </Tooltip.Trigger>
//                                 <Tooltip.Content
//                                   side="left"
//                                   sideOffset={0}
//                                   className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                                 >
//                                   <p>SEP Pasien</p>
//                                 </Tooltip.Content>
//                               </Tooltip.Root>
//                             </Tooltip.Provider>
//                           ) : null}
//                           <Tooltip.Provider
//                             delayDuration={300}
//                             disableHoverableContent
//                           >
//                             <Tooltip.Root>
//                               <Tooltip.Trigger asChild>
//                                 <button
//                                   type="button"
//                                   className="focus:outline-none"
//                                   onClick={() =>
//                                     batalDispatch({
//                                       type: "setBatal",
//                                       batal: {
//                                         modal: true,
//                                         data: {
//                                           id: data.id,
//                                           nm_pasien: data.nm_pasien,
//                                           status: data.status,
//                                         },
//                                       },
//                                     })
//                                   }
//                                 >
//                                   <TbTrash
//                                     size="1.5rem"
//                                     className="text-red-500 hover:text-red-600 active:text-red-700"
//                                   />
//                                 </button>
//                               </Tooltip.Trigger>
//                               <Tooltip.Content
//                                 side="left"
//                                 sideOffset={0}
//                                 className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
//                               >
//                                 <p>Batal Periksa</p>
//                               </Tooltip.Content>
//                             </Tooltip.Root>
//                           </Tooltip.Provider>
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
//             setPage={(pageVal: number) =>
//               metaDispatch({ type: "page", page: pageVal })
//             }
//           />
//         </div>
//       </main>

//       <UbahDialog ubah={ubah} ubahDispatch={ubahDispatch} />

//       <Transition show={batal.modal} as={Fragment}>
//         <Dialog
//           as="div"
//           className="relative z-[1001]"
//           onClose={() =>
//             batalDispatch({
//               type: "setBatal",
//               batal: {
//                 modal: false,
//                 data: batal.data,
//               },
//             })
//           }
//         >
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-50"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black bg-opacity-25" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-50"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-700">
//                   <Dialog.Title
//                     as="p"
//                     className="font-medium leading-6 text-gray-900"
//                   >
//                     Batal Periksa pasien atas nama {batal.data?.nm_pasien}?
//                   </Dialog.Title>
//                   <div className="mt-4 flex justify-end gap-1">
//                     <Button color="red100" onClick={handleBatal}>
//                       Batal Periksa
//                     </Button>
//                     <Button
//                       color="red"
//                       onClick={() =>
//                         batalDispatch({
//                           type: "setBatal",
//                           batal: {
//                             modal: false,
//                             data: batal.data,
//                           },
//                         })
//                       }
//                     >
//                       Tidak
//                     </Button>
//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </>
//   );
// }

// const UbahDialog = ({
//   ubah,
//   ubahDispatch,
// }: {
//   ubah: UbahState;
//   ubahDispatch: React.Dispatch<UbahAction>;
// }) => {
//   const tutup = () => {
//     ubahDispatch({
//       type: "setUbah",
//       ubah: { modal: false, data: ubah.data },
//     });
//   };

//   const headers = new Headers();
//   const [token] = useState(Cookies.get("token"));
//   headers.append("Authorization", token as string);
//   headers.append("Content-Type", "application/json");

//   const [menues] = useState(["Check In", "Booking"]);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     reset,
//     trigger,
//     control,
//     formState: { errors },
//   } = useForm<Booking>({
//     resolver: zodResolver(BookingSchema),
//   });

//   const tanggal = watch("tanggal");

//   const [listKlinik, setListKlinik] = useState<MyOptions>([]);
//   const [selKlinik, setSelKlinik] = useState<MyOption | null>(null);
//   const getPoli = async () => {
//     const resp = await fetch(`${APIURL}/rs/klinik`, {
//       method: "GET",
//       headers: headers,
//     });
//     const json = await resp.json();
//     let data = json.data.map((data: Klinik) => {
//       const option = {
//         value: data?.id,
//         label: data?.nama,
//       };
//       return option;
//     });
//     setListKlinik(data);
//   };

//   const [listAsuransi, setListAsuransi] = useState<MyOptions>([]);
//   const getAsuransi = async () => {
//     const resp = await fetch(`${APIURL}/rs/asuransi`, {
//       method: "GET",
//       headers: headers,
//     });
//     const json = await resp.json();
//     const data = json?.data?.map((data: Asuransi) => {
//       const option = {
//         value: data?.id,
//         label: data?.nama,
//       };
//       return option;
//     });
//     setListAsuransi(data);
//   };

//   const [listJadwal, setListJadwal] = useState<JadwalDokter[]>([]);
//   const getJadwal = async () => {
//     if (!selKlinik?.value && !tanggal) return;
//     const url = new URL(`${APIURL}/rs/jadwal`);
//     const params = {
//       tanggal: tanggal,
//       id_klinik: selKlinik?.value,
//       perPage: 50,
//     };
//     url.search = new URLSearchParams(params as any).toString();
//     const resp = await fetch(url, {
//       method: "GET",
//       headers: headers,
//     });
//     const data = await resp.json();
//     setListJadwal(data.data);
//   };
//   useEffect(() => {
//     getJadwal();
//   }, [selKlinik, tanggal]);

//   // useEffect(() => {
//   //   console.log(errors);
//   // }, [errors]);

//   useEffect(() => {
//     if (!ubah.modal) return;
//     getPoli();
//     getAsuransi();
//     setSelKlinik({ label: ubah.data?.nm_poli!, value: ubah.data?.kd_poli! });
//     setValue("id_pasien", ubah.data?.id!);
//     setValue("id_jadwal", parseInt(ubah.data?.id_jadwal!));
//     setValue("id_asuransi", parseInt(ubah.data?.kd_pj!));
//     setValue("tanggal", new Date().toLocaleDateString("fr-CA"));

//     return () => {
//       setValue("id_jadwal", NaN);
//       setValue("id_asuransi", NaN);
//     };
//   }, [ubah.modal]);

//   const submitHandler: SubmitHandler<Booking> = (data, e) => {
//     e?.preventDefault();
//     // console.log("febgtg");
//     // console.log(data);
//   };

//   return (
//     <Transition show={ubah.modal} as={Fragment}>
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
//                   "h-full w-full max-w-sm transform overflow-y-auto rounded bg-white p-6 pb-4 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
//                   css.scrollbar
//                 )}
//               >
//                 <Tab.Group>
//                   <Tab.List className="flex max-w-xs space-x-0.5 rounded-md bg-gray-900/20 p-0.5 dark:bg-slate-600">
//                     {menues.map((menu) => (
//                       <Tab
//                         className={({ selected }) =>
//                           cn(
//                             "w-full rounded py-1.5 text-sm leading-5 text-gray-700 dark:text-slate-50",
//                             selected
//                               ? "bg-white shadow dark:bg-slate-800"
//                               : "hover:bg-white/[0.12] dark:hover:bg-slate-700"
//                           )
//                         }
//                         key={menu}
//                       >
//                         {menu}
//                       </Tab>
//                     ))}
//                   </Tab.List>
//                   <Tab.Panels className="mt-2">
//                     <div className="max-w-xs rounded-sm border border-slate-200 py-1.5 text-center">
//                       <p>{ubah.data?.nm_pasien}</p>
//                     </div>
//                     <Tab.Panel className={cn("focus:outline-none")}>
//                       <div className="mt-2">
//                         <div className="max-w-xs rounded border p-2 shadow-lg">
//                           <p className="text-md">{ubah.data?.nama}</p>
//                           <p className="text-sm">{ubah.data?.nm_poli}</p>
//                           <div className="mt-1.5 flex justify-between">
//                             <p className="text-sm">{`${ubah.data?.mulai?.slice(
//                               0,
//                               5
//                             )} - ${ubah.data?.selesai?.slice(0, 5)}`}</p>
//                           </div>
//                         </div>
//                         <div className="mt-2 flex gap-1">
//                           <Button type="submit" color="cyan100">
//                             Check In
//                           </Button>
//                           <Button color="red" onClick={tutup}>
//                             Keluar
//                           </Button>
//                         </div>
//                       </div>
//                     </Tab.Panel>
//                     <Tab.Panel className={cn("focus:outline-none")}>
//                       <form onSubmit={handleSubmit(submitHandler)}>
//                         <div className="mt-2 flex flex-col gap-2">
//                           <div
//                             className={cn(
//                               "grid max-w-xs",
//                               errors.tanggal && "rounded-lg bg-red-100"
//                             )}
//                           >
//                             <div className="flex items-baseline justify-between">
//                               <label
//                                 htmlFor="tgl"
//                                 className="text-sm font-medium text-gray-900 dark:text-white"
//                               >
//                                 Tanggal
//                               </label>
//                               {errors.tanggal ? (
//                                 <p className="pr-0.5 text-xs text-red-500">
//                                   {errors.tanggal.message}
//                                 </p>
//                               ) : null}
//                             </div>
//                             <Input
//                               id="tgl"
//                               type="date"
//                               {...register("tanggal")}
//                             />
//                           </div>
//                           <div className={cn("grid max-w-xs")}>
//                             <div className="flex items-baseline justify-between">
//                               <label
//                                 htmlFor="poli"
//                                 className="text-sm font-medium text-gray-900 dark:text-white"
//                               >
//                                 Poliklinik
//                               </label>
//                             </div>
//                             <SelectInput
//                               noOptionsMessage={(e) => "Tidak ada pilihan"}
//                               onChange={(option: unknown) =>
//                                 setSelKlinik(option as MyOption | null)
//                               }
//                               options={listKlinik}
//                               value={selKlinik}
//                               placeholder="Pilih Poliklinik"
//                             />
//                           </div>
//                           <div
//                             className={cn(
//                               "grid max-w-xs",
//                               errors.id_asuransi && "rounded-lg bg-red-100"
//                             )}
//                           >
//                             <div className="flex items-baseline justify-between">
//                               <label
//                                 htmlFor="id_asuransi"
//                                 className="text-sm font-medium text-gray-900 dark:text-white"
//                               >
//                                 Asuransi
//                               </label>
//                               {errors.id_asuransi ? (
//                                 <p className="pr-0.5 text-xs text-red-500">
//                                   {errors.id_asuransi.message}
//                                 </p>
//                               ) : null}
//                             </div>
//                             <Controller
//                               control={control}
//                               name="id_asuransi"
//                               render={({ field: { onChange, value } }) => (
//                                 <SelectInput
//                                   noOptionsMessage={(e) => "Tidak ada pilihan"}
//                                   onChange={(val: any) => onChange(val.value)}
//                                   options={listAsuransi}
//                                   value={listAsuransi.find(
//                                     (c: any) => c.value === value
//                                   )}
//                                   placeholder="Pilih Asuransi"
//                                 />
//                               )}
//                             />
//                           </div>
//                           <div
//                             className={cn(
//                               "flex max-w-xs flex-col",
//                               errors.id_jadwal && "rounded-lg bg-red-100"
//                             )}
//                           >
//                             {errors.id_jadwal ? (
//                               <p className="pr-0.5 pt-1 text-end text-xs text-red-500">
//                                 {errors.id_jadwal.message}
//                               </p>
//                             ) : null}
//                             {listJadwal?.map((jadwal, idx) => (
//                               <div
//                                 className={cn(
//                                   idx + 1 !== listJadwal.length
//                                     ? "my-1"
//                                     : "mt-1"
//                                 )}
//                                 key={idx}
//                               >
//                                 <input
//                                   type="radio"
//                                   id={`jadwal${idx}`}
//                                   className="peer hidden"
//                                   value={jadwal.id}
//                                   {...register("id_jadwal")}
//                                 />
//                                 <label
//                                   htmlFor={`jadwal${idx}`}
//                                   className="block rounded bg-green-100 px-3 py-2 shadow-md hover:bg-green-200 peer-checked:bg-green-500 peer-checked:text-white dark:bg-blue-900 dark:hover:bg-blue-800 dark:peer-checked:bg-blue-400"
//                                 >
//                                   <p className="text-md">{jadwal?.nama}</p>
//                                   <p className="text-sm">
//                                     {jadwal?.nama_klinik}
//                                   </p>
//                                   <div className="mt-1.5 flex justify-between">
//                                     <p className="text-sm">{`${jadwal?.mulai?.slice(
//                                       0,
//                                       5
//                                     )} - ${jadwal?.selesai?.slice(0, 5)}`}</p>
//                                   </div>
//                                 </label>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                         <div className="mt-4 flex gap-1">
//                           <Button type="submit" color="cyan100">
//                             Ubah Booking
//                           </Button>
//                           <Button color="red" onClick={tutup}>
//                             Keluar
//                           </Button>
//                         </div>
//                       </form>
//                     </Tab.Panel>
//                   </Tab.Panels>
//                 </Tab.Group>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };
