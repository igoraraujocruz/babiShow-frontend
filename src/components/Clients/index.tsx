import {
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BsPerson } from 'react-icons/bs';
import { withSSRAuth } from '../../utils/WithSSRAuth';
import { formatPrice } from '../../utils/format';
import { createClient, useClients } from '../../services/hooks/useClients';
import DetailsClientsShop, {
  DetailsClientsShopHandle,
} from '../Modais/DetailsClientsShop';
import { queryClient } from '../../services/queryClient';
import { Input } from '../Form/Input';

interface Shop {
  id: string;
  name: string;
  debit: number;
  createdAt: string;
}

type CreateFormData = {
  name: string;
};

const createFormSchema = yup.object().shape({
  name: yup.string().required('O nome é necessário'),
});

export const Clients = () => {
  const modalDetailsAllShop = useRef<DetailsClientsShopHandle>(null);
  const [client, setClient] = useState({} as Shop);

  const { data } = useClients();

  const handleModal = useCallback(client => {
    setClient(client);
    modalDetailsAllShop.current.onOpen();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isOpen) {
    queryClient.invalidateQueries('clients');
  }

  const toast = useToast();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(createFormSchema),
  });

  const onSubmit: SubmitHandler<CreateFormData> = async (
    values: CreateFormData,
  ) => {
    try {
      await createClient(values.name);
      toast({
        position: 'top',
        title: `Sucesso!`,
        description: `Cliente criado com sucesso`,
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
      reset();
    } catch (err) {
      //
    }
  };

  return (
    <Flex flexDir="column" align="center" w="100%">
      <DetailsClientsShop client={client} ref={modalDetailsAllShop} />

      <BsPerson cursor="pointer" size={45} onClick={() => onOpen()} />

      <Modal size={['md', 'md', '2xl']} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="color-bg">
          <ModalCloseButton
            size="lg"
            _hover={{ bg: 'none' }}
            color="color-icons"
          />
          <ModalHeader />
          <ModalBody>
            <VStack
              align="flex-start"
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
              {data?.map(client => (
                <Flex key={client.id}>
                  <HStack cursor="pointer" onClick={() => handleModal(client)}>
                    <Text>{client.name.toUpperCase()}</Text>

                    <Text
                      color={
                        client.shop.reduce((accumulator, value) => {
                          return Number(accumulator) + Number(value.amountPaid);
                        }, 0) +
                          client.credit.reduce((accumulator, credit) => {
                            return Number(accumulator) + Number(credit.value);
                          }, 0) -
                          client.shop
                            .map(shopClient =>
                              shopClient.order.reduce((accumulator, debit) => {
                                return (
                                  Number(accumulator) +
                                  Number(debit.quantity) *
                                    Number(debit.product.price)
                                );
                              }, 0),
                            )
                            .reduce((accumulator, value) => {
                              return accumulator + value;
                            }, 0) >=
                        0
                          ? '#00fa00'
                          : 'red'
                      }
                    >
                      {formatPrice(
                        client.shop.reduce((accumulator, value) => {
                          return Number(accumulator) + Number(value.amountPaid);
                        }, 0) +
                          client.credit.reduce((accumulator, credit) => {
                            return Number(accumulator) + Number(credit.value);
                          }, 0) -
                          client.shop
                            .map(shopClient =>
                              shopClient.order.reduce((accumulator, debit) => {
                                return (
                                  Number(accumulator) +
                                  Number(debit.quantity) *
                                    Number(debit.product.price)
                                );
                              }, 0),
                            )
                            .reduce((accumulator, value) => {
                              return accumulator + value;
                            }, 0),
                      )}
                    </Text>
                  </HStack>
                </Flex>
              ))}
            </VStack>
            <Flex h="2rem">
              {errors.name && <Text color="red">Informe o nome</Text>}
            </Flex>
            <HStack as="form" onSubmit={handleSubmit(onSubmit)}>
              <Input name="name" {...register('name')} />
              <Button
                type="submit"
                bg="color-input-bg"
                _hover={{
                  bg: 'color-input-bg',
                }}
              >
                Criar
              </Button>
            </HStack>
          </ModalBody>

          <ModalFooter h="5rem" />
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export const getServerSideProps = withSSRAuth(async ctx => ({
  props: {},
}));
