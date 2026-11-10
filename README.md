# SIGEDI — Câmara Municipal de Iracema/RR

Sistema web de diárias com layout institucional, cadastro de beneficiários, cálculo automático, geração das **oito peças do processo Word**, histórico de processos e relatórios filtráveis e exportáveis em CSV.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo, `sigedi-camara-iracema`).
2. Envie **somente o conteúdo da pasta `site`** para a raiz do repositório: `index.html`, `styles.css`, `app.js` e `assets/`.
3. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/(root)`, e salve.
4. Abra o endereço fornecido pelo GitHub Pages. A conexão à internet é necessária ao gerar o Word, pois o sistema utiliza a biblioteca JSZip hospedada em CDN.
5. Na tela **Beneficiários**, clique em **Importar cadastro JSON** e selecione o arquivo privado `servidores-importacao.json`, disponibilizado separadamente.

**Não publique** `servidores-importacao.json`, a planilha original, arquivos de backup ou documentos preenchidos com dados pessoais no repositório. Eles contêm CPF e outras informações privadas.

## Funcionamento

- Pesquise servidores por nome, matrícula ou cargo; caso o cargo não seja único, selecione a pessoa pelo nome ou matrícula.
- Cadastre novos beneficiários com nome, matrícula, cargo e CPF válidos.
- Informe número do memo, processo e portaria; deslocamento, pagamento, finalidade, justificativa e quantidade/valor das diárias com pernoite.
- Salve o processo, ou clique em **Salvar e gerar Word** para baixar um `.docx` baseado diretamente no último modelo oficial fornecido.
- Consulte **Processos** e **Relatórios** para revisar registros, exportar CSV e gerar novamente o Word.
- Em **Configurações**, acrescente datas sem expediente, exporte um backup JSON ou restaure um backup.

## Limitações importantes desta primeira versão

- **Dados guardados exclusivamente no navegador deste computador** (`localStorage`), sem sincronização, autenticação ou banco de dados central. Exporte backups regularmente e não use em computador compartilhado sem controles de acesso.
- GitHub Pages hospeda apenas os arquivos estáticos. Uma futura versão multiusuário exigirá serviço de autenticação e banco de dados com controle de acesso.
- Dias úteis calculados no navegador: fins de semana, feriados nacionais fixos, Carnaval (dois dias), Sexta-Feira Santa, Corpus Christi, 5/10 (RR), 4/11 (Iracema), e datas adicionais configuradas. Confira os atos oficiais e os pontos facultativos de cada exercício; o sistema **não consulta a internet automaticamente** para atualizar feriados.
- Datas da saída e retorno podem cair em sábados, domingos e feriados. Data do pagamento deve ser dia útil. Documentos 01–04 têm datas derivadas dos três dias úteis anteriores ao pagamento e documentos 06–08 recebem o primeiro dia útil após o retorno.
- A geração preserva o Word fornecido, mas variações no tamanho do texto preenchido podem deslocar paginação; confira o arquivo antes de usar.
- A página 07 mantém os campos marcados do modelo original. O aplicativo preenche textos a partir dos dados fornecidos, sem verificar comprovantes.
- Esta versão não publica/processa arquivos pessoais em servidores de terceiros além do armazenamento estático. Nunca inclua CPFs no repositório público.

## Executar localmente para testar

Em um terminal dentro da pasta `site`, execute:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` no navegador. Não abra diretamente `index.html` por `file://`, pois o navegador pode bloquear a leitura do modelo Word.

## Arquivos

`site/index.html`: interface, `site/styles.css`: estilo, `site/app.js`: lógica e geração Word, `site/assets/`: brasão e modelo Word. O cadastro de servidores foi fornecido à parte para manter os dados privados.
