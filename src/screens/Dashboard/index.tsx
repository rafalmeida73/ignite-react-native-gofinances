import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { HighLIghtCard } from '../../components/HighLIghtCard';
import { TransationCard, TransactionCardProps } from '../../components/TransationCard';

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreting,
  UserName,
  Icon,
  HighLIghtCards,
  Transactions,
  Title,
  TransactionsLIst,
  LogOutButton,
  LoadContainer
} from './styles';

export interface DataLisProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string,
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}
export function Dashboard() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<DataLisProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);
  const dataKey = `@gofinances:transactions_user:${user.id}`;

  function getLastTransactionDate(
    collection: DataLisProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFilttered = collection
      .filter(transaction => transaction.type === type);

    if (collectionFilttered.length === 0)
      return 0

    const lastTransaction = new Date(
      Math.max.apply(Math, collectionFilttered
        .map(transaction => new Date(transaction.date).getTime())))

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-Br', { month: 'long' })}`;
  }


  async function loadTransaction() {
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataLisProps[] = transactions
      .map((item: DataLisProps) => {
        if (item.type === 'positive') {
          entriesTotal += Number(item.amount)
        } else {
          expensiveTotal -= Number(item.amount)
        }

        let amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });

        amount = amount.replace('R$', 'R$ ');

        const date = Intl.DateTimeFormat('pt-Br', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date
        }

      });

    setTransaction(transactionsFormatted);
    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
    const totalInterval = lastTransactionExpensives === 0 ? 'Não há transações' : `01 a ${lastTransactionExpensives}`;

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: lastTransactionEntries === 0 ?
          'Não há transações'
          :
          `Última entrada ${lastTransactionEntries}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: lastTransactionExpensives === 0 ?
          'Não há transações'
          :
          `Última saída ${lastTransactionExpensives}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: `${totalInterval}`
      }
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransaction();
  }, [])

  useFocusEffect(useCallback(() => {
    loadTransaction();
  }, []));

  return (
    <Container>
      {
        isLoading ?
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
          :
          <>
            <Header>
              <UserWrapper>
                <UserInfo>
                  <Photo
                    source={{ uri: user.photo }}
                  />
                  <User>
                    <UserGreting>Olá,</UserGreting>
                    <UserName>{user.name}</UserName>
                  </User>
                </UserInfo>

                <LogOutButton onPress={() => { signOut() }}>
                  <Icon name="power" />
                </LogOutButton>
              </UserWrapper>
            </Header>
            <HighLIghtCards>
              <HighLIghtCard
                title="Entradas"
                amount={highlightData?.entries?.amount}
                lastTransation={highlightData?.entries?.lastTransaction}
                type='up'
              />
              <HighLIghtCard
                title="Saídas"
                amount={highlightData?.expensives?.amount}
                lastTransation={highlightData?.expensives?.lastTransaction}
                type='down'
              />
              <HighLIghtCard
                title="Total"
                amount={highlightData?.total?.amount}
                lastTransation={highlightData?.total?.lastTransaction}
                type='total'
              />
            </HighLIghtCards>
            <Transactions>
              <Title>Listagem</Title>

              <TransactionsLIst
                data={transaction}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TransationCard data={item} />}
              />

            </Transactions>
          </>
      }
    </Container >
  )
}