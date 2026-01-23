import { api } from "./axios";

export function getUserShelves() {
    return api.get('/api/users/shelf/');
}
