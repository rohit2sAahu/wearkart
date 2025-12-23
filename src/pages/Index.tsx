import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryBar } from "@/components/CategoryBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.featured);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSearch={setSearchQuery} />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="container mx-auto px-4">
          <CategoryBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {!selectedCategory && !searchQuery && (
            <ProductGrid products={featuredProducts} title="Featured Products" />
          )}
          
          <ProductGrid
            products={filteredProducts}
            title={selectedCategory || searchQuery ? "Results" : "All Products"}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
