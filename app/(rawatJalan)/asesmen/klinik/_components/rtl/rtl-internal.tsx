import { Input } from "@/components/form";
import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlInterSchema, TRtlInter } from "../../../schema";
import { useEffect, useState } from "react";
import { load_klinik } from "./rtl-models";
import { toast } from "react-toastify";
import { fetch_api } from "@/lib/fetchapi";

export default function RtlInternal({
  IKunjungan
}: {
  IKunjungan: { [key: string]: any } | null
}) {
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        keterangan: data.keterangan,
        id_klinik: data.klinik,
        tanggal: data.tanggal,
      }
    }

    console.log(input); return;

    try {
      setIsLoading(true);
      const insert = await fetch_api("POST", "/rs/kunjungan/rtl");
      switch (insert?.status) {
        case 201: {
          toast.success("Berhasil disimpan")
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
  }, [])

  useEffect(() => console.log(errors), [errors])

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
                isError={ !!errors.klinik }
              />
            )}
          />
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
