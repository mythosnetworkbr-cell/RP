# SA-MP Mobile — Mythos Network

Cliente mobile Android para jogar SA-MP no ecossistema **Mythos Network**.

> **Status:** projeto em desenvolvimento, com compilação automatizada pelo GitHub Actions.

## Sobre o projeto

Esta repository reúne a source code do cliente mobile, incluindo a camada Android em **Java** e o código nativo em **C/C++** necessário para o cliente SA-MP Mobile.

O objetivo é manter todo o processo de desenvolvimento e compilação no GitHub, evitando a necessidade de instalar Android SDK/NDK diretamente no dispositivo utilizado para editar o projeto.

## Stack

- Android nativo
- Java
- C/C++
- Gradle
- Android Gradle Plugin
- Android SDK
- Android NDK
- ndk-build
- Node.js para automação auxiliar
- GitHub Actions para CI/build

## Arquitetura

A source possui código Java para a aplicação Android e código nativo para o cliente. O projeto também contém bibliotecas nativas e componentes utilizados pela implementação mobile.

Principais componentes:

```text
Android App
├── Java
├── C/C++
├── JNI / ndk-build
├── bibliotecas nativas
└── recursos Android
```

## Build automático

O projeto foi preparado para ser compilado pelo **GitHub Actions**.

O workflow configura o ambiente de build no runner, incluindo:

- JDK 17
- Android SDK
- Android SDK Platform 33
- Android Build Tools 33.0.2
- Android NDK 27.0.12077973
- Node.js 20
- Gradle Wrapper

Depois executa o build Android e publica o APK gerado como **Artifact** do workflow.

### APK Debug

O comando principal utilizado pelo pipeline é:

```bash
./gradlew assembleDebug
```

Saída esperada:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Build com Node.js

Para automações auxiliares, o projeto pode utilizar Node.js:

```bash
npm install
npm run build:debug
```

O Node.js atua como orquestrador; a compilação Android continua sendo realizada pelo Gradle e pelo toolchain Android.

## Build via Docker

Também existe suporte para executar o processo dentro de um ambiente Docker, mantendo SDK/NDK isolados do sistema hospedeiro.

Exemplo:

```bash
./build-docker.sh
```

## Compatibilidade nativa

A configuração nativa principal utiliza a ABI:

```text
armeabi-v7a
```

O código nativo utiliza **C++14** e `ndk-build`.

## Estrutura de compilação

```text
Source Code
   │
   ├── Java
   │
   ├── C/C++
   │
   ├── JNI
   │
   ├── Android.mk
   ├── Application.mk
   ├── Gradle
   │
   └── GitHub Actions
           │
           ▼
       Android SDK
           +
          NDK
           │
           ▼
        APK Debug
```

## Desenvolvimento

Antes de alterar código nativo, verifique as configurações em `Android.mk` e `Application.mk`. Alterações no Gradle devem permanecer compatíveis com o Gradle Wrapper utilizado pelo projeto.

Não remova bibliotecas nativas ou assets necessários ao cliente apenas para reduzir o tamanho do repositório: eles podem ser dependências essenciais do APK.

## GitHub Actions

Os builds ficam disponíveis na aba **Actions** do GitHub. Quando o workflow terminar com sucesso, o APK pode ser obtido nos **Artifacts** da execução.

## Organização do projeto

Este repositório é destinado ao **cliente SA-MP Mobile / Android**.

Projetos diferentes, como GameMode, servidor NYX Roleplay, launcher independente ou outros sistemas da Mythos Network, devem permanecer em seus respectivos repositórios.

## Mythos Network

**Mythos Network — SA-MP Mobile**

Cliente Android desenvolvido para o ecossistema Mythos Network.

---

### Licença e direitos

Consulte os arquivos de licença e avisos presentes na source original antes de redistribuir, modificar ou publicar componentes de terceiros.
