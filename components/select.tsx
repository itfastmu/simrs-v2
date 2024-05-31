import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Select, { Props, GroupBase } from "react-select";
import AsyncSelect, { AsyncProps } from "react-select/async";
import CreatableSelect, { CreatableProps } from "react-select/creatable";
import { Input } from "./form";
import { cn } from "@/lib/utils";

type SelectProps = {
  size?: "sm" | "md";
  withSpan?: boolean;
  inputCenter?: boolean;
} & Props;

export interface MyOption {
  readonly label: string;
  readonly value: string | number;
}
export type MyOptions = MyOption[];

export function SelectInput({
  noOptionsMessage,
  size = "md",
  withSpan = false,
  inputCenter = false,
  ...props
}: SelectProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Input
        className={cn(
          size === "sm" && "px-2 py-[5px] text-xs",
          props.className
        )}
        readOnly
      />
    );
  }

  return (
    <Select
      noOptionsMessage={noOptionsMessage || ((e) => "Tidak ada pilihan")}
      styles={{
        control: (base, props) => ({
          ...base,
          width: "100%",
          borderRadius: "0.5rem",
          borderColor:
            theme === "dark"
              ? props.isFocused
                ? "rgb(59 130 246)" //blue-500
                : "rgb(107 114 128)" //gray-500
              : props.isFocused
              ? "rgb(6 182 212)" //cyan-500
              : "rgb(209 213 219)", //gray-300
          backgroundColor:
            theme === "dark"
              ? "rgb(55 65 81)"
              : props.isDisabled
              ? "rgb(243 244 246)"
              : "rgb(249 250 251)",
          paddingTop: size === "md" ? "3px" : "0px",
          paddingBottom: size === "md" ? "3px" : "0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          height: props.isMulti ? "auto" : size === "md" ? "42px" : "28px",
          minHeight: size === "md" ? "42px" : "28px",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          transition: "all",
          transitionDuration: "150ms",
          transitionTimingFunction: "linear",
        }),
        valueContainer: (base, props) => ({
          ...base,
          paddingTop: size === "md" ? "2px" : "0px",
          paddingBottom: size === "md" ? "2px" : "0px",
        }),
        input: (base, props) => ({
          ...base,
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          marginTop: size === "md" ? "2px" : "0px",
          marginBottom: size === "md" ? "2px" : "0px",
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          justifyContent: inputCenter ? "center" : "normal",
        }),
        singleValue: (base, props) => ({
          ...base,
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        placeholder: (base, props) => ({
          ...base,
          color: theme === "dark" ? "rgb(156 163 175)" : "rgb(107 114 128)",
        }),
        // indicatorsContainer: (base, props) => ({
        //   ...base,
        //   paddingTop: size === "md" ? "8px" : "0px",
        //   paddingBottom: size === "md" ? "8px" : "0px",
        // }),
        indicatorSeparator: (base, props) => ({
          ...base,
          display: size === "md" ? "block" : "none",
        }),
        clearIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
        }),
        dropdownIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
          // paddingBottom: size === "md" ? "8px" : "0px",
        }),
        menu: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        menuList: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          "::-webkit-scrollbar": {
            borderRadius: "4px",
            width: "8px",
            height: "8px",
            backgroundColor: "rgb(148 163 184)",
          },
          "::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
            backgroundColor: "rgb(226 232 240)",
          },
          "::-webkit-scrollbar-thumb:hover": {
            borderRadius: "4px",
            backgroundColor: "rgb(241 245 249)",
          },
        }),
        menuPortal: (base, props) => ({
          ...base,
          zIndex: 1060,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        option: (base, props) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          backgroundColor: (() => {
            if (theme === "dark") {
              if (props.isSelected) {
                return "rgb(107 114 128)"; //gray-500,
              }
              if (props.isFocused) {
                return "rgb(75 85 99)"; //gray-600,
              }
              return "rgb(55 65 81)"; //gray-700
            } else {
              if (props.isSelected) {
                return "rgb(56 189 248)"; //sky-400
              }
              if (props.isFocused) {
                return "rgb(224 242 254)"; //sky-100
              }
              return "rgb(249 250 251)"; //gray-50
            }
          })(),
        }),
        noOptionsMessage: (base, prop) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
      }}
      {...props}
    />
  );
}

