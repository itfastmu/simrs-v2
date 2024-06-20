import { Button } from "@/components/button";
import { AsyncSelectInput, MyOptions, SelectInput } from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { RtlEksterSchema, TRtlEkster } from "../../../schema";
import { Input, InputArea } from "@/components/form";
import { fetch_api } from "@/lib/fetchapi";
import { useEffect, useState } from "react";

export default function RtlEksternal() {

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
    resolver: zodResolver(RtlEksterSchema)
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

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <input type="hidden" { ...register("sep") } />
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
            name="tujuan_rujuk"
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
            name="klinik"
            render={({ field: { onChange, value } }) => (
              <AsyncSelectInput
                cacheOptions
                noOptionsMessage={(e) => "Data tidak ditemukan"}
                placeholder="Poli Tujuan"
                loadOptions={ loadKlinik }
                defaultOptions={ choiceKlinik }
                value={choiceKlinik.find(
                  (val) => val.value === value
                )}
                onChange={(option:any) => onChange(option?.value)}
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
                placeholder="Pilih Jenis"
                onChange={(val: any) => onChange(val.value)}
                options={ choiceTipeRujukan }
                value={ choiceTipeRujukan.find(f => f.value === value) }
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="catatan" className="inline-block text-sm mb-1.5">Catatan</label>
          <InputArea id="catatan"
            { ...register('catatan') }
          ></InputArea>
        </div>
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
