import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import Router from 'next/router';
import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { api } from '../apiClient';

type User = {
  name: string;
  isAdmin: boolean;
  email: string;
};

type SignInCredentials = {
  username: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'babi.token', { path: '/' });
  destroyCookie(undefined, 'babi.refreshToken', { path: '/' });

  authChannel?.postMessage('signOut');

  Router.push('/admin');
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');
    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          Router.push('/admin');
          break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { 'babi.token': token } = parseCookies();

    if (token) {
      api
        .get('sellers/me')
        .then(response => {
          const { email, name, isAdmin } = response.data;

          setUser({ email, name, isAdmin });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ username, password }: SignInCredentials) {
    const response = await api.post('sessions', {
      username,
      password,
    });

    const { token, refreshToken, user } = response.data;

    setCookie(undefined, 'babi.token', token, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    setCookie(undefined, 'babi.refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    setUser({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    api.defaults.headers['Authorization'] = `Bearer ${token}`;

    if (user.isAdmin === true) {
      Router.push('/painelAdm');
    }

    Router.push('/');
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
