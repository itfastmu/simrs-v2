"use client";

import { useEffect, useState } from "react";
import Menu from "./menu";
import Theme from "./theme";
import { IoPersonSharp } from "react-icons/io5";
import Cookies from "js-cookie";

export default function Taskbar({}) {
  const [nama, setNama] = useState<string | undefined>(undefined);
  const [grup, setGrup] = useState<string | undefined>(undefined);

  useEffect(() => {
    setNama(Cookies.get("nama"));
    setGrup(Cookies.get("grup"));
  }, []);

  return (
    <div className="fixed bottom-1 z-[1000] w-full select-none">
      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1">
            <div className="flex justify-end">
              <div className="flex min-w-80 grow-0 items-center gap-3.5 rounded-lg bg-slate-50 px-6 py-2.5 dark:bg-gray-800">
                <IoPersonSharp
                  size="1.5rem "
                  className="fill-sky-600 hover:cursor-pointer hover:fill-sky-500"
                />
                <div className="h-[40px] flex-1 border-l-[1px] border-slate-300 px-3.5">
                  {!!nama ? (
                    <p className="select-text text-sm font-semibold text-sky-600">
                      {nama}
                    </p>
                  ) : (
                    <p className="mx-auto h-5 w-48 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                  )}
                  <div className="my-0.5 border-b-[1px] border-slate-300" />
                  {!!grup ? (
                    <p className="text-xs text-gray-700 dark:text-gray-100">
                      {grup}
                    </p>
                  ) : (
                    <p className="mx-auto h-4 w-12 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Menu />
          <Theme />
        </div>
      </div>
    </div>
  );
}

const old = () => {
  return (
    <div className="fixed bottom-1 z-50 grid h-10 w-full grid-cols-3 gap-1.5 px-4">
      <div className="h-10 rounded-md border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex h-full max-w-md items-center p-4">
          <div className="flex cursor-pointer items-center justify-center">
            <IoPersonSharp size={`1.1rem`} className="mr-2 inline" />
            <span className="text-sm"></span>
          </div>
        </div>
      </div>
      <Menu />
      <div className="h-10 rounded-md border border-gray-200 bg-gray-100 text-sm dark:border-gray-600 dark:bg-gray-700">
        <div className="mx-auto flex h-full max-w-lg items-center justify-center">
          {new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </div>
      </div>
    </div>
  );
};
