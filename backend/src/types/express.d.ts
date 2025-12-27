declare global{
    namespace Express{
        interface User{
            id: number;
            name: string;
            email: string;
        }
    }
}

export{};