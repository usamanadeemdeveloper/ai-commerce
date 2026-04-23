"use client";

import { Button } from "@/components/ui/button";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, Package, Shield, ShoppingBag, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const { isSignedIn, user } = useUser();

  const isAdmin = user?.publicMetadata?.role === "admin";

  const { openCart } = useCartActions();
  const { openChat } = useChatActions();
  const isChatOpen = useIsChatOpen();
  const totalItems = useTotalItems();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsMobile(mq.matches);

    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            The Furniture Store
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Links (ONLY visible for admin) */}
          {isAdmin && (
            <>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>

              <Button asChild className="hidden sm:inline-flex">
                <Link href="/studio" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Studio
                </Link>
              </Button>
            </>
          )}

          {/* My Orders - Only when signed in */}
          {isSignedIn && (
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/orders" className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="text-sm font-medium">My Orders</span>
              </Link>
            </Button>
          )}

          {/* AI Shopping Assistant */}
          {!isChatOpen && (
            <Button
              onClick={openChat}
              className="hidden sm:inline-flex gap-2 bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-300/50 dark:shadow-amber-900/30 dark:hover:shadow-amber-800/40 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ask AI</span>
            </Button>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:inline-flex cursor-pointer"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <span className="sr-only">Open cart ({totalItems} items)</span>
          </Button>

          {/* User */}
          {isSignedIn ? (
            <UserButton
              afterSwitchSessionUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            >
              <UserButton.MenuItems>
                {isMobile ? (
                  <UserButton.Link
                    label="My Orders"
                    labelIcon={<Package className="h-4 w-4" />}
                    href="/orders"
                  />
                ) : null}

                {isMobile && !isChatOpen ? (
                  <UserButton.Action
                    label="Ask AI"
                    labelIcon={<Sparkles className="h-4 w-4" />}
                    onClick={openChat}
                  />
                ) : null}

                {isMobile ? (
                  <UserButton.Action
                    label={
                      totalItems > 0
                        ? `Cart (${totalItems > 99 ? "99+" : totalItems})`
                        : "Cart"
                    }
                    labelIcon={<ShoppingBag className="h-4 w-4" />}
                    onClick={openCart}
                  />
                ) : null}

                {/* Admin mobile shortcut */}
                {isMobile && isAdmin ? (
                  <UserButton.Link
                    label="Admin Panel"
                    labelIcon={<Shield className="h-4 w-4" />}
                    href="/admin"
                  />
                ) : null}

                {isMobile && isAdmin ? (
                  <UserButton.Link
                    label="Studio"
                    labelIcon={<LayoutDashboard className="h-4 w-4" />}
                    href="/studio"
                  />
                ) : null}
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
