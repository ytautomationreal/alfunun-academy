import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black">
            {/* Desktop Sidebar */}
            <div className="hidden md:block print:hidden">
                <AdminSidebar />
            </div>

            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-y-auto print:m-0 print:p-0 print:overflow-visible">
                <div className="md:hidden mb-6">
                    {/* Mobile Sidebar Trigger will go here or be part of a header */}
                    <AdminSidebar mobile />
                </div>
                {children}
            </main>
        </div>
    );
}
