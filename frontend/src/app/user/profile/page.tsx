import UserNav from "@/components/Navbar/UserNav";

export default function UserProfile(){
    return(
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
            <UserNav />
            <div>
                <h1 className="text-3xl font-main text-[#14919B]">User Profile</h1>
            </div>
        </div>
    );
}