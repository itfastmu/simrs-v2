import { getAgeAll, getAge, cn } from "@/lib/utils";
import { APIURL } from "@/lib/connection";
import { cookies } from "next/headers";
import { DataPesertaBPJS, DetailPasien } from "../../schema";
import css from "@/assets/css/scrollbar.module.css";
import FormSEP from "../_components/sep";

export type TData = {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  agama: string;
  ibu: string;
  hp: string;
  wn: string;
  created_at: Date;
  tanggal_lahir: Date;
  state: string;
  keterangan: null;
  poli?: string;
  kd_poli?: string;
  dokter?: string;
};

export default async function SEP({ params }: { params: { id: string } }) {
  const headers = new Headers();
  const token = cookies().get("token")?.value;
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  type SEP = {
    noSep: string;
    tglSep: string;
    tglPlgSep: string;
    noKartu: string;
    namaPeserta: string;
    jnsPelayanan: string;
    kelasRawat: string;
    diagnosa: string;
    poli: string;
    ppkPelayanan: string;
    noRujukan: string;
    flag: string;
    asuransi: string;
    poliTujSep: string;
  };

  const id = parseInt(params.id);
  const url = new URL(`${APIURL}/rs/pasien/${id}`);
  const res = await fetch(url, { method: "GET", headers: headers });
  const fetchData = await res.json();
  let data = fetchData?.data as DetailPasien;

  const urlPeserta = new URL(`${APIURL}/rs/pasien/bpjs`);
  const paramsPeserta = {
    id_pasien: id,
  };
  urlPeserta.search = new URLSearchParams(paramsPeserta as any).toString();
  const resPeserta = await fetch(urlPeserta, {
    method: "GET",
    headers: headers,
  });
  const fetchDataPeserta = await resPeserta.json();
  const dataPeserta = fetchDataPeserta?.data as DataPesertaBPJS;

  const urlSep = new URL(`${APIURL}/rs/sep/history/${id}`);
  const resSep = await fetch(urlSep, { method: "GET", headers: headers });
  const fetchDataSep = await resSep.json();
  let riwayat = fetchDataSep?.data as SEP[];

  return (
    <main className="mx-auto flex h-full gap-2 overflow-auto px-4 pb-[68px] pt-1">
      <div className="flex w-1/3 flex-col gap-2">
        <div className="h-fit rounded-md bg-white p-2 pt-1 shadow-md dark:bg-slate-700">
          <table className="w-full text-left text-xs font-semibold text-gray-600 dark:text-neutral-200">
            <tbody>
              <tr>
                <td colSpan={3}>
                  <p className="text-center text-base text-red-500">
                    {dataPeserta?.informasi.prolanisPRB}
                  </p>
                </td>
              </tr>
              <tr>
                <td className="align-baseline">
                  <p>NIK</p>
                </td>
                <td className="align-baseline">
                  <p>:</p>
                </td>
                <td className="align-baseline">
                  <p>{data?.nik || ""}</p>
                </td>
              </tr>
              <tr>
                <td className="align-baseline">Nama Pasien</td>
                <td className="align-baseline">:</td>
                <td className="align-baseline">{data?.nama ?? ""}</td>
              </tr>
              <tr>
                <td className="align-baseline">Tanggal Lahir</td>
                <td className="align-baseline">:</td>
                <td className="align-baseline">
                  {data?.tanggal_lahir
                    ? new Intl.DateTimeFormat("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(data.tanggal_lahir))
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="align-baseline">Status</td>
                <td className="align-baseline">:</td>
                <td className="align-baseline">
                  {dataPeserta?.statusPeserta.keterangan}
                </td>
              </tr>
              <tr>
                <td className="align-baseline">Hak Kelas</td>
                <td className="align-baseline">:</td>
                <td className="align-baseline">
                  {dataPeserta?.hakKelas.keterangan}
                </td>
              </tr>
              <tr>
                <td className="align-baseline">Jenis Peserta</td>
                <td className="align-baseline">:</td>
                <td className="align-baseline">
                  {dataPeserta?.jenisPeserta.keterangan}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="relative flex h-full flex-col overflow-y-auto rounded-md bg-white text-xs shadow-md dark:bg-slate-700">
          <div className="sticky left-0 top-0 z-10 w-full bg-sky-200/60 py-1 text-sm font-semibold dark:bg-sky-600">
            Riwayat SEP
          </div>
          <div
            className={cn(
              "relative flex flex-1 flex-col gap-2 overflow-y-auto p-2",
              css.scrollbar
            )}
          >
            {riwayat?.length > 0 ? (
              <>
                {riwayat?.map((val, idx) => (
                  <div
                    className="flex flex-col rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-left text-[10px]/[14px] dark:bg-slate-600"
                    key={idx}
                  >
                    <p className="mb-0.5 font-semibold">{val.noSep}</p>
                    <p>Rawat Jalan</p>
                    <p>{val.poli}</p>
                    <p>Tgl. SEP {val.tglSep}</p>
                    <p>{val.noRujukan}</p>
                    <p>{val.diagnosa}</p>
                    <p>{val.ppkPelayanan}</p>
                  </div>
                ))}
              </>
            ) : (
              <p className="border p-2 text-center text-xs">
                Belum ada riwayat
              </p>
            )}
          </div>
        </div>
      </div>
      <FormSEP />
    </main>
  );
}
