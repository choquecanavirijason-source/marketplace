export interface Review {
  id: number;
  productId: number;
  name: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
}

export interface NewReview {
  productId: number;
  name: string;
  rating: number;
  text: string;
}
