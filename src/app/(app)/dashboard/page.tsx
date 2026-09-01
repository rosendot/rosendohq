import DashboardHome from "@/components/dashboard/DashboardHome";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#08080c] px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pt-8">
      <div className="w-full">
        <DashboardHome />
      </div>
    </div>
  );
}
