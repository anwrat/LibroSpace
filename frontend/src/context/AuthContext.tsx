//Context for accessing the current logged in user
'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser,logOut } from "@/lib/auth";
import { User } from "@/types/user";

// This defines the shape of the data to be shared through the AuthContext
interface AuthContextType{
    user: User | null;
    loading: boolean; //boolean to show if authentication status is being checked
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}:{children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // On loading the component, check if the user is authenticated
    useEffect(()=>{
        const loadUser = async() =>{
            try{
                const res = await getCurrentUser();
                setUser(res.data.user);
            }catch{
                setUser(null); //If request fails (token invalid or missing), set user to null
            }finally{
                setLoading(false);//Set loading to false after check is complete
            }
        };
        loadUser();
    },[]);

    //For logging out the user
    const logout = async() =>{
        await logOut();
        setUser(null);
        window.location.href = '/';
    };
    return(
        <AuthContext.Provider value ={{user,loading, logout}}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}