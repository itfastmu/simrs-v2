export type Pegawai = {
  id: string;
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  email: string;
  status_kepegawaian: string;
  ibu: string;
  nakes: boolean;
  aktif: boolean;
  id_profesi: number;
  jenis_kelamin: string;
};
export type Document = {
  id: number;
  jenis: string;
  nomer: string;
  path: string;
  exp: string;
  aktif: boolean;
  id_pegawai: string;
};
export type DetailPegawai = Pegawai & {
  profesi: string;
  id_jabatan: number;
  id_pangkat: number;
  id_pendidikan: number;
  documents: Document[];
};
export type Pendidikan = {
  id: number;
  aktif: boolean;
  nama: string;
};
export type PendidikanPegawai = {
  id: number;
  id_pendidikan: number;
  created_at: Date;
  aktif: boolean;
  id_pegawai: string;
  nama: string;
};
export type JabatanPegawai = Omit<PendidikanPegawai, "id_pendidikan"> & {
  id_jabatan: number;
  tanggal: Date;
};
export type PangkatPegawai = Omit<PendidikanPegawai, "id_pendidikan"> & {
  id_pangkat: number;
};
export type Profesi = {
  id: number;
  nama: string;
  aktif: boolean;
};
