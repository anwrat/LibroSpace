'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserNav from "@/components/Navbar/UserNav";
import { createCommunity } from "@/lib/user";
import { Camera, Upload, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.photo) {
      setError("Please upload a community photo.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("photo_url", formData.photo); 

    try {
      await createCommunity(data);
      // Redirect back to communities page on success
      router.push("/user/community"); 
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-main">
      <UserNav />
      
      <main className="max-w-2xl mx-auto pt-32 pb-12 px-6">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#14919B] font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Communities
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Start a Community</h1>
            <p className="text-gray-500 mt-2">Create a space for people to discuss their favorite books.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center">
              <label className="relative cursor-pointer group">
                <div className="h-40 w-40 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#14919B] group-hover:bg-[#14919B]/5">
                  {preview ? (
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-[#14919B]">
                      <Camera size={40} />
                      <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Add Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                <div className="absolute -bottom-2 -right-2 bg-[#14919B] text-white p-3 rounded-2xl shadow-xl">
                  <Upload size={20} />
                </div>
              </label>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-[#14919B] transition-colors">
                  Community Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., The Epic Fantasy Guild"
                  className="w-full mt-2 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#14919B] outline-none transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-[#14919B] transition-colors">
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe what people will talk about here..."
                  className="w-full mt-2 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#14919B] outline-none transition-all font-medium resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#14919B] text-white font-bold rounded-2xl shadow-lg shadow-[#14919B]/20 hover:bg-[#0f7178] hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Launch Community"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}