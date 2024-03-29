import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';

import { useAuth } from '../../hooks/auth';
import { SignSocialButton } from '../../components/SignSocialButton';

import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SingInTitle,
  Footer,
  FooterWrapper
} from './styles';

export function SignIn() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();

  async function handleSignInWithGoogle() {
    try {
      setIsLoading(true);
      return await signInWithGoogle();
    } catch (error) {
      console.log(error)
      Alert.alert('Não foi possível conectar a conta Google')
      setIsLoading(false);
    }

  }

  async function handleSignInWithApple() {
    try {
      await setIsLoading(true);
      return await signInWithApple();
    } catch (error) {
      console.log(error)
      Alert.alert('Não foi possível conectar a conta Apple')
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg
            width={RFValue(120)}
            height={RFValue(68)}
          />

          <Title>
            Controle suas {'\n'}
            finanças de forma {'\n'}
            muito simples
          </Title>
        </TitleWrapper>

        <SingInTitle>
          Faça seu login com {'\n'}
          uma das contas abaixo {'\n'}
        </SingInTitle>
      </Header>

      <Footer>
        <FooterWrapper>
          <SignSocialButton
            title="Entrar com Google"
            svg={GoogleSvg}
            onPress={handleSignInWithGoogle}
          />

          {Platform.OS === 'ios' && (
            <SignSocialButton
              title="Entrar com Apple"
              svg={AppleSvg}
              onPress={handleSignInWithApple}
            />
          )}
        </FooterWrapper>

        {
          isLoading &&
          <ActivityIndicator
            color={theme.colors.shape}
            style={{ marginTop: 18 }}
          />
        }
      </Footer>
    </Container>
  )
}