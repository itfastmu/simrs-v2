import React from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";

export function PerPage({
  onChange,
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "w-fit rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
        "transition-all duration-150 ease-linear",
        className
      )}
      onChange={onChange}
      {...props}
    >
      <option>10</option>
      <option>25</option>
      <option>50</option>
      <option>75</option>
    </select>
  );
}

export function InputSearch({
  className,
  onChange,
  logoColor,
  ...props
}: { logoColor?: string } & React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <RiSearchLine className={cn(logoColor)} size={`1rem`} />
      </div>
      <input
        placeholder="Cari..."
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-gray-50 py-[7px] pl-10 pr-1.5 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
          "transition-all duration-150 ease-linear",
          className
        )}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

export function Th({
  children,
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "sticky z-20 bg-slate-200 p-0 text-center uppercase text-gray-700 dark:bg-gray-700 dark:text-slate-100",
        "top-0 xl:-top-[1px]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function ThDiv({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-b border-slate-200 p-3 dark:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type PaginationProps = {
  meta: Meta;
  mutating: boolean;
  setPage: (val: number) => void;
};

export function Pagination({ meta, mutating, setPage }: PaginationProps) {
  const styles = {
    listItem:
      "relative mr-1 inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 dark:border-gray-500 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white",
    listItemActive:
      "relative z-10 mr-1 inline-flex cursor-default items-center rounded-md border border-sky-600 bg-gray-50 px-3 py-1 text-sm font-medium text-sky-600 focus:z-20 dark:border-sky-300 dark:bg-sky-700 dark:text-white",
    listDisable:
      "relative mr-1 inline-flex cursor-default items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-bold text-gray-500 dark:border-gray-500 dark:bg-gray-700 dark:text-white",
  };

  return (
    <div className="mt-3 flex items-center justify-between">
      {meta.total > 0 ? (
        <div className="flex h-[30px] items-center text-sm dark:text-neutral-50">
          <p>
            menampilkan{" "}
            {meta.total > 0 && meta.lastPage > 1
              ? (meta.page - 1) * meta.perPage +
                1 +
                " - " +
                (meta.total < meta.perPage
                  ? meta.total
                  : meta.page * meta.perPage > meta.total
                  ? meta.total
                  : meta.page * meta.perPage) +
                " dari "
              : null}{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {meta.total}{" "}
            </span>{" "}
            hasil
          </p>
        </div>
      ) : null}
      <div className="isolate flex rounded-md">
        {!meta.total ? (
          /* WHEN PREFETCH / LOADING / NULL */
          <div className="h-[30px]"></div>
        ) : null}
        {meta.page > 1 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listItem}
            onClick={() => setPage(meta.page - 1)}
          >
            <RiArrowLeftSLine className="inline text-gray-500" size="1rem" />
          </button>
        ) : null}
        {meta.lastPage > 1 ? (
          <button
            disabled={mutating}
            type="button"
            className={
              meta.page === 1 ? styles.listItemActive : styles.listItem
            }
            onClick={() => setPage(1)}
          >
            1
          </button>
        ) : null}
        {meta.page > 3 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listDisable}
          >
            ...
          </button>
        ) : null}
        {meta.page > 2 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listItem}
            onClick={() => setPage(meta.page - 1)}
          >
            {meta.page - 1}
          </button>
        ) : null}
        {meta.page > 1 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listItemActive}
            onClick={() => setPage(meta.page)}
          >
            {meta.page}
          </button>
        ) : null}
        {meta.page < meta.lastPage - 1 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listItem}
            onClick={() => setPage(meta.page + 1)}
          >
            {meta.page + 1}
          </button>
        ) : null}
        {meta.page < meta.lastPage - 2 ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listDisable}
          >
            ...
          </button>
        ) : null}
        {meta.page < meta.lastPage ? (
          <button
            disabled={mutating}
            type="button"
            className={
              meta.page === meta.lastPage
                ? styles.listItemActive
                : styles.listItem
            }
            onClick={() => setPage(meta.lastPage)}
          >
            {meta.lastPage}
          </button>
        ) : null}
        {meta.page < meta.lastPage ? (
          <button
            disabled={mutating}
            type="button"
            className={styles.listItem}
            onClick={() => setPage(meta.page + 1)}
          >
            <RiArrowRightSLine className="inline text-gray-500" size="1rem" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
