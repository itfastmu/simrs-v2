import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import ListPasienAsesmen from "./_components/list-pasien";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ListPasienPage({
  searchParams,
}: {
  searchParams: { user: string | undefined; id: string | undefined };
}) {
  noStore();
  const userParams = searchParams?.user;
  const userId = searchParams?.id?.replaceAll("_", ".");
  const grup = cookies().get("grup")?.value!;
  const idPegawai = cookies().get("id")?.value!;

  return (
    <ListPasienAsesmen
      user={userParams === "Dewa" || !userParams ? "Perawat" : userParams}
      userId={userId}
      grup={grup}
      idPegawai={idPegawai}
    />
  );
}
