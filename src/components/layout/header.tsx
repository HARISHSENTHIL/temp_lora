"use client";

import React from "react";
import Image from "next/image";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeb3Auth } from "@/components/layout/web3-auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { userInfo, login, logout, isLoading } = useWeb3Auth();

  return (
    <header className="py-4 px-6 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Layers className="h-6 w-6 text-orange-500" />
        <span className="text-xl font-semibold">Model Multiplexer</span>
      </div>

      <div>
        {isLoading ? (
          <div className="w-[120px] h-10 bg-gray-200 animate-pulse rounded-md"></div>
        ) : userInfo ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                {userInfo.profileImage ? (
                  <Image
                    src={userInfo.profileImage}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">
                      {userInfo.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium">
                  {userInfo.name || userInfo.walletAddress?.slice(0, 6) + "..."}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm">
                  {userInfo.walletAddress}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            onClick={() => login()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
} 