"use client";

import css from "@/assets/css/scrollbar.module.css";
import {
  InputSearch,
  Pagination,
  PerPage,
  Th,
  ThDiv,
} from "@/components/table";
import { APIURL } from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Listbox, Tab, Transition } from "@headlessui/react";
import Cookies from "js-cookie";
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { FaBoxOpen } from "react-icons/fa6";
import { RiArrowDropDownLine, RiCheckLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { Depo, StokBarangDepo } from "../schema";

export default function SemuaKunjungan() {
  const headers = new Headers();
  const [token] = useState(Cookies.get("token"));
  headers.append("Authorization", token as string);
  headers.append("Content-Type", "application/json");

  const [cari, setCari] = useState<string>("");
  const deferredCari = useDeferredValue(cari);

  const metaState: Meta = {
    page: 1,
    perPage: 25,
    lastPage: NaN,
    total: NaN,
  };
  const metaActs = (state: Meta, action: MetaAction): Meta => {
    switch (action.type) {
      case "page": {
        return {
          ...state,
          page: action.page,
        };
      }
      case "perPage": {
        return {
          ...state,
          perPage: action.perPage,
        };
      }
      case "lastPage": {
        return {
          ...state,
          lastPage: action.lastPage,
        };
      }
      case "total": {
        return {
          ...state,
          total: action.total,
        };
      }
      case "setMeta": {
        return {
          ...state,
          ...action.setMeta,
        };
      }
    }
  };
  const [meta, metaDispatch] = useReducer(metaActs, metaState);

  const [isMutating, setIsMutating] = useState<boolean>(false);

  type StokBarang = {
    id: number;
    nama: string;
    total_stok: string;
  };
  const [listBarang, setListBarang] = useState<StokBarang[]>([]);
  const loadBarang = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/stok`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
      setListBarang(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page.page),
          perPage: parseInt(json?.page.perPage),
          lastPage: parseInt(json?.page.lastPage),
          total: parseInt(json?.page.total),
        },
      });
      setIsMutating(false);
    } catch (err) {
      const error = err as Error;
      metaDispatch({
        type: "setMeta",
        setMeta: {
          ...meta,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error.message === "Data tidak ditemukan") return setIsMutating(false);
      toast.error(error.message);
      console.error(error);
      setIsMutating(false);
    }
  };

  const [listBarangDepo, setListBarangDepo] = useState<StokBarangDepo[]>([]);
  const loadBarangDepo = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/stok/depo`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
      setListBarangDepo(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page.page),
          perPage: parseInt(json?.page.perPage),
          lastPage: parseInt(json?.page.lastPage),
          total: parseInt(json?.page.total),
        },
      });
      setIsMutating(false);
    } catch (err) {
      const error = err as Error;
      metaDispatch({
        type: "setMeta",
        setMeta: {
          ...meta,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error.message === "Data tidak ditemukan") return setIsMutating(false);
      toast.error(error.message);
      console.error(error);
      setIsMutating(false);
    }
  };

  const [listBarangPerDepo, setListBarangPerDepo] = useState<StokBarangDepo[]>(
    []
  );
  const loadBarangPerDepo = async () => {
    try {
      setIsMutating(true);
      const url = new URL(`${APIURL}/rs/farmasi/stok/depo/${selectedIdx.id}`);
      const params = {
        page: meta.page,
        perPage: meta.perPage,
        keyword: deferredCari.trimStart(),
      };
      url.search = new URLSearchParams(params as any).toString();
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      // console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
      setListBarangPerDepo(json?.data);
      metaDispatch({
        type: "setMeta",
        setMeta: {
          page: parseInt(json?.page.page),
          perPage: parseInt(json?.page.perPage),
          lastPage: parseInt(json?.page.lastPage),
          total: parseInt(json?.page.total),
        },
      });
      setIsMutating(false);
    } catch (err) {
      const error = err as Error;
      metaDispatch({
        type: "setMeta",
        setMeta: {
          ...meta,
          page: 1,
          lastPage: 1,
          total: 0,
        },
      });
      if (error.message === "Data tidak ditemukan") return setIsMutating(false);
      toast.error(error.message);
      console.error(error);
      setIsMutating(false);
    }
  };

  const loadDepo = async () => {
    try {
      const url = new URL(`${APIURL}/rs/farmasi/depo`);
      const resp = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const json = await resp.json();
      console.log(json.data);
      if (json.status !== "Ok") throw new Error(json.message);
      const data: Depo[] = json.data;
      if (menues.length === 2)
        setMenues([
          ...menues,
          ...data.map((val) => ({ name: val.nama, id: val.id })),
        ]);
    } catch (err) {
      const error = err as Error;
      if (error.message === "Data tidak ditemukan") return;
      toast.error(error.message);
      console.error(error);
    }
  };
  const [menues, setMenues] = useState<
    {
      name: string;
      id?: number;
    }[]
  >([{ name: "Semua Barang" }, { name: "Semua Barang Depo" }]);
  const [selectedIdx, setSelectedIdx] = useState<{
    index: number;
    id?: number;
  }>({ index: 0 });

  useEffect(() => {
    loadDepo();
  }, []);

  const loadData = async () => {
    switch (selectedIdx.index) {
      case 0:
        loadBarang();
        break;
      case 1:
        loadBarangDepo();
        break;
      default:
        loadBarangPerDepo();
        break;
    }
  };

  useEffect(() => {
    loadData();
  }, [meta.page, meta.perPage, deferredCari, selectedIdx]);

  const tableDivRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <main className="mx-auto flex overflow-auto px-4 pb-[68px] pt-1">
        <div className="w-full rounded-md bg-white p-3 shadow-md dark:bg-slate-700">
          <div className="flex items-center border-b border-b-slate-200 pb-3">
            <div className="ml-3 flex items-center gap-3">
              <FaBoxOpen
                size="1.75rem"
                className="text-gray-500 dark:text-slate-100"
              />
              <p className="text-xl uppercase text-gray-500 dark:text-slate-100">
                Stok Barang
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <PerPage
                value={meta.perPage}
                onChange={(e) =>
                  metaDispatch({
                    type: "setMeta",
                    setMeta: {
                      ...meta,
                      page: 1,
                      perPage: parseInt(e.target.value),
                    },
                  })
                }
              />
              <Listbox
                value={selectedIdx.index}
                onChange={(val) => {
                  setSelectedIdx({ index: val, id: menues[val].id });
                  metaDispatch({
                    type: "setMeta",
                    setMeta: {
                      ...meta,
                      page: 1,
                    },
                  });
                }}
              >
                <div className="relative">
                  <Listbox.Button
                    className={cn(
                      "inline-flex rounded p-2.5 text-center text-sm text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                      "rounded-full bg-slate-200 font-semibold text-sky-600 active:bg-slate-300 dark:bg-gray-800 dark:active:bg-gray-900",
                      "h-fit px-4 py-[7px]"
                    )}
                  >
                    {menues[selectedIdx.index].name}
                    <RiArrowDropDownLine className="-mr-1 ml-2 h-5 w-5" />
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Listbox.Options className="absolute z-30 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-700">
                      {menues.map((menu, menuIdx) => (
                        <div className="p-0.5" key={menuIdx}>
                          <Listbox.Option
                            as="button"
                            className={({ active }) =>
                              cn(
                                "relative flex w-full items-center rounded-md py-2 pl-10 pr-2 text-sm",
                                active
                                  ? "bg-slate-200 text-sky-600"
                                  : "text-gray-900 dark:text-slate-100"
                              )
                            }
                            value={menuIdx}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={cn(
                                    "block truncate",
                                    selected ? "font-medium" : "font-normal"
                                  )}
                                >
                                  {menu.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                    <RiCheckLine
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        </div>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <InputSearch
              onChange={(e) => {
                metaDispatch({
                  type: "page",
                  page: 1,
                });
                setCari(e.target.value);
              }}
            />
          </div>
          <div
            ref={tableDivRef}
            className={cn(
              "h-[calc(100vh-236px)]",
              css.scrollbar,
              isMutating ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            <Tab.Group
              selectedIndex={
                selectedIdx.index === 0 ? 0 : selectedIdx.index === 1 ? 1 : 2
              }
            >
              <Tab.List className="hidden">
                {menues.map((menu) => (
                  <Tab className="hidden" key={menu.name}>
                    {menu.name}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode POA</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Barang</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Total Stok</ThDiv>
                        </Th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-200 dark:bg-gray-700">
                      {isMutating ? (
                        /* IF DATA FETCHING */
                        [...Array(15)].map((_, i) => (
                          <tr
                            className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                            key={i.toString()}
                          >
                            <td className="h-[56.5px]">
                              <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                          </tr>
                        ))
                      ) : /* IF DATA KOSONG */
                      meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={7}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        /* IF DATA ADA */
                        listBarang?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i.toString()}
                          >
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                {data.id}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.total_stok}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <div className="flex flex-nowrap items-center justify-center gap-1"></div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode POA</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Barang</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Total Stok</ThDiv>
                        </Th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-200 dark:bg-gray-700">
                      {isMutating ? (
                        /* IF DATA FETCHING */
                        [...Array(15)].map((_, i) => (
                          <tr
                            className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                            key={i.toString()}
                          >
                            <td className="h-[56.5px]">
                              <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                          </tr>
                        ))
                      ) : /* IF DATA KOSONG */
                      meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={7}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        /* IF DATA ADA */
                        listBarangDepo?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i.toString()}
                          >
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                {data.id_poa}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.stok}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <div className="flex flex-nowrap items-center justify-center gap-1"></div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Tab.Panel>
                <Tab.Panel className="focus:outline-none">
                  <table className="w-full text-left text-sm font-semibold text-gray-600">
                    <thead>
                      <tr>
                        <Th>
                          <ThDiv>Kode POA</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Barang</ThDiv>
                        </Th>
                        <Th>
                          <ThDiv>Total Stok</ThDiv>
                        </Th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-200 dark:bg-gray-700">
                      {isMutating ? (
                        /* IF DATA FETCHING */
                        [...Array(15)].map((_, i) => (
                          <tr
                            className="animate-pulse border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                            key={i.toString()}
                          >
                            <td className="h-[56.5px]">
                              <p className="mx-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-48 rounded bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                            <td>
                              <p className="mx-auto h-5 w-16 rounded-sm bg-slate-200 dark:bg-slate-400"></p>
                            </td>
                          </tr>
                        ))
                      ) : /* IF DATA KOSONG */
                      meta.total === 0 ? (
                        <tr className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-600">
                          <td className="p-4 text-center" colSpan={7}>
                            <p>Data tidak ditemukan</p>
                          </td>
                        </tr>
                      ) : (
                        /* IF DATA ADA */
                        listBarangPerDepo?.map((data, i) => (
                          <tr
                            className="bg-white hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-gray-800 dark:text-slate-200 hover:dark:bg-gray-900"
                            key={i.toString()}
                          >
                            <td className="border-b border-slate-200 py-2 dark:border-gray-700">
                              <p className="mx-auto w-20 rounded-sm bg-slate-700 py-1 text-center text-xs font-medium tracking-wider text-slate-100">
                                {data.id_poa}
                              </p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <p>{data.nama}</p>
                            </td>
                            <td className="border-b border-slate-200 text-center dark:border-gray-700">
                              <p>{data.stok}</p>
                            </td>
                            <td className="border-b border-slate-200 dark:border-gray-700">
                              <div className="flex flex-nowrap items-center justify-center gap-1"></div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
          <Pagination
            meta={meta}
            mutating={isMutating}
            setPage={(pageVal: number) => {
              metaDispatch({ type: "page", page: pageVal });
              tableDivRef.current?.scrollTo(0, 0);
            }}
          />
        </div>
      </main>
    </>
  );
}
