"use client";
import { useState, useEffect } from "react";
import { addNewBook, checkifBookExists, getAllGenres } from "@/lib/admin";
import { Button, TextField, Typography, Box, Autocomplete, Chip } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";

interface AddBookFormProps {
  onClose: () => void;
  onRefresh: () => void;
}

interface GenreType {
  id: number;
  name: string;
}

export default function AddBookForm({ onClose, onRefresh }: AddBookFormProps) {
  const [loading, setLoading] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<GenreType[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<GenreType[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    published_date: "",
    pageCount: 0,
  });
  const [cover, setCover] = useState<File | null>(null);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getAllGenres();
        setAvailableGenres(res.data.data || []);
      } catch (err) {
        console.error("Failed to load genres", err);
      }
    };
    fetchGenres();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.title || !form.author || !form.published_date) {
      return toast.error("Please fill in all required fields");
    }
    if (!cover) return toast.error("Please upload a cover image");

    setLoading(true);
    const data = new FormData();
    data.append("title", form.title);
    data.append("author", form.author);
    data.append("description", form.description);
    data.append("published_date", form.published_date);
    data.append("pageCount", form.pageCount.toString());
    data.append("cover", cover);
    
    // Append genre IDs as a JSON string
    const genreIds = selectedGenres.map(g => g.id);
    data.append("genres", JSON.stringify(genreIds));

    try {
      const exists = await checkifBookExists(form.title, form.author);
      if(exists.data.exists){
        setLoading(false);
        return toast.error("This book already exists");
      }
      
      const res = await addNewBook(data);
      if (res.status === 201) {
        toast.success("Book added successfully!");
        setTimeout(() => {
          onRefresh();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "An error occurred during upload");
    } finally {
        setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 4, width: '100%', bgcolor: 'background.paper', borderRadius: 2, maxHeight: '90vh', overflowY: 'auto' }}>
      <Toaster position='top-center' reverseOrder={false} />
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', fontFamily: 'var(--font-main)', color: '#14919B' }}>
        Add New Book
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Page Count"
            type="number"
            required
            onChange={(e) => setForm({ ...form, pageCount: parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Multi-Select Genre Field */}
        <Autocomplete
          multiple
          options={availableGenres}
          getOptionLabel={(option) => option.name}
          value={selectedGenres}
          onChange={(_, newValue) => setSelectedGenres(newValue)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Select Genres" placeholder="Search genres..." />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                sx={{ bgcolor: '#14919B', color: 'white', fontWeight: 'bold' }}
              />
            ))
          }
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600 ml-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#14919B] file:bg-opacity-10 file:text-[#14919B] hover:file:bg-opacity-20 cursor-pointer border border-gray-300 rounded-lg p-1"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
          />
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
              py: 1.5,
              borderRadius: '10px'
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
              fontFamily: 'var(--font-main)',
              borderRadius: '10px'
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
}