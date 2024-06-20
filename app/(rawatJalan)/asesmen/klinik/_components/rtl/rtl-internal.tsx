import { Input } from "@/components/form";
import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlInterSchema, TRtlInter } from "../../../schema";
import { useEffect, useState } from "react";
import { load_klinik } from "./rtl-models";

export default function RtlInternal() {
  const ketChoice = [
    { label: 'Konsul', value: 'konsul' },
    { label: 'Alih Rawat', value: 'alih' },
    { label: 'Rawat Bersama', value: 'raber' },
  ]
  // inisialisasi klinik
  const [optsKlinik, setOptsKlinik] = useState([]);
  async function loadKlinik() {
    try {
      const getKlinik = await load_klinik();
      if (getKlinik?.data) {
        const klinikmap = getKlinik.data.map((d: any) => {
          const map = {
            label: d.nama,
            value: d.id
          }
          return map;
        })
        setOptsKlinik(klinikmap);
      
      }
    } catch (error) {
      console.log(error);
    }
  } 
  
  // inisialisasi form
  const { register, control, handleSubmit,
    formState: { errors },
  } = useForm<TRtlInter>({
    defaultValues: {
      tipe_rtl: "internal",
      tanggal: new Date().toLocaleDateString('fr-CA')
    },
    resolver: zodResolver(RtlInterSchema)
  });

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  useEffect(() => {
    loadKlinik();
  }, [])

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Tanggal */}
        <div>
          <label htmlFor="tanggal" className="inline-block text-sm mb-1.5">Tanggal</label>
          <Input type="date" id="tanggal"
            { ...register('tanggal') }
          />
        </div>
        {/* Keterangan */}
        <div>
          <label htmlFor="ket" className="inline-block text-sm mb-1.5">Keterangan</label>
          <Controller
            defaultValue="konsul"
            control={control}
            name="keterangan"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Keterangan"
                onChange={(val: any) => onChange(val.value)}
                options={ ketChoice }
                value={ ketChoice.find(f => f.value === value) }
              />
            )}
          />
        </div>
        {/* Poliklinik */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Klinik</label>
          <Controller
            control={control}
            name="klinik"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Klinik"
                onChange={(val: any) => onChange(val.value)}
                options={ optsKlinik }
              />
            )}
          />
        </div>
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
