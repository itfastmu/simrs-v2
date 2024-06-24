import { z } from "zod";

export const listGender = ["Laki-laki", "Perempuan"];

// const NullableFormString = z.preprocess(
//   (v) => (v === "" ? null : v),
//   z.string().nullish()
// );

export const PasienSchema = z.object({
  nik: z
    .union([
      z.string().length(0, "panjangnya harus 16 dan harus berisi angka"),
      z
        .string()
        .length(16, "panjangnya harus 16")
        .regex(/^\d+$/, "harus berisi angka"),
    ])
    .nullish()
    .transform((e) => (e === "" ? null : e)),
  nama: z.string().min(1, "harus diisi"),
  jenis_kelamin: z.string({ required_error: "harus dipilih" }),
  tanggal_lahir: z.string().min(1, "harus diisi"),
  hp: z.string().min(1, "harus diisi"),
  rt: z.string().min(1, "harus diisi"),
  rw: z.string().min(1, "harus diisi"),
  propinsi: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  kota: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  kecamatan: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  desa: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  alamat: z.string().min(1, "harus diisi"),
  agama: z.string({ required_error: "harus dipilih" }),
  ibu: z.string().min(1, "harus diisi"),
  wn: z.string({ required_error: "harus dipilih" }),
  asuransi: z
    .object({
      id: z.number().optional(),
      id_asuransi: z.number(),
      nama: z.string(),
      nomer: z.string(),
    })
    .array()
    .nullish(),
  deleted: z
    .object({
      asuransi: z.number().array().optional(),
    })
    .optional(),
});

export type FormPasien = z.infer<typeof PasienSchema>;

export const BookingSchema = z.object({
  id_pasien: z.number({
    required_error: "harus diisi",
  }),
  tanggal: z
    .string({
      required_error: "harus diisi",
    })
    .min(1, "harus diisi"),
  id_asuransi: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  id_jadwal: z.number({
    required_error: "Jadwal harus dipilih",
    invalid_type_error: "Jadwal harus dipilih",
  }),
});

export type Booking = z.infer<typeof BookingSchema>;

export const RanapSchema = z.object({
  id_pasien: z.number({
    required_error: "harus diisi",
  }),
  tanggal: z
    .string({
      required_error: "harus diisi",
    })
    .min(1, "harus diisi"),
  id_asuransi: z.number({
    required_error: "harus dipilih",
  }),
  status: z
    .string({
      required_error: "harus diisi",
    })
    .min(1, "harus diisi"),
  id_kelas: z.number({
    required_error: "harus dipilih",
  }),
  id_kamar: z.number({
    required_error: "harus dipilih",
  }),
  id_bed: z.number({
    required_error: "harus dipilih",
  }),
  keterangan: z
    .string({
      required_error: "harus diisi",
    })
    .nullable(),
});

export type Ranap = z.infer<typeof RanapSchema>;

export const SEPSchema = z.object({
  id_kunjungan: z.string().min(1, "harus diisi"),
  noKartu: z.string().min(1, "harus diisi"),
  tglSep: z.string().min(1, "harus diisi"),
  ppkPelayanan: z.string().min(1, "harus diisi"),
  jnsPelayanan: z.string().min(1, "harus diisi"),
  klsRawatHak: z.string().min(1, "harus diisi"),
  klsRawatNaik: z.string().min(1, "harus diisi"),
  pembiayaan: z.string().min(1, "harus diisi"),
  penanggungJawab: z.string().min(1, "harus diisi"),
  noMR: z.string().min(1, "harus diisi"),
  asalRujukan: z.string().min(1, "harus diisi"),
  tglRujukan: z.string().min(1, "harus diisi"),
  noRujukan: z.string().min(1, "harus diisi"),
  ppkRujukan: z.string().min(1, "harus diisi"),
  catatan: z.string().min(1, "harus diisi"),
  diagAwal: z.string().min(1, "harus diisi"),
  tujuan: z.string().min(1, "harus diisi"),
  eksekutif: z.string().min(1, "harus diisi"),
  cob: z.string().min(1, "harus diisi"),
  katarak: z.string().min(1, "harus diisi"),
  lakaLantas: z.string().min(1, "harus diisi"),
  noLP: z.string().min(1, "harus diisi"),
  tglKejadian: z.string().min(1, "harus diisi"),
  keterangan: z.string().min(1, "harus diisi"),
  suplesi: z.string().min(1, "harus diisi"),
  noSepSuplesi: z.string().min(1, "harus diisi"),
  kdPropinsi: z.string().min(1, "harus diisi"),
  kdKabupaten: z.string().min(1, "harus diisi"),
  kdKecamatan: z.string().min(1, "harus diisi"),
  tujuanKunj: z.string().min(1, "harus diisi"),
  flagProcedure: z.string().min(1, "harus diisi"),
  kdPenunjang: z.string().min(1, "harus diisi"),
  assesmentPel: z.string().min(1, "harus diisi"),
  noSurat: z.string().min(1, "harus diisi"),
  kodeDPJP: z.string().min(1, "harus diisi"),
  dpjpLayan: z.string().min(1, "harus diisi"),
  noTelp: z.string().min(1, "harus diisi"),
  user: z.string().min(1, "harus diisi"),
  status: z.number(),
});

export type SEPSch = z.infer<typeof SEPSchema>;

export const SKDPSchema = z.object({
  id_pasien: z.number().optional(),
  tanggal: z.string().min(1, "harus diisi"),
  id_jadwal: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  id_dokter: z.string({ required_error: "harus dipilih" }),
  id_klinik: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  id_asuransi: z.number({
    required_error: "harus dipilih",
    invalid_type_error: "harus dipilih",
  }),
  dokter: z.string().nullish(),
  klinik: z.string().nullish(),
  alasan: z.string().nullish(),
  rtl: z.string().nullish(),
});

