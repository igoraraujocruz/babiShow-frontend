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
  VStack,
  HStack,
  Heading,
  Select,
  Spinner,
  useToast,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react';
import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createCredit } from '../../services/hooks/useShop';
import { formatPrice } from '../../utils/format';
import { MaskedInput } from '../Form/MaskedInput';
import { realMask } from '../../utils/realMask';
import { convertRealToNumber } from '../../utils/convertRealToNumber';
import { useClient } from '../../services/hooks/useClients';
import { queryClient } from '../../services/queryClient';

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

interface Client {
  client: {
    id: string;
    name: string;
    debit: number;
    createdAt: string;
    shop: Shop[];
    credit: Credit[];
  };
}

type EditFormData = {
  value: string;
};

const schema = yup.object().shape({
  value: yup
    .string()
    .typeError('Insira um valor')
    .required('O valor é obrigatório'),
});

export interface DetailsClientsShopHandle {
  onOpen: () => void;
  onClose: () => void;
}

const DetailsClientsShop: ForwardRefRenderFunction<
  DetailsClientsShopHandle,
  any
> = ({ client }: any, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isOpen) {
    queryClient.invalidateQueries('client');
  }

  const { data } = useClient(client.id);

  const [isSubmited, setIsSubmited] = useState(false);

  const toast = useToast();

  const todosOsValoresPagosPelosClients = data?.shop.reduce(
    (accumulator, value) => {
      return Number(accumulator) + Number(value.amountPaid);
    },
    0,
  );

  const dividaDoClient = data?.shop.map(shopClient =>
    shopClient.order.reduce((accumulator, debit) => {
      return (
        Number(accumulator) +
        Number(debit.quantity) * Number(debit.product.price)
      );
    }, 0),
  );

  const somarTodasAsDividasDosClients = dividaDoClient?.reduce(
    (accumulator, value) => {
      return accumulator + value;
    },
    0,
  );

  const creditoDoClient = data?.credit.reduce((accumulator, credit) => {
    return Number(accumulator) + Number(credit.value);
  }, 0);

  const clientDebit =
    todosOsValoresPagosPelosClients +
    creditoDoClient -
    somarTodasAsDividasDosClients;

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<EditFormData>({
    resolver: yupResolver(schema),
  });

  useImperativeHandle(ref, () => ({
    onOpen,
    onClose,
  }));

  const onSubmit = async ({ value }: EditFormData) => {
    setIsSubmited(true);

    try {
      await createCredit(data.id, convertRealToNumber(value));
      await queryClient.invalidateQueries('clients');
      reset();
    } catch (err) {
      toast({
        position: 'top',
        title: `Conexão do Whatsapp`,
        description: err.response.data.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }

    setIsSubmited(false);
  };

  return (
    <Flex bg="red">
      <Modal size={['md', 'md', '2xl']} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="color-bg">
          <ModalCloseButton size="lg" color="color-icons" />
          <ModalHeader />
          <ModalBody>
            <VStack spacing="1rem">
              <HStack>
                <Heading size="md">{data?.name}</Heading>
                <Heading size="md" color={clientDebit >= 0 ? '#00fa00' : 'red'}>
                  {formatPrice(clientDebit)}
                </Heading>
              </HStack>
              <VStack
                align="flex-start"
                flexDir="column"
                h="15rem"
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
                overflowY="scroll"
              >
                {data?.shop.map(clientShop => (
                  <VStack key={clientShop.id} align="flex-start">
                    <HStack fontSize="1.2rem">
                      <Text>
                        <strong>
                          {new Date(clientShop.createdAt).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </strong>
                      </Text>
                      <Text>
                        {formatPrice(
                          clientShop.order.reduce(
                            (accumulator, order) =>
                              accumulator +
                              order.quantity * order.product.price,
                            0,
                          ),
                        )}
                      </Text>
                      <Text color="green">
                        {formatPrice(clientShop.amountPaid)}
                      </Text>
                    </HStack>

                    {clientShop.order?.map(order => (
                      <HStack key={order.id}>
                        <Text>{order.quantity}x</Text>
                        <Text>{order.product.name}</Text>
                        <Text>
                          {formatPrice(order.product.price)} ={' '}
                          {formatPrice(order.quantity * order.product.price)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ))}
              </VStack>

              <VStack
                flexDir="column"
                h="7rem"
                color="green"
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
                overflowY="scroll"
                align="flex-start"
                w="100%"
              >
                {data?.credit.map(clientCredit => (
                  <HStack key={clientCredit.id}>
                    <Text>
                      {new Date(clientCredit.createdAt).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </Text>
                    <Text>{formatPrice(clientCredit.value)}</Text>
                  </HStack>
                ))}
              </VStack>

              <Flex h="3rem">
                {!isSubmited ? (
                  <VStack
                    as="form"
                    w="100%"
                    justify="flex-start"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <MaskedInput
                      focusBorderColor="none"
                      mask={realMask}
                      error={errors.value}
                      name="value"
                      label="Receber valor"
                      {...register('value')}
                    />
                    <Flex justify="center" w="100%">
                      <Button
                        type="submit"
                        bg="color-bg"
                        _hover={{
                          bg: '#D5BDAF',
                        }}
                      >
                        Receber Valor
                      </Button>
                    </Flex>
                  </VStack>
                ) : (
                  <Spinner size="md" />
                )}
              </Flex>
            </VStack>
          </ModalBody>

          <ModalFooter h="5rem" />
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default forwardRef(DetailsClientsShop);
