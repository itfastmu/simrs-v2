"use client"

import { Input } from "@/components/form";
import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlKontrolSchema, TRtlKontrol } from "../../../schema";
import { useEffect, useState } from "react";
import { load_klinik, load_dokter } from "./rtl-models";

export default function RtlKontrol() {
  
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

  // inisialisasi dokter
  const [optsDokter, setOptsDokter] = useState([]);
  async function loadDokter() {
    try {
      const getDokter = await load_dokter();
      if (getDokter?.data) {
        const doktermap = getDokter.data.map((d: any) => {
          const map = {
            label: d.nama,
            value: d.id
          }
          return map;
        })
        setOptsDokter(doktermap);
      }
    } catch (error) {
      console.log(error);
    }
  } 
  
  // inisialisasi form
  const { register, control, handleSubmit, setValue,
    formState: { errors },
  } = useForm<TRtlKontrol>({
    defaultValues: {
      tipe_rtl: "kontrol",
      tanggal: new Date().toLocaleDateString('fr-CA')
    },
    resolver: zodResolver(RtlKontrolSchema)
  });

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  useEffect(() => {
    loadKlinik();
    loadDokter();
  }, [])

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Dokter */}
        <div>
          <label htmlFor="dokter" className="inline-block text-sm mb-1.5">Dokter</label>
          <Controller
            control={control}
            name="dokter"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Dokter"
                onChange={(val: any) => onChange(val.value)}
                options={ optsDokter }
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
        {/* Poliklinik */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Perkiraan Kontrol(Optional)</label>
          <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                onChange={(val: any) => {
                  const d = new Date()
                  d.setDate(d.getDate()+Number(val.value))
                  if(d.getDay()===7){
                    d.setDate(d.getDate()+1)
                  }
                  
                  setValue("tanggal", d.toLocaleDateString('fr-CA'));
                  return val.value
                }}
                options={[{value:7,label:"1 Minggu"},{value:30,label:"30 Hari"}]}
                // value={[{value:7,data:"1 Minggu"},{value:30,data:"30 Hari"}].find(
                //   (c) => c.value === value
                // )}
                placeholder="Pilih Perkiraan"
              />
        </div>
        {/* Tanggal */}
        <div>
          <label htmlFor="tanggal" className="inline-block text-sm mb-1.5">Tanggal</label>
          <Input type="date" id="tanggal"
            { ...register('tanggal') }
          />
        </div>
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
