import { InMemoryProductRepository } from "@/infrastructure/repositories/InMemoryProductRepository";
import { InMemoryReviewRepository } from "@/infrastructure/repositories/InMemoryReviewRepository";
import { InMemoryCategoryRepository } from "@/infrastructure/repositories/InMemoryCategoryRepository";
import { InMemoryHeroSlideRepository } from "@/infrastructure/repositories/InMemoryHeroSlideRepository";
import { ZustandCartRepository } from "@/infrastructure/repositories/ZustandCartRepository";

import { ListProductsUseCase } from "@/application/products/ListProductsUseCase";
import { ListFlashDealsUseCase } from "@/application/products/ListFlashDealsUseCase";
import { GetProductByIdUseCase } from "@/application/products/GetProductByIdUseCase";
import { ListRelatedProductsUseCase } from "@/application/products/ListRelatedProductsUseCase";

import { ListReviewsUseCase } from "@/application/reviews/ListReviewsUseCase";
import { AddReviewUseCase } from "@/application/reviews/AddReviewUseCase";
import { GetReviewsSummaryUseCase } from "@/application/reviews/GetReviewsSummaryUseCase";

import { ListCategoriesUseCase } from "@/application/catalog/ListCategoriesUseCase";
import { ListHeroSlidesUseCase } from "@/application/catalog/ListHeroSlidesUseCase";

import { GetCartUseCase } from "@/application/cart/GetCartUseCase";
import { AddToCartUseCase } from "@/application/cart/AddToCartUseCase";
import { RemoveFromCartUseCase } from "@/application/cart/RemoveFromCartUseCase";
import { UpdateCartQtyUseCase } from "@/application/cart/UpdateCartQtyUseCase";
import { GetCartSummaryUseCase } from "@/application/cart/GetCartSummaryUseCase";

const productRepository = new InMemoryProductRepository();
const reviewRepository = new InMemoryReviewRepository();
const categoryRepository = new InMemoryCategoryRepository();
const heroSlideRepository = new InMemoryHeroSlideRepository();
const cartRepository = new ZustandCartRepository();

export const container = {
  listProducts: new ListProductsUseCase(productRepository),
  listFlashDeals: new ListFlashDealsUseCase(productRepository),
  getProductById: new GetProductByIdUseCase(productRepository),
  listRelatedProducts: new ListRelatedProductsUseCase(productRepository),

  listReviews: new ListReviewsUseCase(reviewRepository),
  addReview: new AddReviewUseCase(reviewRepository),
  getReviewsSummary: new GetReviewsSummaryUseCase(),

  listCategories: new ListCategoriesUseCase(categoryRepository),
  listHeroSlides: new ListHeroSlidesUseCase(heroSlideRepository),

  getCart: new GetCartUseCase(cartRepository),
  addToCart: new AddToCartUseCase(cartRepository),
  removeFromCart: new RemoveFromCartUseCase(cartRepository),
  updateCartQty: new UpdateCartQtyUseCase(cartRepository),
  getCartSummary: new GetCartSummaryUseCase(),
};
