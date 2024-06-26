"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  createRef,
  useEffect,
  useState,
  Fragment,
  forwardRef,
  useDeferredValue,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { TbBuildingBank, TbChecklist, TbMapPinCode } from "react-icons/tb";
import {
  RiBodyScanFill,
  RiFileUserLine,
  RiFlaskFill,
  RiHotelBedLine,
  RiLogoutCircleRLine,
  RiNurseFill,
  RiUserFollowLine,
  RiUserHeartLine,
} from "react-icons/ri";
import {
  BsCashStack,
  BsFillCaretDownFill,
  BsFillPersonBadgeFill,
  BsListUl,
} from "react-icons/bs";
import { TfiDropbox, TfiLayoutGrid2Alt } from "react-icons/tfi";
import { Transition, Menu, Popover } from "@headlessui/react";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import css from "@/assets/css/scrollbar.module.css";
import { Tooltip } from "@/components/tooltip";
import { InputSearch } from "@/components/table";
import { AiOutlineSchedule } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { MdHome, MdOutlineMedicalInformation } from "react-icons/md";
import { GiMedicalDrip, GiMedicines } from "react-icons/gi";
import { VscReferences } from "react-icons/vsc";
import { IoDocumentTextOutline, IoSchoolOutline } from "react-icons/io5";
import { BiBox, BiClinic } from "react-icons/bi";
import { Url } from "next/dist/shared/lib/router/router";
import { CgMenuGridO } from "react-icons/cg";
import { HiOutlineDocumentPlus, HiOutlineDocumentText } from "react-icons/hi2";
import { FaBookMedical, FaTruckLoading } from "react-icons/fa";
import { FaBoxOpen, FaBuildingCircleArrowRight } from "react-icons/fa6";

export default function MenuComponent() {
  const [isShow, setShow] = useState(false);
  const menuRef: React.RefObject<HTMLDivElement> = createRef();

  return (
    <>
      <div className="flex-initial">
        <div
          ref={menuRef}
          className="h-full rounded-lg bg-slate-50 p-4 dark:bg-gray-800"
        >
          <button type="button" onClick={() => setShow(!isShow)}>
            <TfiLayoutGrid2Alt
              size="28px"
              className="mx-auto inline fill-sky-600 hover:fill-sky-500"
            />
          </button>
        </div>
        <Transition
          show={isShow}
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <MenuModal setShow={setShow} menuRef={menuRef} />
        </Transition>
      </div>
    </>
  );
}

type MenuType = {
  menuRef: React.RefObject<HTMLDivElement>;
  setShow: Dispatch<SetStateAction<boolean>>;
};

