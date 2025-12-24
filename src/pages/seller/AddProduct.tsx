import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Upload, 
  ImagePlus, 
  Loader2,
  Plus,
  Trash2,
  Watch,
  ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";

interface SpecificationField {
  key: string;
  value: string;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: categories } = useCategories();
  
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationField[]>([
    { key: "Model Number", value: "" },
    { key: "Warranty", value: "" },
    { key: "Material", value: "" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    brand: "",
    categoryId: "",
    stockQuantity: "10",
    sku: "",
    isFeatured: false,
    isActive: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For now, use placeholder URLs - in production, upload to Supabase Storage
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    setSpecifications(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add products.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          slug: generateSlug(formData.name),
          description: formData.description,
          short_description: formData.shortDescription,
          price: parseFloat(formData.price),
          compare_at_price: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          brand: formData.brand || null,
          category_id: formData.categoryId || null,
          stock_quantity: parseInt(formData.stockQuantity) || 10,
          sku: formData.sku || null,
          is_featured: formData.isFeatured,
          is_active: formData.isActive,
          seller_id: user.id,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Add product images
      if (product && images.length > 0) {
        const imageInserts = images.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          is_primary: index === 0,
          display_order: index,
        }));

        await supabase.from('product_images').insert(imageInserts);
      }

      toast({
        title: "Success!",
        description: "Product added successfully.",
      });

      navigate('/seller/products');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/seller/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Add New Product</h1>
            <p className="text-muted-foreground">Fill in the details to list your product</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary/30 group">
                    <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Nike Air Max 90"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-secondary/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Nike, Fossil"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {category.name.toLowerCase().includes('watch') ? (
                              <Watch className="h-4 w-4" />
                            ) : (
                              <ShoppingBag className="h-4 w-4" />
                            )}
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    placeholder="Brief description for product cards"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed product description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-secondary/50 min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="999"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="bg-secondary/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare Price (₹)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    placeholder="1499"
                    value={formData.compareAtPrice}
                    onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="10"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="SHOE-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Specifications</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Input
                    placeholder="Field name (e.g., Model Number)"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    className="bg-secondary/50 flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    className="bg-secondary/50 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="font-display">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground">Product is visible to customers</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured">Featured</Label>
                  <p className="text-sm text-muted-foreground">Show in featured products section</p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" asChild className="flex-1">
              <Link to="/seller/products">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-orange shadow-glow" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}