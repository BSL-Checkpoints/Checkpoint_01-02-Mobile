/** Tipagem das rotas. Dois stacks por causa da guarda:
 *  - deslogado -> AuthStack (SignIn / SignUp)
 *  - logado    -> RootStack (Products / ProductDetail / Cart)
 */
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { id: string; name: string };
  Cart: undefined;
  Checkout: undefined;
  Order: { id: string };
  Orders: undefined;
};
