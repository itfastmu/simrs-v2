"use client";

// import { APIURL } from "@/lib/connection";
// import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const motivationText = [
  {
    text: "Barangsiapa yang mengerjakan kebaikan sekecil apapun, niscaya dia akan melihat (balasan)nya.",
    source: "(QS. Al-Zalzalah: 7)",
  },
  {
    text: "Dan mohonlah ampun kepada Tuhanmu kemudian bertaubatlah kepada-Nya. Sesungguhnya Tuhanku Maha Penyayang lagi Maha Pengasih.",
    source: "(QS. Huud: 90)",
  },
  {
    text: "Sesungguhnya Allah tidak akan mengubah keadaan suatu kaum hingga mereka merubah keadaan yang ada pada diri mereka sendiri.",
    source: "(QS. Ar-Rad: 11)",
  },
  {
    text: "dan Dia mendapatimu sebagai seorang yang kekurangan, lalu Dia memberikan kecukupan.",
    source: "(QS. Ad-Dhuha: 8)",
  },
  {
    text: "Sesungguhnya shalat itu mencegah dari perbuatan-perbuatan keji dan mungkar.",
    source: "(QS. Al-Ankabut: 45)",
  },
  {
    text: "Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu, namun jika kamu mengingkari (nikmat-Ku), maka sesungguhnya azab-Ku sangatlah pedih.",
    source: "(QS. Ibrahim: 7)",
  },
  {
    text: "Dan Dia mendapatimu sebagai seorang yang bingung, lalu Dia memberikan petunjuk.",
    source: "(QS. Ad-Dhuha: 7)",
  },
  {
    text: "Karena sesungguhnya bersama kesulitan ada kemudahan.",
    source: "(QS. Al-Insyirah: 5-6)",
  },
  {
    text: "Maka bersabarlah, karena sesungguhnya janji Allah adalah benar.",
    source: "(QS. Ar-Rum: 60)",
  },
  {
    text: "Sesungguhnya Allah bersama orang yang sabar.",
    source: "(QS. Al-Baqarah: 153)",
  },
  {
    text: "Dan apa saja musibah yang menimpa kamu maka itu disebabkan oleh perbuatan tanganmu sendiri, dan Allah memaafkan sebagian besar (dari kesalahan-kesalahanmu).",
    source: "(QS. Asy-Syura: 30)",
  },
];

export function Motivation({ color }: { color?: string }) {
  // const headers = new Headers();
  // const [token] = useState(Cookies.get("token"));
  // headers.append("Sourceization", token as string);
  // headers.append("Content-Type", "application/json");

  // const postUser = async () => {
  //   try {
  //     const post = await fetch(`${APIURL}/register`, {
  //       method: "POST",
  //       headers: headers,
  //       body: JSON.stringify({
  //         username: "drmusdalifah",
  //         password: "dokter",
  //         id_group: 7,
  //         id_pegawai: "2014.10.02.003",
  //       }),
  //     });
  //     const resp = await post.json();
  //     if (resp.status !== "Created") throw new Error(resp.message);
  //     console.log(resp);
  //   } catch (err) {
  //     const error = err as Error;
  //     console.error(error);
  //   }
  // };
  const [tIndex, setTindex] = useState(0);

  useEffect(() => {
    // postUser();

    let timeout = setInterval(() => {
      let currentIdx = tIndex;
      setTindex(currentIdx + 1);
    }, 7000);

    return function cleanup() {
      clearInterval(timeout);
    };
  }, [tIndex]);

  let textChange = motivationText[tIndex % Object.keys(motivationText).length];

  return (
    <>
      <p className={`text-center italic leading-5 text-slate-200`}>
        &quot; {textChange.text} &quot;
      </p>
      <p className={`text-md mt-3 text-center font-bold text-slate-200`}>
        {textChange.source}
      </p>
    </>
  );
}
