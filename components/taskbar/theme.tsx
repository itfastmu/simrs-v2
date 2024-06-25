import React from "react";
import { IoMoon, IoSunny } from "react-icons/io5";
import { MdChatBubble } from "react-icons/md";
import { useTheme } from "next-themes";
import NotificationIcon from "./notification";

export default function Theme() {
  const { theme, setTheme } = useTheme();
  /* COLOR THEMES */
  // light:bg-slate-50 dark:bg-gray-800
  // light:bg-slate-200 dark:bg-gray-800
  /* ------------ */

  return (
    <div className="flex-1">
      <div className="flex justify-start">
        <div className="flex min-w-72 grow-0 items-center rounded-lg bg-slate-50 px-6 py-2.5 dark:bg-gray-800">
          <div>
            {theme === "dark" ? (
              <IoMoon
                size="1.5rem "
                className="inline fill-gray-400 hover:cursor-pointer hover:fill-gray-300"
                onClick={() => setTheme("light")}
              />
            ) : (
              <IoSunny
                size="1.5rem "
                className="inline fill-amber-400 hover:cursor-pointer hover:fill-amber-300"
                onClick={() => setTheme("dark")}
              />
            )}
          </div>
          <div className="mx-3.5 h-[40px] border-x-[1px] border-slate-300 px-3.5">
            <p className="text-center font-bold text-sky-600">
              {new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </p>
            <p className="text-[10px] text-gray-700 dark:text-gray-100">
              RSU Fastabiq Sehat PKU Muhammadiyah
            </p>
          </div>
          <MdChatBubble
            size="1.8rem"
            className="inline fill-amber-500 hover:cursor-pointer hover:fill-amber-400"
          />
          <NotificationIcon />
        </div>
      </div>
    </div>
  );
}
