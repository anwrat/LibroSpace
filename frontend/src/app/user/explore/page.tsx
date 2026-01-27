import UserNav from "@/components/Navbar/UserNav";

export default function ExplorePage(){
    return(
        <div className="flex min-h-screen bg-gray-50 items-center justify-center">
            <UserNav />
            <p>For now display all books here, later use some categorising</p>
        </div>
    );
}