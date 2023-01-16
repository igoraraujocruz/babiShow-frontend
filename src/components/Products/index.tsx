import {
  Flex,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BsBagPlus, BsColumnsGap } from 'react-icons/bs';
import { withSSRAuth } from '../../utils/WithSSRAuth';

import BagModal, { IBagModal } from '../Modais/BagModal';

import EditProductModal, {
  ContractEditProductModal,
} from '../Modais/EditProductModal';

import CreateProductModal, {
  ContractCreateProductModal,
} from '../Modais/CreateProductModal';

import { Product, useProducts } from '../../services/hooks/useProducts';
import { Input } from '../Form/Input';
import { useCart } from '../../services/hooks/useCart';
import { formatPrice } from '../../utils/format';

interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  amount: number;
  points: number;
  createdAt: string;
  category: string;
  cost: number;
  photos: [
    {
      id: string;
      name: string;
      url: string;
    },
  ];
}

export const Products = () => {
  const [filterProductName, setFilterProductName] = useState('');
  const modalEditProduct = useRef<ContractEditProductModal>(null);
  const { addProduct } = useCart();

  const modalCreateProduct = useRef<ContractCreateProductModal>(null);

  const [product, setProduct] = useState({} as ProductProps);

  const { data } = useProducts();

  const handleModal = useCallback(shop => {
    setProduct(shop);
    modalEditProduct.current.onOpen();
  }, []);

  const bagModal = useRef<IBagModal>(null);

  return (
    <Flex flexDir="column" align="center" mt={['1rem']} ml="2rem" mr="2rem">
      <EditProductModal product={product} ref={modalEditProduct} />
      <CreateProductModal ref={modalCreateProduct} />
      <HStack align="center" p="2rem">
        <BsColumnsGap
          size={45}
          onClick={() => modalCreateProduct.current.onOpen()}
        />
        <Input
          name="productFilterName"
          onChange={e => setFilterProductName(e.target.value)}
        />
        <BagModal ref={bagModal} />
      </HStack>
      <Flex
        align="flex-end"
        maxH={['30rem', '30rem', '40rem']}
        flexDir="column"
        overflow="scroll"
        sx={{
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Table size="small" colorScheme="whiteAlpha">
          <Thead>
            <Tr>
              <Th pl="4px" pr="4px">
                Nome
              </Th>
              <Th pl="4px" pr="4px">
                Preço
              </Th>
              <Th pl="4px" pr="4px">
                Estoque
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data &&
              data
                .filter(element => {
                  if (filterProductName === '') {
                    return element;
                  }
                  if (
                    element.name
                      .toLowerCase()
                      .includes(filterProductName.toLowerCase())
                  ) {
                    return element;
                  }
                })
                .map(product => (
                  <Tr
                    color={product.amount < 3 && 'red'}
                    key={product.id}
                    cursor="pointer"
                  >
                    <Td pl="4px" pr="30px" onClick={() => handleModal(product)}>
                      {product.name}
                    </Td>
                    <Td pl="4px" pr="30px" onClick={() => handleModal(product)}>
                      {formatPrice(product.price)}
                    </Td>
                    <Td pl="4px" pr="30px" onClick={() => handleModal(product)}>
                      {product.amount}
                    </Td>
                    <Td
                      p="0.8rem"
                      borderRadius="0.2rem"
                      onClick={() => addProduct(product.id)}
                      cursor="pointer"
                      align="center"
                      _hover={{
                        background: '#FF6B00',
                      }}
                      transition={['background 200ms']}
                    >
                      <BsBagPlus cursor="pointer" size={30} />
                    </Td>
                  </Tr>
                ))}
          </Tbody>
        </Table>
      </Flex>
    </Flex>
  );
};

export const getServerSideProps = withSSRAuth(async ctx => ({
  props: {},
}));
