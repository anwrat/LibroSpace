'use client';
import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { Button } from "@mui/material";
import GoogleButton from "../Buttons/GoogleButton";
import { useRouter } from "next/navigation";

export default function LoginForm(){
    const [userID,setuserID] = useState('');
    const [password,setPassword] = useState('');
    const router = useRouter();
    const gotoRegister = () =>{
        router.push('/register');
    };

    async function handlelogin(e:any){
        e.preventDefault();
        try{
            await loginUser({loginID:userID,password});
        }catch(err){
            console.error("Login failed", err);
        }
    }

    return(
        <form onSubmit={handlelogin} className="flex flex-col gap-10">
            <p className="font-main font-semibold text-4xl">Log In</p>
            <input type = "text" placeholder ="Username or Email" value={userID} onChange={(e)=>{setuserID(e.target.value)}}/>
            <input type = "password" placeholder ="Password" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
            <p className="text-[#14919B] font-main">Forgot your password?</p>
            <Button variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}}>Login</Button>
            <div className="flex flex-col items-center gap-6">
                <p className="font-main">----OR----</p>
                <GoogleButton/>
                <p className="font-main">Don't have an account? <a onClick={gotoRegister} className="cursor-pointer text-[#14919B]">Register</a></p>
            </div>
        </form>
    )
}