import { api } from "./axios";

export function getAllBooksforUser(){
    return api.get('/api/users/books');
}

export function getUserShelves() {
    return api.get('/api/users/shelf');
}

export function getBookbyID(id: number){
    return api.get(`/api/users/books/${id}`);
}

export function addBooktoShelf(bookId: number, shelf: string){
    return api.post('/api/users/shelf',{bookId, shelf});
}
