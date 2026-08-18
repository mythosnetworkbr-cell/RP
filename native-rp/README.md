# Nyx Mobile — Native Android RP

Projeto do cliente Nyx Mobile feito **100% em Android nativo (Java + Canvas)**. Não usa Godot, Unity ou outro game engine.

## Funcionalidades atuais

- criação de personagem por nome;
- cidade top-down jogável com ruas, prédios e pontos de interesse;
- movimentação por joystick touch;
- veículo e combustível;
- empregos e pagamento;
- dinheiro em mão e banco persistidos no aparelho;
- celular com banco, organização e atendimento;
- HUD e minimapa;
- chat de sistema;
- compatibilidade Android API 23+;
- inicialização segura sem chamar `WindowInsetsController` em uma janela nula.

## Build

```bash
gradle :app:assembleDebug
```

O workflow `.github/workflows/build-native-rp.yml` gera automaticamente `app-debug.apk` como artifact.
