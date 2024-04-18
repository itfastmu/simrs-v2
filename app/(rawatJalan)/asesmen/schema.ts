import { z } from "zod";

export const asuransi: { [key: number]: { nama: string; cn: string } } = {
  1: {
    nama: "Umum",
    cn: "text-sky-500",
  },
  2: {
    nama: "BPJS Kesehatan",
    cn: "text-green-500",
  },
  3: {
    nama: "BPJS Ketenagakerjaan",
    cn: "text-green-600",
  },
};

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
  klinik?: string;
  kode_klinik?: string;
  dokter?: string;
  jam_periksa?: string;
};

export type KlinikAsesmen = {
  isAnak: boolean;
  isRehab: boolean;
  isMata: boolean;
  isObg: boolean;
  isOrt: boolean;
  isGigi: boolean;
};

export type THasilSkrining = {
  id: number;
  id_kunjungan: string;
  id_tipe: number;
  nama: string;
  normal: boolean;
  indikasi?: string;
  pertanyaan: number[];
  nama_pertanyaans: string[];
  skor: (number | null)[];
  nama_skors: string[];
  tambahan: string[];
};

export type TFormImunisasi = {
  value: string;
  name:
    | "imunisasi.hepatitis_b"
    | "imunisasi.bcg"
    | "imunisasi.polio"
    | "imunisasi.campak"
    | "imunisasi.dpthib";
  list: number[];
};

export const AsesmenPerSchema = z.object({
  id_kunjungan: z.string(),
  // s: z.object({
  anamnesis: z.object({
    id: z.number().optional(),
    keluhan: z.string().min(1, "harus diisi"),
    penyakit: z.string().optional(),
    riwayat: z.string().array().min(0).optional(),
    riwayat_obat: z.string().array().min(0).optional(),
    riwayat_keluarga: z.string().array().min(0).optional(),
    alergi: z.string().optional(),
    riwayat_operasi: z
      .object({
        operasi: z.string(),
        tahun: z.number(),
      })
      .array()
      .min(0)
      .optional(),
  }),
  imunisasi: z
    .object({
      // id: z.number().optional(),
      hepatitis_b: z.number().array().optional(),
      bcg: z.number().array().optional(),
      polio: z.number().array().optional(),
      campak: z.number().array().optional(),
      dpthib: z.number().array().optional(),
    })
    .optional(),
  kajian: z
    .object({
      id: z.number().optional(),
      psikologis: z.string().optional(),
      perilaku: z.string().optional(),
      soseksk: z.string().array().length(6),
    })
    .optional(),
  kebidanan: z
    .object({
      id: z.number().optional(),
      menarche: z.string().min(1, "harus diisi"),
      lama_mens: z.string().min(1, "harus diisi"),
      siklus_teratur: z.boolean({
        required_error: "harus dipilih",
        invalid_type_error: "harus dipilih",
      }),
      siklus_mens: z.string().min(1, "harus diisi"),
      hpht: z.string(),
      hpl: z.string(),
      usia: z.string(),
      riwayat_ginekologi: z.string().array(),
      fluor_albus: z.string().optional().array().length(3),
      riwayat_kb: z.string().array(),
      keluhan_kb: z.string(),
      paritas_gpa: z
        .number({
          required_error: "harus diisi",
          invalid_type_error: "harus diisi",
        })
        .array(),
      diagnosis: z.string().min(1, "harus diisi"),
      rencana_asuhan: z.string().min(1, "harus diisi"),
      target: z.string().min(1, "harus diisi"),
      tindakan: z.string(),
    })
    .optional(),
  persalinan: z
    .object({
      id: z.number().optional(),
      tahun: z.number(),
      tempat: z.string(),
      umur_hamil: z.string(),
      jenis: z.string(),
      penolong: z.string(),
      penyulit: z.string(),
      kelamin_bayi: z.string(),
      berat_lahir: z.number(),
      keadaan: z.string(),
    })
    .array()
    .min(0)
    .optional(),
  // }),
  // o: z.object({
  fisik: z.object({
    id: z.number().optional(),
    gcs: z
      .number({
        required_error: "harus diisi",
        invalid_type_error: "harus diisi",
      })
      .array()
      .optional(),
    keadaan: z.string(),
    td: z
      .number({
        required_error: "harus diisi",
        invalid_type_error: "harus diisi",
      })
      .array(),
    hr: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    rr: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    temp: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    saturasi: z.number().or(z.nan()).optional(),
    bb: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    tb: z.number({
      required_error: "harus diisi",
      invalid_type_error: "harus diisi",
    }),
    tambahan: z.string(),
    mata: z
      .object({
        lama: z.string().array().length(2),
        visus: z.string().array().length(2),
      })
      .optional(),
  }),
  status_lokalis: z
    .object({
      id: z.number().optional(),
      posisi: z.object({
        x: z.number(),
        y: z.number(),
      }),
      catatan: z.string().optional(),
    })
    .array()
    .optional(),
  // }),
  fisio: z
    .object({
      id: z.number().optional(),
      fisik: z.object({
        inspeksi: z.string(),
        statis: z.string(),
        dinamis: z.string(),
        kognitif: z.string(),
        palpasi: z.string(),
        luas: z.string(),
        mmt: z.number().or(z.nan()).array().length(12),
        perkusi: z.string(),
        auskultasi: z.string(),
        nyeri: z.string(),
        tekan: z.number().or(z.nan()),
        gerak: z.number().or(z.nan()),
        diam: z.number().or(z.nan()),
        antropometri: z.string(),
        khusus: z.string(),
      }),
      diagnosis: z.tuple([
        z.string().min(1, "harus diisi"),
        z.string().min(1, "harus diisi"),
        z.string(),
      ]),
      intervensi: z.string().array(),
    })
    .optional(),
  keperawatan: z
    .object({
      id: z.number().optional(),
      diagnosis: z.string().min(1, "harus diisi"),
      rencana_asuhan: z.string().min(1, "harus diisi"),
      target: z.string().min(1, "harus diisi"),
      tindakan: z.string().optional(),
    })
    .optional(),
  deleted: z
    .object({
      status_lokalis: z.number().array().optional(),
      persalinan: z.number().array().optional(),
    })
    .optional(),
});

