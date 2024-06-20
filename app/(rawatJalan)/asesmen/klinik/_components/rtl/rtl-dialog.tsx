"use client"
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react'
import { cn } from '@/lib/utils';
import css from "@/assets/css/scrollbar.module.css";
import RtlPulang from './rtl-pulang';
import RtlRanap from './rtl-ranap';
import RtlKontrol from './rtl-kontrol';
import RtlInternal from './rtl-internal';
import RtlEksternal from './rtl-eksternal';
import RtlPRB from './rtl-prb';
import { LuCalendarClock } from 'react-icons/lu';
import { fetch_api } from '@/lib/fetchapi';

export const RtlDialog = ({ 
   showDialog, closeDialog, idKunjungan
}: { 
   idKunjungan: string | string[],
   showDialog: boolean, 
   closeDialog: React.Dispatch<React.SetStateAction<boolean>>
}) => {

   const [infoKunj, setInfoKunj] = useState<{ [key: string]: any } | null>(null);
   async function loadInfoPemeriksaan() {
      try {
         const fetch = await fetch_api('GET', `/rs/kunjungan/rajal/${idKunjungan}`);
         if (fetch.status === 200) {
            setInfoKunj(fetch.resp.data);
         }

      } catch (error) {
         console.log(error);
      }
   }

   const rtlChoices: {[key: string]: string }[] = [
      { label: 'Kontrol', value: 'kontrol' },
      { label: 'Pulang', value: 'pulang' },
      { label: 'Inap', value: 'ranap' },
      { label: 'Rujuk Int', value: 'internal' },
      { label: 'Rujuk Eks', value: 'eksternal' },
      { label: 'PRB', value: 'prb' },
   ]

   // form rtl ketika dipilih
   const [rtlChange, setRtlChange] = useState<string | null>('kontrol');
   let rtlForm: JSX.Element = (<></>); 
   switch (rtlChange) {
      case "pulang": {
         rtlForm = ( <RtlPulang /> )
      } break;
      case "kontrol": {
         rtlForm = ( <RtlKontrol IKunjungan={ infoKunj }/> )
      } break;
      case "ranap": {
         rtlForm = ( <RtlRanap /> )
      } break;
      case "internal": {
         rtlForm = ( <RtlInternal /> )
      } break;
      case "eksternal": {
         rtlForm = ( <RtlEksternal /> )
      } break;
      case "prb": {
         rtlForm = ( <RtlPRB /> )
      } break;
      default: {
         rtlForm = ( <p className="text-center text-sm">Tentukan Rencana Tindak Lanjut Pasien</p> )
      } break;
   }

   const closeDialogHandler = () => {
      closeDialog(false);
   }

   useEffect(() => {
      loadInfoPemeriksaan();
   }, [])
   
   return (
      <Transition show={showDialog} as={Fragment}>
         <Dialog as="div" className="relative z-[1001]" onClose={closeDialogHandler}>
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
                        "h-full w-full max-w-xl transform overflow-y-auto rounded-l-md bg-white px-5 py-3 text-left align-middle shadow-xl transition-all dark:bg-slate-700",
                        css.scrollbar
                     )}
                  >
                     <Dialog.Title as="p" className="flex justify-between items-end border-b pb-2 border-slate-200 dark:border-slate-300 dark:text-slate-100">
                        <div className="flex items-center text-sky-900">
                           <LuCalendarClock className="text-xl"/>
                           <p className="font-medium text-md ml-1.5">Rencana Tindak Lanjut (RTL)</p>
                        </div>
                        <div>
                           <p className="text-xs">
                              <span className="text-xs text-slate-400 tracking-wide px-1.5">Dibuat :</span>
                              { new Date().toLocaleDateString('id-ID', {
                                 day: '2-digit',
                                 month: 'long',
                                 year: 'numeric'
                           }) }</p>
                        </div>
                     </Dialog.Title>

                        {/* Pilihan RTL */}
                        <div className="my-1.5 p-2.5 text-sm border border-cyan-300 bg-cyan-100 rounded-md grid grid-cols-3 gap-y-1">
                           <p>Nama Pasien</p>
                           {/* <p className="col-span-2">: { infoKunj. }</p> */}
                           <p>No. Kunjungan</p>
                           {/* <p>: { infoPasien?.id_kunjungan }</p> */}
                        </div>
                        <div className="flex frex-wrap gap-2 my-2.5">
                           {
                              Object.values(rtlChoices).map(val => (
                                 <div className="flex items-center" key={val.value}>
                                    <input 
                                       type="radio" 
                                       id={'id-'+val.value} 
                                       name="tipe" 
                                       value={ val.value } 
                                       className="hidden peer" 
                                       checked={rtlChange === val.value}
                                       onChange={ () => setRtlChange(val.value) }
                                    />
                                    <label htmlFor={'id-'+val.value} className="text-xs tracking-wide bg-sky-700 hover:bg-sky-800 text-white py-1.5 px-2.5 border border-sky-800 rounded peer-checked:bg-blue-500 peer-checked:border-blue-200 peer-checked:border-2">
                                       { val.label  }
                                    </label>
                                 </div>
                              ))
                           }
                        </div>
                        <div className="my-2.5 border-b border-slate-200"></div>
                        {/* Form RTL */} 
                        <div className="mb-2.5">
                           { rtlForm }
                        </div>
                     
                  </Dialog.Panel>
                  </Transition.Child>
               </div>
            </div>
         </Dialog>
      </Transition>
   )
}