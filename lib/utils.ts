import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ArrayElementType<T> = T extends (infer U)[] ? U : never;

export const getAge = (strDate: number | Date | undefined) => {
  if (strDate === undefined) return NaN;
  const today = new Date();
  const birth = new Date(strDate);
  let year = today.getFullYear() - birth.getFullYear();
  let month = today.getMonth() - birth.getMonth();
  let date = today.getDate() - birth.getDate();

  if (date < 0) {
    const lastDate = new Date(
      birth.getFullYear(),
      birth.getMonth() + 1,
      0
    ).getDate();
    date = lastDate + date;
    month = month - 1;
  }
  if (month < 0) {
    month = 12 + month;
    year = year - 1;
  }

  return year;
};

export const getAgeAll = (strDate: Date) => {
  const today = new Date();
  const birth = new Date(strDate);
  let year = today.getFullYear() - birth.getFullYear();
  let month = today.getMonth() - birth.getMonth();
  let date = today.getDate() - birth.getDate();

  if (date < 0) {
    const lastDate = new Date(
      birth.getFullYear(),
      birth.getMonth() + 1,
      0
    ).getDate();
    date = lastDate + date;
    month = month - 1;
  }
  if (month < 0) {
    month = 12 + month;
    year = year - 1;
  }

  return year + " Tahun " + month + " Bulan " + date + " Hari";
};

export const getAgeThn = (strDate: Date) => {
  const today = new Date();
  const birth = new Date(strDate);
  let year = today.getFullYear() - birth.getFullYear();
  let month = today.getMonth() - birth.getMonth();
  let date = today.getDate() - birth.getDate();

  if (date < 0) {
    const lastDate = new Date(
      birth.getFullYear(),
      birth.getMonth() + 1,
      0
    ).getDate();
    date = lastDate + date;
    month = month - 1;
  }
  if (month < 0) {
    month = 12 + month;
    year = year - 1;
  }
  const totalDays = Math.floor(
    (today.getTime() - birth.getTime()) / (1000 * 3600 * 24)
  );
  const weeks = Math.floor(totalDays / 7);

  return year !== 0 ? year + " Tahun" : weeks + " Minggu";
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
