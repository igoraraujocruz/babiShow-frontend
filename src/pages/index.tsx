import { Flex, Stack } from '@chakra-ui/react';
import Head from 'next/head';
import { Clients } from '../components/Clients';
import { Products } from '../components/Products';
import { withSSRAuth } from '../utils/WithSSRAuth';

const Home = () => {
  return (
    <Flex>
      <Head>
        <title>Painel Adm | Cacau-Show</title>
      </Head>
      <Flex w="100%" h="100vh" flexDir="column" align="center">
        <Stack
          mt={['1rem', '1rem', '3rem']}
          flexDir={['column', 'column', 'row']}
          justify="flex-start"
        >
          <Flex justify="space-evenly">
            <Clients />
          </Flex>
          <Products />
        </Stack>
      </Flex>
    </Flex>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async ctx => ({
  props: {},
}));
