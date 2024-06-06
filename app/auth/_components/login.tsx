"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/button";
import { IconContext } from "react-icons";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/form";
import { cn } from "@/lib/utils";
import { APIURL } from "@/lib/connection";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hidePass, setHidePass] = useState<boolean>(false);

  const LoginSchema = z.object({
    username: z.string({ required_error: "harus diisi" }).min(1, "harus diisi"),
    password: z.string({ required_error: "harus diisi" }).min(1, "harus diisi"),
  });

  type Login = z.infer<typeof LoginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({
    resolver: zodResolver(LoginSchema),
  });

  const submitHandler: SubmitHandler<Login> = async (data, e) => {
    try {
      e?.preventDefault();
      setIsProcessing(true);
      // const postData = {
      //   username: data.username,
      //   password: data.password,
      // };
      // const login = await fetch(`${APIURL}/login`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(postData),
      // });
      // const res = await login.json();
      // if (res.success === false) return toast.error(res.message);
      // Cookies.set("nama", res?.nama, { expires: 1 });
      // Cookies.set("grup", res?.nama_group, { expires: 1 });
      // Cookies.set("token", res?.token, { expires: 1 });
      /* GET APIV2 */
      const postData = {
        username: data.username,
        password: data.password,
      };
      const login = await fetch(`${APIURL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const resp = await login.json();
      if (resp.status !== "Ok") throw new Error(resp.message);
      // console.log(resp.data);
      Cookies.set("nama", resp.data?.nama, { expires: 1 });
      Cookies.set("grup", resp.data?.group, { expires: 1 });
      Cookies.set("grupId", resp.data?.id_group, { expires: 1 });
      Cookies.set("token", resp.data?.token, { expires: 1 });
      Cookies.set("id", resp.data?.id_pegawai, { expires: 1 });
      router.refresh();
      // console.log(lastUrl);
      // lastUrl ? router.push(lastUrl) : router.push("/home");
      router.push("/home");
      toast.success("Berhasil masuk");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Suspense>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex w-full flex-col justify-center px-8 pb-8 pt-4"
      >
        <div className="flex flex-col gap-2">
          <div>
            <Input
              className={cn(errors.username && "border-red-500")}
              placeholder="Username"
              autoFocus
              {...register("username")}
            />
          </div>
          <div className="relative">
            <Input
              className={cn(errors.password && "border-red-500")}
              type={hidePass ? "" : "password"}
              placeholder="Password"
              {...register("password")}
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center hover:cursor-pointer"
              onClick={() => setHidePass(!hidePass)}
            >
              <IconContext.Provider
                value={{
                  size: "1.2rem",
                  className: "text-slate-400 hover:text-slate-500",
                }}
              >
                {hidePass ? <RiEyeLine /> : <RiEyeOffLine />}
              </IconContext.Provider>
            </div>
          </div>
          <Button
            type="submit"
            loading={isProcessing}
            className="mt-3 block w-full"
          >
            Login
          </Button>
        </div>
      </form>
    </Suspense>
  );
}
