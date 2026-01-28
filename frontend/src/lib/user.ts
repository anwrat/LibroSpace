import { api } from "./axios";

export function getAllBooksforUser(){
    return api.get('/api/users/books');
}

export function getUserShelves() {
    return api.get('/api/users/shelf');
}
