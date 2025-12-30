'use client';
import AdminNav from "@/components/Navbar/AdminNav";

export default function Books(){
    return(
        <div className="flex items-center min-h-screen justify-center bg-white">
            <AdminNav />
            <p>Welcome to the books page in admin panel</p>
        </div>
    )
}