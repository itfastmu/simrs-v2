import { Button } from "@/components/button";
import { SelectInput } from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { RtlEksterSchema, TRtlEkster } from "../../../schema";
import { Input, InputArea } from "@/components/form";

export default function RtlEksternal() {

  // inisialisasi form
  const { register, control, handleSubmit,
    formState: { errors },
  } = useForm<TRtlEkster>({
    defaultValues: {
      tipe_rtl: "eksternal",
    },
    resolver: zodResolver(RtlEksterSchema)
  });

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Sep */}
        <div>
          <label htmlFor="sep" className="inline-block text-sm mb-1.5">No.SEP</label>
          <Input type="text" id="sep"
            { ...register('sep') }
          />
        </div>
        {/* Tanggal */}
        <div>
          <label htmlFor="tglrencana" className="inline-block text-sm mb-1.5">Tanggal Rencana</label>
          <Input type="date" id="tglrencana"
            { ...register('tgl_rencana') }
          />
        </div>
        {/* Tujuan */}
        <div>
          <label htmlFor="tujuan" className="inline-block text-sm mb-1.5">Tujuan Rujuk</label>
          <Controller
            control={control}
            name="tujuan_rujuk"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Tujuan"
                onChange={(val: any) => onChange(val.value)}
              />
            )}
          />
        </div>
        {/* Jenis Pelayanan */}
        <div>
          <label htmlFor="jenis" className="inline-block text-sm mb-1.5">Jenis Pelayanan</label>
          <Controller
            control={control}
            name="jns_pelayanan"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Jenis"
                onChange={(val: any) => onChange(val.value)}
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
