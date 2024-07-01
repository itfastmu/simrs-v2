import { Button } from "@/components/button";
import { AsyncSelectInput, MyOptions, SelectInput } from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { RtlEksterSchema, TRtlEkster } from "../../../schema";
import { Input, InputArea } from "@/components/form";
import { fetch_api } from "@/lib/fetchapi";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { TbTrash } from "react-icons/tb";

export default function RtlEksternal({
  IKunjungan = null, diagnosa = null
}: {
  IKunjungan: { [key: string]: any } | null,
  diagnosa: { [key: string]: any } | null,
}) {

  const choiceTipeRujukan = [
    { value:"0",label:"Penuh" },
    { value:"1",label:"Parsial" }
  ]

  const choiceJenisPel = [
    { value:"1", label:"Rawat Inap" },
    { value:"2", label:"Rawat Jalan" }
  ]

  // inisialisasi form
  const { register, control, handleSubmit,
    formState: { errors },
  } = useForm<TRtlEkster>({
    defaultValues: {
      tipe_rtl: "eksternal",
    },
    resolver: zodResolver(RtlEksterSchema),
  });

  const [choiceFktl, setChoiceFktl] = useState<MyOptions>([]);
  const loadFktl = async (searchText: string = ""):Promise<MyOptions> => {
    if (searchText.length > 2) {
      try {
        const load = await fetch_api('GET', '/rs/rujukan/referensi/fktl', { 
          params: {
            keyword: searchText
          }
        })
        // if (load.resp.data) {
          const choice = load.resp.data.map((v: any) => {
            const d = {
              label: v.nama,
              value: v.kode
            }
            return d;
          })
          setChoiceFktl(choice);
          return choice;
        // }
      } catch (error) {
        console.log(error);
        return []
      } 

    } else return [];
  }

  const [ choiceKlinik, setChoiceKlinik] = useState<MyOptions>([]);
  const loadKlinik = async (searchText: string):Promise<MyOptions> => {
    if (searchText.length > 2) {
      try {
        const load = await fetch_api('GET','/rs/rujukan/referensi/klinik',{
          params: {
            keyword: searchText
          }
        })
        
        const choice = load.resp.data.map((v: any) => {
          const d = {
            label: v.nama,
            value: v.kode
          }
          return d;
        })
        setChoiceKlinik(choice);
        return choice;
      } catch (error) {
        console.log(error);
        return[]
      }
    
    } else return [];
  }

  // load list icd10
  const loadIcd10 = async (search: string) => {
    try {
      const load = await fetch_api("GET", '/rs/icd/10', {
        params: {
          keyword: search,
          perPage: 25
        }
      })

      let choice: any = [];
      load.resp?.data.map((v: any) => {
        const m = {
          label: v.deskripsi,
          value: v.id,
          primer: false,
          extend: true
        }

        choice.push(m);
      })
      return choice;

    } catch (error) { return [] }
  }

  const [diagState, setDiagState] = useState<{ [k: string]: any }[] | []>([]);
  const diagStateAdd = (op: { [k: string]: any } | null) => {
    if (op && diagState.length > 0) {
      const prm = diagState.some((s) => s.primer === true);
      
      if (prm) {
        setDiagState([...diagState, op])
      
      } else {
        const newop = { ...op, primer: true };
        setDiagState([...diagState, newop]);
      }              
    } else {
      setDiagState([...diagState, { ...op, primer: true }]);
    }
    
  }

  const diagStateDel = (code: string) => {
    const flt = diagState.filter((f) => f.value !== code);
    const prm = flt.some((s) => s.primer === true);

    if (prm) {
      setDiagState(flt);
    
    } else {
      if (flt.length > 0) {
        flt[0].primer = true;
        setDiagState(flt);

      } else {
        setDiagState([])
      }
    }
    
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pulangSubmitHandler: SubmitHandler<any> = async (data) => {
    const inputExt = IKunjungan 
      ? Object.fromEntries(
      Object.entries(IKunjungan).filter(([i, v]) => (
        v != null && ['id_kunjungan', 'sep', 'id_klinik', 'no_rm', 'noka'].includes(i)
      )))
      : {}

    // diagnosa
    const diag: any = [];
    diagState.map(v => v.primer ? diag.unshift(v.value) : diag.push(v.value));

    const input = {
      status: data.tipe_rtl,
      detail: {
        ...inputExt,
        tujuan: data.tujuan,
        poli: data.poli,
        jns_pelayanan: data.jns_pelayanan,
        tipe_rujukan: data.tipe_rujukan,
        catatan: data.catatan,
        diagnosa: diag
      }
    }

    // console.log(input); return;

    try {
      setIsLoading(true);
      const insert = await fetch_api("POST", "/rs/kunjungan/rtl");
      switch (insert?.status) {
        case 201: {
          toast.success("Berhasil disimpan")
          router.replace(`/list-pasien?user=Dokter&id=${IKunjungan?.id_pegawai.replaceAll(".", "_")}`);
        } break;
        case 500: {
          throw new Error(String(insert?.status))
        }
      }
    
    } catch (error) { 
      switch (error) {
        case "500": {
          toast.error("Terjadi kesalahan saat pemrosesan data");
        } break;
      }
    
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (diagnosa && Array.isArray(diagnosa)) {
      let diagInit = [];
      for (const v of diagnosa) {
        const ob = {
          label: v.icd10.nama,
          value: v.icd10.id,
          primer: v.primer,
          extend: false
        }
        diagInit.push(ob);
      }
      setDiagState(diagInit);
    }
  }, [])
  

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <p className="text-xs my-2.5">
        <span className="text-red-500">*</span>
        <span className="text-slate-500">) Pencairan minimal 3 karakter</span>
      </p>
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Tujuan */}
        <div>
          <label htmlFor="tujuan" className="inline-block text-sm mb-1.5">Tujuan Rujuk <span className="text-red-500"> * </span></label>
          <Controller
            control={control}
            name="tujuan"
            render={({ field: { onChange, value } }) => (
              <AsyncSelectInput
                cacheOptions
                noOptionsMessage={(e) => "Data tidak ditemukan"}
                placeholder="RS Tujuan"
                loadOptions={ loadFktl }
                defaultOptions={choiceFktl}
                value={choiceFktl.find(
                  (val) => val.value === value
                )}
                onChange={(option:any) => onChange(option?.value)}
                isError={ !!errors.tujuan }
              />
            )}
          />
        </div>
        {/* Poliklinik */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">
            Klinik
            <span className="text-red-500"> * </span>
          </label>
          <Controller
            control={control}
            name="poli"
            render={({ field: { onChange, value } }) => (
              <AsyncSelectInput
                cacheOptions
                noOptionsMessage={(e) => "Data tidak ditemukan"}
                placeholder="Klinik Spesialis Tujuan"
                loadOptions={ loadKlinik }
                defaultOptions={ choiceKlinik }
                value={choiceKlinik.find(
                  (val) => val.value === value
                )}
                onChange={(option:any) => onChange(option?.value)}
                isError={ !!errors.poli }
              />
            )}
          />
        </div>
        {/* Jenis Pelayanan */}
        <div>
          <label htmlFor="jenis" className="inline-block text-sm mb-1.5">Jenis Pelayanan</label>
          <Controller
            defaultValue="2"
            control={control}
            name="jns_pelayanan"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Jenis"
                onChange={(val: any) => onChange(val.value)}
                options={ choiceJenisPel }
                value={ choiceJenisPel.find(f => f.value === value) }
              />
            )}
          />
        </div>
        {/* Tipe Rujukan */}
        <div>
          <label htmlFor="tipe" className="inline-block text-sm mb-1.5">Tipe Rujukan</label>
          <Controller
            defaultValue="0"
            control={control}
            name="tipe_rujukan"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Tipe"
                onChange={(val: any) => onChange(val.value)}
                options={ choiceTipeRujukan }
                value={ choiceTipeRujukan.find(f => f.value === value) }
              />
            )}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="catatan" className="inline-block text-sm mb-1.5">Rekomendasi/Intruksi</label>
          <InputArea id="catatan"
            placeholder="Tuliskan rencana asuhan yg dibutuhkan difaskes rujukan"
            { ...register('catatan') }
          ></InputArea>
        </div>
        <div className="col-span-2">
          <label htmlFor="diagnosa" className="inline-block text-sm mb-1.5">Diagnosa</label>
          <AsyncSelectInput 
            loadOptions={ loadIcd10 }
            placeholder="Pilih Diagnosa"
            onChange={ (op) => diagStateAdd(op ?? null) }
          />
        </div>
      </div>

      {/* List Diagnosa */}
      <div className="my-2.5">
        { diagState?.length === 0 
          ? <p className="text-center text-xs text-red-800 p-1.5 bg-red-100 border border-red-300 rounded-md">
            Tidak ada diagnosa
          </p>
          : <table className="w-full"> 
              <thead className="bg-slate-200 tracking-wide">
                <tr>
                  <th className="text-xs py-1 text-center">Kode</th>
                  <th className="text-xs text-center">Deskripsi</th>
                  <th className="text-xs text-center">Primer</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { diagState?.map((v: any, i) => (
                  <tr key={i} className="bg-slate-50 text-sm text-center">
                    <td className="py-1 px-1.5">{ v.value }</td>
                    <td>{ v.label }</td>
                    <td>{ v.primer ? (<span className="text-green-500">&#10003;</span>) : "" }</td>
                    <td>
                      <button type="button" onClick={() => diagStateDel(v.value) }>
                        <TbTrash className="text-md text-red-500 mx-1.5"/>
                      </button>
                    </td>
                  </tr>
                )) }
              </tbody>
            </table>
        }
        
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" 
        disabled={ isLoading }
        loading={ isLoading }
      >
          Simpan
      </Button>
    </form>
  )
}
