"use client"
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react'
import { cn } from '@/lib/utils';
import css from "@/assets/css/scrollbar.module.css";
import { LuCalendarClock } from 'react-icons/lu';
import { fetch_api } from '@/lib/fetchapi';

export const RtlDialog = ({ 
   dialog, setDialog
}: { 
   dialog: boolean, 
   setDialog: React.Dispatch<any>
}) => {

   const closeDialogHandler = () => {
      setDialog({ dialog: {
         dialog: false
      }});
   }
   
   return (
      <Transition show={dialog} as={Fragment}>
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
                           {/* <p className="col-span-2">: { infoKunj?.nama }</p> */}
                           <p>No. Kunjungan</p>
                           {/* <p>: { idKunjungan }</p> */}
                        </div>
                        <div className="my-2.5 border-b border-slate-200"></div>
                        {/* Form RTL */} 
                        <div className="mb-2.5">
                        </div>
                     
                  </Dialog.Panel>
                  </Transition.Child>
               </div>
            </div>
         </Dialog>
      </Transition>
   )
}