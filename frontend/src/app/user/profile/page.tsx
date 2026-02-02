import UserNav from "@/components/Navbar/UserNav";
import { useAuthContext } from "@/context/AuthContext";

export default function UserProfile(){
    const {user} = useAuthContext();
    return(
        <div>
            <UserNav />

        </div>
    );
}