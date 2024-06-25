"use client"

import { Input } from "@/components/form";
import { MyOption, SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlKontrolSchema, TRtlKontrol } from "../../../schema";
import { useEffect, useState } from "react";
import { load_klinik, load_dokter, load_jadwal } from "./rtl-models";
import { fetch_api } from "@/lib/fetchapi";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function RtlKontrol({
  IKunjungan
}: {
  IKunjungan: { [key: string]: any } | null
}) {
  
  // inisialisasi klinik
  const [optsKlinik, setOptsKlinik] = useState([]);
  async function loadKlinik() {
    try {
      const getKlinik = await load_klinik();
      if (getKlinik?.data) {
        const klinikmap = getKlinik.data.map((d: any) => {
          const map = {
            label: d.nama,
            value: d.id,
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

  const [optsJadwal, setOptsJadwal] = useState([]);
  const [jadwalLoading, setJadwalLoading] = useState<boolean>(false);
  async function loadJadwal(){
    setJadwalLoading(true)
    try {
      const jadwal = await load_jadwal({
        tanggal: watch('tanggal'),
        dokter: watch('dokter'),
        id_klinik: watch('klinik'),
      });
      
      switch(jadwal.status) {
        case 200: {
          setOptsJadwal(jadwal.resp.data);
          if (jadwal.resp.data.length === 1) {
            setValue('jadwal', jadwal.resp.data[0].id);
          }
        } break;
        case 404: {
          setOptsJadwal([]);
        } break;
        case 500: {
          throw new Error("500");
        }
      }

    } catch (error: any) {
      console.log(error);
    } finally {
      setJadwalLoading(false);
    }
  }
  
  // inisialisasi form
  const { register, control, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<TRtlKontrol>({
    defaultValues: {
      tipe_rtl: "kontrol",
      tanggal: new Date().toLocaleDateString('fr-CA')
    },
    resolver: zodResolver(RtlKontrolSchema)
  });

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
        id_klinik: data.klinik,
        id_dokter: data.dokter,
        id_jadwal: data.jadwal,
        tanggal: data.tanggal
      }
    }
    console.log(input); return;

    try {
      setIsLoading(true);
      const insert = await fetch_api("POST", "/rs/kunjungan/rtl", {
        body: JSON.stringify(input)
      });
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
    loadKlinik();
    loadDokter();
    loadJadwal();
  }, [])

  useEffect(() => {
    const w = watch((data, { name, type }) => {
      if (['dokter', 'tanggal'].includes(name ?? "")) {
        loadJadwal();
      }
    });
    return () => w.unsubscribe();
  }, [watch])

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Dokter */}
        <div>
          <label htmlFor="dokter" className="inline-block text-sm mb-1.5">Dokter</label>
          <Controller
            defaultValue={ IKunjungan?.id_pegawai }
            control={control}
            name="dokter"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Dokter"
                onChange={(val: any) => onChange(val.value)}
                options={ optsDokter }
                value={ optsDokter.find((f: any) => f.value === value) }
                isError={ !!errors.dokter }
              />
            )}
          />
        </div>
        {/* Poliklinik */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Klinik</label>
          <Controller
            defaultValue={ IKunjungan?.id_klinik }
            control={control}
            name="klinik"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Klinik"
                onChange={(val: any) => onChange(val.value)}
                options={ optsKlinik }
                value={ optsKlinik.find((f: any) => f.value === value) }
                isError={ !!errors.klinik }
                isDisabled
              />
            )}
          />
        </div>
        {/* Poliklinik */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Perkiraan Kontrol (Optional)</label>
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
                options={[
                  {value:7,label:"1 Minggu"},
                  {value:30,label:"30 Hari"}
                ]}
                placeholder="Pilih Perkiraan"
              />
        </div>
        {/* Tanggal */}
        <div>
          <label htmlFor="tanggal" className="inline-block text-sm mb-1.5">Tanggal</label>
          <Input type="date" id="tanggal"
            isError={ !!errors.tanggal }
            { ...register('tanggal') }
          />
        </div>
      </div>
      <div className="my-3.5">
          {
            jadwalLoading 
              ? <>Loading...</>
              : ( optsJadwal.length === 0
                ? <p className="text-center text-red-800 p-2 bg-red-100 border border-red-300 rounded-md">
                    Tidak ada jadwal
                  </p>
                : <div className="grid flow-col gap-2">
                    { optsJadwal?.map((v: any, i) => (
                      <div key={i}
                        onClick={ () => setValue('jadwal', v.id) } 
                        className={ cn("grid grid-cols-7 justify-between items-center py-2 px-3 bg-cyan-200 rounded-md hover:bg-cyan-300", 
                          v.id === watch('jadwal') && "bg-green-300"
                        )}
                      >
                        <p className="text-sky-900 col-span-4">
                          <small className="text-slate-500">Jam Praktik : </small> 
                          <span className="font-semibold tracking-wide">{ v.mulai } - { v.selesai }</span> 
                          <small className="text-black"> WIB</small>
                        </p>
                        <p className="text-sky-900 col-span-2"><small className="text-slate-500">
                          Kuota : </small> 
                          <span className="font-semibold">{ v.kuota }</span>
                        </p>
                        { v.id === watch('jadwal') && (
                          <p className="font-bold text-lg mx-2 text-green-700 justify-self-end">&#10003;</p>
                        )}
                      </div>
                    )) }
                </div>
              )
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
