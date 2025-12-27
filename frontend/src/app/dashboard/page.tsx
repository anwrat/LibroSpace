'use client';
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Dashboard(){
    const {user,loading} = useAuthContext();
    useEffect(()=>{
        if(!loading && !user){
            window.location.href='/';
        }
    },[loading,user]);//useEffect runs when either loading or user value changes
    if(loading){
        return <p>Loading...</p>; //Show loading state while checking authentication
    }
    if(!user) return null;
    return(
        <div>
            <p>Welcome to the user dashboard</p>
        </div>
    )
}