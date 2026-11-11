# Mapa de planetas · Rick and Morty

App Expo/React Native com mapa interativo baseado na referência visual enviada.

## Rodar

```bash
cd /Users/pedrowill/Desktop/projeto-avila/rickyAndMorty
npm install
npm start
```

Abra pelo Expo Go ou use `npm run web`, `npm run android` ou `npm run ios`.

## Funcionalidades

- Mapa com todos os planetas da API, seleção por toque, zoom e arraste após ampliar.
- Busca por nome ou dimensão, sem diferenciar maiúsculas ou acentos.
- Painel com dois estados: arraste a alça ou toque em **Ver detalhes** para expandir; arraste para baixo ou toque em **Recolher** para fechar.
- Contagem de moradores e de episódios únicos em que esses moradores aparecem. A API não fornece episódios diretamente para um planeta.
- Lista e favoritos compartilhando seleção e dados; favoritos persistidos no aparelho com AsyncStorage.
- Mundos com crateras, brilho e satélites em órbita. tsParticles (engine + slim) carrega sob demanda na web; Android/iOS usam uma animação nativa compartilhada, sem canvas ou WebView.
- Poeira cósmica decorativa acompanha as posições dos mundos; os botões continuam responsáveis pela seleção acessível. O canvas web não captura toques.
- Efeitos pausam fora da aba, em segundo plano e ao expandir o painel; a preferência de reduzir movimento mantém os efeitos estáticos.
- Transições do painel e do zoom e troca suave do conteúdo, respeitando a preferência de reduzir movimento.
- Estados de carregamento, falha com nova tentativa e busca sem resultados.

A API não fornece coordenadas: as posições são ilustrativas, determinísticas e permanecem iguais durante a busca. Dados e imagens dos moradores vêm da API pública; a contagem de episódios aparece quando os detalhes terminam de carregar. As requisições são canceladas ao trocar de planeta e os detalhes carregados ficam em cache durante a sessão.

## Organização

```text
src/app/                         Rotas do Expo Router (Mapa, Lista, Favoritos)
src/features/planets/
  components/                    Mapa, painel, cabeçalho, ícones e feedback
  hooks/                         Detalhes assíncronos e preferência de movimento
  screens/                       Composição das telas
  utils/                         Busca normalizada e distribuição dos pontos
  planets-provider.tsx           Catálogo, seleção e persistência dos favoritos
  theme.ts                       Paleta compartilhada
src/services/planets.ts           API, paginação, lotes de moradores e cache
src/types/planets.ts              Tipos de domínio
```

O arquivo `rickyAndMorttService.tsx` mantém compatibilidade com imports antigos. Componentes do template que não são usados nas novas telas foram preservados.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
```

Os testes de serviço e layout usam o runner nativo e o suporte a TypeScript do Node 24+. Não dependem da API estar online. Cobrem paginação, episódios sem duplicação, lotes e resposta de um único morador, planetas vazios, falhas e posições estáveis.

Para conferir no celular: selecionar diferentes pontos, ampliar e arrastar o mapa, buscar uma dimensão, expandir/recolher o painel, favoritar um planeta e reabrir o app. A conferência visual em aparelho continua necessária para validar gestos e áreas seguras reais.
