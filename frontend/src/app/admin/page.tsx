'use client';
import AdminNav from "@/components/Navbar/AdminNav";

export default function AdminDashboard(){
    return(
        <div className="flex items-center min-h-screen justify-center bg-white">
            <AdminNav />
            <p>Welcome to the admin dashboard</p>
        </div>
    )
}