import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ArrayElementType<T> = T extends (infer U)[] ? U : never;

export const getAge = (strDate: Date, anotherDate: Date = new Date()) => {
  const another = anotherDate;
  const birth = new Date(strDate);
  let year = another.getFullYear() - birth.getFullYear();
  let month = another.getMonth() - birth.getMonth();
  let date = another.getDate() - birth.getDate();

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

export const getAgeAll = (strDate: Date, anotherDate: Date = new Date()) => {
  const another = anotherDate;
  const birth = new Date(strDate);
  let year = another.getFullYear() - birth.getFullYear();
  let month = another.getMonth() - birth.getMonth();
  let date = another.getDate() - birth.getDate();

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

export const getAgeThn = (strDate: Date, anotherDate: Date = new Date()) => {
  const another = anotherDate;
  const birth = new Date(strDate);
  let year = another.getFullYear() - birth.getFullYear();
  let month = another.getMonth() - birth.getMonth();
  let date = another.getDate() - birth.getDate();

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
    (another.getTime() - birth.getTime()) / (1000 * 3600 * 24)
  );
  const weeks = Math.floor(totalDays / 7);

  return year !== 0 ? year + " Tahun" : weeks + " Minggu";
};

export const hijriyahDate = (date: Date): string => {
  const hijriMonths = [
    "Muharram",
    "Safar",
    "Rabiul Awal",
    "Rabiul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Sya'ban",
    "Ramadhan",
    "Syawal",
    "Dzulqa'dah",
    "Dzulhijjah",
  ];

  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  const jd1 = Math.floor((11 * gregorianYear + 3) / 30);
  const jd2 = Math.floor(
    gregorianYear * 365 +
      gregorianYear / 4 -
      jd1 +
      Math.floor(gregorianMonth * 30.6) +
      gregorianDay +
      1948439 -
      1
  );

  const l = jd2 - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const j = l - 10631 * n + 354;
  const j1 =
    Math.floor((10985 - j) / 5316) * Math.floor((50 * j) / 17719) +
    (j / 5670) * Math.floor((43 * j) / 15238);
  const j2 = j - Math.floor((30.6001 * j1 * 10631) / 10600);
  const monthIndex = Math.floor((j2 + 28) / 29.5);
  const year = Math.floor(29 * monthIndex + j1 - 7200) / 10985;

  const day = j2 - Math.floor(29.5001 * monthIndex - 29);

  const hijriDate = `${day} ${hijriMonths[monthIndex - 1]} ${year} H`;
  return hijriDate;
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const MoneyToNumber = (money:string|undefined): number => {
  if (!money) return 0;
  const parsing = money.replace(/[^0-9,]/g, '').replace(',', '.');
  return Number(parsing);
}

export const NumberToMoney = (nomer:any): string => {
  let parsing = "Rp0,00";
  if(nomer!==null){
  parsing = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
  }).format(Number(nomer));
  }
  return parsing;
}