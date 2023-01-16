import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  Flex,
  ModalHeader,
  Text,
  HStack,
  FormControl,
  FormLabel,
  Image,
  Box,
  useToast,
} from '@chakra-ui/react';
import {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from 'react';
import { BsBag, BsFillTrashFill } from 'react-icons/bs';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiShoppingCart } from 'react-icons/fi';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '../../services/apiClient';
import { useCart } from '../../services/hooks/useCart';
import { Input } from '../Form/Input';
import { queryClient } from '../../services/queryClient';
import { formatPrice } from '../../utils/format';
import { MaskedInput } from '../Form/MaskedInput';
import { realMask } from '../../utils/realMask';
import { convertRealToNumber } from '../../utils/convertRealToNumber';

export interface IBagModal {
  onOpen: () => void;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  amount: number;
  category: string;
  slug: string;
}

type CreateFormData = {
  name: string;
  amountPaid: string;
};

interface Client {
  id: string;
  name: string;
}

const createFormSchema = yup.object().shape({
  name: yup.string().required('O nome é necessário'),
  amountPaid: yup.string().required('Qual é o valor pago?'),
});

const BagModal: ForwardRefRenderFunction<IBagModal> = (props, ref) => {
  const [searchClient, setSearchClient] = useState<Client[]>([]);
  const [selectClient, setSelectClient] = useState({} as Client);
  const [haveText, setHaveText] = useState(false);

  const { cart, removeProduct, updateProductAmount, removeAllProductsInBag } =
    useCart();

  const cartFormatted = cart?.map(product => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    subTotal: formatPrice(product.price * product.amount),
  }));

  const total = formatPrice(
    cart?.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0),
  );

  function handleProductIncrement(product: Product) {
    updateProductAmount({ productId: product.id, amount: product.amount + 1 });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({ productId: product.id, amount: product.amount - 1 });
  }

  function handleRemoveProduct(productId: string) {
    removeProduct(productId);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(createFormSchema),
  });

  const getClient = async (value: string) => {
    setSelectClient({} as Client);
    if (value.length <= 0) {
      setHaveText(false);
    }

    if (value.length > 0) {
      const client = await api.get(`clients?name=${value}`);

      setSearchClient(client.data);
      setHaveText(true);
    }
  };

  const closeOptionsClients = (client: Client) => {
    setSelectClient(client);
    setHaveText(false);
  };

  const onSubmit: SubmitHandler<CreateFormData> = async (
    values: CreateFormData,
  ) => {
    try {
      const shop = await api.post('/shop', {
        clientId: selectClient.id,
        amountPaid: convertRealToNumber(values.amountPaid),
      });

      cartFormatted.map(async product => {
        await api.post('/orders', {
          productId: product.id,
          shopId: shop.data.id,
          quantity: product.amount,
        });
      });
      toast({
        position: 'bottom',
        title: `Tudo Certo!`,
        description: `Compra efetuada com sucesso.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onClose();
      removeAllProductsInBag();
      reset();
      await queryClient.invalidateQueries('client');
      await queryClient.invalidateQueries('clients');
      await queryClient.invalidateQueries('products');
    } catch (err) {
      //
    }
  };

  useImperativeHandle(ref, () => ({
    onOpen,
    onClose,
  }));

  return (
    <Flex>
      <Box cursor="pointer" onClick={onOpen} zIndex={2}>
        <Flex flexDir="column" justify="center" align="center" fill="white">
          <BsBag size={40} />
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="color-bg">
          <ModalCloseButton _hover={{ bg: 'none' }} size="lg" />
          <ModalHeader />

          <ModalBody>
            <Flex flexDir="column">
              {cartFormatted?.map(product => {
                return (
                  <Flex key={product.id} w="100%" h="100%" mb="1rem">
                    <Image
                      w="9rem"
                      h="9rem"
                      src={
                        product.photos[0]
                          ? product.photos[0].url
                          : 'placeholder.png'
                      }
                    />
                    <Flex ml="1rem" flexDir="column" align="start">
                      <Text w={['7.5rem', '7.5rem', '15rem']}>
                        Nome: {product.name}
                      </Text>
                      <Text w={['7.5rem', '7.5rem', '15rem']}>
                        Preço Unitário: {product.priceFormatted}
                      </Text>
                      <Text w={['5rem', '5rem', '15rem']}>
                        Subtotal: {formatPrice(product.amount * product.price)}
                      </Text>
                      <Flex
                        align="center"
                        as="form"
                        w="100%"
                        flexDir={['column', 'column', 'row']}
                      >
                        <Button
                          bg="color-input-bg"
                          _hover={{ background: 'color-input-bg' }}
                          h="2rem"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <BsFillTrashFill color="#655E56" />
                        </Button>
                        <Flex
                          mt="1rem"
                          mb="1rem"
                          align="center"
                          ml={['1rem', '1rem', '2.2rem']}
                          flexDir="column"
                        >
                          <Text>Quantidade</Text>
                          <Text>{product.amount}</Text>
                        </Flex>
                      </Flex>
                      <HStack
                        justify={['normal', 'normal', 'center']}
                        width="100%"
                      >
                        <Button
                          bg="color-input-bg"
                          _hover={{ background: 'color-input-bg' }}
                          h="2rem"
                          onClick={() => handleProductDecrement(product)}
                        >
                          <AiOutlineMinus color="#655E56" />
                        </Button>
                        <Button
                          bg="color-input-bg"
                          _hover={{ background: 'color-input-bg' }}
                          h="2rem"
                          onClick={() => handleProductIncrement(product)}
                        >
                          <AiOutlinePlus color="#655E56" />
                        </Button>
                      </HStack>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
            {cartFormatted?.length > 0 ? (
              <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                <Text>Total: {total}</Text>

                <MaskedInput
                  focusBorderColor="#FF6B00"
                  mask={realMask}
                  error={errors.amountPaid}
                  name="amountPaid"
                  label="Valor pago"
                  {...register('amountPaid')}
                />
                <FormControl>
                  <FormLabel>Comprador</FormLabel>
                  <Input
                    {...register('name', {
                      onChange: e => getClient(e.target.value),
                    })}
                    value={selectClient.name}
                    error={errors.name}
                  />
                  {haveText && (
                    <Flex
                      flexDir="column"
                      bg={searchClient.length > 0 && 'gray.800'}
                      maxH="10rem"
                      overflowX="auto"
                      css={{
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#FF6B00',
                          borderRadius: '24px',
                        },
                      }}
                    >
                      {searchClient.map(client => (
                        <Text
                          onClick={() => closeOptionsClients(client)}
                          p="1rem"
                          key={client.id}
                        >
                          {client.name}
                        </Text>
                      ))}
                    </Flex>
                  )}
                </FormControl>

                <Flex mt="1rem" justify="center">
                  <Button
                    color="#D5BDAF"
                    bg="color-icons"
                    _hover={{ bg: 'color-input-bg' }}
                    type="submit"
                  >
                    Finalizar Compra
                  </Button>
                </Flex>
              </Box>
            ) : (
              <Text>Nenhum item no carrinho</Text>
            )}
          </ModalBody>

          <ModalFooter justifyContent="space-between" />
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default forwardRef(BagModal);
