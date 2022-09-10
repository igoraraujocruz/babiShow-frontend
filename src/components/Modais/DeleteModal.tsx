import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  useToast,
} from '@chakra-ui/react';
import { BsTrashFill } from 'react-icons/bs';
import { deleteProducts } from '../../services/hooks/useProducts';

interface ImageModalProps {
  productId: string;
}

export function DeleteModal({ productId }: ImageModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  async function deleteProduct() {
    try {
      await deleteProducts(productId);
    } catch (error) {
      toast({
        title: 'Não foi deletar o produto',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }

  return (
    <>
      <BsTrashFill color="orange" size={25} onClick={onOpen} cursor="pointer" />
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="1rem" color="#343434">
            Tem certeza que deseja deletar?
          </ModalHeader>
          <ModalCloseButton color="black" />
          <ModalBody>
            <Text color="#343434">Não será possível recuperar depois</Text>
          </ModalBody>

          <ModalFooter>
            <Button
              color="#343434"
              bg=""
              _hover={{ bg: '#ff0118' }}
              mr={3}
              onClick={deleteProduct}
            >
              Deletar
            </Button>
            <Button
              color="#343434"
              bg=""
              _hover={{ bg: 'orange' }}
              mr={3}
              onClick={onClose}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
