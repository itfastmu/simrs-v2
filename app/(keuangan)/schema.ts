import { MyOptions } from "@/components/select";
import { z } from "zod";

export type ListBilling = {
  id: number;
  nomer: string;
  kodebooking: string;
  cara_bayar: string;
  nama: string;
  alamat: string;
  instansi: string;
  dokter: string;
  tanggal_lahir: string;
  id_tipe: number;
  tipe: string;
  status: number;
  created_at: string;
};

export type ListTarif = {
  id: number;
  nama: string;
  bhp: string;
  catatan: string | null;
  aktif: boolean;
  unit: string[];
};

export type TBillingPasien = {
  total: number;
  detail:
    | {
        id?: number;
        id_billing: number;
        id_tarif: number;
        nominal?: string;
        nama_tarif: string;
      }[]
    | null;
  obat:
    | {
        id: number;
        id_ref: number;
        bebas: boolean;
        id_barang: string;
        jumlah: number;
        nominal: string | null;
        total: number;
        nama: string;
        stok: number;
        id_satuan: number;
        id_zat: number;
        id_tipe: number;
        harga_dasar: number;
        harga: number;
        id_sediaan: number;
        kekuatan: string;
        aktif: boolean;
      }[]
    | null;
};

export const BillingSchema = z.object({
  id_kunjungan: z.string(),
  detail: z
    .object({
      id: z.number().nullish(),
      id_tarif: z.number(),
      tarif: z.string(),
      tipe: z.number(),
      saved: z.boolean().optional()
    })
    .array()
    .min(1, "diisi minimal satu"),
});

export type Billing = z.infer<typeof BillingSchema>;

export const TarifSchema = z.object({
  nama: z.string().min(1, "harus diisi"),
  bhp_farmasi: z.boolean(),
  catatan: z.string().min(0),
  bhp: z.number({
    required_error: "harus diisi",
    invalid_type_error: "harus diisi",
  }),
  unit: z
    .object({
      id: z.number(),
      nama: z.string(),
    })
    .array()
    .min(0),
});
export type Tarif = z.infer<typeof TarifSchema>;
export const TarifMultipleSchema = TarifSchema.array();
export type TarifMultiple = z.infer<typeof TarifMultipleSchema>;

export type JasaMedis = {
  id: number;
  id_tarif: number;
  id_profesi: number;
  nominal: string;
  aktif: boolean;
  nama: string;
};
export const JasaMedisSchema = z.object({
  id_tarif: z.number(),
  id_profesi: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  nominal: z.number({
    required_error: "harus diisi",
    invalid_type_error: "harus diisi",
  }),
});
export type JasaMedisTSchema = z.infer<typeof JasaMedisSchema>;

export type TarifCaraBayar = {
  id: number;
  id_asuransi: number;
  persentase: number;
  created_at: Date;
  user: string;
  aktif: boolean;
  asuransi: string;
};
export const PersenCaraBayarSchema = z.object({
  id_asuransi: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  persentase: z.number({
    required_error: "harus diisi",
    invalid_type_error: "harus diisi",
  }),
});
export type PersenCaraBayarTSchema = z.infer<typeof PersenCaraBayarSchema>;

export const PersenKelasSchema = z
  .object({
    id_kelas: z.number({
      required_error: "harus dipilih",
      invalid_type_error: "harus dipilih",
    }),
  })
  .merge(PersenCaraBayarSchema.pick({ persentase: true }));
export type PersenKelasTSchema = z.infer<typeof PersenKelasSchema>;

export type TarifKelas = {
  id: number;
  id_kelas: number;
  persentase: number;
  created_at: Date;
  user: string;
  aktif: boolean;
  kelas: string;
};

export type TipeHargaObat = "alkes" | "obat" | "bahan-medis";

export type THargaObat = {
  id: number;
  asuransi: number[];
  nama_asuransi: string[];
  generik: boolean;
  tipe: TipeHargaObat[];
  margin: string;
  status: number;
};

export const tipeHargaOptions = [
  { label: "Alkes", value: "alkes" },
  { label: "Obat", value: "obat" },
  { label: "Bahan Medis", value: "bahan-medis" },
] as MyOptions;
