"use client";
import { SessionProvider } from "next-auth/react"
import { Button } from '@/components/ui/button';
import Link from "next/link";
const Home = () => {
  return (
    <div>
      <SessionProvider>
        <div className="flex justify-end p-4 gap-4">
          <Button>
            <Link href="login">Đăng Nhập</Link>
          </Button>
        </div>
      </SessionProvider>
    </div>
  );
};

export default Home;