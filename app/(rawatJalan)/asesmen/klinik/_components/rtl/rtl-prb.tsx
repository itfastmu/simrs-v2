import { zodResolver } from "@hookform/resolvers/zod";
import { RtlPrbSchema, TRtlPrb } from "../../../schema";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Input, InputArea } from "@/components/form";
import { Button } from "@/components/button";
import { SelectInput } from "@/components/select";

export default function RtlPRB({
  IKunjungan
}: {
  IKunjungan: { [key: string]: any } | null
}) {
  // inisialisasi form
  const { register, control, handleSubmit,
    formState: { errors },
  } = useForm<TRtlPrb>({
    defaultValues: {
      tipe_rtl: "prb",
    },
    resolver: zodResolver(RtlPrbSchema)
  });

  const listProgram:{value:string, label:string}[] = [{
    "value": "01 ",
    "label": "Diabetes Mellitus"
  },
  {
    "value": "02 ",
    "label": "Hypertensi"
  },
  {
    "value": "03 ",
    "label": "Asthma"
  },
  {
    "value": "04 ",
    "label": "Penyakit Jantung"
  },
  {
    "value": "05 ",
    "label": "PPOK (Penyakit Paru Obstruktif Kronik)"
  },
  {
    "value": "06 ",
    "label": "Schizophrenia"
  },
  {
    "value": "07 ",
    "label": "Stroke"
  },
  {
    "value": "08 ",
    "label": "Epilepsi"
  },
  {
    "value": "09 ",
    "label": "Systemic Lupus Erythematosus"
  }]

  const pulangSubmitHandler: SubmitHandler<any> = (data) => {
    console.log(data);
  }

  return (
    <form onSubmit={ handleSubmit(pulangSubmitHandler) }>
      <input type="hidden" { ...register("tipe_rtl") } />
      <input type="hidden" { ...register("email") } />
      <input type="hidden" { ...register("alamat") } />
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* program prb */}
        <div>
          <label htmlFor="poli" className="inline-block text-sm mb-1.5">Program PRB</label>
          <Controller
            control={control}
            name="program_prb"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                noOptionsMessage={(e) => "Tidak ada pilihan"}
                options={listProgram}
                placeholder="Pilih Program"
                onChange={(val: any) => onChange(val.value)}
              />
            )}
          />
        </div>
      </div>
      <Button type="submit" className="px-3 py-1.5" color="cyan" >
          Simpan
      </Button>
    </form>
  )
}
