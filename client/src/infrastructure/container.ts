import { InMemoryProductRepository } from "@/services";
import { InMemoryCategoryRepository } from "@/services";
import { InMemoryReviewRepository } from "@/services";
import { InMemoryHeroSlideRepository } from "@/services";
import { InMemoryOrderRepository } from "@/services";
import { InMemoryAdminRepository } from "@/services";
import { InMemoryServerCartRepository } from "@/services";
import { ZustandCartRepository } from "@/services";
import { ZustandFavoriteRepository } from "@/services";

import { HttpAuthRepository } from "@/services";
import { HttpUserRepository } from "@/services";

import { ListProductsUseCase } from "@/application/products/ListProductsUseCase";
import { ListFlashDealsUseCase } from "@/application/products/ListFlashDealsUseCase";
import { GetProductByIdUseCase } from "@/application/products/GetProductByIdUseCase";
import { ListRelatedProductsUseCase } from "@/application/products/ListRelatedProductsUseCase";
import { AdminListProductsUseCase } from "@/application/products/AdminListProductsUseCase";
import { PaginateProductsUseCase } from "@/application/products/PaginateProductsUseCase";
import { ToggleProductActiveUseCase } from "@/application/products/ToggleProductActiveUseCase";
import { DeleteProductUseCase } from "@/application/products/DeleteProductUseCase";
import { UpdateProductUseCase } from "@/application/products/UpdateProductUseCase";

import { ListReviewsUseCase } from "@/application/reviews/ListReviewsUseCase";
import { AddReviewUseCase } from "@/application/reviews/AddReviewUseCase";
import { GetReviewsSummaryUseCase } from "@/application/reviews/GetReviewsSummaryUseCase";

import { ListCategoriesUseCase } from "@/application/catalog/ListCategoriesUseCase";
import { GetCategoryBySlugUseCase } from "@/application/catalog/GetCategoryBySlugUseCase";
import { CreateCategoryUseCase } from "@/application/catalog/CreateCategoryUseCase";
import { UpdateCategoryUseCase } from "@/application/catalog/UpdateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/application/catalog/DeleteCategoryUseCase";
import { AdminListCategoriesUseCase } from "@/application/catalog/AdminListCategoriesUseCase";
import { ListHeroSlidesUseCase } from "@/application/catalog/ListHeroSlidesUseCase";

import { GetCartUseCase } from "@/application/cart/GetCartUseCase";
import { AddToCartUseCase } from "@/application/cart/AddToCartUseCase";
import { RemoveFromCartUseCase } from "@/application/cart/RemoveFromCartUseCase";
import { UpdateCartQtyUseCase } from "@/application/cart/UpdateCartQtyUseCase";
import { GetCartSummaryUseCase } from "@/application/cart/GetCartSummaryUseCase";
import { ClearCartUseCase } from "@/application/cart/ClearCartUseCase";
import { SyncCartUseCase } from "@/application/cart/SyncCartUseCase";

import { ListFavoritesUseCase } from "@/application/favorites/ListFavoritesUseCase";
import { ToggleFavoriteUseCase } from "@/application/favorites/ToggleFavoriteUseCase";
import { RemoveFavoriteUseCase } from "@/application/favorites/RemoveFavoriteUseCase";

import { LoginUseCase } from "@/application/auth/LoginUseCase";
import { RegisterUseCase } from "@/application/auth/RegisterUseCase";
import { LogoutUseCase } from "@/application/auth/LogoutUseCase";
import { UpdateProfileUseCase } from "@/application/auth/UpdateProfileUseCase";
import { GetSessionUseCase } from "@/application/auth/GetSessionUseCase";

import { CreateOrderUseCase } from "@/application/orders/CreateOrderUseCase";
import { ListMyOrdersUseCase } from "@/application/orders/ListMyOrdersUseCase";
import { GetOrderByIdUseCase } from "@/application/orders/GetOrderByIdUseCase";
import { AdminListOrdersUseCase } from "@/application/orders/AdminListOrdersUseCase";
import { AdminUpdateOrderStatusUseCase } from "@/application/orders/AdminUpdateOrderStatusUseCase";

import { GetAdminStatsUseCase } from "@/application/admin/GetAdminStatsUseCase";

const productRepository = new InMemoryProductRepository();
const reviewRepository = new InMemoryReviewRepository();
const categoryRepository = new InMemoryCategoryRepository();
const heroSlideRepository = new InMemoryHeroSlideRepository();
const cartRepository = new ZustandCartRepository();
const cartServerRepository = new InMemoryServerCartRepository();
const favoriteRepository = new ZustandFavoriteRepository();
const orderRepository = new InMemoryOrderRepository();
const adminRepository = new InMemoryAdminRepository();

const authRepository = new HttpAuthRepository();
const userRepository = new HttpUserRepository();

export const container = {
  listProducts: new ListProductsUseCase(productRepository),
  paginateProducts: new PaginateProductsUseCase(productRepository),
  listFlashDeals: new ListFlashDealsUseCase(productRepository),
  getProductById: new GetProductByIdUseCase(productRepository),
  listRelatedProducts: new ListRelatedProductsUseCase(productRepository),
  adminListProducts: new AdminListProductsUseCase(productRepository),
  toggleProductActive: new ToggleProductActiveUseCase(productRepository),
  deleteProduct: new DeleteProductUseCase(productRepository),
  updateProduct: new UpdateProductUseCase(productRepository),

  listReviews: new ListReviewsUseCase(reviewRepository),
  addReview: new AddReviewUseCase(reviewRepository),
  getReviewsSummary: new GetReviewsSummaryUseCase(),

  listCategories: new ListCategoriesUseCase(categoryRepository),
  getCategoryBySlug: new GetCategoryBySlugUseCase(categoryRepository),
  adminListCategories: new AdminListCategoriesUseCase(categoryRepository),
  createCategory: new CreateCategoryUseCase(categoryRepository),
  updateCategory: new UpdateCategoryUseCase(categoryRepository),
  deleteCategory: new DeleteCategoryUseCase(categoryRepository),
  listHeroSlides: new ListHeroSlidesUseCase(heroSlideRepository),

  getCart: new GetCartUseCase(cartRepository),
  addToCart: new AddToCartUseCase(cartRepository),
  removeFromCart: new RemoveFromCartUseCase(cartRepository),
  updateCartQty: new UpdateCartQtyUseCase(cartRepository),
  getCartSummary: new GetCartSummaryUseCase(),
  clearCart: new ClearCartUseCase(cartRepository),
  cartServer: cartServerRepository,
  syncCart: new SyncCartUseCase(cartServerRepository),

  listFavorites: new ListFavoritesUseCase(favoriteRepository),
  toggleFavorite: new ToggleFavoriteUseCase(favoriteRepository),
  removeFavorite: new RemoveFavoriteUseCase(favoriteRepository),

  login: new LoginUseCase(authRepository),
  register: new RegisterUseCase(authRepository),
  logout: new LogoutUseCase(authRepository),
  updateProfile: new UpdateProfileUseCase(authRepository),
  getSession: new GetSessionUseCase(authRepository),

  createOrder: new CreateOrderUseCase(orderRepository),
  listMyOrders: new ListMyOrdersUseCase(orderRepository),
  getOrderById: new GetOrderByIdUseCase(orderRepository),
  adminListOrders: new AdminListOrdersUseCase(orderRepository),
  adminUpdateOrderStatus: new AdminUpdateOrderStatusUseCase(orderRepository),

  getAdminStats: new GetAdminStatsUseCase(adminRepository),
  users: userRepository,
  auth: authRepository,
};