export type TAsesmenPer = z.infer<typeof AsesmenPerSchema>;

export type PersalinanKeb = {
  id?: number;
  id_pasien: number;
  tahun: number;
  tempat: string;
  umur_hamil: string;
  jenis: string;
  penolong: string;
  penyulit: string;
  kelamin_bayi: string;
  berat_lahir: number;
  keadaan: string;
  user?: string;
  status: number;
};

export type THasilPerawat = {
  kunjungan?: {
    id_pasien: number;
    no_rm: string;
    nama: string;
    tanggal_lahir: string;
    alamat: string;
    nama_klinik: string;
    kode_klinik: string;
    dokter: string;
  };
  anamnesis: {
    id: number;
    id_assesment: number;
    keluhan: string;
    penyakit: string;
    riwayat: string[] | null;
    riwayat_keluarga: string[] | null;
    riwayat_obat: string[] | null;
    alergi: string;
    user: string;
    nama_user: string;
    status: number;
    created_at: string;
  };
  kajian: {
    id?: number;
    psikologis: string;
    perilaku: string;
    soseksk: string[];
    user: string;
    jumlah?: number;
  };
  imunisasi?: {
    hepatitis_b?: number;
    bcg?: number;
    polio?: number;
    dpthib?: number;
    campak?: number;
  } | null;
  fisik: {
    id: number;
    gcs: number[];
    keadaan: string;
    td: number[];
    hr: number;
    rr: number;
    temp: number;
    saturasi: number | null;
    bb: number;
    tb: number;
    user: string;
    tambahan: string | null;
    mata?: {
      id: number;
      lama: string[];
      visus: string[];
    };
    status: number;
    created_at: string;
  };
  keperawatan?: {
    id: number;
    id_assesment: number;
    diagnosis: string;
    rencana_asuhan: string;
    target: string;
    tindakan: string;
    user: string;
    status: number;
    created_at: string;
  };
  kebidanan?: {
    id: number;
    id_assesment: number;
    menarche: string;
    lama_mens: string;
    siklus_teratur: boolean;
    siklus_mens: string;
    hpht: string | null;
    hpl: string | null;
    riwayat_ginekologi: string[];
    fluor_albus: (string | null)[];
    riwayat_kb: string[];
    keluhan_kb: string | null;
    paritas_gpa: number[];
    diagnosis: string;
    rencana_asuhan: string;
    target: string;
    tindakan: string;
    usia: string;
    user: string;
    status: number;
    created_at: string;
  };
  persalinan?: PersalinanKeb[];
  operasi:
    | {
        id?: number;
        id_pasien: number;
        operasi: string;
        tahun: number;
        user?: string;
        status: number;
      }[]
    | null;
  fisio?: {
    id?: number;
    id_assesment: number;
    fisik: {
      inspeksi: string;
      statis: string;
      dinamis: string;
      kognitif: string;
      palpasi: string;
      luas: string;
      mmt: number[];
      perkusi: string;
      auskultasi: string;
      nyeri: string;
      tekan: number;
      gerak: number;
      diam: number;
      antropometri: string;
      khusus: string;
    };
    diagnosis: string[];
    intervensi: string[];
    user: number;
    status: number;
  };
  status_lokalis?: {
    id?: number;
    id_assesment: number;
    posisi: {
      x: number;
      y: number;
    };
    catatan: string;
    user: number;
    status: number;
  }[];
};

