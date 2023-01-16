import { useQuery } from 'react-query';
import { api } from '../apiClient';
import { queryClient } from '../queryClient';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  quantity: number;
  createdAt: string;
  product: Product;
}

interface Shop {
  id: string;
  order: Order[];
  amountPaid: number;
  createdAt: string;
}

interface Credit {
  id: string;
  value: number;
  createdAt: string;
}

interface Clients {
  id: string;
  name: string;
  createdAt: string;
  shop: Shop[];
  credit: Credit[];
}

export const getClients = async (): Promise<Clients[]> => {
  const { data } = await api.get('/clients');

  const clients = data.map((client: Clients) => {
    return {
      id: client.id,
      name: client.name,
      shop: client.shop,
      credit: client.credit,
      createdAt: new Date(client.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  return clients;
};

export function useClients() {
  return useQuery(['clients'], () => getClients());
}

export const getClient = async (
  clientId: string,
): Promise<Clients | undefined> => {
  if (clientId?.length > 0) {
    const { data } = await api.get(`/clients?clientId=${clientId}`);

    return data;
  }
};

export function useClient(clientId: string) {
  return useQuery(['client', clientId], () => getClient(clientId));
}

export async function createClient(name: string) {
  await api.post('/clients', { name });

  queryClient.invalidateQueries('clients');
}
