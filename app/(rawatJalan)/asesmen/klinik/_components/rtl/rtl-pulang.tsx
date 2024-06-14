"use client"

import { SelectInput } from "@/components/select";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlPulangSchema, TRtlPulang } from "../../../schema";
import { useEffect } from "react";

export default function RtlPulang() {
  
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
    { label: "APS", value: "aps" },
    { label: "APD", value: "apd" },
    { label: "Meninggal", value: "meninggal" },
  ];

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  useEffect(() => {
    console.log(errors);
  }, [errors])

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) } className="w-2/3">
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="mb-2.5">
        <label htmlFor="ketpulang" className="block text-sm mb-1.5">Keterangan Pulang</label>
        <Controller
          control={control}
          name="keterangan"
          render={({ field: { onChange, value } }) => (
            <SelectInput
              noOptionsMessage={(e) => "Tidak ada pilihan"}
              placeholder="Pilih Keterangan"
              onChange={(val: any) => onChange(val.value)}
              options={ pulangChoice }
            />
          )}
        />
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
