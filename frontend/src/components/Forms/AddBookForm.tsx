"use client";
import { useState } from "react";
import { addNewBook } from "@/lib/admin";
import { Button, TextField, Typography, Box } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";

interface AddBookFormProps {
  onClose: () => void;
}

export default function AddBookForm({ onClose }: AddBookFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    published_date: "",
    language: "",
  });
  const [cover, setCover] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!form.title || !form.author || !form.published_date) {
      return toast.error("Please fill in all required fields");
    }
    if (!cover) return toast.error("Please upload a cover image");

    setLoading(true);
    console.log(cover);
    const data = new FormData();
    data.append("title", form.title);
    data.append("author", form.author);
    data.append("description", form.description);
    data.append("published_date", form.published_date);
    data.append("language", form.language);
    data.append("cover", cover); 

    try {
      const res = await addNewBook(data);
      if (res.status === 201) {
        toast.success("Book added successfully!");
        // Small delay so user sees the success message before closing
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh table
        }, 1500);
      } else {
        toast.error("Failed to add book");
      }
    } catch (error:any) {
      if(error.response?.status === 409){
        toast.error("This book already exists");
      }
      else{
        toast.error("An error occurred during upload");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 4, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
      <Toaster position='top-center' reverseOrder={false} />
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', fontFamily: 'var(--font-main)' }}>
        Add New Book
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-4 mx-auto">
          <TextField
            fullWidth
            label="Book Title"
            variant="outlined"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Author"
            variant="outlined"
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Published Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setForm({ ...form, published_date: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Language"
            placeholder="e.g. English"
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 ml-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#14919B] file:bg-opacity-10 file:text-[#14919B] hover:file:bg-opacity-20 cursor-pointer"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              flex: 1,
              bgcolor: '#14919B',
              '&:hover': { bgcolor: '#155C62' },
              fontFamily: 'var(--font-main)',
              py: 1.5
            }}
          >
            {loading ? "Adding..." : "Add Book"}
          </Button>
          
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              flex: 1,
              color: '#374151',
              borderColor: '#d1d5db',
              '&:hover': { borderColor: '#9ca3af', bgcolor: '#f3f4f6' },
              fontFamily: 'var(--font-main)'
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
}