import { useQuery } from 'react-query';
import { api } from '../apiClient';
import { queryClient } from '../queryClient';

export interface Product {
  id: string;
  name: string;
  amount: number;
  price: number;
  slug: string;
  createdAt: string;
  category: string;
  cost: number;
  photos: [
    {
      id: string;
      url: string;
    },
  ];
}

interface CreateProductProps {
  name: string;
  price: number;
  cost: number;
  amount: number;
  photos: File[];
  category: string;
}

interface UpdateProductProps {
  id: string;
  name?: string;
  price?: number;
  amount?: number;
  category?: string;
  cost?: number;
}

interface PhotosProps {
  photos: File[];
  productId: string;
}

export interface ProductSlug {
  productSlug: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get(`/products`);

  const products = data.map((product: Product) => {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      amount: product.amount,
      photos: product.photos,
      cost: product.cost,
      category: product.category,
      createdAt: new Date(product.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
  });

  return products;
};

export function useProducts() {
  return useQuery(['products'], () => getProducts());
}

export const getProduct = async ({
  productSlug,
}: ProductSlug): Promise<Product> => {
  if (productSlug) {
    const { data } = await api.get(`/products/?productSlug=${productSlug}`);

    return data;
  }
};

export function useProduct(productSlug: ProductSlug) {
  return useQuery(['product', productSlug], () => getProduct(productSlug));
}

export const getProductById = async (productId: string): Promise<Product> => {
  if (productId) {
    const { data } = await api.get(`/products/?productId=${productId}`);

    return data;
  }
};

export function useProductById(productId: string) {
  return useQuery(['productById', productId], () => getProductById(productId));
}

export async function createProduct(product: CreateProductProps) {
  const formData = new FormData();

  formData.append('name', product.name);
  formData.append('price', product.price.toString());
  formData.append('amount', product.amount.toString());
  formData.append('category', product.category.toString());
  formData.append('cost', product.cost.toString());

  product.photos.forEach(file => {
    formData.append('photos', file);
  });

  const config = {
    headers: { 'content-type': 'multipart/form-data' },
  };

  await api.post('/products', formData, config);

  queryClient.invalidateQueries('products');
}

export async function deleteProducts(productId: string) {
  await api.delete(`/products/${productId}`);

  queryClient.invalidateQueries('products');
}

export async function createPhotos({ productId, photos }: PhotosProps) {
  const formData = new FormData();

  photos.forEach(file => {
    formData.append('photos', file);
  });

  const config = {
    headers: { 'content-type': 'multipart/form-data' },
  };

  await api.post(`/photos/${productId}`, formData, config);

  queryClient.invalidateQueries('productById');
}

export async function updateProduct(product: UpdateProductProps) {
  await api.put('/products/', product);

  queryClient.invalidateQueries('products');
}

export async function deletePhoto(photosId: string) {
  await api.delete(`/photos/${photosId}`);

  queryClient.invalidateQueries('productById');
}