export const listPenDahuluKeb = [
  "Asma",
  "Jantung",
  "Hipertensi",
  "DM",
  "Tiroid",
  "Epilepsi",
];

export const listPenKeluargaKeb = [
  "Kanker",
  "Penyakit Hati",
  "Hipertensi",
  "DM",
  "Penyakit Ginjal",
  "Penyakit Jiwa",
  "Kelainan Bawaan",
  "Hamil Kembar",
  "TBC",
  "Epilepsi",
  "Alergi",
];

export const listPenyakit = [
  "DM",
  "TB Paru",
  "Asma",
  "Hipertensi",
  "Hepatitis",
  "CKD",
];

export const AsesmenDokSchema = z.object({
  id_kunjungan: z.string(),
  anamnesis: z.object({
    id: z.number().optional(),
    keluhan: z.string().min(1, "harus diisi"),
    penyakit: z.string().optional(),
    riwayat: z.string().array().min(0),
    riwayat_obat: z.string().array().min(0).optional(),
    riwayat_keluarga: z.string().array().min(0),
    alergi: z.string().optional(),
    imunisasi: z.string().optional(),
  }),
  // o: z.object({
  fisik: z
    .object({
      id: z.number().optional(),
      gcs: z.number().array().optional(),
      keadaan: z.string({ required_error: "harus dipilih" }),
      td: z.number().nullish().array().optional(),
      hr: z.number().nullish(),
      rr: z.number().nullish(),
      temp: z.number().or(z.string()).nullish(),
      saturasi: z.number().or(z.nan()).optional(),
      bb: z.number().or(z.string()).nullish(),
      tb: z.number().or(z.string()).nullish(),
      tambahan: z.string().optional(),
      // gcs: z
      //   .number({
      //     required_error: "harus diisi",
      //     invalid_type_error: "harus diisi",
      //   })
      //   .array()
      //   .optional(),
      // keadaan: z.string({ required_error: "harus dipilih" }),
      // td: z
      //   .number({
      //     required_error: "harus diisi",
      //     invalid_type_error: "harus diisi",
      //   })
      //   .array(),
      // hr: z.number({
      //   required_error: "harus diisi",
      //   invalid_type_error: "harus diisi",
      // }),
      // rr: z.number({
      //   required_error: "harus diisi",
      //   invalid_type_error: "harus diisi",
      // }),
      // temp: z.number({
      //   required_error: "harus diisi",
      //   invalid_type_error: "harus diisi",
      // }),
      // saturasi: z.number().or(z.nan()).optional(),
      // bb: z.number({
      //   required_error: "harus diisi",
      //   invalid_type_error: "harus diisi",
      // }),
      // tb: z.number({
      //   required_error: "harus diisi",
      //   invalid_type_error: "harus diisi",
      // }),
      // tambahan: z.string(),
      mata: z
        .object({
          lama: z.string().array().length(2),
          visus: z.string().array().length(2),
        })
        .optional(),
    })
    .optional(),
  status_lokalis: z
    .object({
      id: z.number().optional(),
      posisi: z.object({
        x: z.number(),
        y: z.number(),
      }),
      catatan: z.string().optional(),
    })
    .array()
    .optional(),
  // }),
  // a: z.object({
  diagnosis: z
    .object({
      id: z.number().optional(),
      diagnosis: z.string(),
      icd10: z
        .object({
          id: z.string(),
          nama: z.string(),
        })
        .nullish(),
      primer: z.boolean(),
    })
    .array()
    .min(1),
  // }),
  asuhan: z.string().min(1, "harus diisi"),
  target: z.string().min(1, "harus diisi"),
  asuhantarget: z
    .object({
      id: z.number().optional(),
    })
    .optional(),
  // i: z.object({
  tindakan: z
    .object({
      id: z.number().optional(),
      tindakan: z.string(),
      icd9: z
        .object({
          id: z.string(),
          nama: z.string(),
        })
        .nullish(),
    })
    .array()
    .min(1, "harus diisi"),
  laborat: z
    .object({
      id: z.number().optional(),
      diagnosis: z.string().min(1, "harus diisi"),
      informasi: z.string().min(1, "harus diisi"),
      detail: z.number().array(),
    })
    .optional(),
  radiologi: z
    .object({
      id: z.number().optional(),
      diagnosis: z.string().min(1, "harus diisi"),
      informasi: z.string().min(1, "harus diisi"),
      detail: z.number().array(),
    })
    .optional(),
  nonracik: z
    .object({
      id: z.number().optional(),
      id_poa: z.number(),
      nama_obat: z.string(),
      // sediaan: z.string().optional(),
      dosis: z.number().or(z.nan()).optional(),
      rute: z.string().nullish(),
      waktu: z.string().array().length(3),
      jumlah: z.number(),
      id_detail: z.number().nullish(),
    })
    .array()
    .optional(),
  racikan: z
    .object({
      id: z.number().optional(),
      nama: z.string(),
      metode: z.string().optional(),
      jumlah: z.number(),
      rute: z.string().nullish(),
      waktu: z.string().array().length(3),
      tipe: z.enum(["dtd", "nondtd"]),
      detail: z
        .object({
          id: z.number().optional(),
          id_poa: z.number(),
          nama_obat: z.string(),
          dosis: z.number(),
          jumlah: z.number(),
        })
        .array()
        .min(1),
    })
    .array()
    .optional(),
  // }),
  rehabmedik: z
    .object({
      id: z.number().optional(),
      inspeksi: z.string(),
      statis: z.string(),
      dinamis: z.string(),
      kognitif: z.string(),
      palpasi: z.string(),
      luas: z.string(),
      mmt: z.number().or(z.nan()).nullable().array(),
      perkusi: z.string(),
      auskultasi: z.string(),
      nyeri: z.string(),
      tekan: z.number().or(z.nan()).nullable(),
      gerak: z.number().or(z.nan()).nullable(),
      diam: z.number().or(z.nan()).nullable(),
      antropometri: z.string(),
      khusus: z.string(),
      evaluasi: z.string(),
    })
    .optional(),
  mata: z
    .object({
      id: z.number().optional(),
      funduskopi: z.string().array(),
      tonometri: z.string().array(),
      anel: z.string().array(),
    })
    .optional(),
  orto: z
    .object({
      id: z.number().optional(),
      injury: z.string().optional(),
      waktu: z.string().optional(),
      penanganan: z.string().optional(),
      kepala: z.string().optional(),
      leher: z.string().optional(),
      thorak: z.string().optional(),
      abdomen: z.string().optional(),
      ekstremitas: z.string().optional(),
      prognosis: z.string().array().length(6),
    })
    .optional(),
  deleted: z
    .object({
      status_lokalis: z.number().array().optional(),
      diagnosis: z.number().array().optional(),
      tindakan: z.number().array().optional(),
      rad: z.boolean().optional(),
      detail_rad: z.number().array().optional(),
      lab: z.boolean().optional(),
      detail_lab: z.number().array().optional(),
      nonracik: z.number().array().optional(),
      racikan: z.number().array().optional(),
      detail_racik: z.number().array().optional(),
    })
    .optional(),
});