export type SKDPSch = z.infer<typeof SKDPSchema>;

export type Kunjungan = {
  id: number;
  id_pasien: number;
  id_asuransi: number;
  created_at: string;
  tipe: string;
  tanggal: string;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  agama: string;
  ibu: string;
  hp: string;
  wn: string;
  tanggal_lahir: string;
  state: string;
  keterangan: null | string;
  kodebooking: string;
  no_rm: string;
  finger: number;
};

export type KunjunganRajal = {
  id_pasien: number;
  id_rajal: string;
  id_klinik: number;
  id_jadwal: number;
  id_pegawai: string;
  no_rm: string;
  nama: string;
  klinik: string;
  kode_klinik: string;
  dokter: string;
  id_asuransi: number;
  asuransi: string;
  id_kunjungan: string;
  id_proses: string;
  proses: Proses;
  antrian: number;
  tanggal: string;
  tanggal_kunjungan: string;
  tanggal_lahir: string;
  mulai: string;
  selesai: string;
  noka: string;
  id_rtl: number | null;
  rtl: string | null;
  sep: string;
  finger: number;
  tipe: number;
  billing: number;
  pelaksana: string[];
};

export type Proses =
  | "Menunggu Admisi"
  | "Skrining Perawat"
  | "Asesmen Perawat"
  | "Asesmen Dokter"
  | "Selesai Periksa"
  | "Validasi Obat"
  | "Obat diberikan"
  | "Batal";

export type KunjunganRanap = {
  id: number;
  id_pasien: number;
  id_asuransi: number;
  created_at: string;
  tipe: number;
  tanggal: string;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  agama: string;
  ibu: string;
  hp: string;
  wn: string;
  tanggal_lahir: string;
  state: string;
  keterangan: string;
  nomer: number;
  aktif: boolean;
  nonaktif_at: string;
  updated_at: string;
  id_kunjungan: string;
  id_bed: number;
  masuk: string;
  keluar: string;
  status: string;
  id_kelas: number;
  id_kamar: number;
  kamar_tipe: number;
  bed: string;
  asuransi: string;
  kodebooking: string;
  kamar: string;
};

export type MasterPasien = {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  agama: string;
  ibu: string;
  hp: string;
  wn: string;
  created_at: string;
  tanggal_lahir: string;
  state: string;
  keterangan: string;
  nomer: string;
  aktif: boolean;
  nonaktif_at: string;
  updated_at: string;
};

export type DetailPasien = MasterPasien & {
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  propinsi: string;
  id_bpjs: string;
  id_propinsi: number;
  id_kabupaten: number;
  id_kecamatan: number;
  id_kelurahan: string;
  asuransi: {
    id: number;
    id_asuransi: number;
    id_pasien: number;
    nama: string;
    nomer: string;
  }[];
};

export type Propinsi = {
  id: number;
  nama: string;
  id_bpjs: string;
  aktif: boolean;
};

export type Kabupaten = {
  id: number;
  id_propinsi: number;
  nama: string;
  id_bpjs: string;
  aktif: boolean;
};

export type Kecamatan = {
  id: number;
  id_kabupaten: number;
  nama: string;
  id_bpjs: string;
  aktif: boolean;
};

export type Desa = {
  id: string;
  id_kecamatan: number;
  nama: string;
  id_bpjs: string;
  aktif: boolean;
};

export type SEP = {
  id: number;
  id_kunjungan: string;
  noKartu: string;
  tglSep: string;
  ppkPelayanan: string;
  jnsPelayanan: string;
  klsRawatHak: string;
  klsRawatNaik: string;
  penanggungJawab: string;
  noMR: string;
  asalRujukan: string;
  tglRujukan: string;
  noRujukan: string;
  ppkRujukan: string;
  catatan: string;
  diagAwal: string;
  tujuan: string;
  eksekutif: string;
  cob: string;
  katarak: string;
  lakaLantas: string;
  noLP: string;
  tglKejadian: string;
  keterangan: string;
  suplesi: string;
  noSepSuplesi: string;
  kdPropinsi: string;
  kdKabupaten: string;
  kdKecamatan: string;
  tujuanKunj: string;
  flagProcedure: string;
  kdPenunjang: string;
  assesmentPel: string;
  noSurat: string;
  kodeDPJP: string;
  dpjpLayan: string;
  noTelp: string;
  user: string;
  status: number;
};

export type RujukanInternal = {
  no_rujuk: string;
  pertimbangan: string;
  tgl_kunjungan: string;
} & KunjunganRajal;

export type DataPesertaBPJS = {
  noKartu: string;
  nik: string;
  nama: string;
  pisa: string;
  sex: "L" | "P" | null;
  mr: {
    noMR: string;
    noTelepon: string;
  };
  tglLahir: string;
  tglCetakKartu: string;
  tglTAT: string;
  tglTMT: string;
  statusPeserta: {
    kode: string;
    keterangan: string;
  };
  provUmum: {
    kdProvider: string;
    nmProvider: string;
  };
  jenisPeserta: {
    kode: string;
    keterangan: string;
  };
  hakKelas: {
    kode: string;
    keterangan: string;
  };
  umur: {
    umurSekarang: string;
    umurSaatPelayanan: string;
  };
  informasi: {
    dinsos: string | null;
    prolanisPRB: string | null;
    noSKTM: string | null;
    eSEP: string | null;
  };
  cob: {
    noAsuransi: string | null;
    nmAsuransi: string | null;
    tglTMT: string | null;
    tglTAT: string | null;
  };
};
