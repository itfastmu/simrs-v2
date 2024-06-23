"use client"
import { Input } from "@/components/form";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlRanapSchema, TRtlRanap } from "../../../schema";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetch_api } from "@/lib/fetchapi";

export default function RtlRanap({
  IKunjungan
}: {
  IKunjungan: { [key: string]: any } | null
}) {
    
    // inisialisasi form
    const { register, control, handleSubmit,
      formState: { errors },
    } = useForm<TRtlRanap>({
      defaultValues: {
        tipe_rtl: "ranap",
      },
      resolver: zodResolver(RtlRanapSchema)
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
          detail: inputExt
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

    useEffect(() => console.log(errors), [errors])
  
    return (
      <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
        <input type="hidden" { ...register("tipe_rtl") } />
        <div className="grid gap-2 mb-2.5">
          <div className="flex items-center gap-2 rounded-md">
              <input type="checkbox" className="w-4 h-4" defaultChecked/>
              <label className="text-sm">Dengan ini, pasien berikut akan diubah statusnya menjadi <b>Rawat Inap</b></label>
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
