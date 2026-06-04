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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, LogOut, Upload, Image as ImageIcon, Package, FileText, Wrench, Loader2, Pencil, Save, X, Megaphone, BookOpen, Mail, Calendar } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

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
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" /> Products</TabsTrigger>
            <TabsTrigger value="services"><Wrench className="h-4 w-4 mr-1" /> Services</TabsTrigger>
            <TabsTrigger value="gallery"><ImageIcon className="h-4 w-4 mr-1" /> Gallery</TabsTrigger>
            <TabsTrigger value="posters"><Megaphone className="h-4 w-4 mr-1" /> Posters</TabsTrigger>
            <TabsTrigger value="guides"><BookOpen className="h-4 w-4 mr-1" /> Guides</TabsTrigger>
            <TabsTrigger value="newsletter"><Mail className="h-4 w-4 mr-1" /> Newsletter</TabsTrigger>
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" /> Page Content</TabsTrigger>
          </TabsList>

          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="services"><ServicesManager /></TabsContent>
          <TabsContent value="gallery"><GalleryManager /></TabsContent>
          <TabsContent value="posters"><PostersManager /></TabsContent>
          <TabsContent value="guides"><GuidesManager /></TabsContent>
          <TabsContent value="newsletter"><NewsletterManager /></TabsContent>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', unit: '', location: '', stock: '', tags: '', is_available: true });
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

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
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
    const imageUrl = imageFile ? await uploadImage(imageFile, 'products') : null;
    const { error } = await supabase.from('products').insert({
      name: form.name, category: form.category,
      price: parseFloat(form.price) || 0, unit: form.unit || 'each',
      location: form.location, stock: parseInt(form.stock) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      image_url: imageUrl || '/placeholder.svg',
    });
    setUploading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product added' });
      setForm({ name: '', category: '', price: '', unit: '', location: '', stock: '', tags: '' });
      setImageFile(null); setImagePreview(null);
      fetchProducts();
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name, category: p.category, price: String(p.price),
      unit: p.unit || '', location: p.location || '', stock: String(p.stock || 0),
      tags: (p.tags || []).join(', '), is_available: p.is_available ?? true,
    });
    setEditImageFile(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    let imageUrl: string | undefined;
    if (editImageFile) {
      const url = await uploadImage(editImageFile, 'products');
      if (url) imageUrl = url;
    }
    const updateData: any = {
      name: editForm.name, category: editForm.category,
      price: parseFloat(editForm.price) || 0, unit: editForm.unit,
      location: editForm.location, stock: parseInt(editForm.stock) || 0,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_available: editForm.is_available,
    };
    if (imageUrl) updateData.image_url = imageUrl;

    const { error } = await supabase.from('products').update(updateData).eq('id', editingId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product updated' });
      setEditingId(null); setEditImageFile(null);
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
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />}
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
                <div key={p.id} className="border rounded-lg overflow-hidden">
                  {editingId === p.id ? (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div><Label className="text-xs">Name</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><Label className="text-xs">Category</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
                        <div><Label className="text-xs">Price (KES)</Label><Input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
                        <div><Label className="text-xs">Unit</Label><Input value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))} /></div>
                        <div><Label className="text-xs">Location</Label><Input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} /></div>
                        <div><Label className="text-xs">Stock</Label><Input type="number" value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} /></div>
                        <div className="sm:col-span-2 lg:col-span-3"><Label className="text-xs">Tags</Label><Input value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} /></div>
                        <div className="flex items-center gap-2">
                          <Switch checked={editForm.is_available} onCheckedChange={v => setEditForm(f => ({ ...f, is_available: v }))} />
                          <Label className="text-xs">Available</Label>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Replace Image</Label>
                          <Input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url || '/placeholder.svg'} alt={p.name} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-medium text-sm">{p.name} {!p.is_available && <span className="text-xs text-destructive">(Unavailable)</span>}</p>
                          <p className="text-xs text-muted-foreground">{p.category} · KES {p.price} · {p.stock} in stock</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  )}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', duration: '', category: '', features: '', bookings: '', sort_order: '0' });
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
      name: form.name, description: form.description,
      price: form.price, duration: form.duration, category: form.category,
      features: form.features.split('\n').filter(Boolean), bookings: form.bookings,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Service added' });
      setForm({ name: '', description: '', price: '', duration: '', category: '', features: '', bookings: '' });
      fetchServices();
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name, description: s.description || '', price: s.price || '',
      duration: s.duration || '', category: s.category || '',
      features: (s.features || []).join('\n'), bookings: s.bookings || '',
      sort_order: String(s.sort_order || 0),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('services').update({
      name: editForm.name, description: editForm.description,
      price: editForm.price, duration: editForm.duration, category: editForm.category,
      features: editForm.features.split('\n').filter(Boolean), bookings: editForm.bookings,
      sort_order: parseInt(editForm.sort_order) || 0,
    }).eq('id', editingId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Service updated' });
      setEditingId(null);
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
                <div key={s.id} className="border rounded-lg overflow-hidden">
                  {editingId === s.id ? (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><Label className="text-xs">Name</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div><Label className="text-xs">Category</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
                        <div><Label className="text-xs">Price</Label><Input value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
                        <div><Label className="text-xs">Duration</Label><Input value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} /></div>
                        <div><Label className="text-xs">Bookings</Label><Input value={editForm.bookings} onChange={e => setEditForm(f => ({ ...f, bookings: e.target.value }))} /></div>
                        <div><Label className="text-xs">Sort Order</Label><Input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Features (one per line)</Label><Textarea value={editForm.features} onChange={e => setEditForm(f => ({ ...f, features: e.target.value }))} rows={4} /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.category} · {s.price} · {s.duration}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteService(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  )}
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
  const [editForm, setEditForm] = useState({ title: '', description: '', alt: '', sort_order: '0' });

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
      if (uploadError) { toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' }); continue; }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      await supabase.from('gallery_images').insert({ src: publicUrl, alt: file.name.replace(/\.[^.]+$/, ''), title: '', description: '', sort_order: images.length });
    }
    toast({ title: 'Images uploaded' });
    setUploading(false);
    fetchImages();
  };

  const deleteImage = async (img: any) => {
    const urlParts = img.src.split('/images/');
    if (urlParts[1]) await supabase.storage.from('images').remove([urlParts[1]]);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    toast({ title: 'Image deleted' });
    fetchImages();
  };

  const startEdit = (img: any) => {
    setEditingId(img.id);
    setEditForm({ title: img.title || '', description: img.description || '', alt: img.alt || '', sort_order: String(img.sort_order || 0) });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('gallery_images').update({
      title: editForm.title, description: editForm.description, alt: editForm.alt,
      sort_order: parseInt(editForm.sort_order) || 0,
    }).eq('id', editingId);
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
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(img)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={() => deleteImage(img)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  {editingId === img.id ? (
                    <div className="p-3 space-y-2">
                      <div><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div><Label className="text-xs">Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                      <div><Label className="text-xs">Alt Text</Label><Input value={editForm.alt} onChange={e => setEditForm(f => ({ ...f, alt: e.target.value }))} /></div>
                      <div><Label className="text-xs">Sort Order</Label><Input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 cursor-pointer" onClick={() => startEdit(img)}>
                      <p className="font-medium text-sm truncate">{img.title || 'No title'}</p>
                      <p className="text-xs text-muted-foreground truncate">{img.description || 'Click to edit'}</p>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ page_slug: '', section_key: '', title: '', content: '' });
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
      page_slug: form.page_slug, section_key: form.section_key,
      title: form.title, content: form.content,
    }, { onConflict: 'page_slug,section_key' });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Content saved' });
      setForm({ page_slug: '', section_key: '', title: '', content: '' });
      fetchContent();
    }
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditForm({ page_slug: c.page_slug, section_key: c.section_key, title: c.title || '', content: c.content || '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('page_content').update({
      page_slug: editForm.page_slug, section_key: editForm.section_key,
      title: editForm.title, content: editForm.content,
    }).eq('id', editingId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Content updated' });
      setEditingId(null);
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
                <div key={c.id} className="border rounded-lg overflow-hidden">
                  {editingId === c.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><Label className="text-xs">Page Slug</Label><Input value={editForm.page_slug} onChange={e => setEditForm(f => ({ ...f, page_slug: e.target.value }))} /></div>
                        <div><Label className="text-xs">Section Key</Label><Input value={editForm.section_key} onChange={e => setEditForm(f => ({ ...f, section_key: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Content</Label><Textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} rows={4} /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{c.page_slug} / {c.section_key}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.title || c.content?.slice(0, 80)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteContent(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  )}
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


// ============ POSTERS MANAGER ============
function PostersManager() {
  const { toast } = useToast();
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({ title: '', description: '', link_url: '', link_label: 'Learn More', start_date: today, end_date: nextWeek, sort_order: '0' });
  const [editForm, setEditForm] = useState({ title: '', description: '', link_url: '', link_label: '', start_date: '', end_date: '', sort_order: '0', is_active: true });

  const fetchPosters = async () => {
    const { data } = await supabase.from('promo_posters').select('*').order('sort_order');
    setPosters(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchPosters(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filePath = `posters/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    return publicUrl;
  };

  const addPoster = async () => {
    if (!form.title || !imageFile) {
      toast({ title: 'Title and image required', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const imageUrl = await uploadImage(imageFile);
    if (!imageUrl) { setUploading(false); return; }
    const { error } = await supabase.from('promo_posters').insert({
      title: form.title, description: form.description,
      image_url: imageUrl, link_url: form.link_url, link_label: form.link_label || 'Learn More',
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date + 'T23:59:59').toISOString(),
      sort_order: parseInt(form.sort_order) || 0,
    });
    setUploading(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Poster added' });
      setForm({ title: '', description: '', link_url: '', link_label: 'Learn More', start_date: today, end_date: nextWeek, sort_order: '0' });
      setImageFile(null);
      fetchPosters();
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title, description: p.description || '', link_url: p.link_url || '',
      link_label: p.link_label || 'Learn More',
      start_date: p.start_date.slice(0, 10), end_date: p.end_date.slice(0, 10),
      sort_order: String(p.sort_order || 0), is_active: p.is_active,
    });
    setEditImageFile(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    let imageUrl: string | undefined;
    if (editImageFile) {
      const url = await uploadImage(editImageFile);
      if (url) imageUrl = url;
    }
    const updateData: any = {
      title: editForm.title, description: editForm.description,
      link_url: editForm.link_url, link_label: editForm.link_label,
      start_date: new Date(editForm.start_date).toISOString(),
      end_date: new Date(editForm.end_date + 'T23:59:59').toISOString(),
      sort_order: parseInt(editForm.sort_order) || 0,
      is_active: editForm.is_active,
    };
    if (imageUrl) updateData.image_url = imageUrl;
    const { error } = await supabase.from('promo_posters').update(updateData).eq('id', editingId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Poster updated' }); setEditingId(null); setEditImageFile(null); fetchPosters(); }
  };

  const deletePoster = async (p: any) => {
    if (p.image_url?.includes('/images/')) {
      const parts = p.image_url.split('/images/');
      if (parts[1]) await supabase.storage.from('images').remove([parts[1]]);
    }
    await supabase.from('promo_posters').delete().eq('id', p.id);
    toast({ title: 'Poster deleted' });
    fetchPosters();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Promo Poster</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Link URL</Label><Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="/services or https://..." /></div>
            <div><Label>Button Label</Label><Input value={form.link_label} onChange={e => setForm(f => ({ ...f, link_label: e.target.value }))} /></div>
            <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
            <div className="sm:col-span-2">
              <Label>Poster Image *</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button variant="hero" className="mt-4" onClick={addPoster} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            {uploading ? 'Adding...' : 'Add Poster'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Posters ({posters.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-3">
              {posters.map(p => {
                const now = new Date();
                const expired = new Date(p.end_date) < now;
                const upcoming = new Date(p.start_date) > now;
                return (
                  <div key={p.id} className="border rounded-lg overflow-hidden">
                    {editingId === p.id ? (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2"><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                          <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                          <div><Label className="text-xs">Link URL</Label><Input value={editForm.link_url} onChange={e => setEditForm(f => ({ ...f, link_url: e.target.value }))} /></div>
                          <div><Label className="text-xs">Button Label</Label><Input value={editForm.link_label} onChange={e => setEditForm(f => ({ ...f, link_label: e.target.value }))} /></div>
                          <div><Label className="text-xs">Start Date</Label><Input type="date" value={editForm.start_date} onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                          <div><Label className="text-xs">End Date</Label><Input type="date" value={editForm.end_date} onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))} /></div>
                          <div><Label className="text-xs">Sort Order</Label><Input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
                          <div className="flex items-center gap-2"><Switch checked={editForm.is_active} onCheckedChange={v => setEditForm(f => ({ ...f, is_active: v }))} /><Label className="text-xs">Active</Label></div>
                          <div className="sm:col-span-2"><Label className="text-xs">Replace Image</Label><Input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} /></div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.image_url} alt={p.title} className="h-14 w-14 rounded object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(p.start_date).toLocaleDateString()} – {new Date(p.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs mt-0.5">
                              {!p.is_active && <span className="text-destructive">Inactive · </span>}
                              {expired && <span className="text-destructive">Expired</span>}
                              {upcoming && <span className="text-muted-foreground">Scheduled</span>}
                              {!expired && !upcoming && p.is_active && <span className="text-green-600">Live</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deletePoster(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {posters.length === 0 && <p className="text-sm text-muted-foreground">No posters yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ GUIDES MANAGER ============
function GuidesManager() {
  const { toast } = useToast();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', description: '', category: 'General', content: '', read_time: '5 min read', is_popular: false, is_published: true, sort_order: '0' });
  const [editForm, setEditForm] = useState({ slug: '', title: '', description: '', category: '', content: '', read_time: '', is_popular: false, is_published: true, sort_order: '0' });

  const fetchGuides = async () => {
    const { data } = await supabase.from('guides').select('*').order('sort_order');
    setGuides(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchGuides(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filePath = `guides/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return null; }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
    return publicUrl;
  };

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const addGuide = async () => {
    if (!form.title) return;
    setUploading(true);
    const imageUrl = imageFile ? await uploadImage(imageFile) : null;
    const { error } = await supabase.from('guides').insert({
      slug: form.slug || slugify(form.title),
      title: form.title, description: form.description, category: form.category,
      content: form.content, read_time: form.read_time,
      is_popular: form.is_popular, is_published: form.is_published,
      sort_order: parseInt(form.sort_order) || 0,
      image_url: imageUrl || '',
    });
    setUploading(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Guide added' });
      setForm({ slug: '', title: '', description: '', category: 'General', content: '', read_time: '5 min read', is_popular: false, is_published: true, sort_order: '0' });
      setImageFile(null);
      fetchGuides();
    }
  };

  const startEdit = (g: any) => {
    setEditingId(g.id);
    setEditForm({
      slug: g.slug, title: g.title, description: g.description || '',
      category: g.category || '', content: g.content || '', read_time: g.read_time || '',
      is_popular: g.is_popular, is_published: g.is_published,
      sort_order: String(g.sort_order || 0),
    });
    setEditImageFile(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    let imageUrl: string | undefined;
    if (editImageFile) {
      const url = await uploadImage(editImageFile);
      if (url) imageUrl = url;
    }
    const updateData: any = {
      slug: editForm.slug, title: editForm.title, description: editForm.description,
      category: editForm.category, content: editForm.content, read_time: editForm.read_time,
      is_popular: editForm.is_popular, is_published: editForm.is_published,
      sort_order: parseInt(editForm.sort_order) || 0,
    };
    if (imageUrl) updateData.image_url = imageUrl;
    const { error } = await supabase.from('guides').update(updateData).eq('id', editingId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Guide updated' }); setEditingId(null); fetchGuides(); }
  };

  const deleteGuide = async (id: string) => {
    await supabase.from('guides').delete().eq('id', id);
    toast({ title: 'Guide deleted' });
    fetchGuides();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Guide</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto from title if blank" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Read Time</Label><Input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} placeholder="5 min read" /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="sm:col-span-2"><Label>Content (supports ## headings and - bullets)</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
            <div className="flex items-center gap-4 flex-wrap pt-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_popular} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} /><Label>Popular</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} /><Label>Published</Label></div>
            </div>
            <div className="sm:col-span-2"><Label>Cover Image</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
          </div>
          <Button variant="hero" className="mt-4" onClick={addGuide} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add Guide
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Guides ({guides.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-3">
              {guides.map(g => (
                <div key={g.id} className="border rounded-lg overflow-hidden">
                  {editingId === g.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><Label className="text-xs">Title</Label><Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                        <div><Label className="text-xs">Slug</Label><Input value={editForm.slug} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} /></div>
                        <div><Label className="text-xs">Category</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
                        <div><Label className="text-xs">Read Time</Label><Input value={editForm.read_time} onChange={e => setEditForm(f => ({ ...f, read_time: e.target.value }))} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Content</Label><Textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} rows={10} /></div>
                        <div><Label className="text-xs">Sort Order</Label><Input type="number" value={editForm.sort_order} onChange={e => setEditForm(f => ({ ...f, sort_order: e.target.value }))} /></div>
                        <div className="flex items-center gap-4 flex-wrap pt-6">
                          <div className="flex items-center gap-2"><Switch checked={editForm.is_popular} onCheckedChange={v => setEditForm(f => ({ ...f, is_popular: v }))} /><Label className="text-xs">Popular</Label></div>
                          <div className="flex items-center gap-2"><Switch checked={editForm.is_published} onCheckedChange={v => setEditForm(f => ({ ...f, is_published: v }))} /><Label className="text-xs">Published</Label></div>
                        </div>
                        <div className="sm:col-span-2"><Label className="text-xs">Replace Image</Label><Input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{g.title} {!g.is_published && <span className="text-xs text-muted-foreground">(Draft)</span>}</p>
                        <p className="text-xs text-muted-foreground">{g.category} · /{g.slug} · {g.read_time}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(g)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteGuide(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {guides.length === 0 && <p className="text-sm text-muted-foreground">No guides yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ NEWSLETTER MANAGER ============
function NewsletterManager() {
  const { toast } = useToast();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    setSubs(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchSubs(); }, []);

  const deleteSub = async (id: string) => {
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    toast({ title: 'Subscriber removed' });
    fetchSubs();
  };

  const exportCsv = () => {
    const csv = ['Email,Name,Subscribed At', ...subs.map(s => `${s.email},${s.name || ''},${s.created_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = () => {
    const emails = subs.filter(s => s.is_active).map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast({ title: 'Copied!', description: `${subs.filter(s => s.is_active).length} email addresses copied. Paste into your email client's BCC field to send your newsletter.` });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Newsletter Subscribers ({subs.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button variant="hero" size="sm" onClick={copyEmails} disabled={subs.length === 0}>
              <Mail className="h-4 w-4 mr-1" /> Copy All Emails (for BCC)
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={subs.length === 0}>
              <Upload className="h-4 w-4 mr-1 rotate-180" /> Export CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Tip: Use "Copy All Emails" then paste into the BCC field of Gmail/Outlook to send a newsletter. For bulk sending features (templates, scheduling, open tracking), consider Mailchimp or Brevo.
          </p>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <div className="space-y-2">
              {subs.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{s.email}</p>
                    <p className="text-xs text-muted-foreground">{s.name || '—'} · {new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteSub(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
              {subs.length === 0 && <p className="text-sm text-muted-foreground">No subscribers yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Admin;
