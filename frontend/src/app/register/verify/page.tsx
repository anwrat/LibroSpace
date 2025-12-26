'use client';
import LandingNav from "@/components/Navbar/LandingNav";
import { useSearchParams } from "next/navigation";
import { verifyRegisterOTP } from "@/lib/auth";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VerifyOtpPage(){
    const sessionId = useSearchParams().get('sessionId');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');       
    const [loading, setLoading] = useState(false); 

    const verifyOtp = async() => {
        // Clear previous errors
        setError('');
        setLoading(true);
        
        try {
            const response = await verifyRegisterOTP(sessionId!, otp);
            // Check if response indicates success
            if (response.data.success) {
                toast.success('Registration successful! Redirecting to login...');
                setTimeout(()=>{
                    window.location.href = '/login';
                },1500);
            } else {
                // Show error from backend
                setError(response.data.message || 'Invalid OTP');
            }
        } catch (err) {
            // Handle network errors or unexpected issues
            setError('Invalid OTP');
            console.error('OTP verification error:', err);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="flex min-h-screen items-center justify-center bg-white">
            <Toaster position="top-center"/>
            <LandingNav showLoginButton={false}/>
            
            <div className="flex flex-col gap-4 max-w-md w-full p-6">
                <h1 className="text-2xl font-bold">Verify Your Email</h1>
                <p className="text-gray-600">Enter the OTP sent to your email</p>
                
                <input 
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border p-2 rounded"
                    disabled={loading}
                    maxLength={6}
                />
                
                {/* Display error message */}
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <button 
                    onClick={verifyOtp}
                    disabled={loading || !otp}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </div>
        </div>
    );
}