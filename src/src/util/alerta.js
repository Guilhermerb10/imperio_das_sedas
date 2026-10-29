import { Alert, Platform } from 'react-native';

export function mostrarAlerta(titulo, mensagem, botoes) {
  const listaBotoes =
    Array.isArray(botoes) && botoes.length > 0
      ? botoes
      : [{ text: 'Confirmar' }];

  if (Platform.OS === 'web') {
    if (listaBotoes.length > 1) {
      const confirmado = window.confirm(
        titulo ? `${titulo}\n\n${mensagem || ''}` : mensagem
      );

      if (confirmado) {
        const botaoAcao = listaBotoes.find(
          (b) =>
            b.style === 'destructive' ||
            (b.text !== 'Cancelar' && b.style !== 'cancel')
        );
        if (botaoAcao && botaoAcao.onPress) {
          botaoAcao.onPress();
        }
      } else {
        const botaoCancel = listaBotoes.find(
          (b) => b.style === 'cancel' || b.text === 'Cancelar'
        );
        if (botaoCancel && botaoCancel.onPress) {
          botaoCancel.onPress();
        }
      }
      return;
    }

    const texto = titulo ? `${titulo}\n\n${mensagem || ''}` : mensagem;
    window.alert(texto);

    if (listaBotoes[0] && listaBotoes[0].onPress) {
      listaBotoes[0].onPress();
    }
  } else {
    Alert.alert(titulo, mensagem, listaBotoes, { cancelable: true });
  }
}
