# FinanceBook

App de anotações com alerta, contas a pagar/receber e resumo mensal, para Android e iPhone (React Native com Expo).

Nesta versão os dados ficam salvos **no próprio celular** (AsyncStorage) e os alertas são **notificações locais**. A sincronização com o Google Drive é o próximo passo.

## Como rodar

Precisa do [Node.js](https://nodejs.org) instalado e do app **Expo Go** no celular (Play Store ou App Store).

1. Crie o projeto base:

   ```
   npx create-expo-app@latest financebook --template blank
   cd financebook
   ```

2. Instale as dependências (o `expo install` escolhe as versões certas para a sua versão do Expo):

   ```
   npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-notifications @react-native-community/datetimepicker @expo/vector-icons
   ```

3. Copie a pasta `src` e o arquivo `App.js` deste pacote para dentro do projeto, substituindo o `App.js` que já existe.

4. Abra o `app.json` e inclua o plugin de notificações:

   ```json
   {
     "expo": {
       "name": "FinanceBook",
       "plugins": ["expo-notifications"]
     }
   }
   ```

   (mantenha os outros campos que já estão no arquivo)

5. Rode:

   ```
   npx expo start
   ```

   Leia o QR code com o Expo Go (Android) ou com a câmera (iPhone).

## O que já funciona

- **Início:** saldo previsto do mês, alertas de hoje e próximos vencimentos.
- **Anotações:** criar, editar, excluir, buscar e filtrar; alerta com data e hora no celular.
- **Alertas:** o aviso aparece na barra de notificações do celular, no dia e hora escolhidos.
- **Contas:** a pagar e a receber, por mês, marcar como paga, repetir todo mês ou parcelar (de 2 a 60 vezes, uma conta por parcela, no mesmo dia de cada mês), aviso de 0 a 3 dias antes às 09:00. O botão de menu (três linhas) abre três opções em arco: nova conta (papel com +), editar (lápis; toque na conta para editar ou apagar, e a tela de edição tem o botão "Apagar conta") e pesquisar (busca por nome, categoria ou valor, em todos os meses).
- **Salário:** cartão na tela Início abre a tela de salário bruto, dia do pagamento e descontos (valor em R$ ou % do bruto), com o líquido calculado. O líquido entra nas receitas de todos os meses. Os descontos são digitados por você; o app não calcula INSS nem imposto de renda sozinho.
- **Vales:** cartão "Vales do mês" no Início abre a tela de vales. Cada vale (valor, data e observação) é descontado automaticamente do salário do mês seguinte. A tela mostra o salário líquido, os vales do mês anterior que estão sendo descontados e o salário a receber. No saldo, o vale entra como dinheiro recebido no mês em que foi pego, e o desconto reduz o salário do mês seguinte.
- **Resumo:** receitas, despesas, saldo e gráfico por categoria. Sem botões de backup aqui.
- **Config.:** aba com engrenagem. Mostra os alertas por notificação e o backup (exportar e importar).

## Observações

- Se os alertas não tocarem no Expo Go, é uma limitação do ambiente de teste. Eles funcionam num build de desenvolvimento (`npx expo run:android` / `run:ios`) ou no app publicado.
- Os alertas só são agendados para datas futuras e precisam da permissão de notificação do celular.
- O celular limita quantos alertas podem ficar agendados ao mesmo tempo (no iPhone, 64). Por isso o app agenda os alertas das contas dos próximos 60 dias e agenda os demais sempre que você abre o app. Em contas parceladas, o alerta das parcelas distantes só aparece depois que o app for aberto perto da data.

## Próximos passos

1. Login com Google e sincronização do arquivo de dados na pasta oculta do Drive (`drive.appdata`).
2. Tela de edição de conta.
3. Ícone, tela de abertura e publicação nas lojas.

## Estrutura

```
App.js                 navegação (abas + telas de formulário)
src/store.js           dados, salvar/carregar, agendar e cancelar alertas
src/notifications.js   notificações locais
src/format.js          dinheiro, datas e status das contas
src/theme.js           cores e categorias
src/ui.js              componentes de interface
src/screens/           as telas
```
