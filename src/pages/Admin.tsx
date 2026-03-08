import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, LogOut, Upload, Image as ImageIcon, Package, FileText, Wrench, Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" /> Products</TabsTrigger>
            <TabsTrigger value="services"><Wrench className="h-4 w-4 mr-1" /> Services</TabsTrigger>
            <TabsTrigger value="gallery"><ImageIcon className="h-4 w-4 mr-1" /> Gallery</TabsTrigger>
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" /> Page Content</TabsTrigger>
          </TabsList>

          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="services"><ServicesManager /></TabsContent>
          <TabsContent value="gallery"><GalleryManager /></TabsContent>
          <TabsContent value="content"><ContentManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ============ PRODUCTS MANAGER ============
function ProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', unit: '', location: '', stock: '', tags: '' });

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadProductImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(filePath, imageFile);
    if (error) {
      toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    return publicUrl;
  };

  const addProduct = async () => {
    if (!form.name || !form.category) return;
    setUploading(true);
    const imageUrl = await uploadProductImage();
    const { error } = await supabase.from('products').insert({
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      unit: form.unit || 'each',
      location: form.location,
      stock: parseInt(form.stock) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      image_url: imageUrl || '/placeholder.svg',
    });
    setUploading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product added' });
      setForm({ name: '', category: '', price: '', unit: '', location: '', stock: '', tags: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.image_url?.includes('/images/')) {
      const urlParts = product.image_url.split('/images/');
      if (urlParts[1]) await supabase.storage.from('images').remove([urlParts[1]]);
    }
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Product deleted' });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add New Product</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Category *</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Seeds, Fertilizer, Tools..." /></div>
            <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="per kg, each..." /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Product Image</Label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex-1">
                  <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">{imageFile ? imageFile.name : 'Click to select image'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />
                )}
              </div>
            </div>
          </div>
          <Button variant="hero" className="mt-4" onClick={addProduct} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            {uploading ? 'Adding...' : 'Add Product'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Products ({products.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url || '/placeholder.svg'} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · KES {p.price} · {p.stock} in stock</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-muted-foreground">No products yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ SERVICES MANAGER ============
function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: '', features: '', bookings: '' });

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const addService = async () => {
    if (!form.name) return;
    const { error } = await supabase.from('services').insert({
      name: form.name,
      description: form.description,
      price: form.price,
      duration: form.duration,
      category: form.category,
      features: form.features.split('\n').filter(Boolean),
      bookings: form.bookings,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Service added' });
      setForm({ name: '', description: '', price: '', duration: '', category: '', features: '', bookings: '' });
      fetchServices();
    }
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    toast({ title: 'Service deleted' });
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add New Service</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Price</Label><Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><Label>Duration</Label><Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
            <div><Label>Bookings</Label><Input value={form.bookings} onChange={e => setForm(f => ({ ...f, bookings: e.target.value }))} placeholder="500+" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={5} /></div>
          </div>
          <Button variant="hero" className="mt-4" onClick={addService}><Plus className="h-4 w-4 mr-1" /> Add Service</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Services ({services.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.category} · {s.price}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {services.length === 0 && <p className="text-sm text-muted-foreground">No services yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ GALLERY MANAGER ============
function GalleryManager() {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', alt: '' });

  const fetchImages = async () => {
    const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
    setImages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const filePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      
      await supabase.from('gallery_images').insert({
        src: publicUrl,
        alt: file.name.replace(/\.[^.]+$/, ''),
        title: '',
        description: '',
        sort_order: images.length,
      });
    }

    toast({ title: 'Images uploaded' });
    setUploading(false);
    fetchImages();
  };

  const deleteImage = async (img: any) => {
    const urlParts = img.src.split('/images/');
    if (urlParts[1]) {
      await supabase.storage.from('images').remove([urlParts[1]]);
    }
    await supabase.from('gallery_images').delete().eq('id', img.id);
    toast({ title: 'Image deleted' });
    fetchImages();
  };

  const startEdit = (img: any) => {
    setEditingId(img.id);
    setEditForm({ title: img.title || '', description: img.description || '', alt: img.alt || '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('gallery_images').update(editForm).eq('id', editingId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Image updated' });
      setEditingId(null);
      fetchImages();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Upload Images</CardTitle></CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8 text-muted-foreground mb-2" />}
            <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload images (JPG, PNG)'}</span>
            <input type="file" className="hidden" accept="image/*" multiple onChange={uploadImage} disabled={uploading} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Gallery Images ({images.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map(img => (
                <div key={img.id} className="border rounded-lg overflow-hidden">
                  <div className="relative group">
                    <img src={img.src} alt={img.alt} className="aspect-square object-cover w-full" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteImage(img)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {editingId === img.id ? (
                    <div className="p-3 space-y-2">
                      <div><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Image title" /></div>
                      <div><Label className="text-xs">Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Image description" rows={2} /></div>
                      <div><Label className="text-xs">Alt Text</Label><Input value={editForm.alt} onChange={e => setEditForm(f => ({ ...f, alt: e.target.value }))} placeholder="Alt text" /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 cursor-pointer" onClick={() => startEdit(img)}>
                      <p className="font-medium text-sm truncate">{img.title || 'No title'}</p>
                      <p className="text-xs text-muted-foreground truncate">{img.description || 'Click to add details'}</p>
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No images yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ CONTENT MANAGER ============
function ContentManager() {
  const { toast } = useToast();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ page_slug: '', section_key: '', title: '', content: '' });

  const fetchContent = async () => {
    const { data } = await supabase.from('page_content').select('*').order('page_slug');
    setContents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const saveContent = async () => {
    if (!form.page_slug || !form.section_key) return;
    const { error } = await supabase.from('page_content').upsert({
      page_slug: form.page_slug,
      section_key: form.section_key,
      title: form.title,
      content: form.content,
    }, { onConflict: 'page_slug,section_key' });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Content saved' });
      setForm({ page_slug: '', section_key: '', title: '', content: '' });
      fetchContent();
    }
  };

  const deleteContent = async (id: string) => {
    await supabase.from('page_content').delete().eq('id', id);
    toast({ title: 'Content deleted' });
    fetchContent();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add / Edit Page Content</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Page Slug *</Label><Input value={form.page_slug} onChange={e => setForm(f => ({ ...f, page_slug: e.target.value }))} placeholder="about, services, home..." /></div>
            <div><Label>Section Key *</Label><Input value={form.section_key} onChange={e => setForm(f => ({ ...f, section_key: e.target.value }))} placeholder="hero, mission, vision..." /></div>
            <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Content</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} /></div>
          </div>
          <Button variant="hero" className="mt-4" onClick={saveContent}><Plus className="h-4 w-4 mr-1" /> Save Content</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Page Content ({contents.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-3">
              {contents.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.page_slug} / {c.section_key}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.title || c.content?.slice(0, 80)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteContent(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {contents.length === 0 && <p className="text-sm text-muted-foreground">No content yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Admin;
