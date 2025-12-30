'use client';
import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { Button } from "@mui/material";
import GoogleButton from "../Buttons/GoogleButton";
import { useRouter } from "next/navigation";
import {User, Lock, Eye, EyeOff} from 'lucide-react';
import { getCurrentUser } from "@/lib/auth";

export default function LoginForm(){
    const [userID,setuserID] = useState('');
    const [password,setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const gotoRegister = () =>{
        router.push('/register');
    };

    async function handlelogin(e:any){
        e.preventDefault();
        try{
            await loginUser({loginID:userID,password});
            const res = await getCurrentUser();
            if(res.data.user.role === 'admin'){
                window.location.href = '/admin';
            }
            else{
                window.location.href = '/dashboard';
            }
        }catch(err){
            console.error("Login failed", err);
        }
    }

    return(
        <form onSubmit={handlelogin} className="flex flex-col gap-10">
            <p className="font-main font-semibold text-4xl">Log In</p>
            {/* Username or Email */}
            <div className="flex border-b gap-2 py-3">
                <User/>
                <input type = "text" placeholder ="Username or Email" value={userID} onChange={(e)=>{setuserID(e.target.value)}} required className="w-full font-main"/>
            </div>
            {/* Password */}
            <div className="flex border-b gap-2 py-3">
                <Lock/>
                <input type ={showPassword?"text":"password"} placeholder ="Password" value={password} onChange={(e)=>{setPassword(e.target.value)}} required className="w-full font-main"/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?(<EyeOff/>):(<Eye/>)}</button>
            </div>
            <p className="text-[#14919B] font-main text-right">Forgot your password?</p>
            <Button type="submit" variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}}>Login</Button>
            <div className="flex flex-col items-center gap-6">
                <span className="font-main">OR</span>
                <GoogleButton/>
                <p className="font-main">Don't have an account? <a onClick={gotoRegister} className="cursor-pointer text-[#14919B]">Register</a></p>
            </div>
        </form>
    )
}