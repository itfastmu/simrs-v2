import { z } from "zod";

export type Penunjang = {
  id: number;
  nama: string;
  jenis: string;
  aktif: boolean;
  id_jenis: number;
};

export type JenisPenunjang = {
  id: number;
  nama: string;
};

export const DetailPemeriksaanSchema = z.object({
  id_dpermintaan: z.number(),
  hasil: z.string().min(1, "harus diisi"),
  keterangan: z.string(),
});

export type TDetailPemeriksaan = z.infer<typeof DetailPemeriksaanSchema>;

export type Permintaan = {
  id: number;
  id_kunjungan: string;
  id_perujuk: number | null;
  perujuk_luar: number | null;
  diagnosis: string;
  informasi: string;
  status: number;
  created_at: string;
  no_rm: string;
  alamat: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  user: string | null;
  id_pasien: number;
  id_asuransi: number;
  tipe: number;
  tanggal: string;
  nama: string;
  nama_dokter: string;
  klinik: string;
};

export type DetailPemeriksaanRad = {
  id: number;
  id_permintaan: number;
  id_penunjang: number;
  nama: string;
  id_jenis: number;
  aktif: boolean;
  id_dpermintaan: number;
  hasil: string;
  keterangan: string;
  status: number;
  created_at: string;
};

export type HasilRad = {
  id: number;
  id_permintaan: number;
  id_penunjang: number;
  nama: string;
  id_jenis: number;
  aktif: boolean;
  id_dpermintaan: number;
  hasil: string;
  keterangan: string;
  status: number;
};

export type KunjunganPenunjang = {
  no_rm: string;
  id_pasien: number;
  nama: string;
  id_asuransi: number;
  asuransi: string;
  id_kunjungan: string;
  tanggal: Date;
};

export const KunjunganPenunjangSchema = z.object({
  id_pasien: z.number(),
  tanggal: z.string().min(1, "harus diisi"),
});

export type TKunjunganPenunjangSchema = z.infer<
  typeof KunjunganPenunjangSchema
>;

export type GroupingPenunjangTarif = {
  id: number;
  group: string;
  jumlah_layanan: number;
};

export const GroupingDPenunjangTarifSchema = z.object({
  id_penunjang: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  id_tarif: z.number(),
});

export type GroupingDPenunjangTarifTSchema = z.infer<
  typeof GroupingDPenunjangTarifSchema
>;
