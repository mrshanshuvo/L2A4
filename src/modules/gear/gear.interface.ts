export interface CreateGearPayload {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
}

export interface UpdateGearPayload {
  name?: string;
  description?: string;
  brand?: string;
  pricePerDay?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
}

export interface GearQueryFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  availableOnly?: string;
}
