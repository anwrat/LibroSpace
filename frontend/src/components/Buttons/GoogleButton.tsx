import Image from "next/image";

export default function GoogleButton(){
    return(
        <button className="flex items-center gap-2 border shadow rounded-md px-1 py-2 cursor-pointer hover:bg-[#D5D2D2] hover:border-[#D5D2D2]">
            <Image src = "/Google/Googlelogo.png" alt="Google Logo" width = {20} height = {20}/>
            <p className="font-main font-semibold text-[15px]">SIGN IN WITH GOOGLE</p>
        </button>
    )
}