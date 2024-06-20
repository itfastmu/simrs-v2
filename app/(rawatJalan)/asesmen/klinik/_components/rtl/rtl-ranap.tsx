"use client"
import { Input } from "@/components/form";
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Button } from '@/components/button';
import { zodResolver } from "@hookform/resolvers/zod";
import { RtlRanapSchema, TRtlRanap } from "../../../schema";

export default function RtlRanap() {
    
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
  
    return (
      <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
        <div className="grid gap-2 mb-2.5">
          <div className="flex items-center gap-2 rounded-md">
              <input type="checkbox" className="w-4 h-4" defaultChecked/>
              <label className="text-sm">Dengan ini, pasien berikut akan diubah statusnya menjadi <b>Rawat Inap</b></label>
          </div>
        </div>
        <Button type="submit" className="px-3 py-1.5" color="cyan" >
            Simpan
        </Button>
      </form>
    )
}
