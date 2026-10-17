import { Alert } from 'react-native';
import { money } from './format';

// Pergunta "sim ou não" antes de marcar uma conta como paga/recebida (ou desfazer).
export function confirmToggle(bill, togglePaid) {
  const pay = bill.kind === 'pay';
  const detail = `${bill.description} · ${money(bill.amount)}`;
  if (bill.paid) {
    Alert.alert(pay ? 'Desfazer pagamento?' : 'Desfazer recebimento?', detail, [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => togglePaid(bill.id) },
    ]);
    return;
  }
  Alert.alert(
    pay ? 'Marcar como paga?' : 'Marcar como recebida?',
    `${detail}\n\n${pay ? 'Confirme só se você já pagou essa conta.' : 'Confirme só se você já recebeu esse valor.'}`,
    [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => togglePaid(bill.id) },
    ]
  );
}
