import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 px-5 py-6 md:px-8 md:py-8 max-w-5xl w-full">{children}</div>
    </div>
  );
}