export type THasilDokter = {
  kunjungan?: {
    id_pasien: number;
    no_rm: string;
    nama: string;
    tanggal_lahir: string;
    alamat: string;
    nama_klinik: string;
    kode_klinik: string;
    dokter: string;
  };
  anamnesis: {
    id: number;
    id_assesment: number;
    keluhan: string;
    penyakit: string | null;
    riwayat: string[] | null;
    riwayat_keluarga: string[] | null;
    riwayat_obat: string[] | null;
    alergi: string;
    user: string;
    nama_user: string;
    status: number;
    created_at: string;
  };
  fisik?: {
    id: number;
    gcs: number[];
    keadaan: string;
    td: number[];
    hr: number;
    rr: number;
    temp: number;
    saturasi: number | null;
    bb: number;
    tb: number;
    user: string;
    tambahan: string | null;
    mata?: {
      id: number;
      lama: string[];
      visus: string[];
    };
    status: number;
    created_at: string;
  };
  status_lokalis?: {
    id?: number;
    id_assesment: number;
    posisi: {
      x: number;
      y: number;
    };
    catatan: string;
    user: number;
    status: number;
  }[];
  diagnosis: {
    id: number;
    icd10: {
      id: string;
      nama: string;
    };
    diagnosis: string;
    primer: boolean;
  }[];
  asuhantarget: {
    id: number;
    id_assesment: number;
    asuhan: string;
    target: string;
    created_at: null;
    user: string;
    status: number;
  };
  tindakan: {
    id: number;
    icd9: {
      id: string;
      nama: string;
    };
    tindakan: string;
  }[];
  laborat?: {
    id: number;
    id_kunjungan: string;
    id_perujuk: string;
    perujuk_luar: string;
    diagnosis: string;
    informasi: string;
    status: number;
    created_at: string;
    user: string;
    tipe: number;
    jenis: string;
    detail: number[];
    nama_detail: string[];
  };
  radiologi?: {
    id: number;
    id_kunjungan: string;
    id_perujuk: string;
    perujuk_luar: string;
    diagnosis: string;
    informasi: string;
    status: number;
    created_at: string;
    user: string;
    tipe: number;
    jenis: string;
    detail: number[];
    nama_detail: string[];
  };
  nonracik?: {
    id_resep: number;
    id_detail: number;
    id_kunjungan: string;
    nama_obat: string;
    waktu: string[];
    rute: string;
    id_poa: number;
    numerator: number;
    harga: number;
    sediaan: string;
    kekuatan: string;
    jumlah: number;
  }[];
  racik?: {
    id_resep: number;
    id_kunjungan: string;
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
          sediaan: string;
          dosis: number;
          jumlah: number;
          id_poa: number;
          nama: string;
          stok: number;
          id_satuan: number;
          restriksi: null | string;
          id_zat: number;
          id_tipe: number;
          id_sediaan: number;
          harga_dasar: number;
          harga: number;
        }[]
      | null;
  }[];
  orto?: {
    id: number;
    injury: string;
    waktu: string;
    penanganan: string;
    kepala: string;
    leher: string;
    thorak: string;
    abdomen: string;
    ekstremitas: string;
    prognosis: string[];
  };
  mata?: {
    id: number;
    funduskopi: string[];
    tonometri: string[];
    anel: string[];
  };
  rehabmedik?: {
    id: number;
    inspeksi: string;
    statis: string;
    dinamis: string;
    kognitif: string;
    palpasi: string;
    luas: string;
    mmt: number[];
    perkusi: string;
    auskultasi: string;
    nyeri: string;
    tekan: number;
    gerak: number;
    diam: number;
    antropometri: string;
    khusus: string;
    evaluasi: string;
  };
};

export type TAsesmenDok = z.infer<typeof AsesmenDokSchema>;

export type RacikState = {
  modal: boolean;
  tipe?: "dtd" | "nondtd";
  index?: number;
};
export type RacikAction = { type: "setRacik"; racik: RacikState };
