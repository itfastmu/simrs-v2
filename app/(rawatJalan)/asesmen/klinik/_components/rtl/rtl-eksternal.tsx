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
  }

  const [ choiceKlinik, setChoiceKlinik] = useState<MyOptions>([]);
  const loadKlinik = async (searchText: string):Promise<MyOptions> =>{
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

    const input = {
      status: data.tipe_rtl,
      detail: {
        ...inputExt,
        tujuan: data.tujuan,
        poli: data.poli,
        jns_pelayanan: data.jns_pelayanan,
        tipe_rujukan: data.tipe_rujukan,
        catatan: data.catatan,
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
