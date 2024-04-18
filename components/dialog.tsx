import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "./button";

export const HapusDialog = ({
  hapus,
  tutup,
  tutupButton,
  handleHapus,
  text,
  tutupText = "Tutup",
  judul,
}: {
  hapus: boolean;
  tutup: () => void;
  tutupButton?: () => void;
  handleHapus: () => Promise<void>;
  text: string;
  tutupText?: string;
  judul: string;
}) => {
  return (
    <Transition show={hapus} as={React.Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={tutup}>
        <Transition.Child
          as={React.Fragment}
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
              as={React.Fragment}
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
                  className="font-medium leading-6 text-gray-900"
                >
                  Hapus {judul}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{text}</p>
                </div>
                <div className="mt-4 flex justify-end gap-1">
                  <Button color="red100" onClick={handleHapus}>
                    Hapus
                  </Button>
                  <Button color="red" onClick={tutupButton || tutup}>
                    {tutupText}
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
