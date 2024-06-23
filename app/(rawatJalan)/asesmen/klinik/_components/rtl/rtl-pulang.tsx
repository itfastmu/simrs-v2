"use client"

import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlPulangSchema, TRtlPulang } from "../../../schema";
import { useEffect, useState } from "react";
import { fetch_api } from "@/lib/fetchapi";
import { toast } from "react-toastify";

export default function RtlPulang({
  IKunjungan
}: {
  IKunjungan: { [key: string]: any } | null
}) {
  
  const {
    register,
    formState: { errors },
    control,
    handleSubmit
  } = useForm<TRtlPulang>({
    defaultValues: {
      tipe_rtl: "pulang"
    },
    resolver: zodResolver(RtlPulangSchema)
  });

  const pulangChoice: { [k: string]: string }[] = [
    { label: "Atas Permintaan Sendiri", value: "aps" },
    { label: "Atas Persetujuan Dokter", value: "apd" },
    { label: "Meninggal", value: "meninggal" },
  ];

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
        keterangan: data.keterangan
      }
    }
    // console.log(input); return;

    try {
      setIsLoading(true);
      const insert = await fetch_api("POST", "/rs/rs/kunjungan/rtl");
      switch (insert?.status) {
        case 201: {
          toast.success("Berhasil disimpan")
        } break;
        case 500: {
          throw new Error(String(insert?.status))
        }
      }
    
    } catch (error: any) {           
      switch (error.message) {
        case "500": {
          toast.error("Terjadi kesalahan saat pemrosesan data");
        } break;
      }
    
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => console.log(errors), [errors])

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) } className="w-2/3">
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="mb-2.5">
        <label htmlFor="ketpulang" className="block text-sm mb-1.5">Keterangan Pulang</label>
        <Controller
          defaultValue={ pulangChoice[1].value }
          control={control}
          name="keterangan"
          render={({ field: { onChange, value } }) => (
            <SelectInput
              noOptionsMessage={(e) => "Tidak ada pilihan"}
              placeholder="Pilih Keterangan"
              onChange={(val: any) => onChange(val.value)}
              options={ pulangChoice }
              value={ pulangChoice.find(f => f.value === value) }
              isError={ !!errors.keterangan }
            />
          )}
        />
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
