# Nyx Mobile Roleplay

Cliente ativo: **Android nativo (Java + Canvas)**.

O projeto não usa Godot nem Unity. A implementação principal está em `native-rp/`.

## Funcionalidades

- criação de personagem;
- cidade jogável e movimentação touch;
- veículo e combustível;
- empregos e pagamentos;
- dinheiro e banco persistidos;
- celular, organizações e atendimento;
- HUD, minimapa e chat;
- build automático de APK debug pelo GitHub Actions.

## Build local

```bash
cd native-rp
gradle :app:assembleDebug
```
