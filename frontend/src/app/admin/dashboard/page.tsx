'use client';
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

export default function AdminDashboard(){
    const {user,loading} = useAuthContext();
    useEffect(()=>{
        if(!loading ){
            if(!user || user.role !== 'admin'){
                window.location.href='/';
            }
        }
    },[loading,user]);
    if(loading){
        return <p>Loading...</p>; 
    }
    if(!user || user.role!== 'admin') return null;
    return(
        <div>
            <p>Welcome to the admin dashboard</p>
        </div>
    )
}