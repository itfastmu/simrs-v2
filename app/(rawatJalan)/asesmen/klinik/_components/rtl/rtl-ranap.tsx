"use client"
import { useEffect, useState } from "react";
import { Input } from "@/components/form";
import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlRanapSchema, TRtlRanap } from "../../../schema";
import { load_klinik, load_dokter } from "./rtl-models";

export default function RtlRanap() {
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
    const { register, control, handleSubmit,
      formState: { errors },
    } = useForm<TRtlRanap>({
      defaultValues: {
        tipe_rtl: "ranap",
        tanggal: new Date().toLocaleDateString('fr-CA')
      },
      resolver: zodResolver(RtlRanapSchema)
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
        <input type="hidden" { ...register("id") } />
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
