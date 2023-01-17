import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  Image,
  useToast,
  Flex,
  ModalHeader,
  Spinner,
  Text,
  Stack,
  HStack,
  Checkbox,
  FormControl,
  Select,
} from '@chakra-ui/react';
import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AiFillCloseCircle } from 'react-icons/ai';
import Zoom from 'react-medium-image-zoom';
import {
  createPhotos,
  updateProduct,
  useProductById,
} from '../../services/hooks/useProducts';
import { InputFile, InputFileHandle } from '../Form/InputFile';
import DeleteModal, { ModalDeleteHandle } from './DeleteModal';
import { Input } from '../Form/Input';
import { api } from '../../services/apiClient';
import { MaskedInput } from '../Form/MaskedInput';
import { realMask } from '../../utils/realMask';

interface ProductProps {
  product: {
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
  };
}

type EditFormData = {
  name: string;
  description: string;
  price: number;
  amount: number;
  points: number;
  category: string;
  cost: number;
};

export interface ContractEditProductModal {
  onOpen: () => void;
  onClose: () => void;
}

const DetailsProductModal: ForwardRefRenderFunction<
  ContractEditProductModal,
  ProductProps
> = ({ product }: ProductProps, ref) => {
  const inputFileRef = useRef<InputFileHandle>(null);
  const deleteModalRef = useRef<ModalDeleteHandle>(null);

  const {
    data: newProduct,
    isLoading,
    error,
    isFetching,
  } = useProductById(product.id);

  const [photoId, setPhotoId] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => {
      return product;
    }, [product]),
  });

  useEffect(() => {
    reset(product);
  }, [product, reset]);

  useImperativeHandle(ref, () => ({
    onOpen,
    onClose,
  }));

  const openDeleteModal = (photoId: string) => {
    setPhotoId(photoId);
    deleteModalRef.current.onOpen();
  };

  const toast = useToast();

  const onUploadImageSubmit = async () => {
    try {
      await createPhotos({
        productId: product.id,
        photos: inputFileRef.current.images,
      });
      toast({
        title: 'Upload feito com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      inputFileRef.current.setImages([]);
    } catch (error) {
      toast({
        title: 'Não foi possível cadastrar o produto',
        description: error.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const editSubmit: SubmitHandler<EditFormData> = async () => {
    try {
      await updateProduct({
        id: product.id,
        name: getValues('name'),
        price: getValues('price'),
        amount: getValues('amount'),
        category: getValues('category'),
        cost: getValues('cost'),
      });
      toast({
        title: 'Produto atualizado com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Não foi possível atualizar o produto',
        description: error.response.data.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex>
      <DeleteModal ref={deleteModalRef} photoId={photoId} />
      <Modal size="xs" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="color-bg">
          <ModalCloseButton size="lg" _hover={{ bg: 'none' }} />
          <ModalHeader />
          <ModalBody>
            <Flex flexDir={['column']} justify="space-between">
              <Flex
                pr="0.5rem"
                flexDir="column"
                as="form"
                onSubmit={handleSubmit(editSubmit)}
              >
                <Stack spacing="0.5">
                  <FormControl h="5rem">
                    <Text mt="0.5rem">Categoria</Text>
                    <Select
                      _hover={{
                        borderColor: 'none',
                      }}
                      bg="color-input-bg"
                      focusBorderColor="none"
                      border="0.13rem solid"
                      borderColor="color-input-bg"
                      w="12rem"
                      {...register('category')}
                    >
                      <option
                        style={{ background: '#D5BDAF' }}
                        value="televisoes"
                      >
                        Barras
                      </option>
                      <option
                        style={{ background: '#D5BDAF' }}
                        value="informatica"
                      >
                        Trufas
                      </option>
                    </Select>
                  </FormControl>
                  <Input
                    bg="gray.800"
                    name="name"
                    label="Nome"
                    {...register('name')}
                    placeholder={product.name}
                  />
                  <HStack>
                    <MaskedInput
                      focusBorderColor="#FF6B00"
                      mask={realMask}
                      error={errors.cost}
                      name="cost"
                      label="Custo"
                      {...register('cost')}
                    />
                    <MaskedInput
                      focusBorderColor="#FF6B00"
                      mask={realMask}
                      error={errors.price}
                      name="price"
                      label="Preço"
                      {...register('price')}
                    />
                  </HStack>
                  <Input
                    bg="gray.800"
                    name="amount"
                    label="Estoque"
                    {...register('amount')}
                  />
                </Stack>
                <Button
                  bg="color-input-bg"
                  _hover={{ bg: 'none' }}
                  type="submit"
                  mt="6"
                  size="lg"
                >
                  Salvar
                </Button>
              </Flex>
              <Flex flexDir="column" mt={['2rem']} bg="color-input-bg">
                <Flex justify="center" w="100%" align="center" h="2rem">
                  {!isLoading && isFetching && <Spinner size="md" />}
                </Flex>

                <Flex flexDir="column" justify="space-between">
                  <Flex
                    wrap="wrap"
                    h="5rem"
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
                    overflowY="auto"
                  >
                    {isLoading ? (
                      <Flex justify="center">
                        <Spinner />
                      </Flex>
                    ) : error ? (
                      <Flex justify="center">
                        <Text>Falha ao obter dados dos produtos.</Text>
                      </Flex>
                    ) : (
                      newProduct?.photos?.map(photo => (
                        <Flex
                          p="0.2rem"
                          key={photo.id}
                          flexDir="column"
                          align="end"
                        >
                          <Flex
                            _hover={{ color: '#ff0118' }}
                            transition="color 200ms"
                            mb="0.5rem"
                          >
                            <AiFillCloseCircle
                              size={30}
                              cursor="pointer"
                              onClick={() => openDeleteModal(photo.id)}
                            />
                          </Flex>
                          <Zoom overlayBgColorEnd="gray.900">
                            <Image maxW="10rem" src={photo.url} />
                          </Zoom>
                        </Flex>
                      ))
                    )}
                  </Flex>

                  <Flex
                    justify={['center', 'center', 'start', 'end']}
                    p="1rem"
                    as="form"
                    onSubmit={handleSubmit(onUploadImageSubmit)}
                  >
                    <HStack spacing={2}>
                      <InputFile ref={inputFileRef} />
                      <Button
                        type="submit"
                        disabled={!inputFileRef.current?.images.length && true}
                        bg="color-icons"
                        color="#fff"
                        _hover={{ bg: 'color-icons' }}
                        size="lg"
                      >
                        Upload
                      </Button>
                    </HStack>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default forwardRef(DetailsProductModal);
