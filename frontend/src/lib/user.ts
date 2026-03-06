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

export function getAllCommunities(){
    return api.get('/api/users/communities');
}

export function getJoinedCommunities(){
    return api.get('/api/users/communities/joined');
}

export function checkCommunityMembership(communityId: number){
    return api.get(`/api/users/communities/${communityId}/membership`);
}

export function createCommunity(data: FormData){
    return api.post('/api/users/communities', data);
}

export function getCommunitybyId(id: number){
    return api.get(`/api/users/communities/${id}`);
}

//For all discussions and comments related to communities
export function startDiscussion(communityId: number, title: string, content: string){
    return api.post(`/api/users/communities/${communityId}/discussions`, {title, content});
}

export function getAllDiscussions(communityId: number){
    return api.get(`/api/users/communities/${communityId}/discussions`);
}

export function getDiscussionDetailsbyId(communityId: number, discussionId: number){
    return api.get(`/api/users/communities/${communityId}/discussions/${discussionId}`);
}

export function addComment(communityId: number, discussionId: number, content: string){
    return api.post(`/api/users/communities/${communityId}/discussions/${discussionId}/comments`, {content});
}

export function getAllComments(communityId: number, discussionId: number){
    return api.get(`/api/users/communities/${communityId}/discussions/${discussionId}/comments`);
}

//For all reading sessions related functions
export function startReadingSession(book_id: number, start_page: number){
    return api.post('/api/users/reading/start', {book_id, start_page});
}

export function updateSessionNotes(session_id: number, notes: string){
    return api.patch('/api/users/reading/notes',{session_id,notes});
}

export function endReadingSession(session_id: number, end_page: number, notes: string, book_id: number){
    return api.post('/api/users/reading/end',{session_id,end_page,notes,book_id});
}

export function getSessionDetails(session_id: number){
    return api.get(`/api/users/reading/${session_id}`);
}

export function getAllReadingSessions(){
    return api.get('/api/users/reading/sessions/all');
}