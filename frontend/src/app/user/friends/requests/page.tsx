'use client';
import UserNav from "@/components/Navbar/UserNav";
import { getPendingFriendRequests } from "@/lib/user";

export default function FriendRequestsPage(){
    return(
        <div>
            <UserNav />
        </div>
    );
}