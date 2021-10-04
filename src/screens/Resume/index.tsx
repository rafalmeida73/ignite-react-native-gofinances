import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/auth';

import { HistoryCard } from '../../components/HistoryCard';
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MouthSelect,
  MouthSelectButton,
  MouthSelectIcon,
  Mouth,
  LoadContainer
} from './styles';
import { categories } from '../../utils/categories';

interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface categoryData {
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  key: string;
  percent: string
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const dataKey = `@gofinances:transactions_user:${user.id}`;
  const theme = useTheme();
  const [totalByCategories, setTotalByCategories] = useState<categoryData[]>([]);

  function handleDateChange(action: 'next' | 'prev') {
    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1))
    } else {
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  async function loadData() {
    setIsLoading(true);

    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter((expensive: TransactionData) =>
      expensive.type === 'negative'
      &&
      new Date(expensive.date).getMonth() + 1 === selectedDate.getMonth() + 1
      &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensiveTotal = expensives.reduce((acumullator: number, expensive: TransactionData) => {
      return acumullator + Number(expensive.amount);
    }, 0);

    const totalByCategory: categoryData[] = [];

    categories.forEach(category => {
      let categorySun = 0;

      expensives.forEach((expensive: TransactionData) => {
        if (expensive.category === category.key) {
          categorySun += Number(expensive.amount);
        }
      });

      if (categorySun > 0) {
        const totalFormatted = categorySun
          .toLocaleString('pt-Br', {
            style: 'currency',
            currency: 'BRL'
          });


        const percent = `${(categorySun / expensiveTotal * 100).toFixed(0)}%`

        totalByCategory.push({
          name: category.name,
          color: category.color,
          key: category.key,
          total: categorySun,
          totalFormatted,
          percent
        })
      }
    });

    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(useCallback(() => {
    loadData();
  }, [selectedDate]));


  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ?
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
          :
          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight()
            }}
          >

            <MouthSelect>
              <MouthSelectButton
                onPress={() => handleDateChange('prev')}

              >
                <MouthSelectIcon
                  name="chevron-left"
                />
              </MouthSelectButton>

              <Mouth>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Mouth>

              <MouthSelectButton
                onPress={() => handleDateChange('next')}
              >
                <MouthSelectIcon
                  name="chevron-right"

                />
              </MouthSelectButton>
            </MouthSelect>

            <ChartContainer>
              <VictoryPie
                data={totalByCategories}
                colorScale={totalByCategories.map(category => category.color)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape
                  }
                }}
                labelRadius={50}
                x="percent"
                y="total"
              />
            </ChartContainer>

            {
              totalByCategories.map(item => (
                <HistoryCard
                  key={item.key}
                  title={item.name}
                  amount={item.totalFormatted}
                  color={item.color}
                />
              ))
            }
          </Content>
      }
    </Container>
  )
}