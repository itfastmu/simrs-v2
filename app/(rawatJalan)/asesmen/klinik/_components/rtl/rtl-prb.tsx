import { zodResolver } from "@hookform/resolvers/zod";
import { RtlPrbSchema, TRtlPrb } from "../../../schema";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Input, InputArea } from "@/components/form";
import { Button } from "@/components/button";
import { SelectInput } from "@/components/select";

export default function RtlPRB() {
  // inisialisasi form
  const { register, control, handleSubmit,
    formState: { errors },
  } = useForm<TRtlPrb>({
    defaultValues: {
      tipe_rtl: "prb",
    },
    resolver: zodResolver(RtlPrbSchema)
  });

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* sep */}
        <div>
          <label htmlFor="sep" className="inline-block text-sm mb-1.5">No.SEP</label>
          <Input type="text" id="sep" />
        </div>
        {/* no peserta */}
        <div>
          <label htmlFor="noka" className="inline-block text-sm mb-1.5">No.Peserta</label>
          <Input type="text" id="noka" />
        </div>
        {/* email */}
        <div>
          <label htmlFor="email" className="inline-block text-sm mb-1.5">Email</label>
          <Input type="email" id="email" />
        </div>
        {/* program prb */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Program PRB</label>
          <Controller
            control={control}
            name="program_prb"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                placeholder="Pilih Program"
                onChange={(val: any) => onChange(val.value)}
              />
            )}
          />
        </div>
        {/* alamat */}
        <div>
          <label htmlFor="alamat" className="inline-block text-sm mb-1.5">Alamat</label>
          <InputArea id="alamat"
            { ...register('alamat') }
          ></InputArea>
        </div>
        {/* alamat */}
        <div>
          <label htmlFor="keterangan" className="inline-block text-sm mb-1.5">Keterangan</label>
          <InputArea id="keterangan"
            { ...register('keterangan') }
          ></InputArea>
        </div>
        <div>
          <label htmlFor="saran" className="inline-block text-sm mb-1.5">Saran</label>
          <InputArea id="saran"
            { ...register('saran') }
          ></InputArea>
        </div>
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
