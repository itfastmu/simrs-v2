type Meta = {
  page: number;
  perPage: number;
  lastPage: number;
  total: number;
};

type MetaAction =
  | { type: "page"; page: number }
  | { type: "perPage"; perPage: number }
  | { type: "lastPage"; lastPage: number }
  | { type: "total"; total: number }
  | { type: "setMeta"; setMeta: any };

type Filter = {
  klinik: number | string;
  dokter: string;
  mulai: string;
};

type FilterAction =
  | { type: "klinik"; klinik: number | string }
  | { type: "dokter"; dokter: string }
  | { type: "mulai"; mulai: string };
