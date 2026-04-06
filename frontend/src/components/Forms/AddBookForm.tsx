"use client";
import { useState, useEffect } from "react";
import { addNewBook, updateBook, checkifBookExists, getAllGenres } from "@/lib/admin";
import { Button, TextField, Typography, Box, Autocomplete, Chip } from "@mui/material";
import { Image as ImageIcon, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface AddBookFormProps {
  initialData?: any | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AddBookForm({ initialData, onClose, onRefresh }: AddBookFormProps) {
  const [loading, setLoading] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    description: initialData?.description || "",
    published_date: initialData?.published_date ? new Date(initialData.published_date).toISOString().split('T')[0] : "",
    pageCount: initialData?.pagecount ?? 0, 
  });

  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialData?.cover_url || "");

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getAllGenres();
        const allGenresFromDB = res.data.data || [];
        setAvailableGenres(allGenresFromDB);

        // Map backend string array ["Manga"] to full objects [{id: 1, name: "Manga"}]
        if (initialData?.genres && Array.isArray(initialData.genres)) {
          const mapped = initialData.genres.map((genreName: string) => {
            return allGenresFromDB.find((g: any) => g.name === genreName);
          }).filter(Boolean);
          
          setSelectedGenres(mapped);
        }
      } catch (err) {
        console.error("Failed to load genres", err);
      }
    };
    init();
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("author", form.author);
    data.append("description", form.description);
    data.append("published_date", form.published_date);
    data.append("pageCount", (form.pageCount || 0).toString());
    
    if (cover) data.append("cover", cover);
    
    // Send only IDs back to the backend
    const genreIds = selectedGenres.map(g => g.id);
    data.append("genres", JSON.stringify(genreIds));

    try {
      if (initialData) {
        await updateBook(initialData.id, data);
        toast.success("Book updated!");
      } else {
        const exists = await checkifBookExists(form.title, form.author);
        if(exists.data.exists) {
          setLoading(false);
          return toast.error("Book already exists");
        }
        await addNewBook(data);
        toast.success("Book added!");
      }

      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1000);
    } catch (error: any) {
        toast.error("Operation failed");
    } finally {
        setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 4, width: '100%', bgcolor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
      <Toaster />
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#14919B', fontFamily: 'var(--font-main)' }}>
        {initialData ? "Edit Book Entry" : "Add New Book"}
      </Typography>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField 
            fullWidth 
            label="Title" 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            required 
          />
          <TextField 
            fullWidth 
            label="Author" 
            value={form.author} 
            onChange={(e) => setForm({...form, author: e.target.value})} 
            required 
          />
          <TextField 
            fullWidth 
            label="Date" 
            type="date" 
            InputLabelProps={{shrink:true}} 
            value={form.published_date} 
            onChange={(e) => setForm({...form, published_date: e.target.value})} 
            required 
          />
          <TextField 
            fullWidth 
            label="Pages" 
            type="number" 
            value={form.pageCount || ""} 
            onChange={(e) => setForm({...form, pageCount: parseInt(e.target.value) || 0})} 
          />
        </div>

        <Autocomplete
          multiple
          options={availableGenres}
          getOptionLabel={(option) => option.name || ""}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={selectedGenres}
          onChange={(_, val) => setSelectedGenres(val)}
          renderInput={(params) => <TextField {...params} label="Genres" placeholder="Select categories" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                key={option.id}
                sx={{ bgcolor: '#14919B', color: 'white', fontWeight: 'bold' }}
              />
            ))
          }
        />

        <TextField 
          fullWidth 
          multiline 
          rows={4} 
          label="Description" 
          value={form.description} 
          onChange={(e) => setForm({...form, description: e.target.value})} 
        />

        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700">Cover Image</label>
          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            {preview ? (
              <div className="relative group">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-24 h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => { setCover(null); setPreview(""); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-32 flex items-center justify-center bg-gray-200 rounded-lg text-gray-400">
                <ImageIcon size={32} />
              </div>
            )}
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                id="cover-upload"
                className="hidden"
                onChange={handleImageChange}
              />
              <label 
                htmlFor="cover-upload"
                className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
              >
                {preview ? "Change Image" : "Upload Image"}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={loading} 
              sx={{ bgcolor: '#14919B', py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#0d6169' }}}
            >
                {loading ? "Processing..." : (initialData ? "Update Book" : "Add Book")}
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={onClose}
              sx={{ borderRadius: '12px', borderColor: '#d1d5db', color: '#4b5563' }}
            >
              Cancel
            </Button>
        </div>
      </form>
    </Box>
  );
}