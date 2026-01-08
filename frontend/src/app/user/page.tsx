import UserNav from "@/components/Navbar/UserNav"

export default function Dashboard(){
    return(
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
            <UserNav />
            <p>Welcome to the user dashboard</p>
        </div>
    )
}