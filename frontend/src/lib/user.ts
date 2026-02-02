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

export function checkBookInShelf(bookId: number){
    return api.get(`/api/users/shelf/${bookId}`);
}

export function addBooktoShelf(bookId: number, shelf: string){
    return api.post('/api/users/shelf',{bookId, shelf});
}

export function getAllFriends(){
    return api.get('/api/users/friends');
}

export function getPendingFriendRequests(userId: number){
    return api.get('/api/users/friends/pending');
}

export function acceptFriendRequest(requesterId: number){
    return api.put('/api/users/friends',{requesterId});
}

export function deleteFriendRequest(targetId: number){
    return api.delete('/api/users/friends',{data: {targetId}});
}