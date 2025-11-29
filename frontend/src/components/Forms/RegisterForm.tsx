import { useState } from "react";
import { useRouter } from "next/navigation";
import {User,Lock, Eye, EyeOff, Mail} from 'lucide-react';
import GoogleButton from "../Buttons/GoogleButton";
import { Button } from "@mui/material";
import { registerUser } from "@/lib/auth";

export default function RegisterForm(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setconfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const gotoLogin = () =>{
        router.push('/login');
    }

    async function handleRegister(e:any){
        e.preventDefault();
        if(password != confirmPassword){
            alert("Passwords do not match");
            return;
        }
        try{
            await registerUser({name,email,password});
            window.location.href = '/login';
        }catch(err){
            console.error("Login failed", err);
        }
    }

    return(
        <form onSubmit={handleRegister} className="flex flex-col gap-10">
            <p className="font-main font-semibold text-4xl">Sign Up</p>
            {/* Username */}
            <div className="flex border-b gap-2 py-3">
                <User/>
                <input type = "text" placeholder ="Enter Your Username" value={name} onChange={(e)=>{setName(e.target.value)}} required className="w-full font-main"/>
            </div>
            {/* Email */}
            <div className="flex border-b gap-2 py-3">
                <Mail/>
                <input type = "email" placeholder ="Enter Your Email" value={email} onChange={(e)=>{setEmail(e.target.value)}} required className="w-full font-main"/>
            </div>
            {/* Password */}
            <div className="flex border-b gap-2 py-3">
                <Lock/>
                <input type ={showPassword?"text":"password"} placeholder ="Enter Your Password" value={password} onChange={(e)=>{setPassword(e.target.value)}} required className="w-full font-main"/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?(<EyeOff/>):(<Eye/>)}</button>
            </div>
            {/* Confirm Password */}
            <div className="flex border-b gap-2 py-3">
                <Lock/>
                <input type ={showConfirmPassword?"text":"password"} placeholder ="Confirm Password" value={confirmPassword} onChange={(e)=>{setconfirmPassword(e.target.value)}} required className="w-full font-main"/>
                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword?(<EyeOff/>):(<Eye/>)}</button>
            </div>
            <Button type="submit" variant="contained" size="large" sx={{bgcolor:'#14919B', '&:hover':{bgcolor:'#155C62'}, fontFamily:'var(--font-main)'}}>Sign Up</Button>
            <div className="flex flex-col items-center gap-6">
                <span className="font-main">OR</span>
                <GoogleButton/>
                <p className="font-main">Already have an account? <a onClick={gotoLogin} className="cursor-pointer text-[#14919B]">Login</a></p>
            </div>
        </form>
    )
}