const MenuModal = forwardRef<HTMLDivElement, MenuType>(
  ({ menuRef, setShow }, forwardedRef) => {
    const router = useRouter();
    const ref: React.RefObject<HTMLDivElement> = createRef();
    const grupId = parseInt(Cookies.get("grupId")!);
    const userId = Cookies.get("id");

    useEffect(() => {
      // Bind the event listener
      document.addEventListener("mousedown", (ev) => {
        if (menuRef.current?.contains(ev.target as Node)) return;
        if (ref && ref !== null) {
          const cur = ref.current;
          if (cur && !cur.contains(ev.target as Node)) {
            // close all dropdowns
            setShow(false);
          }
        }
      });
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", (ev) => {
          if (menuRef.current?.contains(ev.target as Node)) return;
          if (ref && ref !== null) {
            const cur = ref.current;
            if (cur && !cur.contains(ev.target as Node)) {
              // close all dropdowns
              setShow(false);
            }
          }
        });
      };
    }, [ref]);

    const [cari, setCari] = useState<string>("");
    const deferredCari = useDeferredValue(cari);
    const [menues] = useState([
      // {
      //   icon: RiUserFollowLine,
      //   grup: [1, 2],
      // },
      {
        judul: "Kunjungan Rajal",
        icon: RiUserHeartLine,
        grup: [1, 2],
        child: [
          {
            judul: "Semua Kunjungan",
            icon: RiUserHeartLine,
            href: "/kunjungan",
          },
          {
            judul: "Kunjungan Klinik",
            icon: RiUserHeartLine,
            href: "/kunjungan-rajal",
          },
          {
            judul: "List SEP",
            icon: IoDocumentTextOutline,
            href: "/list-sep",
          },
          {
            judul: "List SKDP",
            icon: IoDocumentTextOutline,
            href: "/list-skdp",
          },
          {
            judul: "Rujukan Internal",
            icon: IoDocumentTextOutline,
            href: "/list-rujuk-internal",
          },
        ],
      },
      {
        judul: "Kunjungan Ranap",
        href: "/kunjungan-ranap",
        icon: RiHotelBedLine,
        grup: [1, 2],
      },
      {
        judul: "Master Pasien",
        href: "/master-pasien",
        icon: RiFileUserLine,
        grup: [1, 2],
      },
      {
        judul: "Verifikasi Pasien",
        href: "/verifikasi-pasien",
        icon: TbChecklist,
        grup: [1],
      },
      {
        judul: "Jadwal Dokter",
        href: "/jadwal-dokter",
        icon: AiOutlineSchedule,
        grup: [1, 3],
      },
      {
        judul: "List Pasien",
        href: {
          pathname: "/list-pasien",
          query: {
            user: grupId === 1 ? "Dewa" : grupId === 4 ? "Perawat" : "Dokter",
            id: userId?.replaceAll(".", "_"),
          },
        } as Url,
        icon: RiNurseFill,
        grup: [1, 4, 5],
      },
      {
        judul: "Pegawai",
        href: "/list-pegawai",
        icon: BsFillPersonBadgeFill,
        grup: [1],
      },
      {
        judul: "Farmasi",
        icon: GiMedicines,
        grup: [1, 6],
        child: [
          {
            judul: "Resep Pasien",
            icon: HiOutlineDocumentText,
            href: "/list-resep",
          },
          {
            judul: "Penjualan Bebas",
            icon: HiOutlineDocumentText,
            href: "/penjualan-bebas",
          },
          // {
          //   judul: "Tarif BHP",
          //   href: "/tarif-bhp",
          //   icon: GiMedicalDrip,
          // },
          // {
          //   judul: "KFA Mapping POA",
          //   href: "/kfa-mapping-poa",
          // },
        ],
      },
      {
        judul: "Inventori Farmasi",
        icon: BiBox,
        grup: [1, 6, 10],
        child: [
          {
            judul: "Stok Barang",
            icon: FaBoxOpen,
            href: "/stok-barang",
            grup: [1, 6],
          },
          {
            judul: "Pemasukan Obat",
            icon: GiMedicines,
            href: "/pemasukan-obat",
            grup: [1, 6],
          },
          {
            judul: "Pengeluaran Obat",
            icon: GiMedicines,
            href: "/pengeluaran-obat",
            grup: [1, 6],
          },
          {
            judul: "Stok Opname",
            icon: FaBoxOpen,
            href: "/stok-opname",
            grup: [1, 6],
          },
          {
            judul: "Surat Pesanan",
            icon: IoDocumentTextOutline,
            href: "/surat-pesanan",
            grup: [1, 6, 10],
          },
          {
            judul: "Permohonan Mutasi",
            icon: IoDocumentTextOutline,
            href: "/permohonan-mutasi",
            grup: [1, 6],
          },
          {
            judul: "Penerimaan Barang",
            icon: FaTruckLoading,
            href: "/penerimaan-barang",
            grup: [1, 6, 10],
          },
          {
            judul: "List Supplier",
            icon: TfiDropbox,
            href: "/list-supplier",
          },
          {
            judul: "Master KFA",
            icon: GiMedicines,
            href: "/master-kfa",
          },
        ],
      },
      {
        judul: "Keuangan",
        icon: BsCashStack,
        grup: [1],
        child: [
          {
            judul: "Master Tarif",
            href: "/master-tarif",
            icon: BsCashStack,
            grup: [1],
          },
          {
            judul: "Setting Harga Obat",
            href: "/harga-obat",
            icon: GiMedicines,
            grup: [1],
          },
          {
            judul: "List Produsen",
            href: "/list-produsen",
            icon: FaBuildingCircleArrowRight,
            grup: [1],
          },
        ],
      },
      {
        judul: "Billing Pasien",
        href: "/billing-pasien",
        icon: IoDocumentTextOutline,
        grup: [1],
      },
      {
        judul: "Laboratorium",
        icon: RiFlaskFill,
        grup: [1],
        child: [
          {
            judul: "Pemeriksaan Laboratorium",
            icon: RiFlaskFill,
            href: "/pemeriksaan-laborat",
          },
          {
            judul: "Kunjungan Laboratorium",
            icon: RiFlaskFill,
            href: "/pemeriksaan-laborat",
          },
          {
            judul: "Master Laboratorium",
            icon: RiFlaskFill,
            href: "/master-laborat",
          },
        ],
      },
      {
        judul: "Radiologi",
        icon: RiBodyScanFill,
        grup: [1, 7, 8],
        child: [
          {
            judul: "Pemeriksaan Radiologi",
            icon: RiBodyScanFill,
            href: "/pemeriksaan-radiologi",
          },
          {
            judul: "Kunjungan Radiologi",
            icon: RiBodyScanFill,
            href: "/kunjungan-radiologi",
          },
          {
            judul: "Master Radiologi",
            icon: RiBodyScanFill,
            href: "/master-radiologi",
          },
        ],
      },
      {
        judul: "Referensi",
        icon: VscReferences,
        grup: [1],
        child: [
          {
            judul: "List Klinik",
            icon: BiClinic,
            href: "/list-klinik",
          },
          {
            judul: "List ICD",
            icon: FaBookMedical,
            href: "/list-icd",
          },
          {
            judul: "List Skrining",
            icon: HiOutlineDocumentPlus,
            href: "/list-skrining",
          },
          {
            judul: "List Pendidikan",
            icon: IoSchoolOutline,
            href: "/list-pendidikan",
          },
          {
            judul: "List Alamat",
            icon: TbMapPinCode,
            href: "/list-alamat",
          },
          {
            judul: "List Cara Bayar",
            icon: TbBuildingBank,
            href: "/list-carabayar",
          },
          {
            judul: "List Kamar",
            icon: RiHotelBedLine,
            href: "/list-kamar",
          },
          {
            judul: "List Unit",
            icon: FiUsers,
            href: "/list-unit",
          },
          {
            judul: "List Jenis Penunjang",
            icon: MdOutlineMedicalInformation,
            href: "/list-penunjang",
          },
        ],
      },
    ]);

    const filteredMenues = useMemo<typeof menues>(() => {
      return menues.filter((val) => {
        return (
          val.grup.some((valGrup) => valGrup === grupId) &&
          (val.judul.toLowerCase().includes(deferredCari.toLowerCase()) ||
            (val.child &&
              val.child.some((child) =>
                child.judul.toLowerCase().includes(deferredCari.toLowerCase())
              )))
        );
      });
    }, [deferredCari]);

    const logOut = () => {
      Cookies.remove("nama");
      Cookies.remove("token");
      Cookies.remove("grup");
      Cookies.remove("grupId");
      router.replace("/auth");
      toast.success("Berhasil keluar");
    };

    return (
      <div ref={forwardedRef}>
        <div
          className="absolute bottom-[4.5rem] left-0 right-0 mx-auto flex min-h-[50vh] w-2/5 flex-col justify-between rounded-lg bg-slate-200 shadow-xl transition-all duration-150 ease-linear dark:bg-slate-800"
          ref={ref}
        >
          <div
            className={cn(
              "relative flex-1 overflow-visible px-3 pt-3",
              css.scrollbar
            )}
          >
            {filteredMenues.length > 0 ? (
              <div
                className={cn(
                  "relative grid grid-cols-5 gap-2"
                  // "w-fit grid-flow-col grid-cols-[repeat(auto-fit,_minmax(90px,_1fr))] grid-rows-3 whitespace-nowrap"
                )}
              >
                {filteredMenues?.map((menu, id) => {
                  return menu.href ? (
                    <div key={id}>
                      <Link
                        key={menu.judul}
                        href={menu.href}
                        onClick={() => {
                          setShow(false);
                        }}
                        className="mx-auto flex w-max rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700"
                      >
                        <menu.icon size="1.6rem" className="text-blue-500" />
                      </Link>
                      <p className="py-1.5 text-center text-[11px]/[12px] font-semibold text-gray-700 dark:text-slate-200">
                        {menu.judul}
                      </p>
                    </div>
                  ) : (
                    <div key={id}>
                      <Popover className="relative">
                        <Popover.Button className="relative mx-auto w-max rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
                          <menu.icon size="1.6rem" className="fill-blue-500" />
                          <CgMenuGridO
                            size="0.8rem"
                            className="absolute bottom-0.5 right-0.5 text-blue-500"
                          />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel
                            className={cn(
                              "absolute left-1/2 z-[1010] mt-1.5 max-h-36 w-80 origin-top-left -translate-x-1/2 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                              // "fixed z-[1020] mt-2 max-h-32 w-56 origin-top-left overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700",
                              // "-top-2 mb-2 mt-0 -translate-y-full",
                              css.scrollbar
                            )}
                          >
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                              <div className="relative grid grid-cols-3 gap-4 bg-white px-4 py-3 dark:bg-slate-700">
                                {menu.child?.map((val, menuIdx) => (
                                  // <div
                                  //   className={cn(
                                  //     "p-0.5",
                                  //     "grup" in val &&
                                  //       val.grup?.every(
                                  //         (grupVal) => grupVal !== grupId
                                  //       ) &&
                                  //       "hidden"
                                  //   )}
                                  //   key={menuIdx}
                                  // >
                                  //   <Link
                                  //     className={cn(
                                  //       "flex w-full items-center rounded-md px-2 py-2 text-[11px]/[12px]"
                                  //     )}
                                  //     href={val.href}
                                  //     onClick={() => {
                                  //       setShow(false);
                                  //     }}
                                  //   >
                                  //     {val.judul}
                                  //   </Link>
                                  // </div>
                                  <div key={val.judul}>
                                    <Link
                                      href={val.href}
                                      onClick={() => {
                                        setShow(false);
                                      }}
                                      className="mx-auto flex w-max rounded-lg bg-slate-200 p-3 shadow-sm dark:bg-slate-800"
                                    >
                                      <val.icon
                                        size="1.6rem"
                                        className="text-blue-500"
                                      />
                                    </Link>
                                    <p className="py-1.5 text-center text-[11px]/[12px] font-semibold text-gray-700 dark:text-slate-200">
                                      {val.judul}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </Popover>
                      <p className="py-1.5 text-center text-[11px]/[12px] font-semibold text-gray-700 dark:text-slate-200">
                        {menu.judul}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
                Belum ada menu
              </p>
            )}
          </div>
          <div className="flex justify-around justify-self-end p-2">
            <Tooltip.Provider delayDuration={300} disableHoverableContent>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link
                    href={"/home"}
                    className="flex items-center justify-center"
                  >
                    <MdHome size="1.6rem" className="text-sky-600" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="right"
                  sideOffset={0}
                  className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                >
                  <p>Beranda</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>

            <InputSearch
              logoColor="text-sky-600"
              className="w-full bg-transparent placeholder:text-slate-700"
              onChange={(e) => {
                setCari(e.target.value);
              }}
            />

            <Tooltip.Provider delayDuration={300} disableHoverableContent>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button type="button" onClick={() => logOut()}>
                    <RiLogoutCircleRLine
                      size="1.4rem"
                      className="text-sky-600"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content
                  side="left"
                  sideOffset={0}
                  className="border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-700 dark:text-slate-200"
                >
                  <p>Keluar</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
        <BsFillCaretDownFill
          size="1.2rem"
          className="absolute bottom-[3.65rem] left-0 right-0 z-[1000] mx-auto fill-slate-200 opacity-95 dark:fill-slate-800"
        />
      </div>
    );
  }
);

MenuModal.displayName = "MenuModal";

const old = () => {
  return (
    <>
      <div className="h-10 rounded-md border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
        <div className="mx-auto grid h-full max-w-lg grid-cols-3">
          <div className="flex items-center justify-center">
            {/* <Link href={`/home`} className="cursor-pointer">
              <HiOutlineHome size={`1.5rem`} />
            </Link> */}
          </div>
          <div className="flex items-center justify-center">
            {/* <div className="grid rounded bg-slate-300 p-2">
              <Link className="w-fit" href={`/pasien-periksa`}>
                Pasien Periksa
              </Link>
              <Link className="w-fit" href={`/master-pasien`}>
                Master Pasien
              </Link>
            </div> */}
            {/* <Image
              src={logoFastMu}
              onClick={() => false}
              draggable={false}
              alt="Logo"
              className="h-10 w-10 cursor-pointer"
            /> */}
          </div>
          <div className="flex items-center justify-center">
            <RiLogoutCircleRLine size={`1.5rem`} className="cursor-pointer" />
          </div>
        </div>
      </div>
    </>
  );
};