export function CreatableSelectInput<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  noOptionsMessage,
  size = "md",
  withSpan = false,
  ...props
}: { size?: "sm" | "md"; withSpan?: boolean } & CreatableProps<
  Option,
  IsMulti,
  Group
>) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Input
        className={cn(
          size === "sm" && "px-2 py-[5px] text-xs",
          props.className
        )}
        readOnly
      />
    );
  }

  return (
    <CreatableSelect
      noOptionsMessage={noOptionsMessage || ((e) => "Tidak ada pilihan")}
      styles={{
        control: (base, props) => ({
          ...base,
          width: "100%",
          borderRadius: "0.5rem",
          borderColor:
            theme === "dark"
              ? props.isFocused
                ? "rgb(59 130 246)" //blue-500
                : "rgb(107 114 128)" //gray-500
              : props.isFocused
              ? "rgb(6 182 212)" //cyan-500
              : "rgb(209 213 219)", //gray-300
          backgroundColor:
            theme === "dark"
              ? "rgb(55 65 81)"
              : props.isDisabled
              ? "rgb(243 244 246)"
              : "rgb(249 250 251)",
          paddingTop: size === "md" ? "3px" : "0px",
          paddingBottom: size === "md" ? "3px" : "0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          height: props.isMulti ? "auto" : size === "md" ? "42px" : "28px",
          minHeight: size === "md" ? "42px" : "28px",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          transition: "all",
          transitionDuration: "150ms",
          transitionTimingFunction: "linear",
        }),
        valueContainer: (base, props) => ({
          ...base,
          paddingTop: size === "md" ? "2px" : "0px",
          paddingBottom: size === "md" ? "2px" : "0px",
        }),
        input: (base, props) => ({
          ...base,
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          marginTop: size === "md" ? "2px" : "0px",
          marginBottom: size === "md" ? "2px" : "0px",
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          // justifyContent: inputCenter ? "center" : "normal",
        }),
        singleValue: (base, props) => ({
          ...base,
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        placeholder: (base, props) => ({
          ...base,
          color: theme === "dark" ? "rgb(156 163 175)" : "rgb(107 114 128)",
        }),
        // indicatorsContainer: (base, props) => ({
        //   ...base,
        //   paddingTop: size === "md" ? "8px" : "0px",
        //   paddingBottom: size === "md" ? "8px" : "0px",
        // }),
        indicatorSeparator: (base, props) => ({
          ...base,
          display: size === "md" ? "block" : "none",
        }),
        clearIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
        }),
        dropdownIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
          // paddingBottom: size === "md" ? "8px" : "0px",
        }),
        menu: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        menuList: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          "::-webkit-scrollbar": {
            borderRadius: "4px",
            width: "8px",
            height: "8px",
            backgroundColor: "rgb(148 163 184)",
          },
          "::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
            backgroundColor: "rgb(226 232 240)",
          },
          "::-webkit-scrollbar-thumb:hover": {
            borderRadius: "4px",
            backgroundColor: "rgb(241 245 249)",
          },
        }),
        menuPortal: (base, props) => ({
          ...base,
          zIndex: 1060,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        option: (base, props) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          backgroundColor: (() => {
            if (theme === "dark") {
              if (props.isSelected) {
                return "rgb(107 114 128)"; //gray-500,
              }
              if (props.isFocused) {
                return "rgb(75 85 99)"; //gray-600,
              }
              return "rgb(55 65 81)"; //gray-700
            } else {
              if (props.isSelected) {
                return "rgb(56 189 248)"; //sky-400
              }
              if (props.isFocused) {
                return "rgb(224 242 254)"; //sky-100
              }
              return "rgb(249 250 251)"; //gray-50
            }
          })(),
        }),
        noOptionsMessage: (base, prop) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
      }}
      {...props}
    />
  );
}

export function AsyncSelectInput<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  noOptionsMessage,
  size = "md",
  withSpan,
  ...props
}: { size?: "sm" | "md"; withSpan?: boolean } & AsyncProps<
  Option,
  IsMulti,
  Group
>) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Input
        className={cn(
          size === "sm" && "px-2 py-[5px] text-xs",
          props.className
        )}
        readOnly
      />
    );
  }

  return (
    <AsyncSelect
      noOptionsMessage={noOptionsMessage || ((e) => "Tidak ada pilihan")}
      styles={{
        control: (base, props) => ({
          ...base,
          width: "100%",
          borderRadius: "0.5rem",
          borderColor:
            theme === "dark"
              ? props.isFocused
                ? "rgb(59 130 246)" //blue-500
                : "rgb(107 114 128)" //gray-500
              : props.isFocused
              ? "rgb(6 182 212)" //cyan-500
              : "rgb(209 213 219)", //gray-300
          backgroundColor:
            theme === "dark"
              ? "rgb(55 65 81)"
              : props.isDisabled
              ? "rgb(243 244 246)"
              : "rgb(249 250 251)",
          paddingTop: size === "md" ? "3px" : "0px",
          paddingBottom: size === "md" ? "3px" : "0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          height: props.isMulti ? "auto" : size === "md" ? "42px" : "28px",
          minHeight: size === "md" ? "42px" : "28px",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          transition: "all",
          transitionDuration: "150ms",
          transitionTimingFunction: "linear",
        }),
        valueContainer: (base, props) => ({
          ...base,
          paddingTop: size === "md" ? "2px" : "0px",
          paddingBottom: size === "md" ? "2px" : "0px",
        }),
        input: (base, props) => ({
          ...base,
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          marginTop: size === "md" ? "2px" : "0px",
          marginBottom: size === "md" ? "2px" : "0px",
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          // justifyContent: inputCenter ? "center" : "normal",
        }),
        singleValue: (base, props) => ({
          ...base,
          padding: withSpan ? "2px 0px 2px 6px" : "2px 0px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        placeholder: (base, props) => ({
          ...base,
          color: theme === "dark" ? "rgb(156 163 175)" : "rgb(107 114 128)",
        }),
        // indicatorsContainer: (base, props) => ({
        //   ...base,
        //   paddingTop: size === "md" ? "8px" : "0px",
        //   paddingBottom: size === "md" ? "8px" : "0px",
        // }),
        indicatorSeparator: (base, props) => ({
          ...base,
          display: size === "md" ? "block" : "none",
        }),
        clearIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
        }),
        dropdownIndicator: (base, props) => ({
          ...base,
          padding: size === "md" ? "8px" : "0px 2px",
          // paddingBottom: size === "md" ? "8px" : "0px",
        }),
        menu: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        menuList: (base, props) => ({
          ...base,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
          "::-webkit-scrollbar": {
            borderRadius: "4px",
            width: "8px",
            height: "8px",
            backgroundColor: "rgb(148 163 184)",
          },
          "::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
            backgroundColor: "rgb(226 232 240)",
          },
          "::-webkit-scrollbar-thumb:hover": {
            borderRadius: "4px",
            backgroundColor: "rgb(241 245 249)",
          },
        }),
        menuPortal: (base, props) => ({
          ...base,
          zIndex: 1060,
          backgroundColor:
            theme === "dark" ? "rgb(55 65 81)" : "rgb(249 250 251)",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
        option: (base, props) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          backgroundColor: (() => {
            if (theme === "dark") {
              if (props.isSelected) {
                return "rgb(107 114 128)"; //gray-500,
              }
              if (props.isFocused) {
                return "rgb(75 85 99)"; //gray-600,
              }
              return "rgb(55 65 81)"; //gray-700
            } else {
              if (props.isSelected) {
                return "rgb(56 189 248)"; //sky-400
              }
              if (props.isFocused) {
                return "rgb(224 242 254)"; //sky-100
              }
              return "rgb(249 250 251)"; //gray-50
            }
          })(),
        }),
        noOptionsMessage: (base, prop) => ({
          ...base,
          fontSize: size === "md" ? "14px" : "12px",
          lineHeight: size === "md" ? "20px" : "16px",
          color: theme === "dark" ? "white" : "rgb(17 24 39)",
        }),
      }}
      {...props}
    />
  );
}
