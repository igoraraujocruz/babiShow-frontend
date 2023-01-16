import { useQuery } from 'react-query';
import { api } from '../apiClient';
import { queryClient } from '../queryClient';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface Order {
  id: string;
  quantity: number;
  product: Product;
}

interface Client {
  id: string;
  name: string;
  numberPhone: string;
}

interface Shop {
  id: string;
  client: Client;
  order: Order[];
  typeOfPayment: string;
  referenceId: string;
  createdAt: string;
  amountPaid: number;
  status: string;
}

export const getShop = async (): Promise<Shop[]> => {
  const { data } = await api.get('/shop');

  const shop = data.map((shop: Shop) => {
    return {
      id: shop.id,
      client: shop.client,
      order: shop.order,
      typeOfPayment: shop.typeOfPayment,
      amountPaid: shop.amountPaid,
      status: shop.status,
      createdAt: new Date(shop.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  return shop;
};

export function useShop() {
  return useQuery(['shop'], () => getShop());
}

export async function createCredit(clientId: string, value: number) {
  await api.post('/credits', {
    clientId,
    value,
  });

  queryClient.invalidateQueries('client');
}
