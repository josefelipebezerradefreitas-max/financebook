import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const two = (n) => String(n).padStart(2, '0');

// Gera o arquivo de backup (.json) e abre a folha de compartilhar do celular,
// onde você escolhe "Salvar em arquivos", Drive, WhatsApp, e-mail etc.
export async function exportBackupFile(data) {
  const d = new Date();
  const name = `financebook-backup-${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}.json`;
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  await file.write(JSON.stringify(data, null, 2));
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este celular não tem compartilhamento de arquivos.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Salvar backup do FinanceBook',
    UTI: 'public.json',
  });
}

// Abre o seletor de arquivos e devolve o texto do arquivo escolhido (ou null se cancelar).
export async function pickBackupFile() {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return new File(res.assets[0].uri).text();
}
