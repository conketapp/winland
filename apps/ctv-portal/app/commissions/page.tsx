/**
 * 💰 COMMISSIONS & WITHDRAWALS PAGE (CTV Portal)
 *
 * @route /commissions
 * @features View commissions PENDING/APPROVED/PAID and create withdrawal requests
 * @date 02-12-2025
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Sun,
  Moon,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { AnimatedBottomNavigation } from "@/components/AnimatedBottomNavigation";
import { useNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/lib/utils";
import { toastNotification } from "@/app/utils/toastNotification";

type CommissionStatus = "PENDING" | "APPROVED" | "PAID";

interface Commission {
  id: string;
  amount: number;
  status: CommissionStatus;
  paidAt?: string | null;
  createdAt: string;
  unit: { code?: string; project?: { name?: string } };
}

interface PaymentRequest {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  createdAt: string;
}

interface SummaryResponse {
  summary: {
    totalEarned: number;
    pending: number;
    approved: number;
    paid: number;
    count: {
      total: number;
      pending: number;
      approved: number;
      paid: number;
    };
  };
  paymentRequests: PaymentRequest[];
  commissions: Commission[];
}

export default function CommissionsPage(): JSX.Element {
  const router = useRouter();
  const { activeNav, setActiveNav } = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"all" | CommissionStatus>("all");

  useEffect(() => {
    const userPhone = sessionStorage.getItem("login:userPhone");
    if (!userPhone) {
      router.push("/login");
      return;
    }
    fetchSummary(userPhone);
  }, [router]);

  const fetchSummary = async (userPhone: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment-requests/my-summary", {
        cache: "no-store",
        headers: {
          "x-user-phone": userPhone,
        },
      });
      if (!res.ok) {
        throw new Error("Không thể tải dữ liệu hoa hồng");
      }
      const json = (await res.json()) as SummaryResponse;
      setData(json);
    } catch (error) {
      console.error("Error fetching commissions summary:", error);
      toastNotification.error("Không thể tải dữ liệu hoa hồng");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("login:userPhone");
    router.push("/login");
  };

  const handleCreateRequest = async (commissionId: string, amount: number) => {
    try {
      setCreatingRequest(true);
      const userPhone = sessionStorage.getItem("login:userPhone") || "";
      const res = await fetch("/api/payment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-phone": userPhone,
        },
        body: JSON.stringify({
          commissionId,
          amount,
          bankName: "",
          bankAccount: "",
          bankAccountName: "",
          notes: "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Không thể tạo yêu cầu rút tiền");
      }

      toastNotification.success("Đã gửi yêu cầu rút tiền cho hoa hồng này");
      if (userPhone) {
        await fetchSummary(userPhone);
      }
    } catch (error: unknown) {
      console.error("Create payment request error:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo yêu cầu rút tiền";
      toastNotification.error(errorMessage);
    } finally {
      setCreatingRequest(false);
    }
  };

  const filteredCommissions =
    data?.commissions.filter((c) =>
      selectedStatus === "all" ? true : c.status === selectedStatus,
    ) || [];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#0C1125] text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`rounded-b-3xl shadow-md ${
          isDark ? "bg-[#10182F]" : "bg-[#041b40] text-white"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Hoa hồng & Rút tiền</h1>
            </div>
            <p className="text-xs opacity-80 mt-1 ml-9">
              Theo dõi hoa hồng và gửi yêu cầu rút tiền
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>Không thể tải dữ liệu hoa hồng</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div
                className={`rounded-2xl p-6 shadow-md ${
                  isDark ? "bg-[#1B2342]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">Tổng hoa hồng</p>
                    <p className="text-2xl font-bold mt-2 text-emerald-500">
                      {formatCurrency(data.summary.totalEarned)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 shadow-md ${
                  isDark ? "bg-[#1B2342]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">Đang chờ rút</p>
                    <p className="text-2xl font-bold mt-2 text-yellow-500">
                      {formatCurrency(data.summary.pending)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-100">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 shadow-md ${
                  isDark ? "bg-[#1B2342]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">Đã duyệt chờ trả</p>
                    <p className="text-2xl font-bold mt-2 text-blue-500">
                      {formatCurrency(data.summary.approved)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 shadow-md ${
                  isDark ? "bg-[#1B2342]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">Đã thanh toán</p>
                    <p className="text-2xl font-bold mt-2 text-green-500">
                      {formatCurrency(data.summary.paid)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter tabs */}
            <div
              className={`rounded-2xl p-4 shadow-md mb-6 ${
                isDark ? "bg-[#1B2342]" : "bg-white"
              }`}
            >
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "Tất cả", count: data.summary.count.total },
                  { key: "PENDING", label: "Chờ rút", count: data.summary.count.pending },
                  { key: "APPROVED", label: "Đã duyệt", count: data.summary.count.approved },
                  { key: "PAID", label: "Đã thanh toán", count: data.summary.count.paid },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setSelectedStatus(tab.key as "all" | CommissionStatus)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedStatus === tab.key
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "bg-[#10182F] text-slate-300 hover:bg-[#1B2342]"
                        : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Commissions list */}
            <section
              className={`rounded-3xl p-6 shadow-md ${
                isDark ? "bg-[#1B2342]" : "bg-white"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2">Danh sách hoa hồng</h2>
              <p className="text-sm opacity-70 mb-4">
                Hoa hồng được tạo khi hợp đồng hoàn tất (unit SOLD)
              </p>

              {filteredCommissions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                  <p>Chưa có hoa hồng nào cho trạng thái này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCommissions.map((c) => (
                    <div
                      key={c.id}
                      className={`rounded-2xl p-4 flex items-center justify-between gap-4 border ${
                        isDark
                          ? "border-slate-700 bg-[#10182F]"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">
                            Hoa hồng căn {c.unit?.code || "N/A"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : c.status === "APPROVED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {c.status === "PENDING"
                              ? "Chờ rút"
                              : c.status === "APPROVED"
                              ? "Đã duyệt"
                              : "Đã thanh toán"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          Tạo lúc:{" "}
                          {new Date(c.createdAt).toLocaleString("vi-VN")}
                        </p>
                        {c.paidAt && (
                          <p className="text-xs text-emerald-600 mt-1">
                            Đã thanh toán:{" "}
                            {new Date(c.paidAt).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold text-emerald-500">
                            {formatCurrency(c.amount)}
                          </span>
                        </div>
                        {c.status === "PENDING" && (
                          <button
                            disabled={creatingRequest}
                            onClick={() => handleCreateRequest(c.id, c.amount)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {creatingRequest ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3 h-3" />
                            )}
                            Yêu cầu rút
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent payment requests */}
            <section className="mt-8">
              <div
                className={`rounded-3xl p-6 shadow-md ${
                  isDark ? "bg-[#1B2342]" : "bg-white"
                }`}
              >
                <h2 className="text-lg font-semibold mb-2">
                  Yêu cầu rút tiền gần đây
                </h2>
                <p className="text-sm opacity-70 mb-4">
                  Theo dõi trạng thái các yêu cầu rút hoa hồng
                </p>

                {data.paymentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có yêu cầu rút tiền nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.paymentRequests.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-2xl p-4 flex items-center justify-between gap-4 border ${
                          isDark
                            ? "border-slate-700 bg-[#10182F]"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            Yêu cầu #{r.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tạo lúc:{" "}
                            {new Date(r.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-emerald-500">
                            {formatCurrency(r.amount)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : r.status === "APPROVED"
                                ? "bg-blue-100 text-blue-700"
                                : r.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status === "PENDING"
                              ? "Chờ duyệt"
                              : r.status === "APPROVED"
                              ? "Đã duyệt"
                              : r.status === "PAID"
                              ? "Đã thanh toán"
                              : "Bị từ chối"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`text-center text-sm py-4 ${
          isDark ? "bg-[#10182F] text-slate-400" : "bg-white text-slate-500 border-t"
        }`}
      >
        © 2025 <span className="font-semibold">Bất Động Sản Winland</span>. Tất cả quyền được bảo
        lưu.
      </footer>

      {/* Bottom navigation */}
      <AnimatedBottomNavigation
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        darkMode={isDark}
      />
    </div>
  );
}


