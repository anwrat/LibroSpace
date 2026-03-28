export interface BookListing {
  id: number;
  user_id: number; // The owner
  book_title: string;
  author?: string;
  description?: string;
  image_url?: string;
  location?: string;
  status: 'available' | 'swapped' | 'hidden';
  created_at: string;
  owner_name?: string; // If joined via SQL
}

export interface SwapRequest {
  id: number;
  listing_id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  
  // These are usually joined in the backend for the UI
  book_title: string;
  image_url?: string;
  sender_name?: string; 
  owner_name?: string;
}