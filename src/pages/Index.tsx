import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryBar } from "@/components/CategoryBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { useProducts, useFeaturedProducts, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allProducts, isLoading: productsLoading } = useProducts({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();

  const showFeatured = !selectedCategory && !searchQuery;

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
          
          {showFeatured && (
            <>
              {featuredLoading ? (
                <div className="py-8">
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : featuredProducts && featuredProducts.length > 0 ? (
                <ProductGrid products={featuredProducts} title="Featured Products" />
              ) : null}
            </>
          )}
          
          {productsLoading ? (
            <div className="py-8">
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <ProductGrid
              products={allProducts || []}
              title={selectedCategory || searchQuery ? "Results" : "All Products"}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
