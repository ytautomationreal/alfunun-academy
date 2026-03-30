"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { GalleryImage } from "@/lib/types";

export default function GalleryManagement() {
    const { showToast } = useToast();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Academy");
    const [videoUrl, setVideoUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await fetch("/api/gallery", { cache: "no-store" });
            const data = await res.json();
            if (data.success) {
                setImages(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error(uploadData.error);

            // 2. Save Metadata
            const dbRes = await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    category,
                    imageUrl: uploadData.url,
                    video_url: videoUrl,
                }),
            });
            const dbData = await dbRes.json();

            if (dbData.success) {
                showToast("Image uploaded successfully!", "success");

                // Reset form
                setTitle("");
                setVideoUrl("");
                setFile(null);
                setPreview(null);

                // Refresh list
                fetchImages();
            } else {
                throw new Error(dbData.error);
            }
        } catch (error) {
            showToast((error as Error).message, "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            console.log("Attempting to delete image:", id);
            const res = await fetch(`/api/gallery/${id}`, {
                method: "DELETE",
            });

            let data;
            try {
                const text = await res.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    console.error("Failed to parse JSON response:", text);
                    data = { error: "Invalid server response: " + text.substring(0, 50) + "..." };
                }
            } catch (e) {
                console.error("Failed to read response body", e);
                data = { error: "Network error reading response" };
            }

            if (res.ok && data.success) {
                setImages(images.filter((img) => img.id !== id));
                showToast("Image deleted successfully", "success");
            } else {
                console.error("Delete failed:", data);
                showToast(data.error || "Failed to delete image", "error");
            }
        } catch (error) {
            console.error("Delete exception:", error);
            showToast("An error occurred while deleting", "error");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Gallery Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Section */}
                <Card className="md:col-span-1 border-white/5 bg-zinc-900/50 h-fit">
                    <CardHeader>
                        <CardTitle>Upload New Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {preview ? (
                                    <div className="relative w-full h-40">
                                        <Image src={preview} alt="Preview" fill className="object-cover rounded-md" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        <Upload className="w-8 h-8" />
                                        <span className="text-sm">Click or drag image here</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Annual Function"
                                    className="bg-zinc-950/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Category</label>
                                <Input
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Academy"
                                    className="bg-zinc-950/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Video URL (Optional)</label>
                                <Input
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="e.g. https://youtube.com/..."
                                    className="bg-zinc-950/50"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                                disabled={uploading || !file}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    "Upload Image"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Images Grid */}
                <Card className="md:col-span-2 border-white/5 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Gallery Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                            </div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">
                                No images found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((img) => (
                                    <div key={img.id} className="group relative aspect-square rounded-md overflow-hidden bg-black/40 border border-white/5">
                                        <Image
                                            src={img.imageUrl}
                                            alt={img.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                            <p className="text-sm font-medium text-white line-clamp-1">{img.title}</p>
                                            <p className="text-xs text-zinc-400 mb-2">{img.category}</p>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(img.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
