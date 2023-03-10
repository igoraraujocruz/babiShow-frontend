import {
  Button,
  useDisclosure,
  useToast,
  Flex,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  Text,
  FormControl,
  Checkbox,
  HStack,
} from '@chakra-ui/react';
import {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createProduct } from '../../services/hooks/useProducts';
import { InputFile, InputFileHandle } from '../Form/InputFile';
import { Input } from '../Form/Input';
import { convertRealToNumber } from '../../utils/convertRealToNumber';
import { MaskedInput } from '../Form/MaskedInput';
import { realMask } from '../../utils/realMask';

type CreateFormData = {
  name: string;
  description: string;
  amount: number;
  price: string;
  cost: string;
  points: number;
  photos: File[];
  category: string;
};

export interface ContractCreateProductModal {
  onOpen: () => void;
  onClose: () => void;
}

const createFormSchema = yup.object().shape({
  name: yup.string().required('Nome do produto é obrigatório'),
  amount: yup.number().required('A quantidade é necessária'),
  category: yup.string().required('A categoria do produto é obrigatória'),
  price: yup
    .string()
    .typeError('Insira um valor')
    .required('Preço do produto é obrigatório'),
  cost: yup
    .string()
    .typeError('Insira um valor')
    .required('O custo do produto é obrigatório'),
});

const CreateProductModal: ForwardRefRenderFunction<
  ContractCreateProductModal
> = (props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputFileRef = useRef<InputFileHandle>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: yupResolver(createFormSchema),
  });

  useImperativeHandle(ref, () => ({
    onOpen,
    onClose,
  }));

  const toast = useToast();

  const onSubmit: SubmitHandler<CreateFormData> = async (
    values: CreateFormData,
  ) => {
    try {
      await createProduct({
        name: values.name,
        amount: values.amount,
        price: convertRealToNumber(values.price),
        photos: inputFileRef.current.images,
        category: values.category,
        cost: convertRealToNumber(values.cost),
      });

      inputFileRef.current?.setImages([]);
      reset();
      toast({
        title: 'Produto cadastrado com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Não foi possível cadastrar o produto',
        description: error.response?.data.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="color-bg">
        <ModalCloseButton
          size="lg"
          _hover={{ bg: 'none' }}
          color="color-icons"
        />
        <ModalHeader />
        <ModalBody>
          <Flex onSubmit={handleSubmit(onSubmit)} as="form" flexDir="column">
            <Stack spacing="0.5">
              <Input
                error={errors.name}
                name="name"
                label="Nome"
                {...register('name')}
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

              <FormControl h="5rem">
                <Text mt="0.5rem">Categoria</Text>
                <Select
                  _hover={{
                    borderColor: 'none',
                  }}
                  bg="color-input-bg"
                  focusBorderColor="none"
                  w="12rem"
                  {...register('category')}
                >
                  <option
                    style={{ background: 'color-input-bg' }}
                    value="tabletes"
                  >
                    Tabletes
                  </option>
                  <option
                    style={{ background: 'color-input-bg' }}
                    value="trufas"
                  >
                    Trufas
                  </option>
                  <option
                    style={{ background: 'color-input-bg' }}
                    value="drageados"
                  >
                    Drageados
                  </option>
                </Select>
              </FormControl>
              <Input
                error={errors.amount}
                name="amount"
                label="Quantidade"
                {...register('amount')}
              />
            </Stack>
            <Flex justify="center">
              <InputFile mt="1rem" ref={inputFileRef} />
            </Flex>
            <Button
              bg="color-input-bg"
              _hover={{ bg: 'color-input-bg' }}
              type="submit"
              mt="1rem"
              size="lg"
            >
              Cadastrar
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default forwardRef(CreateProductModal);
