import { MyOption } from "@/components/select";
import { z } from "zod";

export type Barang = {
  id: string;
  nama: string;
  stok: number;
  id_satuan: number;
  satuan: string;
  restriksi: string;
  deskripsi: string;
  id_zat: number;
  zat: string;
  id_tipe: number;
  harga: number;
  harga_dasar: number;
  tipe: string;
  id_sediaan: number;
  sediaan: string;
  kekuatan: string;
};

export type BarangMapPOA = {
  id: number;
  id_barang: string;
  nama: string;
  id_poa: number;
  nama_poa: string;
};

export type OptionBarang = MyOption & {
  readonly sediaan: string;
  readonly numerator: number;
};

export type Satuan = { id: number; nama: string; deskripsi: string };

export type Depo = {
  id: number;
  nama: string;
  id_unit: number;
  aktif: boolean;
};

export type Jenis = {
  id: number;
  nama: string;
  table: string;
  tipe: number;
};

export type Sediaan = {
  id: number;
  nama: string;
  aktif: boolean;
};

export type Tipe = {
  id: number;
  nama: string;
  kode: string;
};

export type Zat = {
  id: number;
  nama: string;
};

export const TransaksiBarangSchema = z.object({
  id_ref: z
    .number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    })
    .or(z.string()),
  id_depo: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  id_jenis: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  tanggal: z.string().min(1, "harus diisi"),
  keterangan: z.string(),
  detail: z
    .object({
      id_poa: z.number(),
      nama: z.string(),
      batch: z.string(),
      kadaluarsa: z.string(),
      jumlah: z.number(),
    })
    .array()
    .min(1, "harus dipilih"),
});

export type TransaksiBarangTSchema = z.infer<typeof TransaksiBarangSchema>;

export type TransaksiBarang = {
  id: number;
  tanggal: string | Date;
  keterangan: string;
  id_depo: number;
  id_kunjungan: number | null;
  id_suplier: number;
  id_jenis: number;
  user: string;
  created_at: string | Date;
  tipe: number;
  nama: string;
};

export type SOHead = {
  id: number;
  tanggal: Date;
  keterangan: string;
  created_at: Date;
  status: string;
};

export type SOListDepo = {
  id_so: number;
  id_depo: number;
  tanggal: Date;
  nama: string;
};

export type HasilTransaksiBarang = {
  id: number;
  id_depo: number;
  id_ref: number;
  id_jenis: number;
  nama: string;
  depo: string;
  jenis: string;
  keterangan: string;
  nomer: string;
  user: string;
  created_at: string;
  status: number;
  detail:
    | {
        id: number;
        id_poa: number;
        nama: string;
        jumlah: number;
        id_satuan: number;
        satuan: string;
        nominal: number | null;
      }[]
    | null;
};

export type Resep = {
  id_kunjungan: string;
  id_pasien: number;
  no_rm: string;
  id_asuransi: number;
  created_at: Date;
  tipe: number;
  tanggal: Date;
  nama: string;
  proses: string;
  dokter: string;
  klinik: string;
  asuransi: string;
  status:
    | "Resep baru"
    | "Resep divalidasi"
    | "Etiket telah dibuat"
    | "Semua obat tervalidasi";
};

export type ObatResep = {
  nonracik: {
    id_resep: number;
    id_kunjungan: string;
    nama_obat: string;
    sediaan: null | string;
    kekuatan: null | string;
    waktu: string[];
    rute: string;
    id_poa: number;
    harga: number;
    jumlah: number;
  }[];
  racik: {
    id_kunjungan: string;
    id_resep: number;
    nama_racik: string;
    metode: string;
    waktu: string[];
    rute: string;
    jumlah: number;
    tipe: "dtd" | "nondtd";
    detail:
      | {
          id: number;
          id_resep: number;
          dosis: number;
          jumlah: number;
          id_poa: number;
          nama: string;
          sediaan: null | string;
          stok: number;
          id_satuan: number;
          kekuatan: null | string;
          id_zat: number;
          id_tipe: number;
          id_sediaan: number;
          harga_dasar: number;
          harga: number;
        }[]
      | null;
  }[];
};

export const KFABZASchema = z.object({
  id: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  nama: z.string().min(1, "harus diisi"),
});

export type KFABZASchemaType = z.infer<typeof KFABZASchema>;

export type KFAPOV = {
  id: number;
  id_bza: number;
  nama: string;
  numerator: number;
  satuan: string;
  denominator: number;
  satuan_denom: string;
  id_sediaan: string;
  id_hl7: string;
  nama_hl7: string;
  nama_indo: string;
};

export type KFABZA = Pick<KFAPOV, "id" | "nama">;

export type KFAPOA = KFAPOV & {
  restriksi?: string;
  harga?: number;
  id_pov: number;
  merk: string | null;
};

export type SuratPesanan = {
  id: string;
  id_suplier: number;
  jenis: string;
  diskon: number;
  pengiriman: string;
  ppn: number;
  user: string;
  status: number;
  created_at: string;
};

export type DetailPesanan = {
  id: number;
  id_barang: number;
  nama_obat: string;
  satuan: string;
  jumlah: number;
  diskon: number | null;
  harga: string | null;
  id_sp: string;
};

export type StokBarangDepo = {
  id: number;
  id_depo: number;
  id_poa: number;
  stok: number;
  nama: string;
  id_unit: number;
  aktif: boolean;
  id_pov: number;
  merk: string;
  depo: string;
};
