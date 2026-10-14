import { Alert, Linking } from 'react-native';

// Abre o WhatsApp com a mensagem pronta. A pessoa escolhe o contato e toca em enviar.
export function shareWhatsApp(text) {
  return Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`).catch(() =>
    Alert.alert('WhatsApp', 'Não foi possível abrir o WhatsApp neste aparelho.')
  );
}

// Abre o app de e-mail com assunto e texto prontos.
export function shareEmail(subject, body) {
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return Linking.openURL(url).catch(() =>
    Alert.alert('E-mail', 'Não foi possível abrir o app de e-mail neste aparelho.')
  );
}
