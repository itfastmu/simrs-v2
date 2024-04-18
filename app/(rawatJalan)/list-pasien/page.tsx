import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import ListPasienAsesmen from "./_components/list-pasien";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ListPasienPage() {
  noStore();
  const user = cookies().get("grup")?.value!;
  const idPegawai = cookies().get("id")?.value!;
  console.log("user =", user);
  console.log("idPegawai =", idPegawai);

  return <ListPasienAsesmen user={user} idPegawai={idPegawai} />;
}
